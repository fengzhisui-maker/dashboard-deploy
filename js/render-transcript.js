/* ================================================
   金融研究仪表盘 - 转录库渲染模块 v2
   适配GitHub API实时数据拉取
   ================================================ */

// UP主名称缓存
var _upNameCache = {};

/* === 概览页 === */
async function rOverview() {
  showLoading('tc-overview');
  
  try {
    const stats = await DataStore.getStatsSummary();
    const upList = await DataStore.getUpStats();
    const catStats = await DataStore.getCategoryStats();
    
    // 统计数据卡片
    let statsCards = '';
    statsCards += '<div class="card"><div class="l">转录视频</div><div class="v" style="color:var(--accent2)">' + stats.totalVideos + '</div><div class="s">已完成</div></div>';
    statsCards += '<div class="card"><div class="l">UP主</div><div class="v" style="color:var(--info)">' + stats.totalUps + '</div><div class="s">已收录</div></div>';
    statsCards += '<div class="card"><div class="l">宏观类</div><div class="v" style="color:var(--cat-macro)">' + stats.macroCount + '</div><div class="s">含跨分类</div></div>';
    statsCards += '<div class="card"><div class="l">大宗/期货</div><div class="v" style="color:var(--cat-comm)">' + stats.commodityCount + '</div><div class="s">含跨分类</div></div>';
    
    // UP主卡片
    let upCards = '';
    for (const up of upList) {
      const cats = Object.keys(up.categories || {}).map(c => 
        '<span class="tag ' + catCls(c) + '">' + c + ' ' + up.categories[c] + '</span>'
      ).join('');
      
      upCards += '<div class="up-c">';
      upCards += '<div class="up-h">';
      upCards += '<div style="display:flex;align-items:center;gap:6px">';
      upCards += '<span class="plat-tag ' + platClass(up.platform) + '">' + platLabel(up.platform) + '</span>';
      upCards += '<div class="up-n">' + esc(up.name) + '</div>';
      upCards += '<div class="up-d">最新: ' + (up.latest || '—') + '</div>';
      upCards += '</div>';
      upCards += '<div style="display:flex;gap:16px;margin-bottom:8px">';
      upCards += '<div style="text-align:center">';
      upCards += '<div style="font-size:16px;font-weight:700;color:var(--accent2)">' + up.total + '</div>';
      upCards += '<div style="font-size:9px;color:var(--t4)">视频</div>';
      upCards += '</div>';
      upCards += '</div>';
      upCards += '</div>';
      upCards += '<div>' + cats + '</div>';
      upCards += '</div>';
      
      // 缓存UP主名称
      _upNameCache[up._id] = up.name;
    }
    
    // 分类分布
    let catCards = '';
    Object.entries(catStats).sort((a, b) => b[1] - a[1]).forEach(entry => {
      catCards += '<div style="background:var(--bg3);border:1px solid var(--border);border-radius:6px;padding:10px 14px;min-width:180px">';
      catCards += '<div style="font-size:10px;color:var(--t4);margin-bottom:3px">' + entry[0] + '</div>';
      catCards += '<div style="font-size:18px;font-weight:700;color:var(--accent2)">' + entry[1] + '</div>';
      catCards += '</div>';
    });
    
    document.getElementById('tc-overview').innerHTML = 
      '<div data-ref="transcript-overview" class="g2">' + statsCards + '</div>' +
      '<h3 style="font-size:13px;margin-bottom:10px">已收录UP主</h3>' +
      '<div class="up-g">' + upCards + '</div>' +
      '<h3 style="font-size:13px;margin-bottom:10px">分类分布</h3>' +
      '<div style="display:flex;flex-wrap:wrap;gap:8px">' + catCards + '</div>';
    
    initRefSystem();
  } catch (e) {
    document.getElementById('tc-overview').innerHTML = 
      '<div style="color:var(--err);padding:20px;text-align:center">加载失败: ' + esc(e.message) + '</div>';
  }
}

