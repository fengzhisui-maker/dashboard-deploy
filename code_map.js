// 代码地图：每个data-ref对应的完整上下文
// 用户复制引用时，连同这个上下文一起复制，Agent拿到后精确定位
var CODE_MAP = {
  // === 侧边栏导航 ===
  "nav-transcript": { layer: "L4", module: "转录库", renderer: "setMod('transcript')", codeFile: "index.html", desc: "侧边栏转录库导航项" },
  "nav-project": { layer: "L4", module: "项目控制台", renderer: "setMod('project')", codeFile: "index.html", desc: "侧边栏项目控制台导航项" },
  "nav-data": { layer: "L4", module: "数据采集", renderer: "占位", codeFile: "index.html", desc: "侧边栏数据采集导航项（未开发）" },
  "nav-analysis": { layer: "L4", module: "分析工具", renderer: "占位", codeFile: "index.html", desc: "侧边栏分析工具导航项（未开发）" },
  "nav-visual": { layer: "L4", module: "可视化", renderer: "占位", codeFile: "index.html", desc: "侧边栏可视化导航项（未开发）" },
  "nav-notes": { layer: "L4", module: "研究笔记", renderer: "占位", codeFile: "index.html", desc: "侧边栏研究笔记导航项（未开发）" },
  "nav-auto": { layer: "L4", module: "自动化", renderer: "占位", codeFile: "index.html", desc: "侧边栏自动化导航项（未开发）" },

  // === 转录库模块 ===
  "transcript-overview": { layer: "L4", module: "转录库", subModule: "总览", renderer: "rOverview()", codeFile: "index.html", archPath: "L4-transcript > 总览", desc: "总览统计卡片+已收录UP主+分类分布" },
  "transcript-ups": { layer: "L4", module: "转录库", subModule: "UP主管理", renderer: "rUps()", codeFile: "index.html", archPath: "L4-transcript > UP主管理", desc: "UP主卡片列表+追加转录/浏览内容按钮" },
  "transcript-tasks": { layer: "L4", module: "转录库", subModule: "转录任务", renderer: "rTasks()", codeFile: "index.html", archPath: "L4-transcript > 转录任务", desc: "新建转录任务表单+历史任务列表" },
  "transcript-browse": { layer: "L4", module: "转录库", subModule: "内容浏览", renderer: "rBrowse()", codeFile: "index.html", archPath: "L4-transcript > 内容浏览", desc: "筛选栏+视频列表+分页+展开预览+全文侧边栏" },
  "transcript-factors": { layer: "L4", module: "转录库", subModule: "因子提取", renderer: "rFactors()", codeFile: "index.html", archPath: "L4-transcript > 因子提取", desc: "4类因子关键词统计网格（宏观/供需/资金/情绪）" },

  // === 项目控制台模块 ===
  "project-phase": { layer: "L4", module: "项目控制台", subModule: "当前阶段", renderer: "rProject()", codeFile: "index.html", archPath: "L4-project > 当前阶段", desc: "当前阶段名称+上次更新时间" },
  "project-milestones": { layer: "L4", module: "项目控制台", subModule: "里程碑", renderer: "rProject()", codeFile: "index.html", archPath: "L4-project > 里程碑", dataFile: "project_data.js", desc: "9个里程碑进度条（done/partial/todo）" },
  "project-kanban": { layer: "L4", module: "项目控制台", subModule: "任务看板", renderer: "rProject()", codeFile: "index.html", archPath: "L4-project > 任务看板", dataFile: "project_data.js", desc: "4列Kanban看板" },
  "project-kanban-backlog": { layer: "L4", module: "项目控制台", subModule: "任务看板>待办", renderer: "rProject()", codeFile: "index.html", archPath: "L4-project > 任务看板 > 待办", dataFile: "project_data.js", desc: "待办任务列表" },
  "project-kanban-progress": { layer: "L4", module: "项目控制台", subModule: "任务看板>进行中", renderer: "rProject()", codeFile: "index.html", archPath: "L4-project > 任务看板 > 进行中", dataFile: "project_data.js", desc: "进行中任务列表" },
  "project-kanban-done": { layer: "L4", module: "项目控制台", subModule: "任务看板>已完成", renderer: "rProject()", codeFile: "index.html", archPath: "L4-project > 任务看板 > 已完成", dataFile: "project_data.js", desc: "已完成任务列表" },
  "project-kanban-blocked": { layer: "L4", module: "项目控制台", subModule: "任务看板>阻塞", renderer: "rProject()", codeFile: "index.html", archPath: "L4-project > 任务看板 > 阻塞", dataFile: "project_data.js", desc: "阻塞任务列表" },
  "project-decisions": { layer: "L4", module: "项目控制台", subModule: "决策日志", renderer: "rProject()", codeFile: "index.html", archPath: "L4-project > 决策日志", dataFile: "project_data.js", desc: "关键决策时间线" },
  "project-scope": { layer: "L4", module: "项目控制台", subModule: "范围边界", renderer: "rProject()", codeFile: "index.html", archPath: "L4-project > 范围边界", dataFile: "project_data.js", desc: "在范围内 vs 不在范围内" },
  "project-blueprint": { layer: "L4", module: "项目控制台", subModule: "架构蓝图", renderer: "rProject()", codeFile: "index.html", archPath: "L4-project > 架构蓝图", dataFile: "framework_data.js", desc: "4层架构可视化" },
  "blueprint-L4": { layer: "L4", module: "架构蓝图", subModule: "展示层", renderer: "rProject()", codeFile: "index.html", archPath: "L4 展示层", dataFile: "framework_data.js", desc: "用户看到和交互的一切" },
  "blueprint-L3": { layer: "L3", module: "架构蓝图", subModule: "逻辑层", renderer: "rProject()", codeFile: "index.html", archPath: "L3 逻辑层", dataFile: "framework_data.js", desc: "处理数据的规则和引擎" },
  "blueprint-L2": { layer: "L2", module: "架构蓝图", subModule: "数据层", renderer: "rProject()", codeFile: "index.html", archPath: "L2 数据层", dataFile: "framework_data.js", desc: "所有结构化数据的存储和加载" },
  "blueprint-L1": { layer: "L1", module: "架构蓝图", subModule: "基础设施层", renderer: "rProject()", codeFile: "index.html", archPath: "L1 基础设施层", dataFile: "framework_data.js", desc: "部署/认证/更新/DNS等底层支撑" },
  "project-restructure": { layer: "L4", module: "项目控制台", subModule: "重构计划", renderer: "rProject()", codeFile: "index.html", archPath: "L4-project > 重构计划", dataFile: "framework_data.js", desc: "模块化拆分5步计划" }

  // === 架构蓝图模块详情 ===
  "L4-transcript": { layer: "L4", module: "转录库", renderer: "rOverview()", codeFile: "index.html", archPath: "L4-展示层 > 转录库", dataFile: "videos_data.js", desc: "UP主视频转录与内容管理核心系统" },
  "transcript-overview": { layer: "L4", module: "转录库", subModule: "总览", renderer: "rOverview()", codeFile: "index.html", archPath: "L4-transcript > 总览", desc: "总览统计卡片+已收录UP主+分类分布" },
  "transcript-ups": { layer: "L4", module: "转录库", subModule: "UP主管理", renderer: "rUps()", codeFile: "index.html", archPath: "L4-transcript > UP主管理", desc: "UP主卡片列表+追加转录/浏览内容按钮" },
  "transcript-tasks": { layer: "L4", module: "转录库", subModule: "转录任务", renderer: "rTasks()", codeFile: "index.html", archPath: "L4-transcript > 转录任务", desc: "新建转录任务表单+历史任务列表" },
  "transcript-browse": { layer: "L4", module: "转录库", subModule: "内容浏览", renderer: "rBrowse()", codeFile: "index.html", archPath: "L4-transcript > 内容浏览", desc: "筛选栏+视频列表+分页+展开预览+全文侧边栏" },
  "transcript-factors": { layer: "L4", module: "转录库", subModule: "因子提取", renderer: "rFactors()", codeFile: "index.html", archPath: "L4-transcript > 因子提取", desc: "4类因子关键词统计网格" },

  "L4-project": { layer: "L4", module: "项目控制台", renderer: "rProject()", codeFile: "index.html", archPath: "L4-展示层 > 项目控制台", dataFile: "project_data.js", desc: "项目进度管理与决策追踪系统" },
  "project-phase": { layer: "L4", module: "项目控制台", subModule: "里程碑进度", renderer: "rProject()", codeFile: "index.html", archPath: "L4-project > 里程碑进度", dataFile: "project_data.js", desc: "项目阶段与里程碑追踪" },
  "project-kanban": { layer: "L4", module: "项目控制台", subModule: "任务看板", renderer: "rProject()", codeFile: "index.html", archPath: "L4-project > 任务看板", dataFile: "project_data.js", desc: "看板式任务管理" },
  "project-decisions": { layer: "L4", module: "项目控制台", subModule: "决策日志", renderer: "rProject()", codeFile: "index.html", archPath: "L4-project > 决策日志", dataFile: "project_data.js", desc: "关键决策记录与追溯" },
  "project-blueprint": { layer: "L4", module: "项目控制台", subModule: "架构蓝图", renderer: "rProject()", codeFile: "index.html", archPath: "L4-project > 架构蓝图", dataFile: "framework_data.js", desc: "系统架构全景视图与下钻" },
  "project-restructure": { layer: "L4", module: "项目控制台", subModule: "重构计划", renderer: "rProject()", codeFile: "index.html", archPath: "L4-project > 重构计划", dataFile: "framework_data.js", desc: "模块化拆分5步计划" },

  "L4-data": { layer: "L4", module: "数据采集", archPath: "L4-展示层 > 数据采集", desc: "期货市场多维度数据采集系统（规划中）" },
  "data-macro": { layer: "L4", module: "数据采集", subModule: "宏观数据", archPath: "L4-data > 宏观数据", desc: "宏观经济指标采集（规划中）" },
  "data-market": { layer: "L4", module: "数据采集", subModule: "行情数据", archPath: "L4-data > 行情数据", desc: "期货行情实时数据（规划中）" },
  "data-supply": { layer: "L4", module: "数据采集", subModule: "供需数据", archPath: "L4-data > 供需数据", desc: "供需平衡数据（规划中）" },
  "data-position": { layer: "L4", module: "数据采集", subModule: "资金/持仓", archPath: "L4-data > 资金/持仓", desc: "持仓与资金流向（规划中）" },
  "data-news": { layer: "L4", module: "数据采集", subModule: "新闻/研报", archPath: "L4-data > 新闻/研报", desc: "资讯与研报采集（规划中）" },

  "L4-analysis": { layer: "L4", module: "分析工具", archPath: "L4-展示层 > 分析工具", desc: "多维度市场分析工具集（规划中）" },
  "analysis-price": { layer: "L4", module: "分析工具", subModule: "价格分析", archPath: "L4-analysis > 价格分析", desc: "价格走势与形态分析（规划中）" },
  "analysis-fundamental": { layer: "L4", module: "分析工具", subModule: "基本面分析", archPath: "L4-analysis > 基本面分析", desc: "供需与库存分析（规划中）" },
  "analysis-fund": { layer: "L4", module: "分析工具", subModule: "资金面分析", archPath: "L4-analysis > 资金面分析", desc: "资金流向与持仓分析（规划中）" },
  "analysis-cycle": { layer: "L4", module: "分析工具", subModule: "周期/季节性", archPath: "L4-analysis > 周期/季节性", desc: "周期性与季节性分析（规划中）" },
  "analysis-cross": { layer: "L4", module: "分析工具", subModule: "跨品种/跨市场", archPath: "L4-analysis > 跨品种/跨市场", desc: "跨品种与跨市场分析（规划中）" },

  "L4-visual": { layer: "L4", module: "可视化", archPath: "L4-展示层 > 可视化", desc: "多样化图表可视化组件（规划中）" },
  "visual-kline": { layer: "L4", module: "可视化", subModule: "K线/走势图", archPath: "L4-visual > K线/走势图", desc: "K线与自定义走势图表（规划中）" },
  "visual-compare": { layer: "L4", module: "可视化", subModule: "多品种对比", archPath: "L4-visual > 多品种对比", desc: "多品种叠加对比（规划中）" },
  "visual-heatmap": { layer: "L4", module: "可视化", subModule: "热力图/矩阵", archPath: "L4-visual > 热力图/矩阵", desc: "相关性与热力图展示（规划中）" },
  "visual-timeline": { layer: "L4", module: "可视化", subModule: "时间线/日历", archPath: "L4-visual > 时间线/日历", desc: "事件时间线与日历视图（规划中）" },
  "visual-dashboard": { layer: "L4", module: "可视化", subModule: "仪表盘总览", archPath: "L4-visual > 仪表盘总览", desc: "综合仪表盘视图（规划中）" },

  "L4-notes": { layer: "L4", module: "研究笔记", archPath: "L4-展示层 > 研究笔记", desc: "投研笔记与逻辑验证系统（规划中）" },
  "notes-trade": { layer: "L4", module: "研究笔记", subModule: "交易日志", archPath: "L4-notes > 交易日志", desc: "交易记录与反思（规划中）" },
  "notes-view": { layer: "L4", module: "研究笔记", subModule: "观点记录", archPath: "L4-notes > 观点记录", desc: "市场观点与预判（规划中）" },
  "notes-verify": { layer: "L4", module: "研究笔记", subModule: "逻辑验证", archPath: "L4-notes > 逻辑验证", desc: "逻辑假设验证追踪（规划中）" },
  "notes-funnel": { layer: "L4", module: "研究笔记", subModule: "漏斗模型", archPath: "L4-notes > 漏斗模型", desc: "决策漏斗模型（规划中）" },

  "L4-auto": { layer: "L4", module: "自动化", archPath: "L4-展示层 > 自动化", desc: "自动化任务与报告生成（规划中）" },
  "auto-collect": { layer: "L4", module: "自动化", subModule: "定时数据采集", archPath: "L4-auto > 定时数据采集", desc: "定时数据采集任务（规划中）" },
  "auto-alert": { layer: "L4", module: "自动化", subModule: "预警/提醒", archPath: "L4-auto > 预警/提醒", desc: "价格预警与提醒（规划中）" },
  "auto-report": { layer: "L4", module: "自动化", subModule: "日报/周报生成", archPath: "L4-auto > 日报/周报生成", desc: "自动化报告生成（规划中）" },
  "auto-transcribe": { layer: "L4", module: "自动化", subModule: "新视频自动转录", archPath: "L4-auto > 新视频自动转录", desc: "B站新视频自动转录（规划中）" },

  // === L3 逻辑层 ===
  "L3-router": { layer: "L3", module: "路由引擎", codeFile: "index.html", archPath: "L3-逻辑层 > 路由引擎", desc: "模块切换/tab切换/页面状态的统一路由管理" },
  "L3-auth": { layer: "L3", module: "认证逻辑", codeFile: "index.html", archPath: "L3-逻辑层 > 认证逻辑", desc: "SHA-256密码验证+7天localStorage缓存的安全认证" },
  "L3-search": { layer: "L3", module: "搜索引擎", codeFile: "index.html", archPath: "L3-逻辑层 > 搜索引擎", desc: "全文检索/分类筛选/日期排序/分页的搜索能力" },
  "L3-factor": { layer: "L3", module: "因子引擎", codeFile: "index.html", archPath: "L3-逻辑层 > 因子引擎", desc: "关键词匹配+4类因子分类+频率统计的因子分析" },
  "L3-project": { layer: "L3", module: "项目管理逻辑", codeFile: "index.html", archPath: "L3-逻辑层 > 项目管理逻辑", dataFile: "project_data.js", desc: "里程碑/看板/决策的状态管理与数据处理" },
  "L3-theme": { layer: "L3", module: "主题系统", codeFile: "index.html", archPath: "L3-逻辑层 > 主题系统", desc: "暗色/亮色切换+CSS变量的主题管理" },
  "L3-ai": { layer: "L3", module: "AI分析接口", archPath: "L3-逻辑层 > AI分析接口", desc: "调用外部AI分析视频逻辑/观点/因子（规划中）" },
  "ai-video-analysis": { layer: "L3", module: "AI分析接口", subModule: "视频逻辑分析", archPath: "L3-ai > 视频逻辑分析", desc: "AI分析视频内容逻辑（规划中）" },
  "ai-viewpoint": { layer: "L3", module: "AI分析接口", subModule: "观点提取", archPath: "L3-ai > 观点提取", desc: "AI提取关键观点（规划中）" },
  "ai-factor": { layer: "L3", module: "AI分析接口", subModule: "因子识别", archPath: "L3-ai > 因子识别", desc: "AI识别潜在因子（规划中）" },
  "L3-feedback": { layer: "L3", module: "反馈模式", codeFile: "index.html", archPath: "L3-逻辑层 > 反馈模式", desc: "元素引用ID+点击选中+上下文复制（规划中）" },

  // === L2 数据层 ===
  "L2-videos": { layer: "L2", module: "videos_data", codeFile: "videos_data.js", archPath: "L2-数据层 > videos_data", desc: "500条转录数据(4.6MB)" },
  "L2-project": { layer: "L2", module: "project_data", codeFile: "project_data.js", archPath: "L2-数据层 > project_data", desc: "项目状态/里程碑/任务/决策数据" },
  "L2-up": { layer: "L2", module: "up_stats", codeFile: "up_stats.js", archPath: "L2-数据层 > up_stats", desc: "UP主统计数据" },
  "L2-cat": { layer: "L2", module: "cat_stats", codeFile: "cat_stats.js", archPath: "L2-数据层 > cat_stats", desc: "分类统计数据" },
  "L2-framework": { layer: "L2", module: "framework_data", codeFile: "framework_data.js", archPath: "L2-数据层 > framework_data", desc: "系统架构定义数据" },
  "L2-factors": { layer: "L2", module: "factors_data", archPath: "L2-数据层 > factors_data", desc: "因子提取结果数据（规划中）" },
  "L2-analysis": { layer: "L2", module: "analysis_data", archPath: "L2-数据层 > analysis_data", desc: "AI分析结果数据（规划中）" },

  // === L1 基础设施层 ===
  "L1-deploy": { layer: "L1", module: "部署", archPath: "L1-基础设施层 > 部署", desc: "GitHub Pages自动部署" },
  "L1-auth": { layer: "L1", module: "访问控制", archPath: "L1-基础设施层 > 访问控制", desc: "前端SHA-256密码保护" },
  "L1-pipeline": { layer: "L1", module: "更新管道", archPath: "L1-基础设施层 > 更新管道", desc: "Agent → GitHub API → Pages自动部署" },
  "L1-dns": { layer: "L1", module: "DNS/HTTPS", archPath: "L1-基础设施层 > DNS/HTTPS", desc: "阿里云DNS + GitHub Pages SSL" },
  "L1-version": { layer: "L1", module: "版本管理", archPath: "L1-基础设施层 > 版本管理", desc: "语义版本号 + 变更快照 + 一键回滚（规划中）" }

};