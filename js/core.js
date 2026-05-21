/* ================================================
   金融研究仪表盘 - 核心逻辑层 v2
   简道云风格：数据表导航 + 总览首页
   ================================================ */

// 全局状态
var AppState = {
  currentView: 'overview', // 'overview' | 'form'
  currentTab: 'overview',
  currentPage: 1,
  pageSize: 20,
  filteredVideos: [],
  selectedVideos: {},
  isLoading: true
};

// DOM就绪后初始化
(function initApp() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onReady);
  } else {
    onReady();
  }
})();

async function onReady() {
  // 初始化主题
  initTheme();
  
  // 渲染简道云风格侧边栏
  renderJiandaoSidebar();
  
  // 初始化视图
  showOverview();
  
  // 添加刷新按钮
  addRefreshButton();
  
  // 初始化引用系统
  initRefSystem();
  
  // 预加载UP主名称
  try {
    const ups = await DataStore.getUpMaster();
    ups.forEach(up => {
      if (typeof _upNameCache !== 'undefined') {
        _upNameCache[up._id] = up.name;
      }
    });
  } catch (e) {
    console.warn('预加载UP主失败:', e);
  }
}

/* === 简道云风格侧边栏 === */
function renderJiandaoSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;
  
  // 从localStorage读取折叠状态
  const collapsed = JSON.parse(localStorage.getItem('wd_sidebar_collapsed') || '{}');
  
  let html = '';
  
  // Logo区
  html += '<div class="sidebar-logo">';
  html += '<h1>📊</h1>';
  html += '<p>金融研究仪表盘</p>';
  html += '</div>';
  
  // 导航菜单
  html += '<div class="sidebar-nav">';
  
  // 首页
  html += '<div class="nav-item ' + (AppState.currentView === 'overview' ? 'active' : '') + '" onclick="showOverview()">';
  html += '<span class="nav-icon">🏠</span>';
  html += '<span class="nav-text">总览</span>';
  // 项目控制台入口
  html += '<div class="nav-item ' + (AppState.currentView === 'project' ? 'active' : '') + '" onclick="showProjectView()">';
  html += '<span class="nav-icon">📯</span>';
  html += '<span class="nav-text">项目控制台</span>';
  html += '</div>';
  
  // 数据表导航（使用render-form.js中的TABLE_CONFIG）
  if (typeof TABLE_CONFIG !== 'undefined') {
    for (const group of TABLE_CONFIG.groups) {
      const isCollapsed = collapsed[group.id];
      
      html += '<div class="nav-group">';
      html += '<div class="nav-group-header" onclick="toggleNavGroup(\'' + group.id + '\')">';
      html += '<span class="group-icon">' + (isCollapsed ? '📁' : '📂') + '</span>';
      html += '<span class="group-text">' + group.name + '</span>';
      html += '</div>';
      
      if (!isCollapsed) {
        html += '<div class="nav-group-children">';
        for (const table of group.children) {
          html += '<div class="nav-child-item" onclick="showFormView(\'' + table.id + '\')">';
          html += '<span class="child-icon">' + table.icon + '</span>';
          html += '<span class="child-text">' + table.name + '</span>';
          html += '</div>';
        }
        html += '</div>';
      }
      
      html += '</div>';
    }
  }
  
  html += '</div>';
  
  // 底部设置
  html += '<div class="sidebar-footer">';
  html += '<button class="theme-btn" onclick="toggleTheme()" title="切换主题" id="themeBtn">🌙</button>';
  html += '</div>';
  
  sidebar.innerHTML = html;
}

function toggleNavGroup(groupId) {
  const collapsed = JSON.parse(localStorage.getItem('wd_sidebar_collapsed') || '{}');
  collapsed[groupId] = !collapsed[groupId];
  localStorage.setItem('wd_sidebar_collapsed', JSON.stringify(collapsed));
  renderJiandaoSidebar();
}

/* === 视图切换 === */
function showProjectView() {
  AppState.currentView = 'project';
  
  // 更新侧边栏高亮
  document.querySelectorAll('.nav-item, .nav-child-item').forEach(el => el.classList.remove('active'));
  var navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(function(el) {
    if (el.getAttribute('onclick') === 'showProjectView()') el.classList.add('active');
  });
  
  // 隐藏侧边栏详情区
  var formSidebar = document.getElementById('formSidebar');
  var formDetail = document.getElementById('formDetail');
  if (formSidebar) formSidebar.style.display = 'none';
  if (formDetail) formDetail.classList.remove('show');
  
  // 显示主内容区
  document.getElementById('mainContent').style.display = '';
  document.getElementById('formContent').style.display = 'none';
  
  // 更新顶部标题
  document.getElementById('topTitle').textContent = '项目控制台';
  
  // 渲染项目视图
  if (typeof rProject === 'function') {
    rProject();
  }
}

function showOverview() {
  AppState.currentView = 'overview';
  
  // 更新侧边栏高亮
  document.querySelectorAll('.nav-item, .nav-child-item').forEach(el => el.classList.remove('active'));
  document.querySelector('.nav-item')?.classList.add('active');
  
  // 隐藏侧边栏详情区
  const formSidebar = document.getElementById('formSidebar');
  const formDetail = document.getElementById('formDetail');
  if (formSidebar) formSidebar.style.display = 'none';
  if (formDetail) formDetail.classList.remove('show');
  
  // 显示主内容区
  document.getElementById('mainContent').style.display = '';
  document.getElementById('formContent').style.display = 'none';
  
  // 更新顶部标题
  document.getElementById('topTitle').textContent = '总览';
  
  // 渲染总览
  if (typeof rOverview === 'function') {
    rOverview();
  }
}

function showFormView(tableId) {
  AppState.currentView = 'form';
  
  // 更新侧边栏高亮
  document.querySelectorAll('.nav-item, .nav-child-item').forEach(el => el.classList.remove('active'));
  
  // 找到并高亮对应的nav-child-item
  if (typeof TABLE_CONFIG !== 'undefined') {
    for (const group of TABLE_CONFIG.groups) {
      for (const table of group.children) {
        if (table.id === tableId) {
          // 展开父分组
          const collapsed = JSON.parse(localStorage.getItem('wd_sidebar_collapsed') || '{}');
          if (collapsed[group.id]) {
            collapsed[group.id] = false;
            localStorage.setItem('wd_sidebar_collapsed', JSON.stringify(collapsed));
          }
        }
      }
    }
  }
  
  renderJiandaoSidebar();
  
  // 选中当前项
  const items = document.querySelectorAll('.nav-child-item');
  items.forEach((el, idx) => {
    if (typeof TABLE_CONFIG !== 'undefined') {
      const tables = TABLE_CONFIG.groups.flatMap(g => g.children);
      if (tables[idx]?.id === tableId) {
        el.classList.add('active');
      }
    }
  });
  
  // 显示表单侧边栏和内容区
  document.getElementById('mainContent').style.display = 'none';
  document.getElementById('formContent').style.display = '';
  
  // 打开数据表
  if (typeof openTable === 'function') {
    openTable(tableId);
  }
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

/* === 工具函数 === */

/**
 * HTML转义
 */
function esc(t) { 
  if (t === null || t === undefined) return '';
  var d = document.createElement('div'); 
  d.textContent = String(t); 
  return d.innerHTML; 
}

/**
 * 获取分类CSS类
 */
function catCls(c) {
  if (!c) return 't-other';
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
 * 导出数据
 */
function exportData() {
  showToast('请使用数据表视图中的导出功能');
}
