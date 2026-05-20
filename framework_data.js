var FRAMEWORK = {
  version: "1.0",
  lastUpdate: "2026-05-20",
  layers: [
    {
      id: "L4",
      name: "展示层",
      nameEn: "Presentation",
      desc: "用户看到和交互的一切",
      color: "#22c55e",
      modules: [
        {
          id: "L4-transcript",
          name: "转录库",
          status: "active",
          children: ["总览", "UP主管理", "转录任务", "内容浏览", "因子提取"]
        },
        {
          id: "L4-project",
          name: "项目控制台",
          status: "active",
          children: ["里程碑进度", "任务看板", "决策日志", "架构蓝图"]
        },
        {
          id: "L4-data",
          name: "数据采集",
          status: "placeholder",
          children: ["宏观数据", "行情数据", "供需数据", "资金/持仓", "新闻/研报"]
        },
        {
          id: "L4-analysis",
          name: "分析工具",
          status: "placeholder",
          children: ["价格分析", "基本面分析", "资金面分析", "周期/季节性", "跨品种/跨市场"]
        },
        {
          id: "L4-visual",
          name: "可视化",
          status: "placeholder",
          children: ["K线/走势图", "多品种对比", "热力图/矩阵", "时间线/日历", "仪表盘总览"]
        },
        {
          id: "L4-notes",
          name: "研究笔记",
          status: "placeholder",
          children: ["交易日志", "观点记录", "逻辑验证", "漏斗模型"]
        },
        {
          id: "L4-auto",
          name: "自动化",
          status: "placeholder",
          children: ["定时数据采集", "预警/提醒", "日报/周报生成", "新视频自动转录"]
        }
      ]
    },
    {
      id: "L3",
      name: "逻辑层",
      nameEn: "Business Logic",
      desc: "处理数据的规则和引擎",
      color: "#3b82f6",
      modules: [
        { id: "L3-router", name: "路由引擎", desc: "模块切换/tab切换/页面状态", status: "active" },
        { id: "L3-auth", name: "认证逻辑", desc: "SHA-256密码验证+7天localStorage缓存", status: "active" },
        { id: "L3-search", name: "搜索引擎", desc: "全文检索/分类筛选/日期排序/分页", status: "active" },
        { id: "L3-factor", name: "因子引擎", desc: "关键词匹配+4类因子分类+频率统计", status: "active" },
        { id: "L3-project", name: "项目管理逻辑", desc: "里程碑/看板/决策的状态管理", status: "active" },
        { id: "L3-theme", name: "主题系统", desc: "暗色/亮色切换+CSS变量", status: "active" },
        { id: "L3-ai", name: "AI分析接口", desc: "调用外部AI分析视频逻辑/观点/因子", status: "planned" },
        { id: "L3-feedback", name: "反馈模式", desc: "元素引用ID+点击选中+上下文复制", status: "planned" }
      ]
    },
    {
      id: "L2",
      name: "数据层",
      nameEn: "Data",
      desc: "所有结构化数据的存储和加载",
      color: "#a78bfa",
      modules: [
        { id: "L2-videos", name: "videos_data.js", desc: "500条转录数据(4.6MB)", status: "active" },
        { id: "L2-project", name: "project_data.js", desc: "项目状态/里程碑/任务/决策", status: "active" },
        { id: "L2-up", name: "up_stats.js", desc: "UP主统计", status: "active" },
        { id: "L2-cat", name: "cat_stats.js", desc: "分类统计", status: "active" },
        { id: "L2-framework", name: "framework_data.js", desc: "架构定义", status: "active" },
        { id: "L2-factors", name: "factors_data.js", desc: "因子提取结果(规划)", status: "planned" },
        { id: "L2-analysis", name: "analysis_data.js", desc: "AI分析结果(规划)", status: "planned" }
      ]
    },
    {
      id: "L1",
      name: "基础设施层",
      nameEn: "Infrastructure",
      desc: "部署/认证/更新/DNS等底层支撑",
      color: "#f59e0b",
      modules: [
        { id: "L1-deploy", name: "部署", desc: "GitHub Pages → wudaoseng.com", status: "active" },
        { id: "L1-auth", name: "访问控制", desc: "前端SHA-256密码保护", status: "active" },
        { id: "L1-pipeline", name: "更新管道", desc: "Agent → GitHub API → Pages自动部署", status: "active" },
        { id: "L1-dns", name: "DNS/HTTPS", desc: "阿里云DNS + GitHub Pages SSL", status: "active" },
        { id: "L1-version", name: "版本管理", desc: "语义版本号 + 变更前快照 + 一键回滚", status: "planned" }
      ]
    }
  ],
  restructurePlan: {
    current: "单文件(index.html 35KB, CSS+JS+HTML内联)",
    target: "模块化分离",
    steps: [
      { step: 1, name: "拆分CSS", desc: "core.css + theme-dark.css + theme-light.css", priority: "high" },
      { step: 2, name: "拆分JS", desc: "core.js + transcript.js + project.js + 各模块独立文件", priority: "high" },
      { step: 3, name: "HTML瘦身", desc: "index.html只保留骨架和script引用", priority: "high" },
      { step: 4, name: "版本系统", desc: "VERSION文件 + 变更快照 + 回滚脚本", priority: "medium" },
      { step: 5, name: "反馈模式", desc: "元素data-ref + 点击选中 + 上下文复制", priority: "medium" }
    ]
  }
};
