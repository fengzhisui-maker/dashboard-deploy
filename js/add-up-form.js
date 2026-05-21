/* ================================================
   金融研究仪表盘 - UP主表单模块
   包含：添加UP主弹窗、任务提交
   ================================================ */

/* === 打开添加UP主弹窗 === */
function openAddUpModal(prefillName) {
  // 避免重复打开
  if (document.querySelector('.add-up-modal')) return;
  
  var overlay = document.createElement('div');
  overlay.className = 'add-up-modal';
  overlay.onclick = function(e) { if (e.target === overlay) overlay.remove(); };

  var panel = document.createElement('div');
  panel.className = 'add-up-panel';

  // Header
  var header = document.createElement('div');
  header.className = 'add-up-header';
  
  var title = document.createElement('div');
  title.className = 'add-up-title';
  title.textContent = '添加UP主';
  
  var closeBtn = document.createElement('button');
  closeBtn.className = 'btn btn-o btn-s';
  closeBtn.textContent = '✕';
  closeBtn.onclick = function() { overlay.remove(); };
  
  header.appendChild(title);
  header.appendChild(closeBtn);

  // Body
  var body = document.createElement('div');
  body.className = 'add-up-body';

  // Field: Platform
  var fPlat = document.createElement('div');
  fPlat.className = 'add-up-field';
  fPlat.innerHTML = '<label>平台</label><select id="addUpPlat"><option value="bilibili">B站 (Bilibili)</option><option value="youtube">YouTube</option><option value="other">其他</option></select>';

  // Field: Name
  var fName = document.createElement('div');
  fName.className = 'add-up-field';
  fName.innerHTML = '<label>UP主名称</label><input id="addUpName" placeholder="输入UP主名称">';

  // Field: ID
  var fId = document.createElement('div');
  fId.className = 'add-up-field';
  fId.innerHTML = '<label>UP主ID</label><input id="addUpId" placeholder="B站UID如 12345 或 YouTube频道ID如 @xxx">';

  // Field: Transcript limit
  var fLimit = document.createElement('div');
  fLimit.className = 'add-up-field';
  fLimit.innerHTML = '<label>初次转录条件</label><div style="display:flex;gap:8px;align-items:center"><input id="addUpLimitCount" type="number" value="500" min="1" style="width:80px"><span style="font-size:11px;color:var(--t3)">条视频</span><span style="margin:0 4px;color:var(--t4)">或</span><input id="addUpLimitDays" type="number" value="365" min="1" style="width:80px"><span style="font-size:11px;color:var(--t3)">天内</span></div><div style="font-size:9px;color:var(--t4);margin-top:4px">满足任一条件即停止初次转录</div>';

  // Field: Auto-track checkbox
  var fTrack = document.createElement('div');
  fTrack.className = 'add-up-field';
  fTrack.style.marginTop = '8px';
  fTrack.innerHTML = '<label style="display:flex;align-items:center;gap:8px;cursor:pointer"><input type="checkbox" id="addUpAutoTrack" checked style="width:16px;height:16px;accent-color:var(--accent)"><span style="font-size:12px;color:var(--t1)">自动追踪更新</span></label><div style="font-size:9px;color:var(--t4);margin-top:2px;margin-left:24px">勾选后，UP主发布新视频时自动转录（不重复转录已有视频）</div>';

  // Footer buttons
  var footer = document.createElement('div');
  footer.className = 'add-up-footer';
  
  var cancelBtn = document.createElement('button');
  cancelBtn.className = 'btn btn-o';
  cancelBtn.textContent = '取消';
  cancelBtn.onclick = function() { overlay.remove(); };
  
  var submitBtn = document.createElement('button');
  submitBtn.className = 'btn btn-p';
  submitBtn.textContent = '提交';
  submitBtn.onclick = function() { submitUpTask(); };
  
  footer.appendChild(cancelBtn);
  footer.appendChild(submitBtn);

  // Assemble
  body.appendChild(fPlat);
  body.appendChild(fName);
  body.appendChild(fId);
  body.appendChild(fLimit);
  body.appendChild(fTrack);
  body.appendChild(footer);
  panel.appendChild(header);
  panel.appendChild(body);
  overlay.appendChild(panel);
  document.body.appendChild(overlay);

  // Prefill
  if (prefillName) {
    document.getElementById('addUpName').value = prefillName;
    document.getElementById('addUpPlat').value = 'bilibili';
  }
}

