/* ================================================
   金融研究仪表盘 - 简道云风格表单浏览模块 v2
   数据表视图：排序、筛选、搜索、分页、详情
   ================================================ */

// 当前浏览的表
var FormState = {
  currentTable: null,
  currentPage: 1,
  pageSize: 50,
  sortField: '_updateTime',
  sortDir: 'desc',
  filters: {},
  searchText: '',
  data: [],
  showSystemFields: false
};

/* === 表配置 - 定义所有数据表的结构和显示配置 === */
const TABLE_CONFIG = {
  groups: [
    {
      id: 'transcript',
      name: '转录库核心',
      icon: '📁',
      children: [
        {
          id: 'up_master',
          name: 'UP主主表',
          icon: '📄',
          tableName: 'up_master',
          primaryField: '_id',
          fields: ['_id', 'name', 'platform', 'platform_uid', 'status', 'auto_track', '_createTime', '_updateTime'],
          systemFields: ['_id', '_createTime', '_updateTime', '_creator'],
          displayFields: ['name', 'platform', 'status'],
          links: [{ field: 'name', target: 'transcript_videos.up_id', labelField: 'name' }],
          rowClickAction: 'view'
        },
        {
          id: 'category_tags',
          name: '分类标签',
          icon: '🏷️',
          tableName: 'category_tags',
          primaryField: '_id',
          fields: ['_id', 'name', 'parent_id', 'level', 'sort_order', '_createTime', '_updateTime'],
          systemFields: ['_id', '_createTime', '_updateTime', '_creator'],
          displayFields: ['name', 'parent_id', 'level', 'sort_order'],
          rowClickAction: 'view'
        }
      ]
    },
    {
      id: 'transcript_data',
      name: '转录数据',
      icon: '📁',
      children: [
        {
          id: 'transcript_videos',
          name: '转录视频',
          icon: '📹',
          tableName: 'transcript_videos',
          primaryField: '_id',
          fields: ['_id', 'source_id', 'title', 'publish_date', 'category', 'up_id', 'preview', '_createTime', '_updateTime'],
          systemFields: ['_id', '_createTime', '_updateTime', '_creator'],
          displayFields: ['title', 'publish_date', 'category', 'up_id'],
          links: [
            { field: 'up_id', target: 'up_master._id', labelField: 'name' },
            { field: 'source_id', target: 'bilibili', labelTemplate: 'https://www.bilibili.com/video/{value}' }
          ],
          rowClickAction: 'expand'
        },
        {
          id: 'transcript_tasks',
          name: '转录任务',
          icon: '📋',
          tableName: 'transcript_tasks',
          primaryField: '_id',
          fields: ['_id', 'task_type', 'action', 'platform', 'up_id', 'status', 'videos_total', 'videos_done', '_createTime', '_updateTime'],
          systemFields: ['_id', '_createTime', '_updateTime', '_creator'],
          displayFields: ['task_type', 'action', 'platform', 'up_id', 'status', 'videos_total'],
          links: [{ field: 'up_id', target: 'up_master._id', labelField: 'name' }],
          rowClickAction: 'view'
        }
      ]
    },
    {
      id: 'ai_analysis',
      name: 'AI分析',
      icon: '📁',
      children: [
        {
          id: 'factor_keywords',
          name: '因子关键词',
          icon: '🔑',
          tableName: 'factor_keywords',
          primaryField: '_id',
          fields: ['_id', 'keyword', 'type', 'typeName', 'description', '_createTime', '_updateTime'],
          systemFields: ['_id', '_createTime', '_updateTime', '_creator'],
          displayFields: ['keyword', 'type', 'typeName'],
          rowClickAction: 'view'
        }
      ]
    },
    {
      id: 'project',
      name: '项目管理',
      icon: '📁',
      children: [
        {
          id: 'project_milestones',
          name: '里程碑',
          icon: '🏁',
          tableName: 'project_milestones',
          primaryField: '_id',
          fields: ['_id', 'name', 'status', 'target_date', 'completed_date', 'phase', '_createTime', '_updateTime'],
          systemFields: ['_id', '_createTime', '_updateTime', '_creator'],
          displayFields: ['name', 'status', 'phase', 'target_date', 'completed_date'],
          rowClickAction: 'view'
        },
        {
          id: 'project_tasks',
          name: '项目任务',
          icon: '✅',
          tableName: 'project_tasks',
          primaryField: '_id',
          fields: ['_id', 'title', 'status', 'type', 'milestone_id', 'blocked_reason', '_createTime', '_updateTime'],
          systemFields: ['_id', '_createTime', '_updateTime', '_creator'],
          displayFields: ['title', 'status', 'type', 'milestone_id'],
          links: [{ field: 'milestone_id', target: 'project_milestones._id', labelField: 'name' }],
          rowClickAction: 'view'
        },
        {
          id: 'project_errors',
          name: '错误日志',
          icon: '🐛',
          tableName: 'project_errors',
          primaryField: '_id',
          fields: ['_id', 'error_date', 'error_type', 'severity', 'title', 'desc', 'fix', 'lesson', '_createTime', '_updateTime'],
          systemFields: ['_id', '_createTime', '_updateTime', '_creator'],
          displayFields: ['title', 'error_date', 'error_type', 'severity'],
          rowClickAction: 'expand'
        }
      ]
    }
  ]
};

