/* ================================================
   金融研究仪表盘 - 项目控制台渲染模块
   可交互任务树 + 架构蓝图 + 里程碑 + 错误复盘
   ================================================ */

/* === 项目控制台主函数 === */
async function rProject() {
  var container = document.getElementById('mainContent');
  if (!container) return;
  
  container.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;padding:40px;color:var(--t3)"><span style="margin-right:8px">⏳</span>加载项目数据...</div>';
  
  try {
    var [framework, milestones, tasks, errors] = await Promise.all([
      DataStore.fetchJSON('data/framework_data.json'),
      DataStore.getMilestones(),
      DataStore.getProjectTasks(),
      DataStore.getErrors()
    ]);
    
    var html = '';
    
    // === 1. 可交互任务树（蓝图框架） ===
    if (framework && framework.layers) {
      html += '<div data-ref="project-blueprint" style="margin-bottom:20px">';
      html += '<h3 style="font-size:13px;margin-bottom:10px">📯 架构蓝图 · 任务框架</h3>';
      html += renderTaskTree(framework, tasks);
      html += '</div>';
    }
    
    // === 2. 里程碑时间线 ===
    if (milestones && milestones.length > 0) {
      html += '<div data-ref="project-milestones" style="margin-bottom:20px">';
      html += '<h3 style="font-size:13px;margin-bottom:10px">📅 里程碑时间线</h3>';
      html += '<div style="background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:12px">';
      html += renderMilestones(milestones);
      html += '</div></div>';
    }
    
    // === 3. 错误复盘 ===
    if (errors && errors.length > 0) {
      html += '<div data-ref="project-errors" style="margin-bottom:20px">';
      html += '<h3 style="font-size:13px;margin-bottom:10px">📝 错误复盘</h3>';
      html += '<div style="background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:12px">';
      html += renderErrors(errors);
      html += '</div></div>';
    }
    
    container.innerHTML = html;
    if (typeof initRefSystem === 'function') initRefSystem();
  } catch (e) {
    container.innerHTML = '<div style="color:var(--err);padding:20px;text-align:center">加载失败: ' + esc(e.message) + '</div>';
  }
}

