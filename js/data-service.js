/* ================================================
   金融研究仪表盘 - 数据服务层（逻辑层核心）
   职责：Schema校验、数据转换、动态计算、统一接口
   不暴露原始数据，只暴露加工后的干净数据
   ================================================ */

var DataStore = (function() {
  // 内部缓存
  var _cache = {
    upList: null,
    categories: null,
    videos: null,
    catStats: null
  };

  // Schema定义
  var REQUIRED_VIDEO_FIELDS = ['up', 'bvid', 'title', 'date'];
  var OPTIONAL_VIDEO_FIELDS = ['category', 'fullText', 'preview'];

  /* === 私有方法：Schema校验 === */
  function validateVideo(v, index) {
    var errors = [];
    var clean = {};
    
    // 必填字段
    REQUIRED_VIDEO_FIELDS.forEach(function(field) {
      if (!v[field]) {
        errors.push('视频#' + index + ' 缺少必填字段: ' + field);
      } else {
        clean[field] = v[field];
      }
    });
    
    // 可选字段（提供默认值）
    clean.category = v.category || '未分类';
    clean.preview = v.preview || '';
    clean.fullText = v.fullText || '';
    
    // 日期标准化（确保YYYY-MM-DD格式）
    if (clean.date) {
      clean.date = normalizeDate(clean.date);
    }
    
    // 派生字段
    clean.hasFullText = clean.fullText && clean.fullText.length > 0;
    clean.previewText = clean.preview || (clean.fullText ? clean.fullText.slice(0, 200) : '');
    
    return { valid: errors.length === 0, errors: errors, data: clean };
  }

  /* === 私有方法：日期标准化 === */
  function normalizeDate(dateStr) {
    if (!dateStr) return '';
    // 已经是 YYYY-MM-DD 格式
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
    
    // 尝试转换其他格式
    var d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d.getFullYear() + '-' + 
             String(d.getMonth() + 1).padStart(2, '0') + '-' + 
             String(d.getDate()).padStart(2, '0');
    }
    return dateStr; // 无法转换则返回原值
  }

  /* === 私有方法：从VIDEOS动态计算UP主列表 === */
  function computeUpList() {
    var videos = getRawVideos();
    var upMap = {};
    
    videos.forEach(function(v) {
      if (!v.up) return;
      
      if (!upMap[v.up]) {
        upMap[v.up] = {
          name: v.up,
          platform: v.platform || 'bilibili',
          total: 0,
          latest: v.date || '',
          categories: {}
        };
      }
      
      // 累计视频数
      upMap[v.up].total++;
      
      // 更新最新日期
      if (v.date && v.date > upMap[v.up].latest) {
        upMap[v.up].latest = v.date;
      }
      
      // 累计分类
      if (v.category) {
        var catList = v.category.split(/[,，]/).map(function(c) { return c.trim(); });
        catList.forEach(function(cat) {
          if (cat) {
            upMap[v.up].categories[cat] = (upMap[v.up].categories[cat] || 0) + 1;
          }
        });
      }
    });
    
    // 转换为数组并排序（按名称）
    return Object.keys(upMap).sort().map(function(name) {
      return upMap[name];
    });
  }

  /* === 私有方法：从VIDEOS动态计算分类统计 === */
  function computeCatStats() {
    var videos = getRawVideos();
    var catMap = {};
    
    videos.forEach(function(v) {
      if (!v.category) return;
      
      // 支持逗号分隔的多分类
      var catList = v.category.split(/[,，]/).map(function(c) { return c.trim(); });
      catList.forEach(function(cat) {
        if (cat) {
          catMap[cat] = (catMap[cat] || 0) + 1;
        }
      });
    });
    
    // 按数量降序排列
    return Object.entries(catMap)
      .sort(function(a, b) { return b[1] - a[1]; })
      .reduce(function(acc, pair) {
        acc[pair[0]] = pair[1];
        return acc;
      }, {});
  }

  /* === 私有方法：获取原始视频数据 === */
  function getRawVideos() {
    if (_cache.videos !== null) return _cache.videos;
    
    if (typeof VIDEOS === 'undefined' || !Array.isArray(VIDEOS)) {
      _cache.videos = [];
      return [];
    }
    
    // 校验并清理数据
    var validVideos = [];
    var errorLog = [];
    
    VIDEOS.forEach(function(v, index) {
      var result = validateVideo(v, index);
      if (result.valid) {
        validVideos.push(result.data);
      } else {
        errorLog.push(result.errors.join(', '));
      }
    });
    
    // 记录错误（供调试）
    if (errorLog.length > 0) {
      console.warn('[DataStore] 视频数据校验跳过 ' + errorLog.length + ' 条:', errorLog.slice(0, 5));
    }
    
    _cache.videos = validVideos;
    return _cache.videos;
  }

  /* === 公共接口：获取UP主列表 === */
  function getUpList() {
    if (_cache.upList === null) {
      // 从VIDEOS动态计算（唯一数据源）
      _cache.upList = computeUpList();
      // UP_STATS仅补充VIDEOS中没有的字段（如platform覆盖、avatar等）
      if (typeof UP_STATS !== 'undefined') {
        _cache.upList.forEach(function(up) {
          if (UP_STATS[up.name]) {
            // 只用UP_STATS补充，不用它覆盖计算结果
            if (UP_STATS[up.name].platform) up.platform = UP_STATS[up.name].platform;
          }
        });
      }
    }
    return _cache.upList;
  }

  /* === 公共接口：获取UP主详情 === */
  function getUpInfo(name) {
    var list = getUpList();
    return list.find(function(up) { return up.name === name; }) || null;
  }

  /* === 公共接口：获取所有视频（支持过滤） === */
  function getVideos(filters) {
    var videos = getRawVideos();
    
    if (!filters) return videos.slice(); // 返回副本
    
    return videos.filter(function(v) {
      if (filters.up && v.up !== filters.up) return false;
      if (filters.category && !v.category.includes(filters.category)) return false;
      if (filters.fromDate && v.date < filters.fromDate) return false;
      if (filters.toDate && v.date > filters.toDate) return false;
      if (filters.search) {
        var s = filters.search.toLowerCase();
        if (!v.title.toLowerCase().includes(s) && 
            !v.fullText.toLowerCase().includes(s)) return false;
      }
      return true;
    });
  }

  /* === 公共接口：获取单个视频详情 === */
  function getVideoDetail(bvid) {
    var videos = getRawVideos();
    return videos.find(function(v) { return v.bvid === bvid; }) || null;
  }

  /* === 公共接口：获取所有唯一分类 === */
  function getCategories() {
    if (_cache.categories === null) {
      var catSet = {};
      var videos = getRawVideos();
      videos.forEach(function(v) {
        if (v.category) {
          v.category.split(/[,，]/).forEach(function(c) {
            c = c.trim();
            if (c) catSet[c] = true;
          });
        }
      });
      _cache.categories = Object.keys(catSet).sort();
    }
    return _cache.categories;
  }

  /* === 公共接口：获取分类统计 === */
  function getCatStats() {
    if (_cache.catStats === null) {
      // 从VIDEOS动态计算（唯一数据源）
      _cache.catStats = computeCatStats();
    }
    return _cache.catStats;
  }

  /* === 公共接口：获取统计数据汇总 === */
  function getStatsSummary() {
    var videos = getRawVideos();
    var upList = getUpList();
    
    var macroCount = videos.filter(function(v) { 
      return v.category && v.category.includes('宏观'); 
    }).length;
    
    var commCount = videos.filter(function(v) { 
      return v.category && (v.category.includes('大宗') || v.category.includes('期货')); 
    }).length;
    
    return {
      totalVideos: videos.length,
      totalUps: upList.length,
      macroCount: macroCount,
      commodityCount: commCount,
      categories: getCategories(),
      catStats: getCatStats()
    };
  }

  /* === 公共接口：获取项目数据 === */
  function getProjectData() {
    if (typeof PROJECT === 'undefined') return null;
    return PROJECT;
  }

  /* === 公共接口：获取框架数据 === */
  function getFrameworkData() {
    if (typeof FRAMEWORK === 'undefined') return null;
    return FRAMEWORK;
  }

  /* === 公共接口：获取模块详情 === */
  function getModuleDetails() {
    if (typeof MODULE_DETAILS === 'undefined') return null;
    return MODULE_DETAILS;
  }

  /* === 公共接口：获取代码地图 === */
  function getCodeMap() {
    if (typeof CODE_MAP === 'undefined') return null;
    return CODE_MAP;
  }

  /* === 公共接口：获取待处理队列 === */
  function getPendingQueue() {
    if (typeof PENDING_QUEUE === 'undefined') return [];
    return PENDING_QUEUE;
  }

  /* === 公共接口：因子统计 === */
  function getFactorStats() {
    var fts = [
      { name: '宏观因子', type: 'macro', keywords: ['PMI', 'CPI', 'PPI', 'GDP', 'M2', '社融', '利率', '降息', '加息', '通胀', '通缩', '汇率', '人民币', '美元'] },
      { name: '供需因子', type: 'supply', keywords: ['产量', '产能', '库存', '开工率', '进口', '出口', '消费', '需求', '供给', '减产', '增产', '检修', '淡季', '旺季', '补库', '去库', '基差', '升水', '贴水'] },
      { name: '资金因子', type: 'capital', keywords: ['持仓', '多头', '空头', '净多', '净空', '增仓', '减仓', '主力', '向北', '融资', '券商', '成交量'] },
      { name: '情绪因子', type: 'sentiment', keywords: ['恐慌', '贪婪', '乐观', '悲观', '超买', '超卖', '背离', '突破', '支撑', '阻力', '回调', '反弹', '趋势', '震荡'] }
    ];
    
    var videos = getRawVideos();
    var factorMap = {};
    
    fts.forEach(function(ft) {
      ft.keywords.forEach(function(kw) {
        var count = 0;
        var sources = [];
        
        videos.forEach(function(v) {
          if (v.fullText && v.fullText.includes(kw)) {
            count++;
            if (sources.length < 3) sources.push(v.title.slice(0, 20));
          }
        });
        
        if (count > 0) {
          factorMap[kw] = {
            keyword: kw,
            count: count,
            type: ft.type,
            typeName: ft.name,
            sources: sources
          };
        }
      });
    });
    
    // 按提及次数降序排列
    return Object.values(factorMap).sort(function(a, b) {
      return b.count - a.count;
    });
  }

  /* === 公共接口：清除缓存（用于数据更新后） === */
  function clearCache() {
    _cache = {
      upList: null,
      categories: null,
      videos: null,
      catStats: null
    };
  }

  /* === 公共接口：导出API === */
  return {
    getUpList: getUpList,
    getUpInfo: getUpInfo,
    getVideos: getVideos,
    getVideoDetail: getVideoDetail,
    getCategories: getCategories,
    getCatStats: getCatStats,
    getStatsSummary: getStatsSummary,
    getProjectData: getProjectData,
    getFrameworkData: getFrameworkData,
    getModuleDetails: getModuleDetails,
    getCodeMap: getCodeMap,
    getPendingQueue: getPendingQueue,
    getFactorStats: getFactorStats,
    clearCache: clearCache
  };
})();

// ================================================
// 兼容旧接口（过渡期使用，警告deprecated）
// ================================================
function getUpList() { 
  console.warn('[Deprecated] 请使用 DataStore.getUpList()');
  return DataStore.getUpList().map(function(u) { return u.name; });
}
function getUpInfo(name) { 
  console.warn('[Deprecated] 请使用 DataStore.getUpInfo(name)');
  return DataStore.getUpInfo(name);
}
function getVideos() { 
  console.warn('[Deprecated] 请使用 DataStore.getVideos()');
  return DataStore.getVideos();
}
function getCatStats() { 
  console.warn('[Deprecated] 请使用 DataStore.getCatStats()');
  return DataStore.getCatStats();
}