// UP主名称缓存

/* === 渲染侧边栏 === */
function renderFormSidebar() {
  const sidebar = document.getElementById('formSidebar');
  if (!sidebar) return;
  
  // 从localStorage读取折叠状态
  const collapsed = JSON.parse(localStorage.getItem('wd_sidebar_collapsed') || '{}');
  
  let html = '<div class="form-nav">';
  
  for (const group of TABLE_CONFIG.groups) {
    const isCollapsed = collapsed[group.id];
    
    html += '<div class="form-group">';
    html += '<div class="form-group-header" onclick="toggleGroup(\'' + group.id + '\')">';
    html += '<span class="group-icon">' + (isCollapsed ? '📁' : '📂') + '</span>';
    html += '<span class="group-name">' + group.name + '</span>';
    html += '</div>';
    
    if (!isCollapsed) {
      html += '<div class="form-group-children">';
      for (const table of group.children) {
        const isActive = FormState.currentTable?.id === table.id;
        html += '<div class="form-item ' + (isActive ? 'active' : '') + '" onclick="openTable(\'' + table.id + '\')">';
        html += '<span class="form-icon">' + table.icon + '</span>';
        html += '<span class="form-name">' + table.name + '</span>';
        html += '</div>';
      }
      html += '</div>';
    }
    
    html += '</div>';
  }
  
  html += '</div>';
  sidebar.innerHTML = html;
}

/* === 切换分组折叠 === */
function toggleGroup(groupId) {
  const collapsed = JSON.parse(localStorage.getItem('wd_sidebar_collapsed') || '{}');
  collapsed[groupId] = !collapsed[groupId];
  localStorage.setItem('wd_sidebar_collapsed', JSON.stringify(collapsed));
  renderFormSidebar();
}

/* === 打开数据表 === */
async function openTable(tableId) {
  // 找到表配置
  let tableConfig = null;
  for (const group of TABLE_CONFIG.groups) {
    for (const table of group.children) {
      if (table.id === tableId) {
        tableConfig = table;
        break;
      }
    }
    if (tableConfig) break;
  }
  
  if (!tableConfig) {
    showToast('表配置不存在');
    return;
  }
  
  FormState.currentTable = tableConfig;
  FormState.currentPage = 1;
  FormState.sortField = '_updateTime';
  FormState.sortDir = 'desc';
  FormState.filters = {};
  FormState.searchText = '';
  
  // 更新侧边栏高亮
  renderFormSidebar();
  
  // 渲染表格
  await renderFormTable();
}

/* === 渲染数据表格 === */
async function renderFormTable() {
  if (!FormState.currentTable) return;
  
  const container = document.getElementById('formContent');
  if (!container) return;
  
  container.innerHTML = '<div class="form-loading">⏳ 加载数据...</div>';
  
  try {
    // 获取数据
    const data = await DataStore.fetchJSON('data/' + FormState.currentTable.tableName + '.json', true);
    FormState.data = data;
    
    // 预加载UP主名称用于显示
    if (FormState.currentTable.tableName === 'transcript_videos') {
      const ups = await DataStore.getUpMaster();
      ups.forEach(up => {
        _upNameCache[up._id] = up.name;
      });
    }
    
    // 渲染表格界面
    renderFormView();
  } catch (e) {
    container.innerHTML = '<div class="form-error">加载失败: ' + esc(e.message) + '</div>';
  }
}