/* === 渲染可交互任务树 === */
function renderTaskTree(framework, tasks) {
  var html = '';
  var layerIconMap = { 'L4': '🖥️', 'L3': '⚙️', 'L2': '💾', 'L1': '🔧' };
  
  // 构建任务状态映射 (task_id -> task对象)
  var taskMap = {};
  if (tasks && tasks.length) {
    tasks.forEach(function(t) { taskMap[t._id] = t; });
  }
  
  framework.layers.forEach(function(layer) {
    // 计算层完成度
    var total = layer.modules.length;
    var done = layer.modules.filter(function(m) { return m.status === 'active' || m.status === 'done'; }).length;
    var pct = total > 0 ? Math.round(done / total * 100) : 0;
    var layerStatus = pct === 100 ? 'done' : pct > 0 ? 'doing' : 'todo';
    
    html += '<div class="task-layer" data-layer="' + layer.id + '">';
    // 层级头部 - 可折叠
    html += '<div class="task-layer-header" onclick="toggleTaskLayer(\'' + layer.id + '\')">';
    html += '<span class="task-toggle" id="toggle-' + layer.id + '">▶</span>';
    html += '<span class="layer-indicator-sm" style="background:' + layer.color + '"></span>';
    html += '<span class="task-layer-name">' + layerIconMap[layer.id] + ' ' + layer.id + ' ' + esc(layer.name) + '</span>';
    html += '<span class="task-layer-pct">' + pct + '%</span>';
    html += renderMiniBar(pct, layer.color);
    html += '<span class="task-status-tag ' + layerStatus + '">' + statusLabel(layerStatus) + '</span>';
    html += '</div>';
    
    // 层级内容 - 默认展开
    html += '<div class="task-layer-body" id="body-' + layer.id + '">';
    
    layer.modules.forEach(function(mod) {
      var modStatus = mod.status === 'active' ? 'done' : mod.status === 'done' ? 'done' : 'todo';
      var hasChildren = (mod.children && mod.children.length > 0) || (mod.desc);
      
      html += '<div class="task-module" data-mod="' + mod.id + '">';
      // 模块头部 - 可点击展开详情
      html += '<div class="task-mod-header" onclick="toggleTaskMod(\'' + mod.id + '\')">';
      if (hasChildren) {
        html += '<span class="task-toggle-sm" id="toggle-mod-' + mod.id + '">▶</span>';
      } else {
        html += '<span class="task-toggle-spacer"></span>';
      }
      html += '<span class="status-dot ' + (modStatus === 'done' ? 'active' : 'planned') + '"></span>';
      html += '<span class="task-mod-name">' + esc(mod.name) + '</span>';
      html += '<span class="task-status-tag sm ' + modStatus + '">' + statusLabel(modStatus) + '</span>';
      html += '</div>';
      
      // 模块详情 - 默认折叠
      html += '<div class="task-mod-body" id="body-mod-' + mod.id + '" style="display:none">';
      
      // 描述
      if (mod.desc) {
        html += '<div class="task-mod-desc">' + esc(mod.desc) + '</div>';
      }
      
      // 子任务列表
      if (mod.children && mod.children.length > 0) {
        mod.children.forEach(function(child, idx) {
          var childId = mod.id + '-' + idx;
          var childTask = taskMap[childId];
          var childPct = childTask ? (childTask.progress || 0) : 0;
          var childStatus = childTask ? childTask.status : (modStatus === 'done' ? 'done' : 'todo');
          
          html += '<div class="task-child" data-child="' + childId + '">';
          html += '<div class="task-child-header" onclick="toggleTaskChild(\'' + childId + '\')">';
          html += '<span class="task-toggle-sm" id="toggle-child-' + childId + '">▶</span>';
          html += '<span class="status-dot ' + (childStatus === 'done' ? 'active' : childStatus === 'doing' ? 'doing' : 'planned') + '"></span>';
          html += '<span class="task-child-name">' + esc(child) + '</span>';
          
          // 进度条
          if (childPct > 0 || childStatus === 'doing') {
            html += renderMiniBar(childPct || 50, 'var(--accent)');
          }
          html += '<span class="task-status-tag xs ' + childStatus + '">' + statusLabel(childStatus) + '</span>';
          html += '</div>';
          
          // 子任务详情
          html += '<div class="task-child-body" id="body-child-' + childId + '" style="display:none">';
          if (childTask) {
            html += '<div class="task-child-detail">';
            if (childTask.title) html += '<div class="detail-row"><span class="detail-label">任务</span><span>' + esc(childTask.title) + '</span></div>';
            if (childTask.type) html += '<div class="detail-row"><span class="detail-label">类型</span><span>' + esc(childTask.type) + '</span></div>';
            if (childTask.progress !== undefined) html += '<div class="detail-row"><span class="detail-label">进度</span><span>' + childTask.progress + '%</span></div>';
            if (childTask.blocked_reason) html += '<div class="detail-row"><span class="detail-label">阻塞</span><span style="color:var(--danger)">' + esc(childTask.blocked_reason) + '</span></div>';
            html += '</div>';
          } else {
            html += '<div class="task-child-detail"><span style="color:var(--t4)">暂无详细进度</span></div>';
          }
          html += '</div>';
        });
      }
      
      html += '</div>'; // task-mod-body
      html += '</div>'; // task-module
    });
    
    html += '</div>'; // task-layer-body
    html += '</div>'; // task-layer
  });
  
  // 重构计划
  if (framework.restructurePlan) {
    var rp = framework.restructurePlan;
    html += '<div class="restructure-card">';
    html += '<div class="restructure-header"><h3 style="font-size:13px;margin:0">🚀 重构计划</h3></div>';
    html += '<div class="restructure-compare">';
    html += '<span style="color:var(--t4)">现状:</span><span>' + esc(rp.current) + '</span>';
    html += '<span class="arrow">→</span>';
    html += '<span style="color:var(--accent)">' + esc(rp.target) + '</span>';
    html += '</div>';
    
    html += '<div style="margin-top:14px">';
    rp.steps.forEach(function(step) {
      var priorityCls = step.priority === 'high' ? 'priority-high' : 'priority-medium';
      var statusTag = step.status === 'done' ? '<span style="font-size:9px;padding:1px 6px;background:var(--accent);color:#fff;border-radius:4px;margin-left:6px">✓</span>' : '';
      html += '<div class="step-item">';
      html += '<div class="step-num">' + step.step + '</div>';
      html += '<div class="step-info"><div class="step-name">' + esc(step.name) + statusTag + '</div>';
      html += '<div class="step-desc">' + esc(step.desc) + '</div></div>';
      html += '<span class="priority-tag ' + priorityCls + '">' + (step.priority === 'high' ? '高优' : '中优') + '</span>';
      html += '</div>';
    });
    html += '</div></div>';
  }
  
  return html;
}

