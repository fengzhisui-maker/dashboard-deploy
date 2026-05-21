/* ================================================
   金融研究仪表盘 - 数据服务层 v2
   通过GitHub API实时拉取数据
   ================================================ */

class DataStoreClass {
  constructor() {
    // GitHub API配置
    this.token = this._initToken();
    this.owner = 'fengzhisui-maker';
    this.repo = 'dashboard-deploy';
    this.branch = 'main';
    
    // 缓存配置
    this.cache = {};
    this.cacheTime = {};
    this.ttl = 60000; // 缓存1分钟
    
    // API基础路径
    this.apiBase = 'https://api.github.com';
    this.rawBase = 'https://cdn.jsdelivr.net/gh/' + this.owner + '/' + this.repo + '@' + this.branch;
  }
  
  _initToken() {
    // Token从localStorage读取
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

  // 设置Token（密码验证成功后调用）
  setToken(token) {
    this.token = token;
    localStorage.setItem('wd_github_token', token);
  }
  
  // 检查Token是否已设置
  hasToken() {
    return !!this.token;
  }

  /* === GitHub API 请求 === */
  async githubGet(path) {
    const url = `${this.apiBase}${path}`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`GitHub API错误: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  }
  
  async githubPut(path, content, sha, msg) {
    const url = `${this.apiBase}${path}`;
    const body = {
      message: msg,
      content: content,
      sha: sha,
      branch: this.branch
    };
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      throw new Error(`GitHub API写入错误: ${response.status}`);
    }
    
    return response.json();
  }
  
  async githubDelete(path, sha, msg) {
    const url = `${this.apiBase}${path}`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Accept': 'application/vnd.github.v3+json'
      },
      body: JSON.stringify({
        message: msg,
        sha: sha,
        branch: this.branch
      })
    });
    
    if (!response.ok) {
      throw new Error(`GitHub API删除错误: ${response.status}`);
    }
    
    return response.json();
  }
  
  async getFileSha(path) {
    try {
      const data = await this.githubGet(`/repos/${this.owner}/${this.repo}/contents/${path}?ref=${this.branch}`);
      return data.sha;
    } catch (e) {
      return null;
    }
  }
  
  /* === 数据获取 === */
  async fetchJSON(path, skipCache = false) {
    const now = Date.now();
    
    if (!skipCache && this.cache[path] && this.cacheTime[path]) {
      if (now - this.cacheTime[path] < this.ttl) {
        return this.cache[path];
      }
    }
    
    const url = `${this.rawBase}/${path}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`获取数据失败: ${path} (${response.status})`);
    }
    
    const data = await response.json();
    this.cache[path] = data;
    this.cacheTime[path] = now;
    