/* === 提交UP主任务 === */
function submitUpTask() {
  var plat = document.getElementById('addUpPlat').value;
  var name = document.getElementById('addUpName').value.trim();
  var upId = document.getElementById('addUpId').value.trim();
  var limitCount = document.getElementById('addUpLimitCount').value || '500';
  var limitDays = document.getElementById('addUpLimitDays').value || '365';
  var autoTrack = document.getElementById('addUpAutoTrack').checked;

  if (!name) { alert('请输入UP主名称'); return; }
  if (!upId) { alert('请输入UP主ID'); return; }

  var token = localStorage.getItem('gh_token');
  if (!token) {
    token = prompt('首次提交需要输入GitHub Token（仅存本地，用于写入任务队列）\n\nToken获取: GitHub → Settings → Developer settings → Personal access tokens → Generate new token (勾选repo权限)');
    if (!token) return;
    localStorage.setItem('gh_token', token);
  }

  var task = {
    id: Date.now(),
    action: 'add_up',
    platform: plat,
    name: name,
    upId: upId,
    url: plat === 'bilibili' ? 'https://space.bilibili.com/' + upId : plat === 'youtube' ? 'https://youtube.com/' + upId : '',
    limitCount: parseInt(limitCount),
    limitDays: parseInt(limitDays),
    autoTrack: autoTrack,
    status: 'queued',
    createdAt: new Date().toISOString()
  };

  var repo = 'fengzhisui-maker/dashboard-deploy';
  
  fetch('https://api.github.com/repos/' + repo + '/contents/pending_queue.js', {
    headers: { 'Authorization': 'token ' + token }
  }).then(function(r) { return r.json(); }).then(function(data) {
    var content = '';
    if (data.content) {
      content = atob(data.content.replace(/\n/g, ''));
      var match = content.match(/var PENDING_QUEUE = (\[[\s\S]*?\]);/);
      var arr = match ? JSON.parse(match[1]) : [];
      arr.push(task);
      var newContent = 'var PENDING_QUEUE = ' + JSON.stringify(arr, null, 2) + ';';
      return fetch('https://api.github.com/repos/' + repo + '/contents/pending_queue.js', {
        method: 'PUT',
        headers: { 'Authorization': 'token ' + token, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'queue: add ' + plat + ' UP主 ' + name,
          content: btoa(unescape(encodeURIComponent(newContent))),
          sha: data.sha,
          branch: 'main'
        })
      });
    } else {
      var newContent = 'var PENDING_QUEUE = ' + JSON.stringify([task], null, 2) + ';';
      return fetch('https://api.github.com/repos/' + repo + '/contents/pending_queue.js', {
        method: 'PUT',
        headers: { 'Authorization': 'token ' + token, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'queue: add ' + plat + ' UP主 ' + name,
          content: btoa(unescape(encodeURIComponent(newContent))),
          branch: 'main'
        })
      });
    }
  }).then(function(r) {
    if (r && r.ok) {
      document.querySelector('.add-up-modal').remove();
      // 更新本地PENDING_QUEUE
      if (typeof PENDING_QUEUE === 'undefined') window.PENDING_QUEUE = [];
      PENDING_QUEUE.push(task);
      // 刷新UP主管理页面
      if (typeof rUps === 'function') rUps();
      showToast('✓ 任务已提交，Agent将自动处理');
      // 触发Pages重建
      fetch('https://api.github.com/fengzhisui-maker/dashboard-deploy/pages/builds', {
        method: 'POST',
        headers: { 'Authorization': 'token ' + token, 'Content-Type': 'application/json' }
      });
    } else {
      alert('提交失败，请检查GitHub Token是否有效');
    }
  }).catch(function(e) {
    alert('提交失败: ' + e.message);
  });
}