/* === 内容浏览 === */
async function rBrowse() {
  showLoading('tc-browse');
  
  try {
    const upList = await DataStore.getUpStats();
    const catStats = await DataStore.getCategoryStats();
    
    // 动态生成UP主选项
    let upOptions = '<option value="">全部UP主</option>';
    for (const up of upList) {
      upOptions += '<option value="' + up._id + '">' + esc(up.name) + '</option>';
      _upNameCache[up._id] = up.name;
    }
    
    // 动态生成分类选项
    let catOptions = '<option value="">全部分类</option>';
    Object.keys(catStats).forEach(cat => {
      catOptions += '<option value="' + esc(cat) + '">' + esc(cat) + '</option>';
    });
    
    const allVideos = await DataStore.getVideos();
    
    let html = '<div data-ref="transcript-browse" class="fbar">';
    html += '<select id="fUp" onchange="applyF()">' + upOptions + '</select>';
    html += '<select id="fCat" onchange="applyF()">' + catOptions + '</select>';
    html += '<input type="date" id="fFrom" onchange="applyF()" style="width:120px">';
    html += '<span style="color:var(--t4);font-size:11px">至</span>';
    html += '<input type="date" id="fTo" onchange="applyF()" style="width:120px">';
    html += '<input type="text" id="fSearch" placeholder="🔍 搜索..." oninput="applyF()">';
    html += '<select id="fSort" onchange="applyF()">';
    html += '<option value="dd">最新优先</option>';
    html += '<option value="da">最早优先</option>';
    html += '</select>';
    html += '</div>';
    html += '<div style="font-size:11px;color:var(--t4);margin-bottom:8px">共 <span id="rc">' + allVideos.length + '</span> 条</div>';
    html += '<div class="vl" id="vlist"></div>';
    html += '<div class="pag" id="pag"></div>';
    
    document.getElementById('tc-browse').innerHTML = html;
    
    // 存储所有视频用于过滤
    AppState.allVideos = allVideos;
    applyF();
    initRefSystem();
  } catch (e) {
    document.getElementById('tc-browse').innerHTML = 
      '<div style="color:var(--err);padding:20px;text-align:center">加载失败: ' + esc(e.message) + '</div>';
  }
}

/* === 因子提取 === */
async function rFactors() {
  showLoading('tc-factors');
  
  try {
    const keywords = await DataStore.getFactorKeywords();
    const videos = await DataStore.getVideos();
    
    let html = '<h3 data-ref="transcript-factors" style="font-size:13px;margin-bottom:14px">因子提取</h3>';
    
    if (!keywords || keywords.length === 0) {
      html += '<div style="background:var(--bg3);border:1px solid var(--border);border-radius:6px;padding:20px;text-align:center;color:var(--t3)">暂无因子数据</div>';
    } else {
      html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:8px">';
      
      const factorStats = keywords.map(f => {
        let count = 0;
        videos.forEach(v => {
          if (v.preview && v.preview.includes(f.keyword)) count++;
        });
        return { ...f, count: count };
      }).filter(f => f.count > 0).sort((a, b) => b.count - a.count);
      
      factorStats.forEach(f => {
        const cls = f.type === 'macro' ? 't-macro' : f.type === 'supply' ? 't-comm' : f.type === 'capital' ? 't-stock' : 't-mix';
        html += '<div style="background:var(--bg3);border:1px solid var(--border);border-radius:6px;padding:10px">';
        html += '<div style="font-size:12px;font-weight:600">' + esc(f.keyword) + '</div>';
        html += '<span class="tag ' + cls + '">' + esc(f.typeName || f.type) + '</span>';
        html += '<div style="font-size:16px;font-weight:700;margin:6px 0">' + f.count + ' <span style="font-size:10px;color:var(--t4)">个视频提及</span></div>';
        html += '</div>';
      });
      
      html += '</div>';
    }
    
    document.getElementById('tc-factors').innerHTML = html;
    initRefSystem();
  } catch (e) {
    document.getElementById('tc-factors').innerHTML = 
      '<div style="color:var(--err);padding:20px;text-align:center">加载失败: ' + esc(e.message) + '</div>';
  }
}

/* === 辅助函数 === */
function applyF() {
  const filters = {
    upId: document.getElementById('fUp')?.value || '',
    category: document.getElementById('fCat')?.value || '',
    fromDate: document.getElementById('fFrom')?.value || '',
    toDate: document.getElementById('fTo')?.value || '',
    search: document.getElementById('fSearch')?.value || ''
  };
  
  let filtered = AppState.allVideos || [];
  
  if (filters.upId) {
    filtered = filtered.filter(v => v.up_id === filters.upId);
  }
  if (filters.category) {
    filtered = filtered.filter(v => v.category === filters.category);
  }
  if (filters.fromDate) {
    filtered = filtered.filter(v => v.publish_date >= filters.fromDate);
  }
  if (filters.toDate) {
    filtered = filtered.filter(v => v.publish_date <= filters.toDate);
  }
  if (filters.search && filters.search.length >= 2) {
    const kw = filters.search.toLowerCase();
    filtered = filtered.filter(v => 
      (v.title && v.title.toLowerCase().includes(kw)) ||
      (v.preview && v.preview.toLowerCase().includes(kw))
    );
  }
  
  const sort = document.getElementById('fSort')?.value || 'dd';
  if (sort === 'dd') {
    filtered.sort((a, b) => (b.publish_date || '').localeCompare(a.publish_date || ''));
  } else {
    filtered.sort((a, b) => (a.publish_date || '').localeCompare(b.publish_date || ''));
  }
  
  AppState.filteredVideos = filtered;
  AppState.currentPage = 1;
  const rcEl = document.getElementById('rc');
  if (rcEl) rcEl.textContent = filtered.length;
  rVList();
}

