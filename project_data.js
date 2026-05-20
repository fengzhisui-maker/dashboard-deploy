var PROJECT = {
  phase: "Phase 2 - 转录库功能细化",
  lastUpdate: "2026-05-21",
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
      "P0模块化拆分（CSS/JS/HTML分离）",
      "转录库模块：AI分析接入",
      "转录库模块：因子提取交互",
      "数据采集模块：Digital Oracle数据接入"
    ],
    inProgress: ["期神附体-期货320视频转录"],
    done: [
      "B站超能信号500视频转录",
      "转录文件按标题关键词自动分类",
      "HTML看板v2：分类筛选+搜索+内容预览",
      "GitHub Pages部署",
      "阿里云DNS配置",
      "HTTPS证书签发",
      "密码保护+7天缓存（已隔离到head）",
      "暗色+亮色双主题",
      "项目控制台+架构蓝图+下钻详情",
      "UP主平台分类+网页表单添加",
      "任务队列进度条（视频级进度）"
    ],
    blocked: [
      "yfinance/curl_cffi编译超时",
      "提交UP主弹窗误报失败（实际成功但alert误判）"
    ]
  },
  errors: [
    {date:"2026-05-21", type:"架构", severity:"high", 
     title:"密码模块间歇性失效", 
     desc:"密码JS与业务JS耦合在同一个script块，排在4.8MB videos_data.js后面，外部脚本加载慢→内联脚本不执行→密码按钮无响应",
     fix:"密码逻辑独立到head的script，DOMContentLoaded绑定，完全隔离",
     lesson:"关键模块必须隔离，Auth不能依赖业务脚本加载"},
    {date:"2026-05-21", type:"架构", severity:"high",
     title:"修改UP主弹窗→影响密码模块",
     desc:"单文件string替换改弹窗代码，全文件替换风险不可控",
     fix:"密码已隔离；P0模块化拆分必须执行",
     lesson:"子模块修改不应影响全局，单文件编辑=对整个文件动刀"},
    {date:"2026-05-21", type:"编码", severity:"medium",
     title:"进度条替换残留旧代码导致JS语法错误",
     desc:"replace_one行号计算错误，旧pending代码残留，导致SyntaxError",
     fix:"用Python精确定位行号替换，替换后node -c验证语法",
     lesson:"替换后必须语法检查+残留检查"},
    {date:"2026-05-21", type:"记忆", severity:"high",
     title:"忘记昨日验证过的B站下载路径",
     desc:"昨天用cookies+代理+v3脚本成功转录500视频，今天从零试API→352拦截→浏览器→you-get，浪费20分钟",
     fix:"直接复用batch_process_v3.py + cookies.txt + proxy",
     lesson:"已验证的技术路径必须记录，不可每次从零开始试错"}
  ],
  decisions: [
    {date:"2026-05-20", decision:"GitHub API替代git push", reason:"云电脑无法直连github.com:443", alt:"手动上传"},
    {date:"2026-05-20", decision:"GitHub Pages legacy模式", reason:"更简单无需Actions文件", alt:"GitHub Actions"},
    {date:"2026-05-20", decision:"仓库改public", reason:"Free计划私有仓库不支持Pages", alt:"GitHub Pro"},
    {date:"2026-05-20", decision:"纯阿里云DNS", reason:"减少操作步骤", alt:"Cloudflare"},
    {date:"2026-05-20", decision:"密码v3完整重写", reason:"v2模板转义导致JS错误", alt:"修复v2"},
    {date:"2026-05-21", decision:"密码模块隔离到head", reason:"业务脚本加载影响密码功能", alt:"保持原位"},
    {date:"2026-05-21", decision:"复用v3脚本+cookies+代理", reason:"已验证的B站下载路径", alt:"浏览器方式"}
  ],
  scope: {
    inScope: ["转录库浏览搜索", "密码保护", "双主题", "因子提取", "AI分析接入", "Digital Oracle", "自动化部署"],
    outOfScope: ["多用户系统", "后端服务器", "实时推送", "移动App", "付费API"]
  }
};
