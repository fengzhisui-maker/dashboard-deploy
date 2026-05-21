/* ================================================
   金融研究仪表盘 - 转录库渲染模块
   展示层：只调用 DataStore 接口，不碰原始数据
   ================================================ */

/* === 概览页 === */
function rOverview() {
  var stats = DataStore.getStatsSummary();
  var upList = DataStore.getUpList();
  var catStats = DataStore.getCatStats();
  
  // 统计数据卡片
  var statsCards = '';
  statsCards += '<div class="card"><div class="l">转录视频</div><div class="v" style="color:var(--accent2)">' + stats.totalVideos + '</div><div class="s">已完成</div></div>';
  statsCards += '<div class="card"><div class="l">UP主</div><div class="v" style="color:var(--info)">' + stats.totalUps + '</div><div class="s">已收录</div></div>';
  statsCards += '<div class="card"><div class="l">宏观类</div><div class="v" style="color:var(--cat-macro)">' + stats.macroCount + '</div><div class="s">含跨分类</div></div>';
  statsCards += '<div class="card"><div class="l">大宗/期货</div><div class="v" style="color:var(--cat-comm)">' + stats.commodityCount + '</div><div class="s">含跨分类</div></div>';
  
  // UP主卡片（从DataStore动态获取，不硬编码任何名称）
  var upCards = '';
  upList.forEach(function(up) {
    var cats = '';
    Object.keys(up.categories || {}).forEach(function(c) {
      cats += '<span class="tag ' + catCls(c) + '">' + c + ' ' + up.categories[c] + '</span>';
    });
    
    upCards += '<div class="up-c">';
    upCards += '<div class="up-h">';
    upCards += '<div style="display:flex;align-items:center;gap:6px">';
    upCards += '<span class="plat-tag ' + platClass(up.platform) + '">' + platLabel(up.platform) + '</span>';
    upCards += '<div class="up-n">' + esc(up.name) + '</div>';
    upCards += '<div class="up-d">最新: ' + (up.latest || '—') + '</div>';
    upCards += '</div>';
    upCards += '<div style="display:flex;gap:16px;margin-bottom:8px">';
    upCards += '<div style="text-align:center">';
    upCards += '<div style="font-size:16px;font-weight:700;color:var(--accent2)">' + up.total + '</div>';
    upCards += '<div style="font-size:9px;color:var(--t4)">视频</div>';
    upCards += '</div>';
    upCards += '</div>';
    upCards += '</div>';
    upCards += '<div>' + cats + '</div>';
    upCards += '</div>';
  });
  
  // 分类分布（从DataStore动态获取）
  var catCards = '';
  Object.entries(catStats).sort(function(a, b) { return b[1] - a[1]; }).forEach(function(entry) {
    catCards += '<div style="background:var(--bg3);border:1px solid var(--border);border-radius:6px;padding:10px 14px;min-width:180px">';
    catCards += '<div style="font-size:10px;color:var(--t4);margin-bottom:3px">' + entry[0] + '</div>';
    catCards += '<div style="font-size:18px;font-weight:700;color:var(--accent2)">' + entry[1] + '</div>';
    catCards += '</div>';
  });
  
  document.getElementById('tc-overview').innerHTML = 
    '<div data-ref="transcript-overview" class="g2">' + statsCards + '</div>' +
    '<h3 style="font-size:13px;margin-bottom:10px">已收录UP主</h3>' +
    '<div class="up-g">' + upCards + '</div>' +
    '<h3 style="font-size:13px;margin-bottom:10px">分类分布</h3>' +
    '<div style="display:flex;flex-wrap:wrap;gap:8px">' + catCards + '</div>';
  
  initRefSystem();
}