/* === 渲染表格视图 === */
function renderFormView() {
  const container = document.getElementById('formContent');
  if (!container) return;
  
  const table = FormState.currentTable;
  
  // 应用过滤和搜索
  let filteredData = applyFilters(FormState.data);
  
  // 应用排序
  filteredData = applySort(filteredData);
  
  // 分页
  const totalPages = Math.ceil(filteredData.length / FormState.pageSize);
  const startIdx = (FormState.currentPage - 1) * FormState.pageSize;
  const pageData = filteredData.slice(startIdx, startIdx + FormState.pageSize);
  
  // 标题栏
  let html = '<div class="form-header">';
  html += '<h2 class="form-title">' + table.icon + ' ' + table.name + '</h2>';
  html += '<div class="form-header-actions">';
  html += '<button class="btn btn-o btn-s" onclick="toggleFormSystemFields()">系统字段</button>';
  html += '<button class="btn btn-o btn-s" onclick="exportFormData()">📥 导出</button>';
  html += '</div>';
  html += '</div>';
  
  // 搜索栏
  html += '<div class="form-toolbar">';
  html += '<input type="text" class="form-search" placeholder="🔍 搜索..." value="' + esc(FormState.searchText) + '" oninput="onFormSearch(this.value)">';
  html += '<span class="form-count">共 ' + filteredData.length + ' 条</span>';
  html += '</div>';
  
  // 表格
  html += '<div class="form-table-wrapper">';
  html += '<table class="form-table">';
  
  // 表头
  html += '<thead><tr>';
  
  // 显示的字段
  const fieldsToShow = FormState.showSystemFields ? table.fields : table.displayFields;
  
  for (const field of fieldsToShow) {
    const isSort = FormState.sortField === field;
    html += '<th class="' + (isSort ? 'sorted' : '') + '" onclick="sortByField(\'' + field + '\')">';
    html += getFieldLabel(field);
    if (isSort) {
      html += ' <span class="sort-icon">' + (FormState.sortDir === 'asc' ? '↑' : '↓') + '</span>';
    }
    html += '</th>';
  }
  
  html += '</tr></thead>';
  
  // 表体
  html += '<tbody>';
  
  for (const row of pageData) {
    html += '<tr onclick="onRowClick(\'' + row._id + '\')">';
    
    for (const field of fieldsToShow) {
      let value = row[field];
      let displayValue = formatFieldValue(field, value, table);
      html += '<td>' + displayValue + '</td>';
    }
    
    html += '</tr>';
  }
  
  html += '</tbody></table></div>';
  
  // 分页
  if (totalPages > 1) {
    html += '<div class="form-pagination">';
    html += '<button class="pg-btn" onclick="goToPage(1)" ' + (FormState.currentPage === 1 ? 'disabled' : '') + '>«</button>';
    html += '<button class="pg-btn" onclick="goToPage(' + (FormState.currentPage - 1) + ')" ' + (FormState.currentPage === 1 ? 'disabled' : '') + '>‹</button>';
    
    const startP = Math.max(1, FormState.currentPage - 2);
    const endP = Math.min(totalPages, FormState.currentPage + 2);
    
    for (let p = startP; p <= endP; p++) {
      html += '<button class="pg-btn ' + (p === FormState.currentPage ? 'active' : '') + '" onclick="goToPage(' + p + ')">' + p + '</button>';
    }
    
    html += '<button class="pg-btn" onclick="goToPage(' + (FormState.currentPage + 1) + ')" ' + (FormState.currentPage === totalPages ? 'disabled' : '') + '>›</button>';
    html += '<button class="pg-btn" onclick="goToPage(' + totalPages + ')" ' + (FormState.currentPage === totalPages ? 'disabled' : '') + '>»</button>';
    html += '</div>';
  }
  
  container.innerHTML = html;
}

