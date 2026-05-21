/* ================================================
   金融研究仪表盘 - 项目控制台渲染模块
   展示层：只调用 DataStore 接口
   ================================================ */

/* === 项目控制台主函数 === */
function rProject() {
  var project = DataStore.getProjectData();
  var framework = DataStore.getFrameworkData();
  
  if (!project) {
    document.getElementById('tc-project').innerHTML = '<div style="padding:20px;color:var(--t3)">加载项目数据中...</div>';
    return;
  }
  
  // 计算进度
  var doneCnt = project.milestones.filter(function(m) { return m.status === 'done'; }).length;
  var partialCnt = project.milestones.filter(function(m) { return m.status === 'partial'; }).length;
  var totalCnt = project.milestones.length;
  var pct = Math.round((doneCnt + partialCnt * 0.5) / totalCnt * 100);
  
  var html = '';
  
  // === 1. 阶段总览 ===
  html += '<div data-ref="project-phase" style="display:flex;align-items:center;justify-content:space-between;background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:12px 16px;margin-bottom:16px;position:relative">';
  html += '<div><div style="font-size:10px;color:var(--t4);margin-bottom:2px">当前阶段</div><div style="font-size:14px;font-weight:600;color:var(--accent2)">' + esc(project.phase) + '</div></div>';
  html += '<div style="display:flex;align-items:center;gap:12px"><div style="width:120px;height:6px;background:var(--input-bg);border-radius:3px;overflow:hidden"><div style="height:100%;background:var(--accent);width:' + pct + '%"></div></div><span style="font-size:13px;font-weight:700;color:var(--accent2)">' + pct + '%</span></div>';
  html += '<div style="font-size:10px;color:var(--t4)">更新: ' + project.lastUpdate + '</div>';
  html += '</div>';
  
  // === 2. 架构蓝图 ===
  if (framework) {
    html += '<div data-ref="project-blueprint" style="position:relative;margin-bottom:16px"><h3 style="font-size:13px;margin-bottom:10px">📯 架构蓝图</h3>';
    html += renderBlueprint(framework);
    html += '</div>';
  }
  
  // === 3. 里程碑时间线 ===
  html += '<div data-ref="project-milestones" style="position:relative;margin-bottom:16px"><h3 style="font-size:13px;margin-bottom:10px">📅 里程碑时间线</h3>';
  html += '<div style="background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:12px">';
  html += renderMilestones(project.milestones);
  html += '</div></div>';
  
  // === 4. 任务看板 ===
  html += '<div data-ref="project-kanban" style="position:relative;margin-bottom:16px"><h3 style="font-size:13px;margin-bottom:10px">📌 任务看板</h3>';
  html += renderKanban(project.tasks);
  html += '</div>';
  
  // === 5. 错误复盘 ===
  if (project.errors && project.errors.length > 0) {
    html += '<div data-ref="project-errors" style="position:relative;margin-bottom:16px"><h3 style="font-size:13px;margin-bottom:10px">📝 错误复盘</h3>';
    html += '<div style="background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:12px">';
    html += renderErrors(project.errors);
    html += '</div></div>';
  }
  
  // === 6. 关键决策日志 ===
  if (project.decisions && project.decisions.length > 0) {
    html += '<div data-ref="project-decisions" style="position:relative;margin-bottom:16px"><h3 style="font-size:13px;margin-bottom:10px">⚖️ 关键决策日志</h3>';
    html += '<div style="background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:12px">';
    html += renderDecisions(project.decisions);
    html += '</div></div>';
  }
  
  // === 7. 范围边界 ===
  if (project.scope) {
    html += '<div data-ref="project-scope" style="position:relative;margin-bottom:16px"><h3 style="font-size:13px;margin-bottom:10px">🌍 范围边界</h3>';
    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">';
    html += '<div style="background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:12px"><div style="font-size:11px;font-weight:600;color:var(--accent);margin-bottom:8px">✓ 在范围内</div>';
    if (project.scope.inScope) {
      html += project.scope.inScope.map(function(s) { 
        return '<span style="font-size:10px;padding:3px 8px;background:var(--accent-bg);color:var(--accent);border-radius:4px;margin:2px;display:inline-block">' + esc(s) + '</span>'; 
      }).join('');
    }
    html += '</div><div style="background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:12px"><div style="font-size:11px;font-weight:600;color:var(--danger);margin-bottom:8px">✗ 不在范围内</div>';
    if (project.scope.outOfScope) {
      html += project.scope.outOfScope.map(function(s) { 
        return '<span style="font-size:10px;padding:3px 8px;background:rgba(100,100,100,0.15);color:var(--t4);border-radius:4px;margin:2px;display:inline-block">' + esc(s) + '</span>'; 
      }).join('');
    }
    html += '</div></div></div>';
  }
  
  document.getElementById('tc-project').innerHTML = html;
  initRefSystem();
}

