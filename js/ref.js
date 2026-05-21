/* ================================================
   金融研究仪表盘 - 引用系统 v1.3
   L3-11: 引用系统（逻辑层，不含DOM）
   ================================================ */

// 引用上下文生成器
export function generateContext(ref) {
  const lines = ['📋 引用上下文'];
  lines.push(`Ref: #${ref}`);
  
  // 尝试从code_map获取信息（如果存在）
  const map = getCodeMap();
  if (map && map[ref]) {
    const m = map[ref];
    if (m.module) {
      const modStr = m.module + (m.subModule ? ` > ${m.subModule}` : '');
      lines.push(`模块: ${modStr}`);
    }
    if (m.layer) lines.push(`层级: ${m.layer}`);
    if (m.archPath) lines.push(`架构: ${m.archPath}`);
    if (m.renderer) {
      lines.push(`渲染: ${m.renderer}${m.codeFile ? ` in ${m.codeFile}` : ''}`);
    }
    if (m.dataFile) lines.push(`数据: ${m.dataFile}`);
    if (m.desc) lines.push(`描述: ${m.desc}`);
  }
  
  return lines.join('\n');
}

// 获取code_map
function getCodeMap() {
  if (typeof code_map !== 'undefined') {
    return code_map;
  }
  return {};
}

// 解析引用
export function parseRef(refString) {
  const match = refString.match(/^#?(\w+(?:-\w+)*)$/);
  if (match) {
    return match[1];
  }
  return null;
}

// 验证引用格式
export function isValidRef(ref) {
  return /^[a-z][a-z0-9-]*$/i.test(ref);
}

// 规范化引用格式
export function normalizeRef(ref) {
  return ref.replace(/^#/, '').trim().toLowerCase();
}

// 引用类型检测
export function detectRefType(ref) {
  const prefixes = {
    'tc-': 'transcript',
    'project-': 'project',
    'vis-': 'visualization',
    'form-': 'form',
    'comp-': 'component'
  };
  
  for (const [prefix, type] of Object.entries(prefixes)) {
    if (ref.startsWith(prefix)) {
      return type;
    }
  }
  
  return 'unknown';
}

// 生成唯一引用ID
export function generateRefId(prefix = 'ref') {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 6);
  return `${prefix}-${timestamp}-${random}`;
}

// 复制到剪贴板
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (e) {
    // 降级方案
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
      document.execCommand('copy');
      return true;
    } catch (e2) {
      return false;
    } finally {
      document.body.removeChild(textarea);
    }
  }
}

// 格式化引用为可读文本
export function formatRefText(ref, context = null) {
  let text = `#${ref}`;
  
  if (context) {
    const lines = context.split('\n');
    const descLine = lines.find(l => l.startsWith('描述:'));
    if (descLine) {
      text += ` - ${descLine.replace('描述:', '').trim()}`;
    }
  }
  
  return text;
}


// 初始化引用系统（为data-ref元素绑定交互）
export function initRefSystem() {
  document.querySelectorAll('[data-ref]').forEach(el => {
    if (!el.dataset.refBound) {
      el.dataset.refBound = 'true';
      el.style.cursor = 'pointer';
      el.title = '点击复制引用';
      el.addEventListener('click', function(e) {
        const ref = this.dataset.ref;
        if (ref) {
          const context = generateContext(ref);
          copyToClipboard(context);
        }
      });
    }
  });
}

export default {
  initRefSystem,
  generateContext,
  parseRef,
  isValidRef,
  normalizeRef,
  detectRefType,
  generateRefId,
  copyToClipboard,
  formatRefText
};