    return data;
  }
  
  async refresh() {
    this.cache = {};
    this.cacheTime = {};
  }
  
  /* === 数据查询API === */
  
  async getUpMaster() {
    return this.fetchJSON('data/up_master.json');
  }
  
  async getUpById(_id) {
    const ups = await this.getUpMaster();
    return ups.find(u => u._id === _id) || null;
  }
  
  async getVideos(upId = null) {
    const videos = await this.fetchJSON('data/transcript_videos.json');
    if (upId) {
      return videos.filter(v => v.up_id === upId);
    }
    return videos;
  }
  
  async getVideoById(_id) {
    const videos = await this.getVideos();
    return videos.find(v => v._id === _id) || null;
  }
  
  async getVideoFullText(videoId) {
    const video = await this.getVideoById(videoId);
    if (!video) return null;
    
    const upIdShort = video.up_id.slice(0, 8);
    const path = `data/transcript_videos_fulltext/${upIdShort}/${videoId}.json`;
    
    try {
      const data = await this.fetchJSON(path);
      return data.fullText || '';
    } catch (e) {
      console.warn(`fullText不存在: ${videoId}`, e);
      return '';
    }
  }
  
  async getVideosByCategory(category) {
    const videos = await this.getVideos();
    return videos.filter(v => v.category === category);
  }
  
  async getCategoryTags() {
    return this.fetchJSON('data/category_tags.json');
  }
  
  async getTasks() {
    return this.fetchJSON('data/transcript_tasks.json');
  }
  
  async getFactorKeywords() {
    return this.fetchJSON('data/factor_keywords.json');
  }
  
  async getMilestones() {
    return this.fetchJSON('data/project_milestones.json');
  }
  
  async getProjectTasks() {
    return this.fetchJSON('data/project_tasks.json');
  }
  
  async getErrors() {
    return this.fetchJSON('data/project_errors.json');
  }
  
  // 获取code_map数据（供ref-system使用）
  getCodeMap() {
    if (typeof code_map !== 'undefined') return code_map;
    return {};
  }
  
  /* === 计算字段/聚合 === */
  
  async getUpStats() {
    const ups = await this.getUpMaster();
    const videos = await this.getVideos();
    
    return ups.map(up => {
      const upVideos = videos.filter(v => v.up_id === up._id);
      
      const categories = {};
      upVideos.forEach(v => {
        if (v.category) {
          categories[v.category] = (categories[v.category] || 0) + 1;
        }
      });
      
      const dates = upVideos.map(v => v.publish_date).filter(d => d).sort();
      const latest = dates.length > 0 ? dates[dates.length - 1] : '';
      
      return {
        _id: up._id,
        name: up.name,
        platform: up.platform,
        avatar_url: up.avatar_url,
        status: up.status,
        total: upVideos.length,
        latest: latest,
        categories: categories
      };
    });
  }
  
  async getCategoryStats() {
    const videos = await this.getVideos();
    const catStats = {};
    
    videos.forEach(v => {
      if (v.category) {
        catStats[v.category] = (catStats[v.category] || 0) + 1;
      }
    });
    
    return catStats;
  }
  
  async getStatsSummary() {
    const videos = await this.getVideos();
    const ups = await this.getUpStats();
    const catStats = await this.getCategoryStats();
    
    let macroCount = 0;
    let commodityCount = 0;
    
    Object.keys(catStats).forEach(cat => {
      if (cat.includes('宏观')) macroCount += catStats[cat];
      if (cat.includes('大宗') || cat.includes('期货')) commodityCount += catStats[cat];
    });
    
    return {
      totalVideos: videos.length,
      totalUps: ups.length,
      macroCount: macroCount,
      commodityCount: commodityCount
    };
  }
  
  async searchVideos(keyword) {
    if (!keyword || keyword.length < 2) return [];
    
    const videos = await this.getVideos();
    const kw = keyword.toLowerCase();
    
    return videos.filter(v => {
      if (v.title && v.title.toLowerCase().includes(kw)) return true;
      if (v.preview && v.preview.toLowerCase().includes(kw)) return true;
      return false;
    });
  }
  
  /* === 数据写入 === */
  
  async writeData(path, data, commitMsg) {
    const content = btoa(unescape(encodeURIComponent(JSON.stringify(data, null, 2))));
    const sha = await this.getFileSha(path);
    
    const result = await this.githubPut(
      `/repos/${this.owner}/${this.repo}/contents/${path}`,
      content,
      sha,
      commitMsg
    );
    
    delete this.cache[path];
    delete this.cacheTime[path];
    
    return result;
  }
  
  async addUpMaster(upData) {
    const ups = await this.getUpMaster();
    
    const newId = 'up_' + Math.random().toString(36).slice(2, 12);
    const now = new Date().toISOString();
    
    const newUp = {
      _id: newId,
      _createTime: now,
      _updateTime: now,
      _creator: 'manual',
      name: upData.name,
      platform: upData.platform || 'bilibili',
      platform_uid: upData.platform_uid || '',
      avatar_url: upData.avatar_url || '',
      status: 'active',
      auto_track: upData.auto_track !== false
    };
    
    ups.push(newUp);
    await this.writeData('data/up_master.json', ups, `添加UP主: ${upData.name}`);
    
    return newUp;
  }
  
  async addTask(taskData) {
    const tasks = await this.getTasks();
    
    const newId = 'task_' + Math.random().toString(36).slice(2, 12);
    const now = new Date().toISOString();
    
    const newTask = {
      _id: newId,
      _createTime: now,
      _updateTime: now,
      _creator: 'manual',
      task_type: taskData.task_type || 'initial',
      action: taskData.action || 'add_up',
      platform: taskData.platform || 'bilibili',
      up_id: taskData.up_id,
      up_url: taskData.up_url || '',
      limit_count: taskData.limit_count || 500,
      limit_days: taskData.limit_days || 365,
      auto_track: taskData.auto_track !== false,
      status: 'pending',
      videos_total: 0,
      videos_done: 0,
      videos_skip: 0,
      videos_fail: 0
    };
    
    tasks.push(newTask);
    await this.writeData('data/transcript_tasks.json', tasks, `添加任务: ${taskData.up_id}`);
    
    return newTask;
  }
  
  async updateTask(taskId, updates) {
    const tasks = await this.getTasks();
    const idx = tasks.findIndex(t => t._id === taskId);
    
    if (idx === -1) {
      throw new Error(`任务不存在: ${taskId}`);
    }
    
    tasks[idx] = {
      ...tasks[idx],
      ...updates,
      _updateTime: new Date().toISOString()
    };
    
    await this.writeData('data/transcript_tasks.json', tasks, `更新任务: ${taskId}`);
    
    return tasks[idx];
  }
  
  async addVideo(videoData) {
    const videos = await this.getVideos();
    
    const newId = 'vid_' + Math.random().toString(36).slice(2, 12);
    const now = new Date().toISOString();
    
    const newVideo = {
      _id: newId,
      _createTime: now,
      _updateTime: now,
      _creator: 'manual',
      source_id: videoData.source_id,
      title: videoData.title,
      publish_date: videoData.publish_date,
      category: videoData.category || '',
      up_id: videoData.up_id,
      filename: videoData.filename || '',
      preview: videoData.preview || ''
    };
    
    videos.push(newVideo);
    await this.writeData('data/transcript_videos.json', videos, `添加视频: ${videoData.title}`);
    
    return newVideo;
  }
}

// 全局实例
var DataStore = new DataStoreClass();