/* === UP主管理 === */
function rUps() {
  var upList = DataStore.getUpList();
  
  // 平台筛选器
  var filterHtml = '<div class="plat-filter">';
  filterHtml += '<button class="active" onclick="filterPlat(\'all\',this)">全部</button>';
  filterHtml += '<button onclick="filterPlat(\'bilibili\',this)">B站</button>';
  filterHtml += '<button onclick="filterPlat(\'youtube\',this)">YouTube</button>';
  filterHtml += '<button onclick="filterPlat(\'other\',this)">其他</button>';
  filterHtml += '</div>';
  
  // UP主卡片（从DataStore动态获取）
  var upCards = '';
  upList.forEach(function(up) {
    var cats = '';
    Object.keys(up.categories || {}).forEach(function(c) {
      cats += '<span class="tag ' + catCls(c) + '">' + c + ' ' + up.categories[c] + '</span>';
    });
    
    upCards += '<div class="up-c" data-platform="' + (up.platform || 'bilibili') + '">';
    upCards += '<div class="up-h">';
    upCards += '<div style="display:flex;align-items:center;gap:6px">';
    upCards += '<span class="plat-tag ' + platClass(up.platform) + '">' + platLabel(up.platform) + '</span>';
    upCards += '<div class="up-n">' + esc(up.name) + '</div>';
    upCards += '</div>';
    upCards += '<div class="up-d">最新: ' + (up.latest || '—') + '</div>';
    upCards += '</div>';
    upCards += '<div style="display:flex;gap:16px;margin-bottom:8px">';
    upCards += '<div style="text-align:center">';
    upCards += '<div style="font-size:16px;font-weight:700;color:var(--accent2)">' + up.total + '</div>';
    upCards += '<div style="font-size:9px;color:var(--t4)">视频</div>';
    upCards += '</div>';
    upCards += '</div>';
    upCards += '<div style="margin-bottom:10px">' + cats + '</div>';
    upCards += '<div style="display:flex;gap:6px">';
    upCards += '<button class="btn btn-o btn-s" onclick="openAddUpModal(\'' + esc(up.name) + '\')">追加转录</button>';
    upCards += '<button class="btn btn-o btn-s" onclick="browseUp(\'' + esc(up.name) + '\')">浏览内容</button>';
    upCards += '</div>';
    upCards += '</div>';
  });
  
  // 待处理队列
  var pendingHtml = renderPendingQueue();
  
  document.getElementById('tc-ups').innerHTML = 
    '<div data-ref="transcript-ups" style="position:relative">' +
    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">' +
    '<h3 style="font-size:13px">UP主管理</h3>' +
    '<button class="btn btn-p" onclick="openAddUpModal()">➕ 添加UP主</button>' +
    '</div>' +
    filterHtml +
    '<div class="up-g" id="upGrid">' + upCards + '</div>' +
    pendingHtml +
    '</div>';
  
  initRefSystem();
}

