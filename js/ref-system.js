/* ================================================
   金融研究仪表盘 - 引用系统模块
   包含：引用ID复制、上下文生成
   ================================================ */

/* === 生成引用上下文 === */
function generateContext(ref) {
  var lines = ['📋 引用上下文'];
  lines.push('Ref: #' + ref);
  
  var map = DataStore.getCodeMap();
  if (map && map[ref]) {
    var m = map[ref];
    if (m.module) {
      var modStr = m.module;
      if (m.subModule) modStr += ' > ' + m.subModule;
      lines.push('模块: ' + modStr);
    }
    if (m.layer) lines.push('层级: ' + m.layer);
    if (m.archPath) lines.push('架构: ' + m.archPath);
    if (m.renderer) lines.push('渲染: ' + m.renderer + (m.codeFile ? ' in ' + m.codeFile : ''));
    if (m.dataFile) lines.push('数据: ' + m.dataFile);
    if (m.desc) lines.push('描述: ' + m.desc);
  }
  
  return lines.join('\n');
}

/* === 初始化引用系统 === */
function initRefSystem() {
  // 清除旧的复制按钮
  document.querySelectorAll('.ref-copy-btn').forEach(function(b) { b.remove(); });
  
  // 给所有带data-ref的元素添加复制按钮
  document.querySelectorAll('[data-ref]').forEach(function(el) {
    // 跳过已处理过的
    if (el.querySelector('.ref-copy-btn')) return;
    
    var btn = document.createElement('button');
    btn.className = 'ref-copy-btn';
    btn.textContent = '📋';
    var ref = el.getAttribute('data-ref');
    var contextText = generateContext(ref);
    
    btn.title = '复制引用上下文';
    
    // 创建tooltip预览
    var tooltip = document.createElement('div');
    tooltip.className = 'ref-tooltip';
    tooltip.textContent = contextText;
    btn.appendChild(tooltip);
    
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      e.preventDefault();
      navigator.clipboard.writeText(contextText).then(function() {
        btn.textContent = '✓';
        btn.classList.add('copied');
        setTimeout(function() {
          btn.textContent = '📋';
          btn.classList.remove('copied');
        }, 1500);
      });
    });
    
    el.appendChild(btn);
  });
}

/* === 挂载到窗口（供外部调用） === */
window.generateContext = generateContext;
window.initRefSystem = initRefSystem;