/* === 辅助函数 === */
function getFieldLabel(field) {
  const labels = {
    '_id': 'ID',
    '_createTime': '创建时间',
    '_updateTime': '更新时间',
    '_creator': '创建人',
    'name': '名称',
    'platform': '平台',
    'platform_uid': '平台UID',
    'status': '状态',
    'auto_track': '自动追踪',
    'title': '标题',
    'source_id': '视频ID',
    'publish_date': '发布日期',
    'category': '分类',
    'up_id': 'UP主',
    'preview': '预览',
    'fullText': '全文',
    'parent_id': '父级ID',
    'level': '层级',
    'sort_order': '排序',
    'task_type': '任务类型',
    'action': '操作',
    'up_url': '主页URL',
    'limit_count': '数量限制',
    'limit_days': '天数限制',
    'videos_total': '总视频',
    'videos_done': '已完成',
    'videos_skip': '跳过',
    'videos_fail': '失败',
    'keyword': '关键词',
    'type': '类型',
    'typeName': '类型名称',
    'description': '描述',
    'target_date': '目标日期',
    'completed_date': '完成日期',
    'phase': '阶段',
    'milestone_id': '里程碑',
    'blocked_reason': '阻塞原因',
    'error_date': '错误日期',
    'error_type': '错误类型',
    'severity': '严重程度',
    'desc': '描述',
    'fix': '修复方案',
    'lesson': '经验教训',
    'filename': '文件名'
  };
  return labels[field] || field;
}

function formatFieldValue(field, value, table) {
  if (value === null || value === undefined) return '<span class="null-value">-</span>';
  
  // 关联字段处理
  const link = table.links?.find(l => l.field === field);
  
  if (link) {
    if (link.labelTemplate) {
      // 外部链接
      return '<a href="' + link.labelTemplate.replace('{value}', value) + '" target="_blank" class="link-cell">' + esc(String(value)) + '</a>';
    } else if (field === 'up_id' && _upNameCache[value]) {
      // UP主名称显示
      return '<span class="link-cell" onclick="jumpToUpMaster(\'' + value + '\')">' + esc(_upNameCache[value]) + '</span>';
    } else {
      return '<span class="link-cell" onclick="jumpToLink(\'' + link.target + '\', \'' + value + '\')">' + esc(String(value)) + '</span>';
    }
  }
  
  // 布尔值
  if (typeof value === 'boolean') {
    return value ? '<span class="bool-true">是</span>' : '<span class="bool-false">否</span>';
  }
  
  // 状态字段
  if (field === 'status') {
    const statusMap = {
      'done': '<span class="status-done">已完成</span>',
      'inProgress': '<span class="status-progress">进行中</span>',
      'todo': '<span class="status-todo">待处理</span>',
      'backlog': '<span class="status-backlog">积压</span>',
      'active': '<span class="status-active">活跃</span>',
      'pending': '<span class="status-pending">等待</span>',
      'processing': '<span class="status-processing">处理中</span>',
      'partial': '<span class="status-partial">部分</span>',
      'error': '<span class="status-error">错误</span>',
      'high': '<span class="severity-high">高</span>',
      'medium': '<span class="severity-medium">中</span>',
      'low': '<span class="severity-low">低</span>'
    };
    return statusMap[value] || esc(String(value));
  }
  
  // 日期格式化
  if (field.includes('date') || field.includes('Time')) {
    try {
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        return esc(d.toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }));
      }
    } catch (e) {}
  }
  
  // 平台格式化
  if (field === 'platform') {
    return '<span class="platform-tag">' + platLabel(value) + '</span>';
  }
  
  // 文本截断
  if (typeof value === 'string' && value.length > 50) {
    return '<span title="' + esc(value) + '">' + esc(value.slice(0, 50)) + '...</span>';
  }
  
  return esc(String(value));
}

function applyFilters(data) {
  let filtered = [...data];
  
  // 搜索
  if (FormState.searchText && FormState.searchText.length >= 2) {
    const kw = FormState.searchText.toLowerCase();
    filtered = filtered.filter(row => {
      const fields = FormState.currentTable.displayFields;
      for (const field of fields) {
        const val = String(row[field] || '').toLowerCase();
        if (val.includes(kw)) return true;
      }
      return false;
    });
  }
  
  return filtered;
}

