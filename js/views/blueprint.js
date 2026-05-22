/* ================================================
   金融研究仪表盘 - 蓝图视图 v1.3
   L4-2: 架构图/原型图/数据模型/决策记录
   ================================================ */

import { AppState } from '../store/state.js';
import { BlueprintAPI } from '../adapter/data-adapter.js';

// 当前激活的Tab
let currentTab = 'architecture';

// 架构图版本配置
const ARCH_VERSIONS = [
  { id: 'v1.0', date: '2024-01', title: '初始架构', isCurrent: false },
  { id: 'v1.1', date: '2024-06', title: '模块化重构', isCurrent: false },
  { id: 'v1.2', date: '2025-01', title: '数据层分离', isCurrent: false },
  { id: 'v1.3', date: '2025-05', title: '蓝图模块', isCurrent: true }
];

// 版本变更日志
const CHANGELOG = {
  'v1.0': [
    { type: 'add', desc: '初始四层架构设计' },
    { type: 'add', desc: 'L1数据层基础结构' },
    { type: 'add', desc: '转录库核心模块' }
  ],
  'v1.1': [
    { type: 'add', desc: 'ES Module模块化重构' },
    { type: 'update', desc: '视图层解耦为独立模块' },
    { type: 'add', desc: '路由系统v2' }
  ],
  'v1.2': [
    { type: 'add', desc: 'DataAdapter数据适配层' },
    { type: 'add', desc: 'GitHub API集成' },
    { type: 'update', desc: 'CDN缓存策略优化' }
  ],
  'v1.3': [
    { type: 'add', desc: '架构蓝图模块' },
    { type: 'add', desc: '交互原型图展示' },
    { type: 'add', desc: 'ER数据模型' },
    { type: 'add', desc: 'ADR决策记录' }
  ]
};

// ADR示例数据
const ADR_LIST = [
  {
    id: 'ADR-001',
    title: '采用ES Module模块化架构',
    status: 'accepted',
    context: '仪表盘代码规模增长，需要更好的代码组织方式。考虑过立即执行函数(IIFE)和全局变量方案，最终选择ES Module。',
    decision: '使用原生ES Module import/export，不引入打包工具。通过CDN或GitHub直接加载，保持部署简单性。',
    consequences: '1. 浏览器原生支持，无需编译\n2. 静态分析友好\n3. 加载顺序需严格管理\n4. 不支持旧版浏览器',
    date: '2024-06-15',
    author: '系统架构'
  },
  {
    id: 'ADR-002',
    title: '数据层与展示层分离',
    status: 'accepted',
    context: '当前代码中数据获取和DOM操作混在一起，维护困难。需要建立清晰的分层架构。',
    decision: '建立L1-L4分层架构：L1数据层→L2服务层→L3逻辑层→L4展示层。严禁跨层调用。',
    consequences: '1. 职责清晰，易于维护\n2. 便于单元测试\n3. 代码行数增加\n4. 需要更多文件管理',
    date: '2024-08-20',
    author: '系统架构'
  },
  {
    id: 'ADR-003',
    title: '使用GitHub作为数据源',
    status: 'accepted',
    context: '数据文件需要版本控制和协作编辑能力。本地文件方案无法满足需求。',
    decision: '使用GitHub仓库存储数据文件，通过GitHub API读取，CDN(jsDelivr)缓存。',
    consequences: '1. 数据版本控制\n2. 多设备同步\n3. 需要GitHub Token\n4. API调用限制',
    date: '2024-09-10',
    author: '系统架构'
  },
  {
    id: 'ADR-004',
    title: '引入蓝图模块',
    status: 'proposed',
    context: '系统复杂度增加，需要统一展示架构设计、原型图、数据模型和决策记录。',
    decision: '新增「📐 蓝图」模块，包含4个Tab：架构图、原型图、数据模型、决策记录。',
    consequences: '1. 架构可视化\n2. 便于新人 onboarding\n3. 需要维护额外文件\n4. Draw.io渲染复杂度',
    date: '2025-05-22',
    author: '系统架构'
  }
];