async function rVList() {
  const pg = AppState.pageSize;
  const s = (AppState.currentPage - 1) * pg;
  const e = s + pg;
  const pageVideos = (AppState.filteredVideos || []).slice(s, e);
  const tp = Math.ceil((AppState.filteredVideos || []).length / pg);
  
  let html = '';
  for (const v of pageVideos) {
    const upName = _upNameCache[v.up_id] || v.up_id;
    html += '<div class="vi" id="v-' + v._id + '" onclick="togExp(\'' + v._id + '\')">';
    html += '<div class="vh">';
    html += '<div class="vt">' + esc(v.title) + '</div>';
    html += '<div class="vm">';
    html += '<span class="tag ' + catCls(v.category || '') + '">' + esc(v.category || '未分类') + '</span>';
    html += '<span>' + (v.publish_date || '') + '</span>';
    html += '<span style="color:var(--t3)">' + esc(upName) + '</span>';
    html += '</div>';
    html += '</div>';
    html += '<div class="vp" id="p-' + v._id + '">' + esc(v.preview || '') + '...</div>';
    html += '</div>';
  }
  
  const vlistEl = document.getElementById('vlist');
  if (vlistEl) vlistEl.innerHTML = html;
  
  // 分页
  let ph = '';
  if (AppState.currentPage > 1) ph += '<div class="pb" onclick="gP(' + (AppState.currentPage - 1) + ')">‹</div>';
  
  const startPage = Math.max(1, AppState.currentPage - 2);
  const endPage = Math.min(tp, AppState.currentPage + 2);
  
  for (let i = startPage; i <= endPage; i++) {
    ph += '<div class="pb ' + (i === AppState.currentPage ? 'active' : '') + '" onclick="gP(' + i + ')">' + i + '</div>';
  }
  
  if (AppState.currentPage < tp) ph += '<div class="pb" onclick="gP(' + (AppState.currentPage + 1) + ')">›</div>';
  
  const pagEl = document.getElementById('pag');
  if (pagEl) pagEl.innerHTML = ph;
}

function gP(p) {
  AppState.currentPage = p;
  rVList();
}

async function togExp(id) {
  const el = document.getElementById('v-' + id);
  const pr = document.getElementById('p-' + id);
  const v = (AppState.filteredVideos || []).find(x => x._id === id);
  
  if (!v || !el || !pr) return;
  
  if (el.classList.contains('open')) {
    el.classList.remove('open');
    pr.innerHTML = esc(v.preview || '') + '...';
  } else {
    el.classList.add('open');
    
    let fullTextHtml = '<span style="color:var(--t4)">加载中...</span>';
    try {
      const fullText = await DataStore.getVideoFullText(id);
      if (fullText && fullText.length > 0) {
        fullTextHtml = esc(fullText);
        v._fullText = fullText;
      } else {
        fullTextHtml = '<span style="color:var(--t4)">暂无全文</span>';
      }
    } catch (e) {
      fullTextHtml = '<span style="color:var(--t4)">加载失败</span>';
    }
    
    pr.innerHTML = '<div style="margin-bottom:6px">' +
      '<button class="btn btn-p btn-s" onclick="event.stopPropagation();openDet(\'' + id + '\')">📄 全文</button> ' +
      '<a href="https://www.bilibili.com/video/' + (v.source_id || id) + '" target="_blank" class="btn btn-o btn-s" style="text-decoration:none" onclick="event.stopPropagation()">▶️ B站</a>' +
      '</div>' + fullTextHtml;
  }
}

async function openDet(id) {
  const v = (AppState.filteredVideos || []).find(x => x._id === id);
  if (!v) return;
  
  const upName = _upNameCache[v.up_id] || v.up_id;
  
  document.getElementById('detTitle').textContent = v.title;
  
  let fullText = v._fullText;
  if (!fullText) {
    try {
      fullText = await DataStore.getVideoFullText(id);
    } catch (e) {
      fullText = '';
    }
  }
  
  document.getElementById('detBody').innerHTML = 
    '<div class="dm">' +
    '<span>UP主: ' + esc(upName) + '</span>' +
    '<span>日期: ' + (v.publish_date || '') + '</span>' +
    '<span>分类: ' + esc(v.category || '') + '</span>' +
    '</div>' +
    '<div style="margin-bottom:10px;display:flex;gap:6px">' +
    '<button class="btn btn-o btn-s" onclick="copyFullText(\'' + id + '\')">📋 复制全文</button>' +
    '</div>' +
    '<div class="dc">' + (fullText ? esc(fullText) : '<span style="color:var(--t4)">暂无全文</span>') + '</div>';
  
  document.getElementById('detail').classList.add('show');
}

function closeDet() {
  document.getElementById('detail').classList.remove('show');
}

function copyFullText(id) {
  const v = (AppState.filteredVideos || []).find(x => x._id === id);
  if (v && v._fullText) {
    navigator.clipboard.writeText(v._fullText).then(function() {
      showToast('已复制');
    });
  } else {
    showToast('暂无全文');
  }
}

function showLoading(containerId) {
  const el = document.getElementById(containerId);
  if (el) {
    el.innerHTML = 
      '<div style="display:flex;align-items:center;justify-content:center;padding:40px;color:var(--t3)">' +
      '<span style="margin-right:8px">⏳</span>加载中...' +
      '</div>';
  }
}
