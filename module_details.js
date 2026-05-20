// 模块详情数据 - 架构蓝图下钻功能
var MODULE_DETAILS = {
  // ========== L4 展示层 ==========
  "L4-transcript": {
    name: "转录库",
    status: "active",
    desc: "UP主视频转录与内容管理核心系统，支持多维度数据展示与因子提取",
    archPath: "L4-展示层 > 转录库",
    renderer: "rOverview()",
    codeFile: "index.html",
    dataFile: "videos_data.js",
    subModules: [
      { id: "transcript-overview", name: "总览", status: "active", desc: "转录数据统计与可视化总览", renderer: "rOverview()" },
      { id: "transcript-ups", name: "UP主管理", status: "active", desc: "UP主信息管理与统计分析", renderer: "rUps()" },
      { id: "transcript-tasks", name: "转录任务", status: "active", desc: "视频转录任务队列与管理", renderer: "rTasks()" },
      { id: "transcript-browse", name: "内容浏览", status: "active", desc: "转录内容浏览与搜索", renderer: "rBrowse()" },
      { id: "transcript-factors", name: "因子提取", status: "active", desc: "AI辅助因子提取与分析", renderer: "rFactors()" }
    ]
  },
  "L4-project": {
    name: "项目控制台",
    status: "active",
    desc: "项目进度管理与决策追踪系统，包含里程碑、看板、决策日志等模块",
    archPath: "L4-展示层 > 项目控制台",
    renderer: "rProject()",
    codeFile: "index.html",
    dataFile: "project_data.js",
    subModules: [
      { id: "project-phase", name: "里程碑进度", status: "active", desc: "项目阶段与里程碑追踪", renderer: "rProject()", dataFile: "project_data.js" },
      { id: "project-kanban", name: "任务看板", status: "active", desc: "看板式任务管理", renderer: "rProject()", dataFile: "project_data.js" },
      { id: "project-decisions", name: "决策日志", status: "active", desc: "关键决策记录与追溯", renderer: "rProject()", dataFile: "project_data.js" },
      { id: "project-blueprint", name: "架构蓝图", status: "active", desc: "系统架构全景视图与下钻", renderer: "rProject()", dataFile: "framework_data.js" }
    ]
  },
  "L4-data": {
    name: "数据采集",
    status: "placeholder",
    desc: "期货市场多维度数据采集系统（规划中）",
    archPath: "L4-展示层 > 数据采集",
    subModules: [
      { id: "data-macro", name: "宏观数据", status: "planned", desc: "宏观经济指标采集" },
      { id: "data-market", name: "行情数据", status: "planned", desc: "期货行情实时数据" },
      { id: "data-supply", name: "供需数据", status: "planned", desc: "供需平衡数据" },
      { id: "data-position", name: "资金/持仓", status: "planned", desc: "持仓与资金流向" },
      { id: "data-news", name: "新闻/研报", status: "planned", desc: "资讯与研报采集" }
    ]
  },
  "L4-analysis": {
    name: "分析工具",
    status: "placeholder",
    desc: "多维度市场分析工具集（规划中）",
    archPath: "L4-展示层 > 分析工具",
    subModules: [
      { id: "analysis-price", name: "价格分析", status: "planned", desc: "价格走势与形态分析" },
      { id: "analysis-fundamental", name: "基本面分析", status: "planned", desc: "供需与库存分析" },
      { id: "analysis-fund", name: "资金面分析", status: "planned", desc: "资金流向与持仓分析" },
      { id: "analysis-cycle", name: "周期/季节性", status: "planned", desc: "周期性与季节性分析" },
      { id: "analysis-cross", name: "跨品种/跨市场", status: "planned", desc: "跨品种与跨市场分析" }
    ]
  },
  "L4-visual": {
    name: "可视化",
    status: "placeholder",
    desc: "多样化图表可视化组件（规划中）",
    archPath: "L4-展示层 > 可视化",
    subModules: [
      { id: "visual-kline", name: "K线/走势图", status: "planned", desc: "K线与自定义走势图表" },
      { id: "visual-compare", name: "多品种对比", status: "planned", desc: "多品种叠加对比" },
      { id: "visual-heatmap", name: "热力图/矩阵", status: "planned", desc: "相关性与热力图展示" },
      { id: "visual-timeline", name: "时间线/日历", status: "planned", desc: "事件时间线与日历视图" },
      { id: "visual-dashboard", name: "仪表盘总览", status: "planned", desc: "综合仪表盘视图" }
    ]
  },
  "L4-notes": {
    name: "研究笔记",
    status: "placeholder",
    desc: "投研笔记与逻辑验证系统（规划中）",
    archPath: "L4-展示层 > 研究笔记",
    subModules: [
      { id: "notes-trade", name: "交易日志", status: "planned", desc: "交易记录与反思" },
      { id: "notes-view", name: "观点记录", status: "planned", desc: "市场观点与预判" },
      { id: "notes-verify", name: "逻辑验证", status: "planned", desc: "逻辑假设验证追踪" },
      { id: "notes-funnel", name: "漏斗模型", status: "planned", desc: "决策漏斗模型" }
    ]
  },
  "L4-auto": {
    name: "自动化",
    status: "placeholder",
    desc: "自动化任务与报告生成（规划中）",
    archPath: "L4-展示层 > 自动化",
    subModules: [
      { id: "auto-collect", name: "定时数据采集", status: "planned", desc: "定时数据采集任务" },
      { id: "auto-alert", name: "预警/提醒", status: "planned", desc: "价格预警与提醒" },
      { id: "auto-report", name: "日报/周报生成", status: "planned", desc: "自动化报告生成" },
      { id: "auto-transcribe", name: "新视频自动转录", status: "planned", desc: "B站新视频自动转录" }
    ]
  },

  // ========== L3 逻辑层 ==========
  "L3-router": {
    name: "路由引擎",
    status: "active",
    desc: "模块切换/tab切换/页面状态的统一路由管理",
    archPath: "L3-逻辑层 > 路由引擎",
    renderer: "setMod()",
    codeFile: "index.html"
  },
  "L3-auth": {
    name: "认证逻辑",
    status: "active",
    desc: "SHA-256密码验证+7天localStorage缓存的安全认证",
    archPath: "L3-逻辑层 > 认证逻辑",
    renderer: "checkAuth()",
    codeFile: "index.html"
  },
  "L3-search": {
    name: "搜索引擎",
    status: "active",
    desc: "全文检索/分类筛选/日期排序/分页的搜索能力",
    archPath: "L3-逻辑层 > 搜索引擎",
    codeFile: "index.html"
  },
  "L3-factor": {
    name: "因子引擎",
    status: "active",
    desc: "关键词匹配+4类因子分类+频率统计的因子分析",
    archPath: "L3-逻辑层 > 因子引擎",
    codeFile: "index.html"
  },
  "L3-project": {
    name: "项目管理逻辑",
    status: "active",
    desc: "里程碑/看板/决策的状态管理与数据处理",
    archPath: "L3-逻辑层 > 项目管理逻辑",
    renderer: "rProject()",
    codeFile: "index.html",
    dataFile: "project_data.js"
  },
  "L3-theme": {
    name: "主题系统",
    status: "active",
    desc: "暗色/亮色切换+CSS变量的主题管理",
    archPath: "L3-逻辑层 > 主题系统",
    codeFile: "index.html"
  },
  "L3-ai": {
    name: "AI分析接口",
    status: "planned",
    desc: "调用外部AI分析视频逻辑/观点/因子（规划中）",
    archPath: "L3-逻辑层 > AI分析接口",
    subModules: [
      { id: "ai-video-analysis", name: "视频逻辑分析", status: "planned", desc: "AI分析视频内容逻辑" },
      { id: "ai-viewpoint", name: "观点提取", status: "planned", desc: "AI提取关键观点" },
      { id: "ai-factor", name: "因子识别", status: "planned", desc: "AI识别潜在因子" }
    ]
  },
  "L3-feedback": {
    name: "反馈模式",
    status: "planned",
    desc: "元素引用ID+点击选中+上下文复制（规划中）",
    archPath: "L3-逻辑层 > 反馈模式",
    codeFile: "index.html"
  },

  // ========== L2 数据层 ==========
  "L2-videos": {
    name: "videos_data.js",
    status: "active",
    desc: "500条转录数据(4.6MB)，包含视频标题/UP主/转录内容/因子",
    archPath: "L2-数据层 > videos_data",
    codeFile: "videos_data.js"
  },
  "L2-project": {
    name: "project_data.js",
    status: "active",
    desc: "项目状态/里程碑/任务/决策等项目管理数据",
    archPath: "L2-数据层 > project_data",
    codeFile: "project_data.js"
  },
  "L2-up": {
    name: "up_stats.js",
    status: "active",
    desc: "UP主统计数据与排名信息",
    archPath: "L2-数据层 > up_stats",
    codeFile: "up_stats.js"
  },
  "L2-cat": {
    name: "cat_stats.js",
    status: "active",
    desc: "分类统计数据",
    archPath: "L2-数据层 > cat_stats",
    codeFile: "cat_stats.js"
  },
  "L2-framework": {
    name: "framework_data.js",
    status: "active",
    desc: "系统架构定义数据，包含层级/模块/子模块结构",
    archPath: "L2-数据层 > framework_data",
    codeFile: "framework_data.js"
  },
  "L2-factors": {
    name: "factors_data.js",
    status: "planned",
    desc: "因子提取结果数据（规划中）",
    archPath: "L2-数据层 > factors_data"
  },
  "L2-analysis": {
    name: "analysis_data.js",
    status: "planned",
    desc: "AI分析结果数据（规划中）",
    archPath: "L2-数据层 > analysis_data"
  },

  // ========== L1 基础设施层 ==========
  "L1-deploy": {
    name: "部署",
    status: "active",
    desc: "GitHub Pages自动部署，访问地址 wudaoseng.com",
    archPath: "L1-基础设施层 > 部署"
  },
  "L1-auth": {
    name: "访问控制",
    status: "active",
    desc: "前端SHA-256密码保护，7天缓存有效期",
    archPath: "L1-基础设施层 > 访问控制"
  },
  "L1-pipeline": {
    name: "更新管道",
    status: "active",
    desc: "Agent → GitHub API → Pages自动部署的完整流水线",
    archPath: "L1-基础设施层 > 更新管道"
  },
  "L1-dns": {
    name: "DNS/HTTPS",
    status: "active",
    desc: "阿里云DNS解析 + GitHub Pages SSL证书",
    archPath: "L1-基础设施层 > DNS/HTTPS"
  },
  "L1-version": {
    name: "版本管理",
    status: "planned",
    desc: "语义版本号 + 变更前快照 + 一键回滚（规划中）",
    archPath: "L1-基础设施层 > 版本管理"
  }
};