/**
 * 渲染蓝图视图
 */
export function renderBlueprintView() {
  const container = document.getElementById('mainContent');
  if (!container) return;

  container.innerHTML = `
    <div class="blueprint-container">
      <!-- Tab导航 -->
      <div class="bp-tabs">
        <button class="bp-tab active" data-tab="architecture" onclick="switchBlueprintTab('architecture')">
          🏗️ 架构图
        </button>
        <button class="bp-tab" data-tab="prototype" onclick="switchBlueprintTab('prototype')">
          🖼️ 原型图
        </button>
        <button class="bp-tab" data-tab="datamodel" onclick="switchBlueprintTab('datamodel')">
          📊 数据模型
        </button>
        <button class="bp-tab" data-tab="adr" onclick="switchBlueprintTab('adr')">
          📝 决策记录
        </button>
      </div>

      <!-- 架构图Tab -->
      <div class="bp-content active" id="bp-architecture">
        ${renderArchitectureTab()}
      </div>

      <!-- 原型图Tab -->
      <div class="bp-content" id="bp-prototype">
        ${renderPrototypeTab()}
      </div>

      <!-- 数据模型Tab -->
      <div class="bp-content" id="bp-datamodel">
        ${renderDataModelTab()}
      </div>

      <!-- 决策记录Tab -->
      <div class="bp-content" id="bp-adr">
        ${renderADRTab()}
      </div>
    </div>

    <!-- ADR详情弹框 -->
    <div class="adr-detail-overlay" id="adrOverlay" onclick="closeADRDetail()"></div>
    <div class="adr-detail" id="adrDetail"></div>
  `;

  // 暴露切换函数到全局
  window.switchBlueprintTab = switchBlueprintTab;
  window.closeADRDetail = closeADRDetail;
  window.showADRDetail = showADRDetail;

  // 加载架构图
  loadArchitectureDiagram();

  // 加载ER图
  loadERDiagram();

  // 加载原型图
  loadPrototypeContent();
}

/**
 * 渲染架构图Tab
 */
function renderArchitectureTab() {
  return `
    <div class="arch-container">
      <!-- 版本时间线 -->
      <div class="version-timeline" id="versionTimeline">
        ${ARCH_VERSIONS.map((v, i) => `
          <div class="version-item ${v.isCurrent ? 'current' : ''}" data-version="${v.id}">
            <div class="version-dot"></div>
            <span class="version-label" onclick="loadArchitectureDiagram('${v.id}')">${v.id}</span>
            <span class="version-date">${v.date}</span>
          </div>
          ${i < ARCH_VERSIONS.length - 1 ? '<div class="version-arrow"></div>' : ''}
        `).join('')}
      </div>

      <!-- 架构图显示区 -->
      <div class="arch-viewer">
        <div class="arch-header">
          <span class="arch-title">📐 系统架构图 <span id="currentArchVersion" style="color:var(--accent2)">v1.3</span></span>
          <div class="arch-controls">
            <button class="arch-btn" onclick="zoomArchitecture(1.1)" title="放大">➕ 放大</button>
            <button class="arch-btn" onclick="zoomArchitecture(0.9)" title="缩小">➖ 缩小</button>
            <button class="arch-btn" onclick="resetArchitectureZoom()" title="重置">🔄 重置</button>
          </div>
        </div>
        <div class="arch-svg-container" id="archSvgContainer">
          <div class="bp-loading">
            <div class="bp-loading-spinner"></div>
            <span class="bp-loading-text">加载架构图...</span>
          </div>
        </div>
      </div>

      <!-- 版本变更说明 -->
      <div class="version-changelog">
        <div class="changelog-title">📋 版本变更日志</div>
        <div class="changelog-content" id="changelogContent">
          ${renderChangelog('v1.3')}
        </div>
      </div>
    </div>
  `;
}

/**
 * 渲染原型图Tab
 */
