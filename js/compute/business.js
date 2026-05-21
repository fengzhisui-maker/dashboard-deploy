/* ================================================
   金融研究仪表盘 - 业务计算层 v1.3
   L3-3: 聚合统计/分类统计
   ================================================ */

import { DataAPI } from '../adapter/data-adapter.js';
import { AppState } from '../store/state.js';

// UP主统计
export async function getUpStats() {
  const ups = await DataAPI.getUpMaster();
  const videos = await DataAPI.getVideos();
  
  return ups.map(up => {
    const upVideos = videos.filter(v => v.up_id === up._id);
    
    const categories = {};
    upVideos.forEach(v => {
      if (v.category) {
        categories[v.category] = (categories[v.category] || 0) + 1;
      }
    });
    
    const dates = upVideos.map(v => v.publish_date).filter(d => d).sort();
    
    return {
      _id: up._id,
      name: up.name,
      platform: up.platform,
      avatar_url: up.avatar_url,
      status: up.status,
      total: upVideos.length,
      latest: dates.length > 0 ? dates[dates.length - 1] : '',
      categories
    };
  });
}

// 分类统计
export async function getCategoryStats() {
  const videos = await DataAPI.getVideos();
  const catStats = {};
  
  videos.forEach(v => {
    if (v.category) {
      catStats[v.category] = (catStats[v.category] || 0) + 1;
    }
  });
  
  return catStats;
}

// 综合统计摘要
export async function getStatsSummary() {
  const videos = await DataAPI.getVideos();
  const ups = await getUpStats();
  const catStats = await getCategoryStats();
  
  let macroCount = 0;
  let commCount = 0;
  
  Object.keys(catStats).forEach(cat => {
    if (cat.includes('宏观')) macroCount += catStats[cat];
    if (cat.includes('大宗') || cat.includes('期货')) commCount += catStats[cat];
  });
  
  return {
    totalVideos: videos.length,
    totalUps: ups.length,
    macroCount,
    commCount,
    catStats
  };
}

// 分类CSS类名
export function getCategoryClass(category) {
  if (!category) return 't-other';
  
  const macros = ['宏观', '宏观研究', '宏观分析'];
  const comms = ['大宗', '期货', '商品'];
  const stocks = ['股票', 'A股', '美股'];
  
  let matchMacro = macros.some(m => category.includes(m));
  let matchComm = comms.some(c => category.includes(c));
  let matchStock = stocks.some(s => category.includes(s));
  
  if (matchMacro && matchComm && matchStock) return 't-other';
  if ((matchMacro && matchComm) || (matchMacro && matchStock) || (matchComm && matchStock)) return 't-mix';
  if (matchMacro) return 't-macro';
  if (matchComm) return 't-comm';
  if (matchStock) return 't-stock';
  
  return 't-other';
}

// 平台CSS类名
export function getPlatformClass(platform) {
  if (platform === 'youtube') return 'yt';
  if (platform === 'bilibili') return 'bili';
  return 'other';
}

// 平台显示名称
export function getPlatformLabel(platform) {
  const labels = {
    youtube: 'YouTube',
    bilibili: 'B站',
    other: '其他'
  };
  return labels[platform] || '未知';
}

// 格式化日期
export function formatDate(dateStr) {
  if (!dateStr) return '—';
  
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    
    return d.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  } catch (e) {
    return dateStr;
  }
}

// 格式化日期时间
export function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    
    return d.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return dateStr;
  }
}

// HTML转义
export function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  
  const div = document.createElement('div');
  div.textContent = String(str);
  return div.innerHTML;
}

// 文本截断
export function truncateText(text, maxLength = 100) {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

// 加载UP主名称到缓存
export async function loadUpNameCache() {
  const ups = await DataAPI.getUpMaster();
  ups.forEach(up => {
    AppState.upNameCache[up._id] = up.name;
  });
}

// 获取UP主名称
export function getUpName(upId) {
  return AppState.upNameCache[upId] || upId;
}
