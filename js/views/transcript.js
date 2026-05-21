/* ================================================
   金融研究仪表盘 - 转录库视图 v1.3
   L4-2: 转录库完整实现（总览/UP主管理/内容浏览/因子提取）
   ================================================ */

import { AppState, ToastState } from '../store/state.js';
import { DataAPI } from '../adapter/data-adapter.js';
import { 
  getStatsSummary, 
  getUpStats, 
  getCategoryStats, 
  getCategoryClass,
  getPlatformClass,
  getPlatformLabel,
  formatDate,
  escapeHtml,
  loadUpNameCache,
  getUpName
} from '../compute/business.js';
import { filterAndSort, updateFilter, resetFilters } from '../search.js';
import { getFactorStats, getFactorStatsByType, FACTOR_TYPES, highlightFactors, getFactorClass } from '../factor.js';
import { initRefSystem, generateContext, copyToClipboard } from '../ref.js';

// 渲染转录库主视图
export async function renderTranscriptView() {
  const container = document.getElementById('mainContent');
  if (!container) return;
  
  AppState.isLoading = true;
  
  try {
    // 加载数据
    await loadUpNameCache();
    const stats = await getStatsSummary();
    const upList = await getUpStats();
    const catStats = await getCategoryStats();
    
    AppState.upList = upList;
    AppState.catStats = catStats;
    
    // 渲染Tab导航
    let html = `
      <div class="tc-tabs">
        <div class="tc-tab ${AppState.currentTab === 'overview' ? 'active' : ''}" onclick="switchTab('overview')">📊 总览</div>
        <div class="tc-tab ${AppState.currentTab === 'upmanage' ? 'active' : ''}" onclick="switchTab('upmanage')">👤 UP主</div>
        <div class="tc-tab ${AppState.currentTab === 'browse' ? 'active' : ''}" onclick="switchTab('browse')">📋 浏览</div>
        <div class="tc-tab ${AppState.currentTab === 'factor' ? 'active' : ''}" onclick="switchTab('factor')">🔑 因子</div>
      </div>
    `;
    
    // 根据当前Tab渲染内容
    switch (AppState.currentTab) {
      case 'overview':
        html += await renderOverview(stats, upList, catStats);
        break;
      case 'upmanage':
        html += await renderUpManage(upList);
        break;
      case 'browse':
        html += await renderBrowse();
        break;
      case 'factor':
        html += await renderFactor();
        break;
    }
    
    container.innerHTML = html;
    initRefSystem();
    
    // 如果是浏览视图，加载视频列表
    if (AppState.currentTab === 'browse') {
      await loadVideoList();
    }
    
  } catch (error) {
    container.innerHTML = `
      <div class="error-state">
        <div>加载失败: ${escapeHtml(error.message)}</div>
      </div>
    `;
  }
  
  AppState.isLoading = false;
}

// 切换Tab
window.switchTab = function(tab) {
  AppState.currentTab = tab;
  AppState.currentPage = 1;
  renderTranscriptView();
};

