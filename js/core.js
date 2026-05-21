/* ================================================
   金融研究仪表盘 - 核心逻辑层
   包含：初始化、路由、工具函数
   ================================================ */

// 全局状态
var AppState = {
  currentTab: 'overview',
  currentPage: 1,
  pageSize: 20,
  filteredVideos: [],
  selectedVideos: {},
  currentModule: 'project'
};

// DOM就绪后初始化
(function initApp() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onReady);
  } else {
    onReady();
  }
})();

function onReady() {
  // 初始化主题
  initTheme();
  
  // 初始化视图
  render(AppState.currentTab);
  
  // 初始化模块
  setMod(AppState.currentModule);
  
  // 初始化引用系统
  initRefSystem();
}

/* === 主题系统 === */
function initTheme() {
  var t = localStorage.getItem('wd_theme');
  if (t) {
    document.documentElement.setAttribute('data-theme', t);
    updateThemeBtn(t);
  }
}

function toggleTheme() {
  var current = document.documentElement.getAttribute('data-theme');
  var next = current === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('wd_theme', next);
  updateThemeBtn(next);
}

function updateThemeBtn(theme) {
  var btn = document.getElementById('themeBtn');
  if (btn) {
    btn.textContent = theme === 'light' ? '☀️' : '🌙';
  }
}

/* === 路由系统 === */
function swTab(t) {
  if (typeof t === 'string') {
    document.querySelectorAll('.tab').forEach(function(x) { 
      x.classList.toggle('active', x.dataset.t === t); 
    });
    AppState.currentTab = t;
  } else {
    document.querySelectorAll('.tab').forEach(function(x) { x.classList.remove('active'); });
    t.classList.add('active');
    AppState.currentTab = t.dataset.t;
  }
  
  // 隐藏所有内容区域
  document.querySelectorAll('[id^="tc-"]').forEach(function(x) { x.style.display = 'none'; });
  
  // 显示当前tab内容
  document.getElementById('tc-' + AppState.currentTab).style.display = '';
  
  // 渲染内容
  render(AppState.currentTab);
}

function render(t) {
  // 路由到对应渲染器
  if (t === 'overview') {
    if (typeof rOverview === 'function') rOverview();
  }
  else if (t === 'ups') {
    if (typeof rUps === 'function') rUps();
  }
  else if (t === 'tasks') {
    if (typeof rTasks === 'function') rTasks();
  }
  else if (t === 'browse') {
    if (typeof rBrowse === 'function') rBrowse();
  }
  else if (t === 'factors') {
    if (typeof rFactors === 'function') rFactors();
  }
  else if (t === 'project') {
    if (typeof rProject === 'function') rProject();
  }
}

/* === 模块切换 === */
function setMod(m) {
  // 更新侧边栏激活状态
  document.querySelectorAll('.s-item').forEach(function(x) { x.classList.remove('active'); });
  
  if (m === 'transcript') {
    // 找到转录库nav项并激活
    var navItems = document.querySelectorAll('.s-item');
    if (navItems[1]) navItems[1].classList.add('active');
    
    // 显示tabs，隐藏项目按钮
    document.getElementById('tabs').style.display = '';
    document.getElementById('topTitle').textContent = '转录库';
    var addBtn = document.querySelector('.btn-p');
    if (addBtn) addBtn.style.display = '';
    
    // 切换到概览
    swTab('overview');
  } 
  else if (m === 'project') {
    // 找到项目控制台nav项并激活
    var navItems = document.querySelectorAll('.s-item');
    if (navItems[2]) navItems[2].classList.add('active');
    
    // 隐藏tabs，显示项目内容
    document.getElementById('tabs').style.display = 'none';
    document.getElementById('topTitle').textContent = '项目控制台';
    var addBtn = document.querySelector('.btn-p');
    if (addBtn) addBtn.style.display = 'none';
    
    // 隐藏所有tab内容
    document.querySelectorAll('[id^="tc-"]').forEach(function(x) { x.style.display = 'none'; });
    
    // 显示项目内容
    document.getElementById('tc-project').style.display = '';
    AppState.currentModule = 'project';
    
    if (typeof rProject === 'function') rProject();
  }
}

/* === 工具函数 === */

/**
 * HTML转义
 */
function esc(t) { 
  var d = document.createElement('div'); 
  d.textContent = t; 
  return d.innerHTML; 
}

/**
 * 获取分类CSS类
 * @param {string} c 分类名
 * @returns {string} CSS类名
 */
function catCls(c) {
  // 检查是否包含多个分类
  if (c.includes('宏观') && c.includes('大宗') && c.includes('股票')) return 't-other';
  if ((c.includes('宏观') && c.includes('大宗')) || 
      (c.includes('宏观') && c.includes('股票')) || 
      (c.includes('大宗') && c.includes('股票'))) return 't-mix';
  if (c.includes('宏观')) return 't-macro';
  if (c.includes('大宗') || c.includes('期货')) return 't-comm';
  if (c.includes('股票')) return 't-stock';
  return 't-other';
}

/**
 * Toast提示
 */
function showToast(msg) {
  var t = document.createElement('div');
  t.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:var(--accent);color:#fff;padding:10px 20px;border-radius:8px;font-size:12px;z-index:1000;animation:slideUp .3s';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(function() { t.remove(); }, 3000);
}

/**
 * 平台标签类名
 */
function platClass(platform) {
  return platform === 'youtube' ? 'yt' : platform === 'other' ? 'other' : 'bili';
}

/**
 * 平台标签文字
 */
function platLabel(platform) {
  return platform === 'youtube' ? 'YouTube' : platform === 'other' ? '其他' : 'B站';
}

/**
 * 状态类名
 */
function statusClass(status) {
  return status === 'done' ? 'done' : status === 'processing' ? 'processing' : status === 'error' ? 'error' : 'queued';
}

/**
 * 状态标签文字
 */
function statusLabel(status) {
  return status === 'done' ? '✓ 完成' : status === 'processing' ? '执行中' : status === 'error' ? '✗ 失败' : '排队中';
}

/* === 导出功能 === */
function exportData() {
  var fV = getFilteredVideos();
  var d = fV.map(function(v) { 
    return {
      up: v.up,
      bvid: v.bvid,
      title: v.title,
      date: v.date,
      category: v.category
    }; 
  });
  var b = new Blob([JSON.stringify(d, null, 2)], {type: 'application/json'}),
      u = URL.createObjectURL(b),
      a = document.createElement('a');
  a.href = u; 
  a.download = 'transcript_data.json'; 
  a.click();
  URL.revokeObjectURL(u);
}

/**
 * 获取当前过滤后的视频列表
 * @returns {Array}
 */
function getFilteredVideos() {
  if (typeof AppState.filteredVideos !== 'undefined' && AppState.filteredVideos.length > 0) {
    return AppState.filteredVideos;
  }
  return getVideos();
}