/* === 渲染架构蓝图 === */
function renderBlueprint(framework) {
  var html = '';
  var layerIconMap = { 'L4': '🖥️', 'L3': '⚙️', 'L2': '💾', 'L1': '🔧' };
  
  framework.layers.forEach(function(layer) {
    html += '<div data-ref="blueprint-' + layer.id + '" class="layer-card">';
    html += '<div class="layer-header">';
    html += '<div class="layer-indicator" style="background:' + layer.color + '"></div>';
    html += '<div><div class="layer-title">' + layerIconMap[layer.id] + ' ' + layer.id + ': ' + esc(layer.name) + ' (' + layer.nameEn + ')</div>';
    html += '<div class="layer-desc">' + esc(layer.desc) + '</div></div>';
    html += '</div>';
    
    html += '<div class="mod-grid">';
    layer.modules.forEach(function(mod) {
      var statusIcon = mod.status === 'active' ? 'active' : mod.status === 'planned' ? 'planned' : 'placeholder';
      
      html += '<div data-ref="' + mod.id + '" class="mod-card ' + mod.status + '" onclick="showModuleDetail(\'' + mod.id + '\')">';
      html += '<div class="mod-name"><span class="status-dot ' + statusIcon + '"></span>' + esc(mod.name) + '</div>';
      
      if (mod.children && mod.children.length > 0) {
        html += '<div class="mod-children">';
        mod.children.forEach(function(child) {
          html += '<span class="mod-child">' + esc(child) + '</span>';
        });
        html += '</div>';
      } else if (mod.desc) {
        html += '<div class="mod-desc">' + esc(mod.desc) + '</div>';
      }
      
      html += '</div>';
    });
    html += '</div></div>';
  });
  
  // 重构计划
  if (framework.restructurePlan) {
    var rp = framework.restructurePlan;
    html += '<div data-ref="project-restructure" class="restructure-card">';
    html += '<div class="restructure-header"><h3 style="font-size:13px;margin:0">🚀 重构计划</h3></div>';
    html += '<div class="restructure-compare">';
    html += '<span style="color:var(--t4)">现状:</span><span>' + esc(rp.current) + '</span>';
    html += '<span class="arrow">→</span>';
    html += '<span style="color:var(--accent)">' + esc(rp.target) + '</span>';
    html += '</div>';
    
    html += '<div style="margin-top:14px">';
    rp.steps.forEach(function(step) {
      var priorityCls = step.priority === 'high' ? 'priority-high' : 'priority-medium';
      html += '<div class="step-item">';
      html += '<div class="step-num">' + step.step + '</div>';
      html += '<div class="step-info"><div class="step-name">' + esc(step.name) + '</div>';
      html += '<div class="step-desc">' + esc(step.desc) + '</div></div>';
      html += '<span class="priority-tag ' + priorityCls + '">' + (step.priority === 'high' ? '高优' : '中优') + '</span>';
      html += '</div>';
    });
    html += '</div></div>';
  }
  
  return html;
}

/* === 渲染里程碑 === */
function renderMilestones(milestones) {
  var html = '';
  milestones.forEach(function(m) {
    var icon = m.status === 'done' ? '✅' : m.status === 'partial' ? '⚠️' : '🔢';
    var cls = m.status === 'done' ? 'style="color:var(--accent)"' : m.status === 'partial' ? 'style="color:var(--warn)"' : 'style="color:var(--t4)"';
    
    html += '<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border)">';
    html += '<span ' + cls + ' style="font-size:16px">' + icon + '</span>';
    html += '<div style="flex:1"><div style="font-size:12px;font-weight:500">' + esc(m.name) + '</div>';
    if (m.date) html += '<div style="font-size:10px;color:var(--t4)">' + m.date + '</div>';
    html += '</div>';
    html += '<span style="font-size:9px;color:var(--t4)">' + m.id + '</span>';
    html += '</div>';
  });
  return html;
}

