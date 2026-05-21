/* ================================================
   金融研究仪表盘 - 认证模块 v1.3
   L3-10: 从index.html head中移出的认证逻辑（保持隔离）
   ================================================ */

// 认证状态
export const AuthState = {
  isAuthenticated: false,
  expiresAt: null,
  
  init() {
    const auth = localStorage.getItem('wd_auth');
    if (auth) {
      const expiresAt = parseInt(auth);
      if (expiresAt > Date.now()) {
        this.isAuthenticated = true;
        this.expiresAt = expiresAt;
        return true;
      } else {
        this.logout();
      }
    }
    return false;
  },
  
  login() {
    this.isAuthenticated = true;
    this.expiresAt = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7天
    localStorage.setItem('wd_auth', this.expiresAt.toString());
  },
  
  logout() {
    this.isAuthenticated = false;
    this.expiresAt = null;
    localStorage.removeItem('wd_auth');
    localStorage.removeItem('wd_github_token');
  },
  
  check() {
    if (!this.isAuthenticated) return false;
    if (this.expiresAt && this.expiresAt <= Date.now()) {
      this.logout();
      return false;
    }
    return true;
  }
};

// 密码验证
export async function verifyPassword(password) {
  const PWD_HASH = 'ac50201d8b39de3e403adc70ae473c786d0ccc46c694ba8d68c84b0e1633c71e';
  
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex === PWD_HASH;
}

// 执行登录
export async function doLogin(password) {
  const isValid = await verifyPassword(password);
  
  if (isValid) {
    AuthState.login();
    
    // 隐藏密码门
    const gate = document.getElementById('pwd-gate');
    if (gate) {
      gate.style.display = 'none';
    }
    
    return true;
  }
  
  return false;
}

// 初始化认证UI
export function initAuthUI() {
  const gate = document.getElementById('pwd-gate');
  const btn = document.getElementById('pwd-btn');
  const input = document.getElementById('pwd-input');
  const err = document.getElementById('pwd-err');
  
  if (!gate) return;
  
  // 检查是否已认证
  if (AuthState.check()) {
    gate.style.display = 'none';
    return;
  }
  
  // 绑定登录按钮
  if (btn) {
    btn.addEventListener('click', async () => {
      if (!input || !input.value) return;
      
      btn.disabled = true;
      btn.textContent = '验证中...';
      
      try {
        const success = await doLogin(input.value);
        
        if (success) {
          if (err) err.style.display = 'none';
          // 初始化应用
          initApp();
        } else {
          if (err) err.style.display = 'block';
          input.value = '';
          input.focus();
        }
      } catch (e) {
        if (err) err.style.display = 'block';
      }
      
      btn.disabled = false;
      btn.textContent = '进入';
    });
  }
  
  // 绑定回车键
  if (input) {
    input.addEventListener('keydown', async (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        btn?.click();
      }
    });
  }
}

// 应用初始化入口（认证成功后调用）
async function initApp() {
  // 动态导入并初始化
  const { ThemeState } = await import('./store/state.js');
  const { loadUpNameCache } = await import('./compute/business.js');
  const { initRouter } = await import('./router.js');
  const { renderSidebar } = await import('./views/sidebar.js');
  
  // 初始化主题
  ThemeState.init();
  
  // 渲染侧边栏
  renderSidebar();
  
  // 预加载UP主名称
  await loadUpNameCache();
  
  // 初始化路由
  initRouter();
  
  // 添加刷新按钮
  addRefreshButton();
}

export default { AuthState, verifyPassword, doLogin, initAuthUI };
