/* ================================================
   金融研究仪表盘 - 侧边栏视图 v1.3
   L4-1: 侧边栏渲染
   ================================================ */

import { AppState, SidebarState, ThemeState } from '../store/state.js';
import { navigateTo } from '../router.js';

// 导航配置
const NAV_CONFIG = [
  {
    id: 'transcript',
    name: '转录库',
    icon: '📁',
    type: 'item'
  },
  {
    id: 'project',
    name: '项目控制台',
    icon: '📯',
    type: 'item'
  },
  {
    id: 'visualization',
    name: '数据可视化',
    icon: '📊',
    type: 'item'
  },
  {
    id: 'analysis',
    name: '分析工具',
    icon: '🔍',
    type: 'item'
  },
  {
    id: 'collection',
    name: '数据采集',
    icon: '🗂️',
    type: 'item'
  },
  {
    id: 'notes',
    name: '研究笔记',
    icon: '📝',
    type: 'item'
  },
  {
    id: 'automation',
    name: '自动化',
    icon: '⚡',
    type: 'item'
  }
];

// 渲染侧边栏
export function renderSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;
  
  let html = '';
  
  // Logo区
  html += `
    <div class="sidebar-logo">
      <h1>📊</h1>
      <p>金融研究仪表盘</p>
    </div>
  `;
  
  // 导航菜单
  html += '<div class="sidebar-nav">';
  
  for (const nav of NAV_CONFIG) {
    if (nav.type === 'item') {
      const isActive = AppState.currentView === nav.id;
      html += `
        <div class="nav-item ${isActive ? 'active' : ''}" onclick="navigateToView('${nav.id}')">
          <span class="nav-icon">${nav.icon}</span>
          <span class="nav-text">${nav.name}</span>
        </div>
      `;
    }
  }
  
  html += '</div>';
  
  // 底部设置
  html += `
    <div class="sidebar-footer">
      <button class="theme-btn" onclick="toggleTheme()" title="切换主题" id="themeBtn">
        ${ThemeState.getIcon()}
      </button>
    </div>
  `;
  
  sidebar.innerHTML = html;
}

// 导航到指定视图
window.navigateToView = function(viewId) {
  navigateTo(viewId);
};

// 切换主题
window.toggleTheme = function() {
  ThemeState.toggle();
  const btn = document.getElementById('themeBtn');
  if (btn) {
    btn.textContent = ThemeState.getIcon();
  }
};

// 刷新按钮
export function addRefreshButton() {
  const topbarRight = document.querySelector('.topbar-right');
  if (!topbarRight) return;
  
  if (document.getElementById('refreshBtn')) return;
  
  const btn = document.createElement('button');
  btn.id = 'refreshBtn';
  btn.className = 'btn btn-o btn-s';
  btn.innerHTML = '🔄 刷新';
  btn.title = '清除缓存并重新加载数据';
  btn.onclick = async function() {
    btn.disabled = true;
    btn.innerHTML = '⏳ 刷新中...';
    
    try {
      const { refreshCache } = await import('../adapter/data-adapter.js');
      refreshCache();
      
      const { refreshCurrentView } = await import('../router.js');
      refreshCurrentView();
      
      const { ToastState } = await import('../store/state.js');
      ToastState.success('数据已刷新');
    } catch (e) {
      const { ToastState } = await import('../store/state.js');
      ToastState.error('刷新失败');
    }
    
    btn.disabled = false;
    btn.innerHTML = '🔄 刷新';
  };
  
  topbarRight.insertBefore(btn, topbarRight.firstChild);
}

export default { renderSidebar, addRefreshButton };