function applySort(data) {
  const field = FormState.sortField;
  const dir = FormState.sortDir === 'asc' ? 1 : -1;
  
  return [...data].sort((a, b) => {
    let va = a[field];
    let vb = b[field];
    
    // 日期排序
    if (field.includes('date') || field.includes('Time')) {
      va = va ? new Date(va).getTime() : 0;
      vb = vb ? new Date(vb).getTime() : 0;
    }
    
    if (va < vb) return -1 * dir;
    if (va > vb) return 1 * dir;
    return 0;
  });
}

function sortByField(field) {
  if (FormState.sortField === field) {
    FormState.sortDir = FormState.sortDir === 'asc' ? 'desc' : 'asc';
  } else {
    FormState.sortField = field;
    FormState.sortDir = 'desc';
  }
  FormState.currentPage = 1;
  renderFormView();
}

function onFormSearch(text) {
  FormState.searchText = text;
  FormState.currentPage = 1;
  renderFormView();
}

function goToPage(page) {
  const totalPages = Math.ceil(FormState.data.length / FormState.pageSize);
  if (page < 1 || page > totalPages) return;
  FormState.currentPage = page;
  renderFormView();
}

function toggleFormSystemFields() {
  FormState.showSystemFields = !FormState.showSystemFields;
  renderFormView();
}

function onRowClick(rowId) {
  const row = FormState.data.find(r => r._id === rowId);
  if (!row) return;
  
  // 简道云风格：点击行展开详情
  showRowDetail(row);
}

function showRowDetail(row) {
  const detail = document.getElementById('formDetail');
  if (!detail) return;
  
  const table = FormState.currentTable;
  let html = '<div class="detail-header">';
  html += '<h3>' + table.icon + ' ' + table.name + ' - 详情</h3>';
  html += '<button class="btn btn-o btn-s" onclick="closeFormDetail()">✕</button>';
  html += '</div>';
  
  html += '<div class="detail-body">';
  
  // 显示所有字段
  for (const field of table.fields) {
    let value = row[field];
    
    // fullText特殊处理
    if (field === 'fullText' && value) {
      html += '<div class="detail-field">';
      html += '<div class="detail-label">' + getFieldLabel(field) + '</div>';
      html += '<div class="detail-value detail-fulltext"><pre>' + esc(value) + '</pre></div>';
      html += '</div>';
      continue;
    }
    
    // preview特殊处理
    if (field === 'preview' && value) {
      html += '<div class="detail-field">';
      html += '<div class="detail-label">' + getFieldLabel(field) + '</div>';
      html += '<div class="detail-value detail-preview"><pre>' + esc(value) + '</pre></div>';
      html += '</div>';
      continue;
    }
    
    html += '<div class="detail-field">';
    html += '<div class="detail-label">' + getFieldLabel(field) + '</div>';
    html += '<div class="detail-value">' + formatFieldValue(field, value, table) + '</div>';
    html += '</div>';
  }
  
  html += '</div>';
  
  detail.innerHTML = html;
  detail.classList.add('show');
}

function closeFormDetail() {
  const detail = document.getElementById('formDetail');
  if (detail) detail.classList.remove('show');
}

function jumpToUpMaster(upId) {
  openTable('up_master');
  // 搜索该UP主
  setTimeout(() => {
    FormState.searchText = upId;
    renderFormView();
  }, 100);
}

function jumpToLink(target, value) {
  // 跳转到关联表并定位
  const [tableName] = target.split('.');
  openTable(tableName);
  setTimeout(() => {
    FormState.searchText = value;
    renderFormView();
  }, 100);
}

function exportFormData() {
  if (!FormState.data || FormState.data.length === 0) {
    showToast('无数据可导出');
    return;
  }
  
  const data = FormState.data;
  const fields = FormState.currentTable.displayFields;
  
  // CSV格式
  let csv = fields.map(f => getFieldLabel(f)).join(',') + '\n';
  
  for (const row of data) {
    csv += fields.map(f => {
      let val = row[f] || '';
      if (typeof val === 'string' && (val.includes(',') || val.includes('"') || val.includes('\n'))) {
        val = '"' + val.replace(/"/g, '""') + '"';
      }
      return val;
    }).join(',') + '\n';
  }
  
  // 下载
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = FormState.currentTable.tableName + '_export.csv';
  a.click();
  URL.revokeObjectURL(url);
  
  showToast('导出成功');
}