function renderPrototypeTab() {
  return `
    <div class="proto-container">
      <div class="proto-render">
        <div class="bp-loading" id="protoLoading">
          <div class="bp-loading-spinner"></div>
          <span class="bp-loading-text">加载原型图...</span>
        </div>
        <div class="proto-content" id="protoContent" style="display:none"></div>
      </div>
    </div>
  `;
}

/**
 * 渲染数据模型Tab
 */
function renderDataModelTab() {
  return `
    <div class="er-container">
      <div class="er-viewer">
        <div class="er-header">
          <span class="er-title">📊 数据模型 ER图 v1.0</span>
          <div class="arch-controls">
            <button class="arch-btn" onclick="zoomER(1.1)" title="放大">➕ 放大</button>
            <button class="arch-btn" onclick="zoomER(0.9)" title="缩小">➖ 缩小</button>
            <button class="arch-btn" onclick="resetERZoom()" title="重置">🔄 重置</button>
          </div>
        </div>
        <div class="er-svg-container" id="erSvgContainer">
          <div class="bp-loading">
            <div class="bp-loading-spinner"></div>
            <span class="bp-loading-text">加载ER图...</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * 渲染决策记录Tab
 */
function renderADRTab() {
  return `
    <div class="adr-container">
      <div class="adr-list" id="adrList">
        ${ADR_LIST.map(adr => `
          <div class="adr-card" onclick="showADRDetail('${adr.id}')">
            <div class="adr-header">
              <span class="adr-id">${adr.id}</span>
              <span class="adr-status ${adr.status}">${getStatusLabel(adr.status)}</span>
            </div>
            <div class="adr-title">${adr.title}</div>
            <div class="adr-context">${adr.context}</div>
            <div class="adr-meta">
              <span>📅 ${adr.date}</span>
              <span>👤 ${adr.author}</span>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

/**
 * 切换蓝图Tab
 */
function switchBlueprintTab(tab) {
  currentTab = tab;

  // 更新Tab高亮
  document.querySelectorAll('.bp-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.tab === tab);
  });

  // 更新内容显示
  document.querySelectorAll('.bp-content').forEach(c => {
    c.classList.toggle('active', c.id === `bp-${tab}`);
  });
}

/**
 * 渲染变更日志
 */
function renderChangelog(version) {
  const changes = CHANGELOG[version] || [];
  return changes.map(c => `
    <div class="changelog-item">
      <span class="changelog-type ${c.type}">${getChangeTypeLabel(c.type)}</span>
      <span>${c.desc}</span>
    </div>
  `).join('');
}

/**
 * 加载架构图
 */
async function loadArchitectureDiagram(version = 'v1.3') {
  const container = document.getElementById('archSvgContainer');
  if (!container) return;

  // 更新当前版本显示
  const versionEl = document.getElementById('currentArchVersion');
  if (versionEl) versionEl.textContent = version;

  // 更新时间线高亮
  document.querySelectorAll('.version-item').forEach(item => {
    item.classList.toggle('active', item.dataset.version === version);
  });

  // 更新变更日志
  const changelogEl = document.getElementById('changelogContent');
  if (changelogEl) changelogEl.innerHTML = renderChangelog(version);

  try {
    // 使用draw.io嵌入模式渲染
    const fileName = version === 'v1.3' 
      ? '金融研究仪表盘_架构图.drawio'
      : `archive/架构图_${version}.drawio`;

    const svgUrl = `https://viewer.diagrams.net/?layers=1&embed=${encodeURIComponent(
      'https://raw.githubusercontent.com/fengzhisui-maker/dashboard-deploy/main/' + fileName
    )}`;

    // 由于跨域限制，使用draw.io的embed服务
    const embedUrl = `https://app.diagrams.net/#Hfengzhisui-maker%2Fdashboard-deploy%2Fmain%2F${encodeURIComponent(fileName)}`;

    // 尝试加载SVG
    const rawUrl = `https://raw.githubusercontent.com/fengzhisui-maker/dashboard-deploy/main/${encodeURIComponent(fileName)}`;
    
    try {
      const response = await fetch(rawUrl);
      if (response.ok) {
        const xmlText = await response.text();
        // 简单渲染SVG（实际项目建议用mxGraph）
        container.innerHTML = `
          <div style="width:100%;height:100%;overflow:auto;padding:16px;">
            <div style="max-width:1200px;margin:0 auto;">
              <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:20px;text-align:center;">
                <p style="color:var(--t3);font-size:12px;margin-bottom:12px;">
                  📐 架构图文件已加载 (${version})
                </p>
                <p style="color:var(--t4);font-size:11px;">
                  由于浏览器安全限制，SVG渲染需要服务端支持。<br>
                  当前显示为纯文本预览。
                </p>
                <a href="${embedUrl}" target="_blank" style="display:inline-block;margin-top:16px;padding:8px 16px;background:var(--accent);color:#fff;border-radius:6px;font-size:12px;text-decoration:none;">
                  🔗 在draw.io中打开
                </a>
              </div>
              <details style="margin-top:16px;">
                <summary style="cursor:pointer;color:var(--t3);font-size:11px;padding:8px;background:var(--bg2);border-radius:6px;">
                  📄 查看原始XML内容
                </summary>
                <pre style="margin-top:8px;padding:12px;background:var(--bg);border:1px solid var(--border);border-radius:6px;font-size:9px;overflow:auto;max-height:400px;color:var(--t3);line-height:1.4;text-align:left;white-space:pre-wrap;word-break:break-all;">${escapeHtml(xmlText.substring(0, 5000))}${xmlText.length > 5000 ? '\n\n... (内容截断)' : ''}</pre>
              </details>
            </div>
          </div>
        `;
      }
    } catch (e) {
      // 文件可能不存在，显示占位符
      container.innerHTML = `
        <div style="text-align:center;padding:40px;">
          <div style="font-size:48px;margin-bottom:16px;opacity:0.5;">🏗️</div>
          <p style="color:var(--t2);font-size:13px;margin-bottom:8px;">架构图 ${version}</p>
          <p style="color:var(--t4);font-size:11px;">${version === 'v1.3' ? '当前版本' : '历史版本 ' + version}</p>
          <a href="${embedUrl}" target="_blank" style="display:inline-block;margin-top:16px;padding:8px 16px;background:var(--accent);color:#fff;border-radius:6px;font-size:12px;text-decoration:none;">
            🔗 在draw.io中查看
          </a>
        </div>
      `;
    }
  } catch (error) {
    console.error('加载架构图失败:', error);
    container.innerHTML = `
      <div class="bp-error">
        <div class="bp-error-icon">⚠️</div>
        <div class="bp-error-title">加载失败</div>
        <div class="bp-error-desc">无法加载架构图文件</div>
        <button class="bp-error-retry" onclick="loadArchitectureDiagram('${version}')">重试</button>
      </div>
    `;
  }
}