/* === 迷你进度条 === */
function renderMiniBar(pct, color) {
  return '<span class="mini-bar"><span class="mini-bar-fill" style="width:' + Math.max(0, Math.min(100, pct)) + '%;background:' + color + '"></span></span>';
}

/* === 状态标签 === */
function statusLabel(s) {
  var map = { 'done': '已完成', 'doing': '进行中', 'todo': '待开始', 'active': '已完成', 'planned': '规划中', 'partial': '部分完成', 'blocked': '阻塞' };
  return map[s] || s;
}

/* === 折叠/展开交互 === */
function toggleTaskLayer(layerId) {
  var body = document.getElementById('body-' + layerId);
  var toggle = document.getElementById('toggle-' + layerId);
  if (!body) return;
  var open = body.style.display !== 'none';
  body.style.display = open ? 'none' : '';
  if (toggle) toggle.textContent = open ? '▶' : '▼';
}

function toggleTaskMod(modId) {
  var body = document.getElementById('body-mod-' + modId);
  var toggle = document.getElementById('toggle-mod-' + modId);
  if (!body) return;
  var open = body.style.display !== 'none';
  body.style.display = open ? 'none' : '';
  if (toggle) toggle.textContent = open ? '▶' : '▼';
}

function toggleTaskChild(childId) {
  var body = document.getElementById('body-child-' + childId);
  var toggle = document.getElementById('toggle-child-' + childId);
  if (!body) return;
  var open = body.style.display !== 'none';
  body.style.display = open ? 'none' : '';
  if (toggle) toggle.textContent = open ? '▶' : '▼';
}

/* === 渲染里程碑 === */
function renderMilestones(milestones) {
  var html = '';
  milestones.forEach(function(m) {
    var icon = m.status === 'done' ? '✅' : m.status === 'partial' ? '⚠️' : m.status === 'inProgress' ? '🔄' : '🔢';
    var cls = m.status === 'done' ? 'style="color:var(--accent)"' : m.status === 'partial' ? 'style="color:var(--warn)"' : m.status === 'inProgress' ? 'style="color:var(--info)"' : 'style="color:var(--t4)"';
    
    html += '<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border)">';
    html += '<span ' + cls + ' style="font-size:16px">' + icon + '</span>';
    html += '<div style="flex:1"><div style="font-size:12px;font-weight:500">' + esc(m.name) + '</div>';
    if (m.target_date) html += '<div style="font-size:10px;color:var(--t4)">目标: ' + esc(m.target_date) + (m.completed_date ? ' → 完成: ' + esc(m.completed_date) : '') + '</div>';
    html += '</div>';
    html += '<span style="font-size:9px;color:var(--t4)">' + esc(m.phase || '') + '</span>';
    html += '</div>';
  });
  return html;
}

/* === 渲染错误 === */
function renderErrors(errors) {
  var html = '';
  errors.forEach(function(e) {
    var sevColor = e.severity === 'high' ? 'var(--danger)' : e.severity === 'medium' ? 'var(--warn)' : 'var(--t3)';
    
    html += '<div style="padding:10px 0;border-bottom:1px solid var(--border)">';
    html += '<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">';
    html += '<span style="font-size:9px;padding:1px 6px;border-radius:3px;background:' + sevColor + ';color:#fff">' + esc(e.severity || 'low') + '</span>';
    html += '<span style="font-size:11px;font-weight:500">' + esc(e.title || '') + '</span>';
    html += '<span style="font-size:9px;color:var(--t4);margin-left:auto">' + esc(e.error_date || '') + '</span>';
    html += '</div>';
    if (e.desc) html += '<div style="font-size:10px;color:var(--t3);margin-bottom:4px">' + esc(e.desc) + '</div>';
    if (e.fix) html += '<div style="font-size:10px;color:var(--accent)">修复: ' + esc(e.fix) + '</div>';
    if (e.lesson) html += '<div style="font-size:10px;color:var(--info);font-style:italic">教训: ' + esc(e.lesson) + '</div>';
    html += '</div>';
  });
  return html;
}

function showModuleDetail(modId) {
  showToast('模块: ' + modId);
}