/* === 渲染看板 === */
function renderKanban(tasks) {
  var cols = [
    { key: 'backlog', icon: '📋', label: '待办', color: 'var(--t3)', ref: 'project-kanban-backlog' },
    { key: 'inProgress', icon: '🔄', label: '进行中', color: 'var(--info)', ref: 'project-kanban-progress' },
    { key: 'done', icon: '✅', label: '已完成', color: 'var(--accent)', ref: 'project-kanban-done' },
    { key: 'blocked', icon: '⚠️', label: '阻塞', color: 'var(--danger)', ref: 'project-kanban-blocked' }
  ];
  
  var html = '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px">';
  
  cols.forEach(function(col) {
    var taskList = tasks[col.key] || [];
    var taskItems = taskList.map(function(t) { 
      return '<div style="font-size:11px;padding:6px 8px;background:var(--bg4);border-radius:4px;margin-bottom:6px">' + esc(t) + '</div>'; 
    }).join('');
    
    html += '<div data-ref="' + col.ref + '" style="background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:12px">';
    html += '<div style="display:flex;align-items:center;gap:6px;margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid var(--border)">';
    html += '<span style="font-size:14px">' + col.icon + '</span>';
    html += '<span style="font-size:11px;font-weight:600;color:' + col.color + '">' + col.label + '</span>';
    html += '<span style="margin-left:auto;font-size:10px;background:var(--bg4);padding:1px 6px;border-radius:8px;color:var(--t4)">' + taskList.length + '</span>';
    html += '</div>' + taskItems + '</div>';
  });
  
  html += '</div>';
  return html;
}

/* === 渲染错误 === */
function renderErrors(errors) {
  var html = '';
  errors.forEach(function(e) {
    var sevColor = e.severity === 'high' ? '#ef4444' : e.severity === 'medium' ? '#eab308' : 'var(--t3)';
    var sevBg = e.severity === 'high' ? 'rgba(239,68,68,0.1)' : e.severity === 'medium' ? 'rgba(234,179,8,0.1)' : 'var(--bg4)';
    
    html += '<div style="padding:10px 0;border-bottom:1px solid var(--border)">';
    html += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">';
    html += '<span style="font-size:9px;padding:2px 6px;border-radius:3px;background:' + sevBg + ';color:' + sevColor + '">' + e.severity.toUpperCase() + '</span>';
    html += '<span style="font-size:9px;color:var(--t4)">' + e.date + '</span>';
    html += '<span style="font-size:9px;padding:2px 6px;border-radius:3px;background:var(--bg4);color:var(--t3)">' + esc(e.type) + '</span>';
    html += '</div>';
    html += '<div style="font-size:12px;font-weight:500;margin-bottom:4px">' + esc(e.title) + '</div>';
    html += '<div style="font-size:10px;color:var(--t3);margin-bottom:4px">' + esc(e.desc) + '</div>';
    if (e.lesson) html += '<div style="font-size:10px;color:var(--accent)">✓ ' + esc(e.lesson) + '</div>';
    html += '</div>';
  });
  return html;
}

/* === 渲染决策 === */
function renderDecisions(decisions) {
  var html = '';
  decisions.forEach(function(d) {
    html += '<div style="padding:10px 0;border-bottom:1px solid var(--border)">';
    html += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">';
    html += '<span style="font-size:10px;background:var(--accent-bg);color:var(--accent);padding:2px 8px;border-radius:4px">' + d.date + '</span>';
    html += '<span style="font-size:12px;font-weight:600;color:var(--accent2)">' + esc(d.decision) + '</span>';
    html += '</div>';
    html += '<div style="font-size:11px;color:var(--t3);margin-bottom:4px"><span style="color:var(--t4)">原因:</span> ' + esc(d.reason) + '</div>';
    if (d.alt) html += '<div style="font-size:10px;color:var(--t4)"><span style="color:var(--warn)">备选:</span> ' + esc(d.alt) + '</div>';
    html += '</div>';
  });
  return html;
}