/**
 * 加载ER图
 */
async function loadERDiagram() {
  const container = document.getElementById('erSvgContainer');
  if (!container) return;

  try {
    const rawUrl = 'https://raw.githubusercontent.com/fengzhisui-maker/dashboard-deploy/main/data_model_er_v1.0.drawio';
    
    try {
      const response = await fetch(rawUrl);
      if (response.ok) {
        const xmlText = await response.text();
        const embedUrl = `https://app.diagrams.net/#Hfengzhisui-maker%2Fdashboard-deploy%2Fmain%2Fdata_model_er_v1.0.drawio`;
        
        container.innerHTML = `
          <div style="width:100%;height:100%;overflow:auto;padding:16px;">
            <div style="max-width:1200px;margin:0 auto;">
              <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:20px;text-align:center;">
                <p style="color:var(--t3);font-size:12px;margin-bottom:12px;">
                  📊 数据模型 ER图 v1.0
                </p>
                <p style="color:var(--t4);font-size:11px;">
                  由于浏览器安全限制，SVG渲染需要服务端支持。
                </p>
                <a href="${embedUrl}" target="_blank" style="display:inline-block;margin-top:16px;padding:8px 16px;background:var(--accent);color:#fff;border-radius:6px;font-size:12px;text-decoration:none;">
                  🔗 在draw.io中打开
                </a>
              </div>
              <details style="margin-top:16px;">
                <summary style="cursor:pointer;color:var(--t3);font-size:11px;padding:8px;background:var(--bg2);border-radius:6px;">
                  📄 查看ER图XML内容
                </summary>
                <pre style="margin-top:8px;padding:12px;background:var(--bg);border:1px solid var(--border);border-radius:6px;font-size:9px;overflow:auto;max-height:400px;color:var(--t3);line-height:1.4;text-align:left;white-space:pre-wrap;word-break:break-all;">${escapeHtml(xmlText.substring(0, 5000))}${xmlText.length > 5000 ? '\n\n... (内容截断)' : ''}</pre>
              </details>
            </div>
          </div>
        `;
      }
    } catch (e) {
      container.innerHTML = `
        <div style="text-align:center;padding:40px;">
          <div style="font-size:48px;margin-bottom:16px;opacity:0.5;">📊</div>
          <p style="color:var(--t2);font-size:13px;margin-bottom:8px;">ER数据模型</p>
          <p style="color:var(--t4);font-size:11px;">v1.0</p>
          <a href="https://app.diagrams.net/#Hfengzhisui-maker%2Fdashboard-deploy%2Fmain%2Fdata_model_er_v1.0.drawio" target="_blank" style="display:inline-block;margin-top:16px;padding:8px 16px;background:var(--accent);color:#fff;border-radius:6px;font-size:12px;text-decoration:none;">
            🔗 在draw.io中查看
          </a>
        </div>
      `;
    }
  } catch (error) {
    console.error('加载ER图失败:', error);
    container.innerHTML = `
      <div class="bp-error">
        <div class="bp-error-icon">⚠️</div>
        <div class="bp-error-title">加载失败</div>
        <div class="bp-error-desc">无法加载ER图文件</div>
        <button class="bp-error-retry" onclick="loadERDiagram()">重试</button>
      </div>
    `;
  }
}