/* === 转录任务 === */
function rTasks() {
  var html = '<div data-ref="transcript-tasks" style="background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:16px;margin-bottom:16px">';
  html += '<h3 style="font-size:13px;margin-bottom:12px">📋 新建转录任务</h3>';
  html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">';
  html += '<div><label style="font-size:10px;color:var(--t3);display:block;margin-bottom:4px">UP主名称</label>';
  html += '<input style="width:100%;background:var(--input-bg);border:1px solid var(--border);color:var(--t1);padding:7px 10px;border-radius:5px;font-size:12px" placeholder="输入UP主名称"></div>';
  html += '<div><label style="font-size:10px;color:var(--t3);display:block;margin-bottom:4px">主页链接</label>';
  html += '<input style="width:100%;background:var(--input-bg);border:1px solid var(--border);color:var(--t1);padding:7px 10px;border-radius:5px;font-size:12px" placeholder="https://space.bilibili.com/xxx"></div>';
  html += '</div>';
  html += '<button class="btn btn-p" style="margin-top:10px" onclick="alert(\'请在对话中发送任务信息，我来执行\')">创建任务</button>';
  html += '</div>';
  
  html += '<h3 style="font-size:13px;margin-bottom:10px">历史任务</h3>';
  
  // 从待处理队列动态生成历史任务
  var queue = DataStore.getPendingQueue();
  if (queue && queue.length > 0) {
    queue.forEach(function(task) {
      var statusClass = task.status === 'done' ? 't-stock' : task.status === 'processing' ? 't-macro' : 't-other';
      var statusText = task.status === 'done' ? '已完成' : task.status === 'processing' ? '处理中' : task.status;
      html += '<div style="background:var(--bg3);border:1px solid var(--border);border-radius:6px;padding:12px;margin-bottom:8px">';
      html += '<div style="display:flex;justify-content:space-between;margin-bottom:6px">';
      html += '<span style="font-size:12px;font-weight:500">' + esc(task.name) + '</span>';
      html += '<span class="tag ' + statusClass + '">' + statusText + '</span>';
      html += '</div>';
      html += '<div style="font-size:10px;color:var(--t4);margin-bottom:6px">平台: ' + platLabel(task.platform) + ' | ID: ' + task.upId + '</div>';
      if (task.videosDone) {
        html += '<div style="height:3px;background:var(--input-bg);border-radius:2px;overflow:hidden"><div style="height:100%;background:var(--accent);width:100%"></div></div>';
      }
      html += '</div>';
    });
  } else {
    html += '<div style="background:var(--bg3);border:1px solid var(--border);border-radius:6px;padding:12px">';
    html += '<div style="display:flex;justify-content:space-between;margin-bottom:6px">';
    html += '<span style="font-size:12px;font-weight:500">暂无历史任务</span>';
    html += '</div>';
    html += '</div>';
  }
  
  document.getElementById('tc-tasks').innerHTML = html;
  initRefSystem();
}

/* === 内容浏览 === */
function rBrowse() {
  var upList = DataStore.getUpList();
  var categories = DataStore.getCategories();
  
  // 动态生成UP主选项
  var upOptions = '<option value="">全部UP主</option>';
  upList.forEach(function(up) {
    upOptions += '<option value="' + esc(up.name) + '">' + esc(up.name) + '</option>';
  });
  
  // 动态生成分类选项
  var catOptions = '<option value="">全部分类</option>';
  categories.forEach(function(c) {
    catOptions += '<option value="' + esc(c) + '">' + esc(c) + '</option>';
  });
  
  var html = '<div data-ref="transcript-browse" class="fbar">';
  html += '<select id="fUp" onchange="applyF()">' + upOptions + '</select>';
  html += '<select id="fCat" onchange="applyF()">' + catOptions + '</select>';
  html += '<input type="date" id="fFrom" onchange="applyF()" style="width:120px">';
  html += '<span style="color:var(--t4);font-size:11px">至</span>';
  html += '<input type="date" id="fTo" onchange="applyF()" style="width:120px">';
  html += '<input type="text" id="fSearch" placeholder="🔍 搜索..." oninput="applyF()">';
  html += '<select id="fSort" onchange="applyF()">';
  html += '<option value="dd">最新优先</option>';
  html += '<option value="da">最早优先</option>';
  html += '</select>';
  html += '</div>';
  html += '<div style="font-size:11px;color:var(--t4);margin-bottom:8px">共 <span id="rc">' + DataStore.getVideos().length + '</span> 条</div>';
  html += '<div class="vl" id="vlist"></div>';
  html += '<div class="pag" id="pag"></div>';
  
  document.getElementById('tc-browse').innerHTML = html;
  applyF();
  initRefSystem();
}