// 渲染总览页
async function renderOverview(stats, upList, catStats) {
  let html = '<div class="transcript-container" data-ref="transcript-overview">';
  
  // 统计卡片
  html += `
    <div class="tc-stats">
      <div class="tc-stat-card">
        <div class="label">转录视频</div>
        <div class="value" style="color:var(--accent2)">${stats.totalVideos}</div>
        <div class="sub">已完成</div>
      </div>
      <div class="tc-stat-card">
        <div class="label">UP主</div>
        <div class="value" style="color:var(--info)">${stats.totalUps}</div>
        <div class="sub">已收录</div>
      </div>
      <div class="tc-stat-card">
        <div class="label">宏观类</div>
        <div class="value" style="color:var(--cat-macro)">${stats.macroCount}</div>
        <div class="sub">含跨分类</div>
      </div>
      <div class="tc-stat-card">
        <div class="label">大宗/期货</div>
        <div class="value" style="color:var(--cat-comm)">${stats.commCount}</div>
        <div class="sub">含跨分类</div>
      </div>
    </div>
  `;
  
  // UP主卡片列表
  html += `
    <div>
      <div class="tc-up-header">已收录UP主</div>
      <div class="tc-up-grid">
        ${upList.map(up => `
          <div class="tc-up-card" onclick="switchTab('upmanage'); filterByUp('${up._id}')">
            <div class="tc-up-card-header">
              <img class="tc-up-avatar" src="${up.avatar_url || 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2280%22>👤</text></svg>'}" alt="">
              <div class="tc-up-info">
                <div class="tc-up-name">
                  <span class="plat-tag ${getPlatformClass(up.platform)}">${getPlatformLabel(up.platform)}</span>
                  ${escapeHtml(up.name)}
                </div>
                <div class="tc-up-meta">最新: ${up.latest || '—'}</div>
              </div>
            </div>
            <div class="tc-up-stats">
              <div class="tc-up-stat">
                <div class="num">${up.total}</div>
                <div class="txt">视频</div>
              </div>
            </div>
            <div class="tc-up-tags">
              ${Object.entries(up.categories || {}).map(([cat, count]) => 
                `<span class="tag ${getCategoryClass(cat)}">${escapeHtml(cat)} ${count}</span>`
              ).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
  
  // 分类分布
  html += `
    <div>
      <div class="tc-cat-header">分类分布</div>
      <div class="tc-cat-grid">
        ${Object.entries(catStats).sort((a, b) => b[1] - a[1]).map(([cat, count]) => `
          <div class="tc-cat-item">
            <div class="name">${escapeHtml(cat)}</div>
            <div class="count">${count}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
  
  html += '</div>';
  
  return html;
}

// 按UP主筛选
window.filterByUp = function(upId) {
  updateFilter('upId', upId);
  AppState.currentTab = 'browse';
  renderTranscriptView();
  loadVideoList();
};

// 渲染UP主管理页
async function renderUpManage(upList) {
  let html = '<div class="transcript-container" data-ref="transcript-upmanage">';
  
  // 搜索和筛选
  html += `
    <div class="tc-toolbar">
      <input type="text" class="input" placeholder="🔍 搜索UP主..." 
        oninput="searchUp(this.value)" style="width:200px">
      <select class="select" onchange="filterUpPlatform(this.value)">
        <option value="">全部平台</option>
        <option value="bilibili">B站</option>
        <option value="youtube">YouTube</option>
      </select>
      <span class="count">共 <strong>${upList.length}</strong> 个UP主</span>
    </div>
  `;
  
  // UP主卡片列表
  html += `<div class="tc-up-grid" id="upGrid">`;
  html += upList.map(up => `
    <div class="tc-up-card" id="up-${up._id}" data-name="${up.name.toLowerCase()}" data-platform="${up.platform}">
      <div class="tc-up-card-header">
        <img class="tc-up-avatar" src="${up.avatar_url || 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2280%22>👤</text></svg>'}" alt="">
        <div class="tc-up-info">
          <div class="tc-up-name">
            <span class="plat-tag ${getPlatformClass(up.platform)}">${getPlatformLabel(up.platform)}</span>
            ${escapeHtml(up.name)}
          </div>
          <div class="tc-up-meta">最新: ${up.latest || '—'}</div>
        </div>
      </div>
      <div class="tc-up-stats">
        <div class="tc-up-stat">
          <div class="num">${up.total}</div>
          <div class="txt">视频</div>
        </div>
      </div>
      <div class="tc-up-tags">
        ${Object.entries(up.categories || {}).map(([cat, count]) => 
          `<span class="tag ${getCategoryClass(cat)}">${escapeHtml(cat)} ${count}</span>`
        ).join('')}
      </div>
      <div style="margin-top:8px">
        <button class="btn btn-o btn-s" onclick="toggleUpVideos('${up._id}')">查看视频</button>
      </div>
      <div id="up-videos-${up._id}" style="display:none;margin-top:8px"></div>
    </div>
  `).join('');
  html += `</div>`;
  
  html += '</div>';
  
  return html;
}

// UP主搜索
window.searchUp = function(keyword) {
  const cards = document.querySelectorAll('.tc-up-card[id^="up-"]');
  const kw = keyword.toLowerCase();
  
  cards.forEach(card => {
    const name = card.dataset.name || '';
    card.style.display = name.includes(kw) ? '' : 'none';
  });
};

// UP主平台筛选
window.filterUpPlatform = function(platform) {
  const cards = document.querySelectorAll('.tc-up-card[id^="up-"]');
  
  cards.forEach(card => {
    if (!platform || card.dataset.platform === platform) {
      card.style.display = '';
    } else {
      card.style.display = 'none';
    }
  });
};

// 展开/收起UP主视频列表
window.toggleUpVideos = async function(upId) {
  const container = document.getElementById(`up-videos-${upId}`);
  if (!container) return;
  
  if (container.style.display === 'none') {
    container.style.display = '';
    
    if (!container.innerHTML || container.dataset.loaded !== 'true') {
      container.innerHTML = '<div class="tc-loading">加载中...</div>';
      
      try {
        const videos = await DataAPI.getVideos(upId);
        container.innerHTML = videos.length > 0 ? 
          videos.slice(0, 10).map(v => `
            <div style="padding:8px;border-bottom:1px solid var(--border);font-size:12px">
              <div style="font-weight:500">${escapeHtml(v.title)}</div>
              <div style="color:var(--t4);font-size:11px">${v.publish_date || '—'} · ${escapeHtml(v.category || '未分类')}</div>
            </div>
          `).join('') + (videos.length > 10 ? `<div style="padding:8px;color:var(--t4);font-size:11px;text-align:center">还有${videos.length - 10}个视频...</div>` : '') :
          '<div style="padding:16px;text-align:center;color:var(--t4)">暂无视频</div>';
        container.dataset.loaded = 'true';
      } catch (e) {
        container.innerHTML = '<div style="padding:16px;color:var(--danger)">加载失败</div>';
      }
    }
  } else {
    container.style.display = 'none';
  }
};

// 渲染内容浏览页
async function renderBrowse() {
  const videos = await DataAPI.getVideos();
  AppState.allVideos = videos;
  
  // 动态生成UP主选项
  let upOptions = '<option value="">全部UP主</option>';
  for (const up of AppState.upList) {
    upOptions += `<option value="${up._id}">${escapeHtml(up.name)}</option>`;
  }
  
  // 动态生成分类选项
  let catOptions = '<option value="">全部分类</option>';
  for (const cat of Object.keys(AppState.catStats)) {
    catOptions += `<option value="${escapeHtml(cat)}">${escapeHtml(cat)}</option>`;
  }
  
  let html = `<div class="transcript-container" data-ref="transcript-browse">`;
  
  // 筛选工具栏
  html += `
    <div class="tc-toolbar">
      <select class="select" id="fUp" onchange="applyBrowseFilters()">
        ${upOptions}
      </select>
      <select class="select" id="fCat" onchange="applyBrowseFilters()">
        ${catOptions}
      </select>
      <div class="date-range">
        <input type="date" id="fFrom" class="input" onchange="applyBrowseFilters()" style="width:120px">
        <span>至</span>
        <input type="date" id="fTo" class="input" onchange="applyBrowseFilters()" style="width:120px">
      </div>
      <input type="text" class="input" id="fSearch" placeholder="🔍 搜索..." oninput="applyBrowseFilters()" style="width:180px">
      <select class="select" id="fSort" onchange="applyBrowseFilters()">
        <option value="dd">最新优先</option>
        <option value="da">最早优先</option>
      </select>
      <button class="btn btn-g btn-s" onclick="resetBrowseFilters()">重置</button>
      <span class="count">共 <strong id="videoCount">${videos.length}</strong> 条</span>
    </div>
  `;
  
  // 视频列表容器
  html += '<div class="tc-video-list" id="videoList"></div>';
  
  // 分页
  html += '<div class="tc-pagination" id="videoPagination"></div>';
  
  html += '</div>';
  
  return html;
}

// 应用浏览筛选
window.applyBrowseFilters = function() {
  AppState.filters.upId = document.getElementById('fUp')?.value || '';
  AppState.filters.category = document.getElementById('fCat')?.value || '';
  AppState.filters.fromDate = document.getElementById('fFrom')?.value || '';
  AppState.filters.toDate = document.getElementById('fTo')?.value || '';
  AppState.filters.search = document.getElementById('fSearch')?.value || '';
  AppState.sortDir = document.getElementById('fSort')?.value === 'da' ? 'asc' : 'desc';
  
  loadVideoList();
};

// 重置浏览筛选
window.resetBrowseFilters = function() {
  document.getElementById('fUp').value = '';
  document.getElementById('fCat').value = '';
  document.getElementById('fFrom').value = '';
  document.getElementById('fTo').value = '';
  document.getElementById('fSearch').value = '';
  document.getElementById('fSort').value = 'dd';
  
  resetFilters();
  loadVideoList();
};

// 加载视频列表
async function loadVideoList() {
  const container = document.getElementById('videoList');
  const pagination = document.getElementById('videoPagination');
  const countEl = document.getElementById('videoCount');
  
  if (!container) return;
  
  // 应用筛选和排序
  const result = filterAndSort(AppState.allVideos, {
    page: AppState.currentPage,
    pageSize: AppState.pageSize
  });
  
  // 更新计数
  if (countEl) countEl.textContent = result.total;
  
  // 渲染视频列表
  let html = '';
  for (const v of result.data) {
    const upName = getUpName(v.up_id);
    html += `
      <div class="tc-video-item" id="v-${v._id}" onclick="toggleVideoExpand('${v._id}')">
        <div class="tc-video-header">
          <div style="flex:1">
            <div class="tc-video-title">${escapeHtml(v.title)}</div>
            <div class="tc-video-meta">
              <span class="tag ${getCategoryClass(v.category)}">${escapeHtml(v.category || '未分类')}</span>
              <span>${v.publish_date || '—'}</span>
              <span style="color:var(--t4)">${escapeHtml(upName)}</span>
            </div>
          </div>
        </div>
        <div class="tc-video-preview" id="p-${v._id}">${escapeHtml(v.preview || '')}...</div>
      </div>
    `;
  }
  
  container.innerHTML = html || '<div class="empty-state"><div class="icon">📭</div><div class="text">暂无数据</div></div>';
  
  // 渲染分页
  if (result.totalPages > 1) {
    let ph = '';
    if (AppState.currentPage > 1) {
      ph += `<button class="pg-btn" onclick="goToPage(${AppState.currentPage - 1})">‹</button>`;
    }
    
    const startPage = Math.max(1, AppState.currentPage - 2);
    const endPage = Math.min(result.totalPages, AppState.currentPage + 2);
    
    for (let i = startPage; i <= endPage; i++) {
      ph += `<button class="pg-btn ${i === AppState.currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
    }
    
    if (AppState.currentPage < result.totalPages) {
      ph += `<button class="pg-btn" onclick="goToPage(${AppState.currentPage + 1})">›</button>`;
    }
    
    pagination.innerHTML = ph;
  } else {
    pagination.innerHTML = '';
  }
}

// 翻页
window.goToPage = function(page) {
  AppState.currentPage = page;
  loadVideoList();
};

// 展开/收起视频详情
window.toggleVideoExpand = async function(id) {
  const item = document.getElementById(`v-${id}`);
  const preview = document.getElementById(`p-${id}`);
  
  if (!item || !preview) return;
  
  if (item.classList.contains('open')) {
    // 收起
    item.classList.remove('open');
    const v = AppState.filteredVideos.find(x => x._id === id);
    preview.innerHTML = `${escapeHtml(v?.preview || '')}...`;
  } else {
    // 展开
    item.classList.add('open');
    preview.innerHTML = '<div class="tc-loading">加载中...</div>';
    
    try {
      let fullText = AppState.videoCache[id];
      
      if (!fullText) {
        fullText = await DataAPI.getVideoFullText(id);
        AppState.videoCache[id] = fullText;
      }
      
      const v = AppState.filteredVideos.find(x => x._id === id);
      
      preview.innerHTML = `
        <div class="tc-video-actions">
          <button class="btn btn-p btn-s" onclick="openVideoDetail('${id}'); event.stopPropagation();">📄 全文</button>
          <a href="https://www.bilibili.com/video/${v?.source_id || id}" target="_blank" class="btn btn-o btn-s" onclick="event.stopPropagation()">▶️ B站</a>
          <button class="btn btn-o btn-s" onclick="copyVideoText('${id}'); event.stopPropagation();">📋 复制</button>
        </div>
        <div class="tc-video-fulltext">${escapeHtml(fullText || '暂无全文')}</div>
      `;
    } catch (e) {
      preview.innerHTML = '<div style="color:var(--danger)">加载失败</div>';
    }
  }
};

// 打开视频详情面板
window.openVideoDetail = function(id) {
  const { DetailPanelState } = require('../store/state.js');
  const v = AppState.filteredVideos.find(x => x._id === id);
  
  if (!v) return;
  
  const upName = getUpName(v.up_id);
  const fullText = AppState.videoCache[id] || v.preview || '';
  
  const panel = document.getElementById('detailPanel');
  const title = document.getElementById('detailTitle');
  const body = document.getElementById('detailBody');
  
  if (title) title.textContent = v.title;
  if (body) {
    body.innerHTML = `
      <div class="detail-meta">
        <div class="detail-meta-item">UP主: <span>${escapeHtml(upName)}</span></div>
        <div class="detail-meta-item">日期: <span>${v.publish_date || '—'}</span></div>
        <div class="detail-meta-item">分类: <span>${escapeHtml(v.category || '')}</span></div>
      </div>
      <div class="detail-content">${escapeHtml(fullText)}</div>
    `;
  }
  
  DetailPanelState.open(id);
};

// 复制视频文本
window.copyVideoText = async function(id) {
  const text = AppState.videoCache[id];
  
  if (text) {
    const success = await copyToClipboard(text);
    ToastState.show(success ? '已复制' : '复制失败', success ? 'success' : 'error');
  } else {
    ToastState.show('暂无全文', 'warning');
  }
};

// 渲染因子提取页
async function renderFactor() {
  let html = '<div class="transcript-container" data-ref="transcript-factor">';
  
  // 因子类型说明
  html += `
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px">
      ${Object.values(FACTOR_TYPES).map(type => `
        <div style="background:var(--bg3);padding:12px;border-radius:8px;text-align:center">
          <div style="font-size:20px;margin-bottom:4px">${type.icon}</div>
          <div style="font-weight:600;font-size:13px">${type.name}</div>
          <div style="font-size:11px;color:var(--t4);margin-top:4px">${type.description}</div>
        </div>
      `).join('')}
    </div>
  `;
  
  // 获取因子统计
  const stats = await getFactorStatsByType();
  
  html += '<div class="tc-factor-grid">';
  
  // 按类型分组显示
  for (const [typeId, typeData] of Object.entries(stats)) {
    if (typeData.keywords.length === 0) continue;
    
    html += `
      <div style="grid-column:1/-1;margin-top:16px">
        <div style="font-weight:600;margin-bottom:12px;display:flex;align-items:center;gap:8px">
          <span>${typeData.type.icon}</span>
          <span>${typeData.type.name}</span>
          <span class="tag ${getFactorClass(typeId)}">${typeData.keywords.length}个因子</span>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px">
          ${typeData.keywords.map(kw => `
            <div class="tc-factor-card">
              <div class="tc-factor-keyword">${escapeHtml(kw.keyword)}</div>
              <span class="tag ${getFactorClass(kw.typeId)}">${escapeHtml(kw.typeName || kw.type)}</span>
              <div class="tc-factor-count" style="color:var(--${typeData.type.color === 'macro' ? 'cat-macro' : typeData.type.color === 'comm' ? 'cat-comm' : typeData.type.color === 'stock' ? 'cat-stock' : 'cat-mix'})">
                ${kw.count} <span>个视频提及</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }
  
  html += '</div></div>';
  
  return html;
}

export default { renderTranscriptView };
