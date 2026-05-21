/* ================================================
   金融研究仪表盘 - 因子引擎 v1.3
   L3-6: 关键词匹配/4类因子分类
   ================================================ */

import { DataAPI } from './adapter/data-adapter.js';
import { escapeHtml } from './compute/business.js';

// 因子类型定义
export const FACTOR_TYPES = {
  macro: {
    id: 'macro',
    name: '宏观因子',
    icon: '🌐',
    color: 'macro',
    description: '宏观经济、政策、国际关系等因素'
  },
  commodity: {
    id: 'commodity',
    name: '商品因子',
    icon: '📦',
    color: 'comm',
    description: '大宗商品、期货、原材料价格'
  },
  capital: {
    id: 'capital',
    name: '资金因子',
    icon: '💰',
    color: 'stock',
    description: '资金流向、流动性、利率汇率'
  },
  technical: {
    id: 'technical',
    name: '技术因子',
    icon: '📈',
    color: 'mix',
    description: '技术分析、图表形态、量价关系'
  }
};

// 因子关键词缓存
let factorKeywordsCache = null;

// 获取因子关键词
export async function getFactorKeywords() {
  if (factorKeywordsCache) return factorKeywordsCache;
  
  try {
    const keywords = await DataAPI.getFactorKeywords();
    factorKeywordsCache = keywords;
    return keywords;
  } catch (e) {
    console.error('获取因子关键词失败:', e);
    return [];
  }
}

// 按类型分类关键词
export async function getKeywordsByType() {
  const keywords = await getFactorKeywords();
  
  const categorized = {
    macro: [],
    commodity: [],
    capital: [],
    technical: []
  };
  
  keywords.forEach(kw => {
    const type = mapKeywordType(kw.type);
    if (categorized[type]) {
      categorized[type].push(kw);
    }
  });
  
  return categorized;
}

// 映射关键词类型
function mapKeywordType(type) {
  if (!type) return 'technical';
  
  const macroTypes = ['macro', 'macroeconomic', '宏观', '政策'];
  const commTypes = ['commodity', 'supply', '商品', '大宗', '期货'];
  const capitalTypes = ['capital', '资金', '流动性', '利率', '汇率'];
  
  if (macroTypes.some(t => type.toLowerCase().includes(t))) return 'macro';
  if (commTypes.some(t => type.toLowerCase().includes(t))) return 'commodity';
  if (capitalTypes.some(t => type.toLowerCase().includes(t))) return 'capital';
  
  return 'technical';
}

// 提取视频中的因子
export async function extractFactorsFromVideo(video) {
  const keywords = await getFactorKeywords();
  const factors = {
    macro: [],
    commodity: [],
    capital: [],
    technical: []
  };
  
  const text = (video.preview || '').toLowerCase();
  
  keywords.forEach(kw => {
    const keyword = kw.keyword.toLowerCase();
    if (text.includes(keyword)) {
      const type = mapKeywordType(kw.type);
      factors[type].push({
        keyword: kw.keyword,
        type: kw.type,
        typeName: kw.typeName || kw.type
      });
    }
  });
  
  return factors;
}

// 统计因子出现次数
export async function getFactorStats() {
  const keywords = await getFactorKeywords();
  const videos = await DataAPI.getVideos();
  
  const stats = {};
  
  keywords.forEach(kw => {
    const type = mapKeywordType(kw.type);
    let count = 0;
    
    videos.forEach(v => {
      const text = (v.preview || '').toLowerCase();
      if (text.includes(kw.keyword.toLowerCase())) {
        count++;
      }
    });
    
    stats[kw.keyword] = {
      ...kw,
      count,
      typeId: type,
      typeInfo: FACTOR_TYPES[type]
    };
  });
  
  // 排序并过滤掉count为0的
  return Object.values(stats)
    .filter(s => s.count > 0)
    .sort((a, b) => b.count - a.count);
}

// 按因子类型分组统计
export async function getFactorStatsByType() {
  const stats = await getFactorStats();
  
  const grouped = {
    macro: { type: FACTOR_TYPES.macro, keywords: [] },
    commodity: { type: FACTOR_TYPES.commodity, keywords: [] },
    capital: { type: FACTOR_TYPES.capital, keywords: [] },
    technical: { type: FACTOR_TYPES.technical, keywords: [] }
  };
  
  stats.forEach(s => {
    if (grouped[s.typeId]) {
      grouped[s.typeId].keywords.push(s);
    }
  });
  
  return grouped;
}

// 高亮文本中的因子关键词
export function highlightFactors(text, keywords) {
  if (!text || !keywords || keywords.length === 0) {
    return escapeHtml(text);
  }
  
  let result = escapeHtml(text);
  
  keywords.forEach(kw => {
    const type = mapKeywordType(kw.type);
    const hlClass = `hl-${type === 'commodity' ? 'comm' : type === 'capital' ? 'capital' : type}`;
    const escapedKw = escapeHtml(kw.keyword);
    const regex = new RegExp(`(${escapeRegex(escapedKw)})`, 'gi');
    result = result.replace(regex, `<span class="${hlClass}">$1</span>`);
  });
  
  return result;
}

// 转义正则特殊字符
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// 获取因子的CSS类名
export function getFactorClass(type) {
  const classMap = {
    macro: 't-macro',
    commodity: 't-comm',
    capital: 't-stock',
    technical: 't-mix'
  };
  return classMap[type] || 't-other';
}

// 获取因子类型名称
export function getFactorTypeName(type) {
  const typeMap = {
    macro: '宏观',
    commodity: '大宗',
    capital: '资金',
    technical: '技术'
  };
  return typeMap[type] || type;
}

export default {
  FACTOR_TYPES,
  getFactorKeywords,
  getKeywordsByType,
  extractFactorsFromVideo,
  getFactorStats,
  getFactorStatsByType,
  highlightFactors,
  getFactorClass,
  getFactorTypeName
};
