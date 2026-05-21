/* ================================================
   金融研究仪表盘 - 状态管理 v1.3
   L3-1: 第一公民状态 - AppState/主题/缓存/UI状态
   ================================================ */

// 应用全局状态
export const AppState = {
  // 视图状态
  currentView: 'transcript',    // 'transcript' | 'project' | 'visualization' | 'analysis' | 'collection' | 'notes' | 'automation'
  currentTab: 'overview',       // 转录库子标签: 'overview' | 'upmanage' | 'browse' | 'factor'
  currentPage: 1,
  pageSize: 20,
  
  // 转录库数据
  allVideos: [],
  filteredVideos: [],
  upList: [],
  catStats: {},
  
  // UI状态
  isLoading: true,
  sidebarCollapsed: {},
  detailPanelOpen: false,
  selectedVideoId: null,
  
  // 缓存
  videoCache: {},        // 视频完整文本缓存
  upNameCache: {},      // UP主名称缓存
  dataCache: {},        // 通用数据缓存
  cacheTime: {},        // 缓存时间戳
  cacheTTL: 60000,      // 缓存有效期: 1分钟
  
  // 筛选状态
  filters: {
    upId: '',
    category: '',
    fromDate: '',
    toDate: '',
    search: ''
  },
  sortField: 'publish_date',
  sortDir: 'desc'
};

// 主题管理
export const ThemeState = {
  current: 'dark',  // 'dark' | 'light'
  
  init() {
    const stored = localStorage.getItem('wd_theme');
    if (stored) {
      this.current = stored;
    }
    this.apply();
  },
  
  toggle() {
    this.current = this.current === 'dark' ? 'light' : 'dark';
    localStorage.setItem('wd_theme', this.current);
    this.apply();
    return this.current;
  },
  
  apply() {
    document.documentElement.setAttribute('data-theme', this.current);
  },
  
  getIcon() {
    return this.current === 'dark' ? '☀️' : '🌙';
  }
};

// 侧边栏折叠状态管理
export const SidebarState = {
  init() {
    const stored = localStorage.getItem('wd_sidebar_collapsed');
    if (stored) {
      try {
        AppState.sidebarCollapsed = JSON.parse(stored);
      } catch (e) {
        AppState.sidebarCollapsed = {};
      }
    }
  },
  
  toggle(groupId) {
    AppState.sidebarCollapsed[groupId] = !AppState.sidebarCollapsed[groupId];
    localStorage.setItem('wd_sidebar_collapsed', JSON.stringify(AppState.sidebarCollapsed));
  },
  
  isCollapsed(groupId) {
    return !!AppState.sidebarCollapsed[groupId];
  }
};

// Toast通知管理
export const ToastState = {
  container: null,
  
  init() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = 'toast-container';
      document.body.appendChild(this.container);
    }
  },
  
  show(message, type = 'default', duration = 3000) {
    this.init();
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    this.container.appendChild(toast);
    
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },
  
  success(message) { this.show(message, 'success'); },
  error(message) { this.show(message, 'error'); },
  warning(message) { this.show(message, 'warning'); },
  info(message) { this.show(message); }
};

// 详情面板状态
export const DetailPanelState = {
  open(videoId) {
    AppState.detailPanelOpen = true;
    AppState.selectedVideoId = videoId;
    
    const panel = document.getElementById('detailPanel');
    if (panel) {
      panel.classList.add('show');
    }
  },
  
  close() {
    AppState.detailPanelOpen = false;
    AppState.selectedVideoId = null;
    
    const panel = document.getElementById('detailPanel');
    if (panel) {
      panel.classList.remove('show');
    }
  },
  
  isOpen() {
    return AppState.detailPanelOpen;
  }
};

// 状态更新辅助函数
export function updateState(path, value) {
  const keys = path.split('.');
  let current = AppState;
  
  for (let i = 0; i < keys.length - 1; i++) {
    current = current[keys[i]];
  }
  
  current[keys[keys.length - 1]] = value;
}

// 导出默认状态用于重置
export function getDefaultState() {
  return {
    currentView: 'transcript',
    currentTab: 'overview',
    currentPage: 1,
    pageSize: 20,
    allVideos: [],
    filteredVideos: [],
    upList: [],
    catStats: {},
    isLoading: true,
    filters: {
      upId: '',
      category: '',
      fromDate: '',
      toDate: '',
      search: ''
    },
    sortField: 'publish_date',
    sortDir: 'desc'
  };
}
