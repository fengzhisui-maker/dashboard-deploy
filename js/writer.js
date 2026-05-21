/* ================================================
   金融研究仪表盘 - 数据写入 v1.3
   L3-9: GitHub API写入
   ================================================ */

import { getToken, setToken } from './adapter/data-adapter.js';
import { ToastState } from './store/state.js';
import { AppError, ERROR_CODES } from './error.js';

// GitHub配置
const CONFIG = {
  owner: 'fengzhisui-maker',
  repo: 'dashboard-deploy',
  branch: 'main',
  apiBase: 'https://api.github.com'
};

// GitHub API请求
async function githubRequest(path, options = {}) {
  const token = getToken();
  
  if (!token) {
    throw new AppError('未设置GitHub Token', ERROR_CODES.AUTH_FAILED);
  }
  
  const url = `${CONFIG.apiBase}${path}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new AppError(
      `GitHub API错误: ${response.status} ${response.statusText}`,
      ERROR_CODES.SERVER_ERROR,
      errorData
    );
  }
  
  return response.json();
}

// 获取文件SHA
async function getFileSha(path) {
  try {
    const data = await githubRequest(
      `/repos/${CONFIG.owner}/${CONFIG.repo}/contents/${path}?ref=${CONFIG.branch}`
    );
    return data.sha;
  } catch (e) {
    return null;
  }
}

// 写入文件到GitHub
export async function writeFile(path, content, message = 'Update file') {
  const sha = await getFileSha(path);
  
  // 内容Base64编码
  const encoded = btoa(unescape(encodeURIComponent(
    typeof content === 'object' ? JSON.stringify(content, null, 2) : content
  )));
  
  const body = {
    message,
    content: encoded,
    branch: CONFIG.branch
  };
  
  if (sha) {
    body.sha = sha;
  }
  
  const result = await githubRequest(
    `/repos/${CONFIG.owner}/${CONFIG.repo}/contents/${path}`,
    {
      method: 'PUT',
      body: JSON.stringify(body)
    }
  );
  
  ToastState.success('文件保存成功');
  return result;
}

// 删除文件
export async function deleteFile(path, message = 'Delete file') {
  const sha = await getFileSha(path);
  
  if (!sha) {
    throw new AppError('文件不存在', ERROR_CODES.DATA_NOT_FOUND);
  }
  
  const result = await githubRequest(
    `/repos/${CONFIG.owner}/${CONFIG.repo}/contents/${path}`,
    {
      method: 'DELETE',
      body: JSON.stringify({
        message,
        sha,
        branch: CONFIG.branch
      })
    }
  );
  
  ToastState.success('文件删除成功');
  return result;
}

// 数据写入API
export const WriterAPI = {
  // 保存UP主数据
  async saveUpMaster(data, message = 'Update UP主数据') {
    return writeFile('data/up_master.json', data, message);
  },
  
  // 保存视频数据
  async saveVideos(data, message = 'Update 视频数据') {
    return writeFile('data/transcript_videos.json', data, message);
  },
  
  // 保存任务数据
  async saveTasks(data, message = 'Update 任务数据') {
    return writeFile('data/transcript_tasks.json', data, message);
  },
  
  // 保存因子关键词
  async saveFactorKeywords(data, message = 'Update 因子关键词') {
    return writeFile('data/factor_keywords.json', data, message);
  },
  
  // 保存项目里程碑
  async saveMilestones(data, message = 'Update 里程碑') {
    return writeFile('data/project_milestones.json', data, message);
  },
  
  // 保存项目任务
  async saveProjectTasks(data, message = 'Update 项目任务') {
    return writeFile('data/project_tasks.json', data, message);
  },
  
  // 保存项目错误
  async saveErrors(data, message = 'Update 错误日志') {
    return writeFile('data/project_errors.json', data, message);
  }
};

// 生成唯一ID
export function generateId(prefix = 'id') {
  return `${prefix}_${Math.random().toString(36).slice(2, 12)}`;
}

// 创建新UP主
export async function createUp(upData) {
  const { DataAPI } = await import('./adapter/data-adapter.js');
  
  const ups = await DataAPI.getUpMaster();
  
  const newUp = {
    _id: generateId('up'),
    _createTime: new Date().toISOString(),
    _updateTime: new Date().toISOString(),
    _creator: 'manual',
    name: upData.name,
    platform: upData.platform || 'bilibili',
    platform_uid: upData.platform_uid || '',
    avatar_url: upData.avatar_url || '',
    status: 'active',
    auto_track: upData.auto_track !== false
  };
  
  ups.push(newUp);
  await WriterAPI.saveUpMaster(ups, `添加UP主: ${upData.name}`);
  
  return newUp;
}

// 创建新视频
export async function createVideo(videoData) {
  const { DataAPI } = await import('./adapter/data-adapter.js');
  
  const videos = await DataAPI.getVideos();
  
  const newVideo = {
    _id: generateId('vid'),
    _createTime: new Date().toISOString(),
    _updateTime: new Date().toISOString(),
    _creator: 'manual',
    source_id: videoData.source_id,
    title: videoData.title,
    publish_date: videoData.publish_date,
    category: videoData.category || '',
    up_id: videoData.up_id,
    preview: videoData.preview || ''
  };
  
  videos.push(newVideo);
  await WriterAPI.saveVideos(videos, `添加视频: ${videoData.title}`);
  
  return newVideo;
}

// 更新数据项
export async function updateItem(tableName, itemId, updates) {
  const { DataAPI } = await import('./adapter/data-adapter.js');
  
  let data, saveFunc;
  
  switch (tableName) {
    case 'up_master':
      data = await DataAPI.getUpMaster();
      saveFunc = WriterAPI.saveUpMaster.bind(WriterAPI);
      break;
    case 'transcript_videos':
      data = await DataAPI.getVideos();
      saveFunc = WriterAPI.saveVideos.bind(WriterAPI);
      break;
    case 'transcript_tasks':
      data = await DataAPI.getTasks();
      saveFunc = WriterAPI.saveTasks.bind(WriterAPI);
      break;
    default:
      throw new AppError(`不支持的表: ${tableName}`, ERROR_CODES.VALIDATION_ERROR);
  }
  
  const idx = data.findIndex(item => item._id === itemId);
  
  if (idx === -1) {
    throw new AppError(`数据项不存在: ${itemId}`, ERROR_CODES.DATA_NOT_FOUND);
  }
  
  data[idx] = {
    ...data[idx],
    ...updates,
    _updateTime: new Date().toISOString()
  };
  
  await saveFunc(data, `更新 ${tableName}: ${itemId}`);
  
  return data[idx];
}

// 删除数据项
export async function deleteItem(tableName, itemId) {
  const { DataAPI } = await import('./adapter/data-adapter.js');
  
  let data, saveFunc;
  
  switch (tableName) {
    case 'up_master':
      data = await DataAPI.getUpMaster();
      saveFunc = WriterAPI.saveUpMaster.bind(WriterAPI);
      break;
    case 'transcript_videos':
      data = await DataAPI.getVideos();
      saveFunc = WriterAPI.saveVideos.bind(WriterAPI);
      break;
    case 'transcript_tasks':
      data = await DataAPI.getTasks();
      saveFunc = WriterAPI.saveTasks.bind(WriterAPI);
      break;
    default:
      throw new AppError(`不支持的表: ${tableName}`, ERROR_CODES.VALIDATION_ERROR);
  }
  
  const filtered = data.filter(item => item._id !== itemId);
  
  if (filtered.length === data.length) {
    throw new AppError(`数据项不存在: ${itemId}`, ERROR_CODES.DATA_NOT_FOUND);
  }
  
  await saveFunc(filtered, `删除 ${tableName}: ${itemId}`);
  
  return true;
}

export default {
  writeFile,
  deleteFile,
  WriterAPI,
  generateId,
  createUp,
  createVideo,
  updateItem,
  deleteItem
};