/* === 模块下钻详情 === */
function showModuleDetail(modId) {
  var details = DataStore.getModuleDetails();
  if (!details || !details[modId]) return;
  
  var detail = details[modId];
  var layerMap = { 'L4': '展示层', 'L3': '逻辑层', 'L2': '数据层', 'L1': '基础设施层' };
  var layerId = modId.split('-')[0];
  
  // Meta tags
  var metaHtml = '';
  metaHtml += '<div class="bp-drill-meta-item"><strong>层级</strong>' + (layerMap[layerId] || layerId) + '</div>';
  if (detail.archPath) metaHtml += '<div class="bp-drill-meta-item"><strong>架构</strong>' + esc(detail.archPath) + '</div>';
  if (detail.renderer) metaHtml += '<div class="bp-drill-meta-item"><strong>渲染</strong>' + esc(detail.renderer) + '</div>';
  if (detail.dataFile) metaHtml += '<div class="bp-drill-meta-item"><strong>数据</strong>' + esc(detail.dataFile) + '</div>';
  if (detail.codeFile) metaHtml += '<div class="bp-drill-meta-item"><strong>代码</strong>' + esc(detail.codeFile) + '</div>';
  
  // Sub-modules
  var subsHtml = '';
  if (detail.subModules && detail.subModules.length > 0) {
    detail.subModules.forEach(function(sub) {
      var statusCls = sub.status === 'active' ? 'active' : 'planned';
      var statusText = sub.status === 'active' ? '已实现' : '规划中';
      
      subsHtml += '<div data-ref="' + sub.id + '" class="bp-drill-sub">';
      subsHtml += '<div class="bp-drill-sub-name">' + esc(sub.name) + '<span class="bp-drill-sub-status ' + statusCls + '">' + statusText + '</span></div>';
      subsHtml += '<div class="bp-drill-sub-desc">' + (sub.desc ? esc(sub.desc) : '') + '</div>';
      if (sub.renderer) subsHtml += '<div style="font-size:9px;color:var(--t4);margin-top:4px">渲染: ' + esc(sub.renderer) + '</div>';
      if (sub.dataFile) subsHtml += '<div style="font-size:9px;color:var(--t4)">数据: ' + esc(sub.dataFile) + '</div>';
      subsHtml += '</div>';
    });
  } else {
    subsHtml = '<div style="font-size:11px;color:var(--t4);text-align:center;padding:20px">暂无子模块定义</div>';
  }
  
  var statusCls = detail.status === 'active' ? 'active' : detail.status === 'planned' ? 'planned' : 'placeholder';
  var statusText = detail.status === 'active' ? '已实现' : detail.status === 'planned' ? '规划中' : '占位';
  
  var html = '<div class="bp-drill" onclick="if(event.target===this)closeModuleDetail()">';
  html += '<div class="bp-drill-panel">';
  html += '<div class="bp-drill-header">';
  html += '<button class="bp-drill-back" onclick="closeModuleDetail()">←</button>';
  html += '<div class="bp-drill-title">' + esc(detail.name) + '</div>';
  html += '<span class="bp-drill-status ' + statusCls + '">' + statusText + '</span>';
  html += '</div>';
  html += '<div class="bp-drill-body">';
  html += '<div class="bp-drill-meta">' + metaHtml + '</div>';
  html += '<div class="bp-drill-desc">' + (detail.desc ? esc(detail.desc) : '') + '</div>';
  html += '<div class="bp-drill-subs-title">子模块 (' + (detail.subModules ? detail.subModules.length : 0) + ')</div>';
  html += subsHtml;
  html += '</div></div></div>';
  
  document.body.insertAdjacentHTML('beforeend', html);
  initRefSystem();
  
  // ESC键关闭
  document.addEventListener('keydown', function escHandler(e) {
    if (e.key === 'Escape') {
      closeModuleDetail();
      document.removeEventListener('keydown', escHandler);
    }
  });
}

function closeModuleDetail() {
  var drill = document.querySelector('.bp-drill');
  if (drill) drill.remove();
}