/* === 因子提取 === */
function rFactors() {
  var factorStats = DataStore.getFactorStats();
  
  var html = '<h3 data-ref="transcript-factors" style="font-size:13px;margin-bottom:14px">因子提取</h3>';
  html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:8px">';
  
  factorStats.forEach(function(f) {
    var cls = f.type === 'macro' ? 't-macro' : f.type === 'supply' ? 't-comm' : f.type === 'capital' ? 't-stock' : 't-mix';
    html += '<div style="background:var(--bg3);border:1px solid var(--border);border-radius:6px;padding:10px">';
    html += '<div style="font-size:12px;font-weight:600">' + esc(f.keyword) + '</div>';
    html += '<span class="tag ' + cls + '">' + esc(f.typeName) + '</span>';
    html += '<div style="font-size:16px;font-weight:700;margin:6px 0">' + f.count + ' <span style="font-size:10px;color:var(--t4)">个视频提及</span></div>';
    html += '</div>';
  });
  
  html += '</div>';
  document.getElementById('tc-factors').innerHTML = html;
  initRefSystem();
}

/* === 辅助函数 === */
function filterPlat(plat, btn) {
  document.querySelectorAll('.plat-filter button').forEach(function(b) { b.classList.remove('active'); });
  btn.classList.add('active');
  
  document.querySelectorAll('#upGrid .up-c').forEach(function(card) {
    if (plat === 'all' || card.dataset.platform === plat) {
      card.style.display = '';
    } else {
      card.style.display = 'none';
    }
  });
}

function browseUp(u) { 
  swTab('browse'); 
  setTimeout(function() { 
    var sel = document.getElementById('fUp');
    if (sel) sel.value = u; 
    applyF(); 
  }, 50); 
}

function applyF() {
  var filters = {
    up: document.getElementById('fUp').value,
    category: document.getElementById('fCat').value,
    fromDate: document.getElementById('fFrom').value,
    toDate: document.getElementById('fTo').value,
    search: document.getElementById('fSearch').value
  };
  
  AppState.filteredVideos = DataStore.getVideos(filters);
  
  var sort = document.getElementById('fSort').value;
  if (sort === 'dd') {
    AppState.filteredVideos.sort(function(a, b) { return b.date.localeCompare(a.date); });
  } else {
    AppState.filteredVideos.sort(function(a, b) { return a.date.localeCompare(b.date); });
  }
  
  AppState.currentPage = 1;
  document.getElementById('rc').textContent = AppState.filteredVideos.length;
  rVList();
}

function rVList() {
  var pg = AppState.pageSize;
  var s = (AppState.currentPage - 1) * pg;
  var e = s + pg;
  var pageVideos = AppState.filteredVideos.slice(s, e);
  var tp = Math.ceil(AppState.filteredVideos.length / pg);
  
  var html = '';
  pageVideos.forEach(function(v) {
    html += '<div class="vi" id="v-' + v.bvid + '" onclick="togExp(\'' + v.bvid + '\')">';
    html += '<div class="vh">';
    html += '<div class="vt">' + esc(v.title) + '</div>';
    html += '<div class="vm">';
    html += '<span class="tag ' + catCls(v.category) + '">' + esc(v.category) + '</span>';
    html += '<span>' + v.date + '</span>';
    html += '</div>';
    html += '</div>';
    html += '<div class="vp" id="p-' + v.bvid + '">' + esc(v.previewText) + '...</div>';
    html += '</div>';
  });
  
  document.getElementById('vlist').innerHTML = html;
  
  var ph = '';
  if (AppState.currentPage > 1) ph += '<div class="pb" onclick="gP(' + (AppState.currentPage - 1) + ')">‹</div>';
  for (var i = 1; i <= tp; i++) ph += '<div class="pb ' + (i === AppState.currentPage ? 'active' : '') + '" onclick="gP(' + i + ')">' + i + '</div>';
  if (AppState.currentPage < tp) ph += '<div class="pb" onclick="gP(' + (AppState.currentPage + 1) + ')">›</div>';
  document.getElementById('pag').innerHTML = ph;
}

function gP(p) {
  AppState.currentPage = p;
  rVList();
}

