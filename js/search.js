/* ================================================
   金融研究仪表盘 - 搜索引擎 v1.3
   L3-5: 全文检索/分类筛选/排序分页
   ================================================ */

import { AppState } from './store/state.js';
import { escapeHtml, getUpName } from './compute/business.js';

// 搜索索引
let searchIndex = null;

// 构建搜索索引
export function buildSearchIndex(videos) {
  searchIndex = videos.map(v => ({
    _id: v._id,
    title: v.title || '',
    preview: v.preview || '',
    category: v.category || '',
    up_id: v.up_id || '',
    publish_date: v.publish_date || ''
  }));
  
  return searchIndex;
}

// 全文搜索
export function searchVideos(keyword, videos = null) {
  if (!keyword || keyword.length < 2) {
    return videos || AppState.allVideos;
  }
  
  const data = videos || AppState.allVideos;
  const kw = keyword.toLowerCase();
  
  return data.filter(v => {
    if (v.title && v.title.toLowerCase().includes(kw)) return true;
    if (v.preview && v.preview.toLowerCase().includes(kw)) return true;
    if (v.category && v.category.toLowerCase().includes(kw)) return true;
    return false;
  });
}

// 应用筛选条件
export function applyFilters(videos) {
  const f = AppState.filters;
  let filtered = [...videos];
  
  // UP主筛选
  if (f.upId) {
    filtered = filtered.filter(v => v.up_id === f.upId);
  }
  
  // 分类筛选
  if (f.category) {
    filtered = filtered.filter(v => v.category === f.category);
  }
  
  // 日期范围筛选
  if (f.fromDate) {
    filtered = filtered.filter(v => v.publish_date >= f.fromDate);
  }
  
  if (f.toDate) {
    filtered = filtered.filter(v => v.publish_date <= f.toDate);
  }
  
  // 关键词搜索
  if (f.search && f.search.length >= 2) {
    const kw = f.search.toLowerCase();
    filtered = filtered.filter(v => 
      (v.title && v.title.toLowerCase().includes(kw)) ||
      (v.preview && v.preview.toLowerCase().includes(kw))
    );
  }
  
  return filtered;
}

// 应用排序
export function applySort(videos) {
  const field = AppState.sortField;
  const dir = AppState.sortDir === 'desc' ? -1 : 1;
  
  return [...videos].sort((a, b) => {
    let va = a[field] || '';
    let vb = b[field] || '';
    
    // 日期排序
    if (field === 'publish_date') {
      va = va ? va.localeCompare(vb) : 0;
      vb = vb ? vb.localeCompare(va) : 0;
    }
    
    if (va < vb) return -1 * dir;
    if (va > vb) return 1 * dir;
    return 0;
  });
}

// 分页
export function paginate(videos, page = 1, pageSize = 20) {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  
  return {
    data: videos.slice(start, end),
    total: videos.length,
    page,
    pageSize,
    totalPages: Math.ceil(videos.length / pageSize)
  };
}

// 完整筛选流程
export function filterAndSort(videos, options = {}) {
  const { page = 1, pageSize = 20 } = options;
  
  // 1. 应用筛选
  let result = applyFilters(videos);
  
  // 2. 排序
  result = applySort(result);
  
  // 3. 更新全局状态
  AppState.filteredVideos = result;
  AppState.currentPage = page;
  
  // 4. 分页
  const paginated = paginate(result, page, pageSize);
  
  return paginated;
}

// 更新筛选条件
export function updateFilter(key, value) {
  AppState.filters[key] = value;
  AppState.currentPage = 1; // 重置页码
}

// 重置筛选条件
export function resetFilters() {
  AppState.filters = {
    upId: '',
    category: '',
    fromDate: '',
    toDate: '',
    search: ''
  };
  AppState.currentPage = 1;
}

// 切换排序
export function toggleSort(field) {
  if (AppState.sortField === field) {
    AppState.sortDir = AppState.sortDir === 'desc' ? 'asc' : 'desc';
  } else {
    AppState.sortField = field;
    AppState.sortDir = 'desc';
  }
  AppState.currentPage = 1;
}

// 高亮搜索关键词
export function highlightKeyword(text, keyword) {
  if (!keyword || !text) return escapeHtml(text);
  
  const escaped = escapeHtml(text);
  const regex = new RegExp(`(${escapeRegex(keyword)})`, 'gi');
  return escaped.replace(regex, '<mark class="search-highlight">$1</mark>');
}

// 转义正则特殊字符
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export default {
  buildSearchIndex,
  searchVideos,
  applyFilters,
  applySort,
  paginate,
  filterAndSort,
  updateFilter,
  resetFilters,
  toggleSort,
  highlightKeyword
};