/**
 * 加载原型图内容
 */
async function loadPrototypeContent() {
  const loadingEl = document.getElementById('protoLoading');
  const contentEl = document.getElementById('protoContent');
  if (!loadingEl || !contentEl) return;

  try {
    // 从本地目录加载原型MD文件
    const mdPath = '../transcript-prototype/转录库交互原型v1.0.md';
    
    try {
      const response = await fetch(mdPath);
      if (response.ok) {
        const mdText = await response.text();
        const htmlContent = parseMarkdown(mdText);
        
        loadingEl.style.display = 'none';
        contentEl.style.display = 'block';
        contentEl.innerHTML = htmlContent;
      } else {
        throw new Error('文件不存在');
      }
    } catch (e) {
      // 文件不存在，显示说明
      loadingEl.style.display = 'none';
      contentEl.style.display = 'block';
      contentEl.innerHTML = `
        <div style="text-align:center;padding:40px;">
          <div style="font-size:48px;margin-bottom:16px;opacity:0.5;">🖼️</div>
          <p style="color:var(--t2);font-size:13px;margin-bottom:8px;">转录库交互原型图</p>
          <p style="color:var(--t4);font-size:11px;">v1.0</p>
          <p style="color:var(--t3);font-size:11px;margin-top:20px;line-height:1.6;">
            原型文件位于本地目录：<br>
            <code style="background:var(--bg3);padding:4px 8px;border-radius:4px;margin-top:8px;display:inline-block;">
              仪表盘数据v2/transcript-prototype/转录库交互原型v1.0.md
            </code>
          </p>
        </div>
      `;
    }
  } catch (error) {
    console.error('加载原型图失败:', error);
    loadingEl.innerHTML = `
      <div class="bp-error">
        <div class="bp-error-icon">⚠️</div>
        <div class="bp-error-title">加载失败</div>
        <div class="bp-error-desc">无法加载原型图文件</div>
        <button class="bp-error-retry" onclick="loadPrototypeContent()">重试</button>
      </div>
    `;
  }
}