function togExp(id) {
  var el = document.getElementById('v-' + id);
  var pr = document.getElementById('p-' + id);
  var v = AppState.filteredVideos.find(function(x) { return x.bvid === id; });
  
  if (!v) return;
  
  if (el.classList.contains('open')) {
    el.classList.remove('open');
    pr.innerHTML = esc(v.previewText) + '...';
  } else {
    el.classList.add('open');
    var fullTextHtml = v.hasFullText ? esc(v.fullText) : '<span style="color:var(--t4)">暂无全文</span>';
    pr.innerHTML = '<div style="margin-bottom:6px">' +
      '<button class="btn btn-p btn-s" onclick="event.stopPropagation();openDet(\'' + id + '\')">📄 全文</button> ' +
      '<a href="https://www.bilibili.com/video/' + id + '" target="_blank" class="btn btn-o btn-s" style="text-decoration:none" onclick="event.stopPropagation()">▶️ B站</a>' +
      '</div>' + fullTextHtml;
  }
}

function openDet(id) {
  var v = DataStore.getVideoDetail(id);
  if (!v) return;
  
  document.getElementById('detTitle').textContent = v.title;
  document.getElementById('detBody').innerHTML = 
    '<div class="dm">' +
    '<span>UP主: ' + esc(v.up) + '</span>' +
    '<span>日期: ' + v.date + '</span>' +
    '<span>分类: ' + esc(v.category) + '</span>' +
    '</div>' +
    '<div style="margin-bottom:10px;display:flex;gap:6px">' +
    '<button class="btn btn-o btn-s" onclick="copyFullText(\'' + id + '\')">📋 复制全文</button>' +
    '</div>' +
    '<div class="dc">' + (v.hasFullText ? esc(v.fullText) : '<span style="color:var(--t4)">暂无全文</span>') + '</div>';
  
  document.getElementById('detail').classList.add('show');
}

function closeDet() {
  document.getElementById('detail').classList.remove('show');
}

function copyFullText(id) {
  var v = DataStore.getVideoDetail(id);
  if (v && v.fullText) {
    navigator.clipboard.writeText(v.fullText).then(function() {
      showToast('已复制');
    });
  } else {
    showToast('暂无全文');
  }
}

function renderPendingQueue() {
  var queue = DataStore.getPendingQueue();
  if (!queue || queue.length === 0) return '';
  
  var totalTasks = 0, doneTasks = 0, processingTasks = 0, errorTasks = 0;
  
  queue.forEach(function(t) {
    totalTasks++;
    if (t.status === 'done') doneTasks++;
    else if (t.status === 'processing') processingTasks++;
    else if (t.status === 'error') errorTasks++;
  });
  
  var pct = totalTasks > 0 ? Math.round(doneTasks / totalTasks * 100) : 0;
  
  var html = '<div class="pending-section">';
  html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">';
  html += '<h3 style="font-size:12px;color:var(--warn);margin:0">⏳ 任务队列</h3>';
  html += '<span style="font-size:11px;color:var(--t3)">' + doneTasks + '/' + totalTasks + ' 完成</span>';
  html += '</div>';
  html += '<div class="task-progress"><div class="task-progress-bar" style="width:' + pct + '%"></div></div>';
  html += '<div class="task-progress-info">';
  html += '<span>进度 ' + pct + '%</span>';
  html += '<span>' + (processingTasks > 0 ? processingTasks + ' 执行中' : '') + (errorTasks > 0 ? ' · ' + errorTasks + ' 失败' : '') + '</span>';
  html += '</div>';
  
  queue.forEach(function(task) {
    var progressHtml = '';
    if (task.status === 'processing' && task.progress) {
      progressHtml = '<div class="task-progress"><div class="task-progress-bar" style="width:' + task.progress + '%"></div></div>';
    }
    html += '<div class="pending-item">';
    html += '<span class="plat-tag ' + platClass(task.platform) + '">' + platLabel(task.platform) + '</span>';
    html += '<span style="flex:1">' + esc(task.name) + progressHtml + '</span>';
    html += '<span class="pending-status ' + statusClass(task.status) + '">' + statusLabel(task.status) + '</span>';
    html += '</div>';
  });
  
  html += '</div>';
  return html;
}
