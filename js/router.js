/* ================================================
   金融研究仪表盘 - 路由系统 v1.3
   L3-4: 视图切换/hash路由
   ================================================ */

import { AppState, ToastState } from './store/state.js';
import { renderTranscriptView } from './views/transcript.js';
import { renderPlaceholderView } from './views/placeholder.js';
import { renderBlueprintView } from './views/blueprint.js';

// 视图映射
const VIEW_RENDERERS = {
  transcript: renderTranscriptView,
  project: () => renderPlaceholderView('project'),
  visualization: () => renderPlaceholderView('visualization'),
  analysis: () => renderPlaceholderView('analysis'),
  collection: () => renderPlaceholderView('collection'),
  notes: () => renderPlaceholderView('notes'),
  automation: () => renderPlaceholderView('automation'),
  blueprint: renderBlueprintView
};

// 视图标题
const VIEW_TITLES = {
  transcript: '转录库',
  project: '项目控制台',
  visualization: '数据可视化',
  analysis: '分析工具',
  collection: '数据采集',
  notes: '研究笔记',
  automation: '自动化',
  blueprint: '架构蓝图'
};

// 视图图标
const VIEW_ICONS = {
  transcript: '📁',
  project: '📯',
  visualization: '📊',
  analysis: '🔍',
  collection: '🗂️',
  notes: '📝',
  automation: '⚡',
  blueprint: '📐'
};

// 路由初始化
export function initRouter() {
  // 监听hash变化
  window.addEventListener('hashchange', handleHashChange);
  
  // 解析初始路由
  handleHashChange();
}

// 处理hash变化
function handleHashChange() {
  const hash = window.location.hash.slice(1) || 'transcript';
  
  // 解析视图和参数
  const [view, ...params] = hash.split(':');
  
  if (VIEW_RENDERERS[view]) {
    navigateTo(view, params);
  } else {
    navigateTo('transcript');
  }
}

// 导航到指定视图
export function navigateTo(view, params = []) {
  // 更新状态
  AppState.currentView = view;
  
  // 更新URL hash
  if (params.length > 0) {
    window.location.hash = `${view}:${params.join(':')}`;
  } else {
    window.location.hash = view;
  }
  
  // 更新侧边栏高亮
  updateSidebarHighlight(view);
  
  // 更新标题
  updateTopbarTitle(view);
  
  // 渲染视图
  const renderer = VIEW_RENDERERS[view];
  if (renderer) {
    renderer(params);
  }
}

// 更新侧边栏高亮
function updateSidebarHighlight(view) {
  document.querySelectorAll('.nav-item, .nav-child-item').forEach(el => {
    el.classList.remove('active');
  });
  
  // 查找对应的nav-item
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(el => {
    const onclick = el.getAttribute('onclick');
    if (onclick && onclick.includes(`'${view}'`)) {
      el.classList.add('active');
    }
  });
}

// 更新顶部标题
function updateTopbarTitle(view) {
  const titleEl = document.getElementById('topTitle');
  if (titleEl) {
    titleEl.textContent = VIEW_TITLES[view] || '转录库';
  }
}

// 获取视图信息
export function getViewInfo(view) {
  return {
    id: view,
    title: VIEW_TITLES[view] || view,
    icon: VIEW_ICONS[view] || '📄'
  };
}

// 获取所有视图列表
export function getViewList() {
  return Object.keys(VIEW_RENDERERS).map(view => getViewInfo(view));
}

// 切换转录库子标签
export function switchTranscriptTab(tab) {
  AppState.currentTab = tab;
  renderTranscriptView();
}

// 刷新当前视图
export function refreshCurrentView() {
  const renderer = VIEW_RENDERERS[AppState.currentView];
  if (renderer) {
    renderer();
  }
}

export default { initRouter, navigateTo, switchTranscriptTab, refreshCurrentView };