/**
 * 简单的Markdown解析
 */
function parseMarkdown(md) {
  let html = md
    // 转义HTML
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // 标题
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    // 分割线
    .replace(/^---$/gm, '<hr>')
    // 代码块
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
    // 行内代码
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // 换行
    .replace(/\n\n/g, '</p><p>')
    // 粗体
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  return `<p>${html}</p>`;
}

/**
 * 显示ADR详情
 */
function showADRDetail(id) {
  const adr = ADR_LIST.find(a => a.id === id);
  if (!adr) return;

  const detailEl = document.getElementById('adrDetail');
  const overlayEl = document.getElementById('adrOverlay');

  if (!detailEl || !overlayEl) return;

  detailEl.innerHTML = `
    <div class="adr-detail-header">
      <span class="adr-detail-title">${adr.id}: ${adr.title}</span>
      <button class="adr-detail-close" onclick="closeADRDetail()">✕</button>
    </div>
    <div class="adr-detail-body">
      <div class="adr-detail-section">
        <h3>状态</h3>
        <span class="adr-status ${adr.status}">${getStatusLabel(adr.status)}</span>
      </div>
      <div class="adr-detail-section">
        <h3>背景</h3>
        <p>${adr.context}</p>
      </div>
      <div class="adr-detail-section">
        <h3>决策</h3>
        <p>${adr.decision}</p>
      </div>
      <div class="adr-detail-section">
        <h3>后果</h3>
        <ul>
          ${adr.consequences.split('\n').filter(c => c.trim()).map(c => `<li>${c.replace(/^\d+\.\s*/, '')}</li>`).join('')}
        </ul>
      </div>
      <div class="adr-detail-section">
        <h3>元信息</h3>
        <p>日期: ${adr.date} | 作者: ${adr.author}</p>
      </div>
    </div>
  `;

  detailEl.classList.add('show');
  overlayEl.classList.add('show');
}

/**
 * 关闭ADR详情
 */
function closeADRDetail() {
  const detailEl = document.getElementById('adrDetail');
  const overlayEl = document.getElementById('adrOverlay');

  if (detailEl) detailEl.classList.remove('show');
  if (overlayEl) overlayEl.classList.remove('show');
}

/**
 * 辅助函数
 */
function getStatusLabel(status) {
  const labels = {
    accepted: '✅ 已采纳',
    proposed: '💡 提议中',
    deprecated: '⚠️ 已废弃'
  };
  return labels[status] || status;
}

function getChangeTypeLabel(type) {
  const labels = {
    add: '新增',
    update: '更新',
    fix: '修复'
  };
  return labels[type] || type;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// 缩放控制函数（暴露到全局）
window.zoomArchitecture = function(scale) {
  const container = document.getElementById('archSvgContainer');
  if (!container) return;
  const svg = container.querySelector('svg');
  if (svg) {
    const currentScale = parseFloat(svg.style.transform?.match(/scale\(([\d.]+)\)/)?.[1] || '1');
    const newScale = currentScale * scale;
    svg.style.transform = `scale(${newScale})`;
    svg.style.transformOrigin = 'center center';
  }
};

window.resetArchitectureZoom = function() {
  const container = document.getElementById('archSvgContainer');
  if (!container) return;
  const svg = container.querySelector('svg');
  if (svg) {
    svg.style.transform = 'scale(1)';
  }
};

window.zoomER = function(scale) {
  const container = document.getElementById('erSvgContainer');
  if (!container) return;
  const svg = container.querySelector('svg');
  if (svg) {
    const currentScale = parseFloat(svg.style.transform?.match(/scale\(([\d.]+)\)/)?.[1] || '1');
    const newScale = currentScale * scale;
    svg.style.transform = `scale(${newScale})`;
    svg.style.transformOrigin = 'center center';
  }
};

window.resetERZoom = function() {
  const container = document.getElementById('erSvgContainer');
  if (!container) return;
  const svg = container.querySelector('svg');
  if (svg) {
    svg.style.transform = 'scale(1)';
  }
};

export default { renderBlueprintView };
