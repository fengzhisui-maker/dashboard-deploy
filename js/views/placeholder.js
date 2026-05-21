/* ================================================
   金融研究仪表盘 - 占位视图 v1.3
   L4-2: 其他模块占位展示
   ================================================ */

// 占位视图配置
const PLACEHOLDER_CONFIG = {
  project: {
    title: '项目控制台',
    icon: '📯',
    desc: '项目管理、任务追踪、里程碑、错误复盘',
    status: '规划中',
    features: [
      '项目任务树与进度追踪',
      '里程碑时间线管理',
      '错误日志与经验复盘',
      '架构蓝图可视化'
    ]
  },
  visualization: {
    title: '数据可视化',
    icon: '📊',
    desc: '图表展示、数据大屏、趋势分析',
    status: '规划中',
    features: [
      '视频分类分布饼图',
      'UP主贡献度排行',
      '发布时间趋势折线图',
      '因子关联热力图'
    ]
  },
  analysis: {
    title: '分析工具',
    icon: '🔍',
    desc: '深度分析、对比研究、因子挖掘',
    status: '规划中',
    features: [
      '多维度视频对比',
      'UP主内容风格分析',
      '关键词趋势追踪',
      '智能摘要生成'
    ]
  },
  collection: {
    title: '数据采集',
    icon: '🗂️',
    desc: '自动化采集、任务管理、数据清洗',
    status: '规划中',
    features: [
      'B站视频批量采集',
      '采集任务队列管理',
      '自动分类打标',
      '异常检测与重试'
    ]
  },
  notes: {
    title: '研究笔记',
    icon: '📝',
    desc: '笔记管理、标签分类、知识沉淀',
    status: '规划中',
    features: [
      'Markdown笔记编辑',
      '关联视频与UP主',
      '标签分类检索',
      '笔记导出分享'
    ]
  },
  automation: {
    title: '自动化',
    icon: '⚡',
    desc: '定时任务、webhook、API集成',
    status: '规划中',
    features: [
      '定时数据同步',
      'GitHub Actions集成',
      'B站API自动化',
      '钉钉/飞书通知'
    ]
  }
};

// 渲染占位视图
export function renderPlaceholderView(viewId) {
  const container = document.getElementById('mainContent');
  if (!container) return;
  
  const config = PLACEHOLDER_CONFIG[viewId];
  
  if (!config) {
    container.innerHTML = '<div class="error-state">视图不存在</div>';
    return;
  }
  
  container.innerHTML = `
    <div class="placeholder-view" data-ref="placeholder-${viewId}">
      <div class="placeholder-header">
        <div class="placeholder-icon">${config.icon}</div>
        <div class="placeholder-info">
          <h1 class="placeholder-title">${config.title}</h1>
          <p class="placeholder-desc">${config.desc}</p>
        </div>
        <div class="placeholder-status">
          <span class="tag s-pending">${config.status}</span>
        </div>
      </div>
      
      <div class="placeholder-content">
        <div class="placeholder-features">
          <h3 class="features-title">规划功能</h3>
          <div class="features-grid">
            ${config.features.map(f => `
              <div class="feature-item">
                <span class="feature-icon">🔲</span>
                <span class="feature-text">${f}</span>
              </div>
            `).join('')}
          </div>
        </div>
        
        <div class="placeholder-roadmap">
          <h3 class="roadmap-title">开发路线</h3>
          <div class="roadmap-timeline">
            <div class="roadmap-item">
              <div class="roadmap-dot pending"></div>
              <div class="roadmap-content">
                <div class="roadmap-label">Phase 1 - 基础框架</div>
                <div class="roadmap-desc">完成视图结构和路由集成</div>
              </div>
            </div>
            <div class="roadmap-item">
              <div class="roadmap-dot pending"></div>
              <div class="roadmap-content">
                <div class="roadmap-label">Phase 2 - 核心功能</div>
                <div class="roadmap-desc">实现主要业务逻辑</div>
              </div>
            </div>
            <div class="roadmap-item">
              <div class="roadmap-dot pending"></div>
              <div class="roadmap-content">
                <div class="roadmap-label">Phase 3 - 数据集成</div>
                <div class="roadmap-desc">对接数据层和缓存</div>
              </div>
            </div>
            <div class="roadmap-item">
              <div class="roadmap-dot pending"></div>
              <div class="roadmap-content">
                <div class="roadmap-label">Phase 4 - 优化打磨</div>
                <div class="roadmap-desc">性能优化和交互完善</div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="placeholder-action">
          <button class="btn btn-o" disabled>
            🔔 订阅功能更新
          </button>
        </div>
      </div>
    </div>
  `;
  
  // 添加占位视图样式（如果尚未添加）
  addPlaceholderStyles();
}

// 添加占位视图样式
function addPlaceholderStyles() {
  if (document.getElementById('placeholder-styles')) return;
  
  const styles = document.createElement('style');
  styles.id = 'placeholder-styles';
  styles.textContent = `
    .placeholder-view {
      max-width: 800px;
      margin: 0 auto;
    }
    
    .placeholder-header {
      display: flex;
      align-items: flex-start;
      gap: 20px;
      padding: 24px;
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      margin-bottom: 24px;
    }
    
    .placeholder-icon {
      font-size: 48px;
      width: 72px;
      height: 72px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg3);
      border-radius: 12px;
    }
    
    .placeholder-info {
      flex: 1;
    }
    
    .placeholder-title {
      font-size: 24px;
      font-weight: 700;
      margin: 0 0 8px 0;
      color: var(--t1);
    }
    
    .placeholder-desc {
      font-size: 14px;
      color: var(--t3);
      margin: 0;
      line-height: 1.5;
    }
    
    .placeholder-status {
      flex-shrink: 0;
    }
    
    .placeholder-content {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 24px;
    }
    
    .features-title,
    .roadmap-title {
      font-size: 16px;
      font-weight: 600;
      margin: 0 0 16px 0;
      color: var(--t1);
    }
    
    .roadmap-title {
      margin-top: 32px;
    }
    
    .features-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }
    
    .feature-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 16px;
      background: var(--bg3);
      border-radius: 8px;
      font-size: 14px;
      color: var(--t2);
    }
    
    .feature-icon {
      font-size: 12px;
      opacity: 0.5;
    }
    
    .roadmap-timeline {
      position: relative;
      padding-left: 24px;
    }
    
    .roadmap-timeline::before {
      content: '';
      position: absolute;
      left: 5px;
      top: 8px;
      bottom: 8px;
      width: 2px;
      background: var(--border);
    }
    
    .roadmap-item {
      position: relative;
      padding-bottom: 24px;
    }
    
    .roadmap-item:last-child {
      padding-bottom: 0;
    }
    
    .roadmap-dot {
      position: absolute;
      left: -20px;
      top: 4px;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: var(--bg4);
      border: 2px solid var(--t4);
    }
    
    .roadmap-dot.pending {
      background: var(--bg3);
      border-color: var(--accent);
    }
    
    .roadmap-dot.done {
      background: var(--accent);
      border-color: var(--accent);
    }
    
    .roadmap-label {
      font-size: 14px;
      font-weight: 600;
      color: var(--t1);
      margin-bottom: 4px;
    }
    
    .roadmap-desc {
      font-size: 13px;
      color: var(--t3);
    }
    
    .placeholder-action {
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid var(--border);
      display: flex;
      justify-content: center;
    }
  `;
  
  document.head.appendChild(styles);
}

export default { renderPlaceholderView };
