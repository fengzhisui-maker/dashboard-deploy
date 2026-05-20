var PROJECT = {
  phase: "Phase 2 - 转录库功能细化",
  lastUpdate: "2026-05-20",
  milestones: [
    {id:"M1", name:"500视频转录+分类+基础看板", status:"done", date:"2026-05-20"},
    {id:"M2", name:"部署到 wudaoseng.com", status:"done", date:"2026-05-20"},
    {id:"M3", name:"密码保护+主题切换+7天缓存", status:"partial", date:""},
    {id:"M4", name:"转录库AI分析/因子提取交互", status:"todo", date:""},
    {id:"M5", name:"数据采集模块（Digital Oracle接入）", status:"todo", date:""},
    {id:"M6", name:"分析工具模块", status:"todo", date:""},
    {id:"M7", name:"可视化模块", status:"todo", date:""},
    {id:"M8", name:"研究笔记模块", status:"todo", date:""},
    {id:"M9", name:"自动化模块", status:"todo", date:""}
  ],
  tasks: {
    backlog: [
      "密码功能v3验证",
      "yfinance/curl_cffi依赖安装",
      "转录库模块：AI分析接入",
      "转录库模块：因子提取交互",
      "转录库模块：追加UP主/视频功能",
      "转录库模块：UP主观点对比视图",
      "数据采集模块：Digital Oracle数据接入",
      "项目控制台模块"
    ],
    inProgress: ["项目状态持久化体系搭建"],
    done: [
      "B站超能信号500视频转录",
      "转录文件按标题关键词自动分类",
      "HTML看板v2：分类筛选+搜索+内容预览",
      "GitHub Pages部署",
      "阿里云DNS配置",
      "HTTPS证书签发",
      "密码保护v1（SHA-256哈希）",
      "暗色主题调亮+同花顺风格亮色主题",
      "7天密码有效期",
      "v3密码重写"
    ],
    blocked: ["yfinance/curl_cffi编译超时"]
  },
  decisions: [
    {date:"2026-05-20", decision:"GitHub API替代git push", reason:"云电脑无法直连github.com:443", alt:"手动上传"},
    {date:"2026-05-20", decision:"GitHub Pages legacy模式", reason:"更简单无需Actions文件", alt:"GitHub Actions"},
    {date:"2026-05-20", decision:"仓库改public", reason:"Free计划私有仓库不支持Pages", alt:"GitHub Pro"},
    {date:"2026-05-20", decision:"纯阿里云DNS", reason:"减少操作步骤", alt:"Cloudflare"},
    {date:"2026-05-20", decision:"密码v3完整重写", reason:"v2模板转义导致JS错误", alt:"修复v2"}
  ],
  scope: {
    inScope: ["转录库浏览搜索", "密码保护", "双主题", "因子提取", "AI分析接入", "Digital Oracle", "自动化部署"],
    outOfScope: ["多用户系统", "后端服务器", "实时推送", "移动App", "付费API"]
  }
};
