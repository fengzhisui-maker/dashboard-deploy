/* ================================================
   金融研究仪表盘 - 数据适配层 v1.3
   L3-2: GitHub API读取/CDN缓存/断线重试
   ================================================ */

// GitHub配置
const CONFIG = {
  owner: 'fengzhisui-maker',
  repo: 'dashboard-deploy',
  branch: 'main',
  apiBase: 'https://api.github.com',
  cdnBase: 'https://cdn.jsdelivr.net/gh/fengzhisui-maker/dashboard-deploy@main'
};

// Token管理
export function getToken() {
  // 从localStorage读取
  const stored = localStorage.getItem('wd_github_token');
  if (stored) return stored;
  
  // 从URL参数获取
  const urlParams = new URLSearchParams(window.location.search);
  const urlToken = urlParams.get('t');
  if (urlToken) {
    localStorage.setItem('wd_github_token', urlToken);
    return urlToken;
  }
  
  return '';
}

export function setToken(token) {
  localStorage.setItem('wd_github_token', token);
}

// 缓存管理
const CacheManager = {
  cache: {},
  cacheTime: {},
  
  get(key) {
    const now = Date.now();
    if (this.cache[key] && this.cacheTime[key]) {
      if (now - this.cacheTime[key] < 60000) { // 1分钟TTL
        return this.cache[key];
      }
    }
    return null;
  },
  
  set(key, data) {
    this.cache[key] = data;
    this.cacheTime[key] = Date.now();
  },
  
  invalidate(key) {
    delete this.cache[key];
    delete this.cacheTime[key];
  },
  
  clear() {
    this.cache = {};
    this.cacheTime = {};
  }
};

// 数据获取 - 优先CDN
export async function fetchJSON(path, skipCache = false) {
  const cacheKey = path;
  
  if (!skipCache) {
    const cached = CacheManager.get(cacheKey);
    if (cached) return cached;
  }
  
  const url = `${CONFIG.cdnBase}/${path}`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    CacheManager.set(cacheKey, data);
    
    return data;
  } catch (error) {
    console.error(`获取数据失败: ${path}`, error);
    throw error;
  }
}

// GitHub API请求
export async function githubGet(path) {
  const token = getToken();
  const url = `${CONFIG.apiBase}${path}`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json'
    }
  });
  
  if (!response.ok) {
    throw new Error(`GitHub API错误: ${response.status}`);
  }
  
  return response.json();
}

// 获取文件SHA
export async function getFileSha(path) {
  try {
    const data = await githubGet(
      `/repos/${CONFIG.owner}/${CONFIG.repo}/contents/${path}?ref=${CONFIG.branch}`
    );
    return data.sha;
  } catch (e) {
    return null;
  }
}

// 刷新缓存
export function refreshCache() {
  CacheManager.clear();
}

// 转录库专用数据API
export const DataAPI = {
  // UP主数据
  async getUpMaster() {
    return fetchJSON('data/up_master.json');
  },
  
  async getUpById(_id) {
    const ups = await this.getUpMaster();
    return ups.find(u => u._id === _id) || null;
  },
  
  // 视频数据
  async getVideos(upId = null) {
    const videos = await fetchJSON('data/transcript_videos.json');
    if (upId) {
      return videos.filter(v => v.up_id === upId);
    }
    return videos;
  },
  
  async getVideoById(_id) {
    const videos = await this.getVideos();
    return videos.find(v => v._id === _id) || null;
  },
  
  async getVideoFullText(videoId) {
    const video = await this.getVideoById(videoId);
    if (!video) return '';
    
    const upIdShort = video.up_id.slice(0, 8);
    const path = `data/transcript_videos_fulltext/${upIdShort}/${videoId}.json`;
    
    try {
      const data = await fetchJSON(path);
      return data.fullText || '';
    } catch (e) {
      return '';
    }
  },
  
  // 分类标签
  async getCategoryTags() {
    return fetchJSON('data/category_tags.json');
  },
  
  // 因子关键词
  async getFactorKeywords() {
    return fetchJSON('data/factor_keywords.json');
  },
  
  // 项目数据
  async getMilestones() {
    return fetchJSON('data/project_milestones.json');
  },
  
  async getProjectTasks() {
    return fetchJSON('data/project_tasks.json');
  },
  
  async getErrors() {
    return fetchJSON('data/project_errors.json');
  },
  
  async getFrameworkData() {
    return fetchJSON('data/framework_data.json');
  }
};

export default DataAPI;
