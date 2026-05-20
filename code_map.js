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
};
