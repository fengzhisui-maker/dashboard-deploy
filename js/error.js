/* ================================================
   金融研究仪表盘 - 错误处理 v1.3
   L3-8: 结构化Error/Toast通知
   ================================================ */

// 自定义错误类
export class AppError extends Error {
  constructor(message, code = 'UNKNOWN', details = null) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

// 错误代码定义
export const ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',           // 网络错误
  DATA_NOT_FOUND: 'DATA_NOT_FOUND',         // 数据未找到
  AUTH_FAILED: 'AUTH_FAILED',               // 认证失败
  PERMISSION_DENIED: 'PERMISSION_DENIED',   // 权限拒绝
  VALIDATION_ERROR: 'VALIDATION_ERROR',     // 验证错误
  SERVER_ERROR: 'SERVER_ERROR',              // 服务器错误
  CACHE_ERROR: 'CACHE_ERROR',                // 缓存错误
  RENDER_ERROR: 'RENDER_ERROR'               // 渲染错误
};

// 错误处理中心
export const ErrorHandler = {
  errors: [],
  maxErrors: 100,
  
  // 记录错误
  log(error, context = null) {
    const errorRecord = {
      error: error instanceof Error ? {
        message: error.message,
        name: error.name,
        stack: error.stack
      } : error,
      context,
      timestamp: new Date().toISOString()
    };
    
    this.errors.unshift(errorRecord);
    
    // 限制记录数量
    if (this.errors.length > this.maxErrors) {
      this.errors.pop();
    }
    
    // 控制台输出
    console.error('[ErrorHandler]', errorRecord);
    
    return errorRecord;
  },
  
  // 获取最近错误
  getRecent(count = 10) {
    return this.errors.slice(0, count);
  },
  
  // 清除错误记录
  clear() {
    this.errors = [];
  }
};

// 全局错误处理
export function handleError(error, context = 'APP') {
  // 记录错误
  ErrorHandler.log(error, context);
  
  // 显示用户提示
  let message = '发生错误';
  
  if (error instanceof AppError) {
    message = error.message;
  } else if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === 'string') {
    message = error;
  }
  
  // 根据错误类型显示不同提示
  if (context === 'NETWORK') {
    showErrorToast('网络错误，请检查连接');
  } else if (context === 'AUTH') {
    showErrorToast('认证失败，请重新登录');
  } else {
    showErrorToast(message);
  }
}

// 显示错误Toast
function showErrorToast(message) {
  // 动态导入ToastState避免循环依赖
  import('./store/state.js').then(({ ToastState }) => {
    ToastState.error(message);
  });
}

// 异步错误包装
export function asyncHandler(fn, context = 'APP') {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      handleError(error, context);
      return null;
    }
  };
}

// 同步错误包装
export function syncHandler(fn, context = 'APP') {
  return (...args) => {
    try {
      return fn(...args);
    } catch (error) {
      handleError(error, context);
      return null;
    }
  };
}

// 验证函数
export function validateRequired(value, fieldName) {
  if (value === null || value === undefined || value === '') {
    throw new AppError(
      `${fieldName}不能为空`,
      ERROR_CODES.VALIDATION_ERROR,
      { field: fieldName, value }
    );
  }
  return true;
}

export function validateLength(value, fieldName, min, max) {
  const len = String(value || '').length;
  if (len < min || len > max) {
    throw new AppError(
      `${fieldName}长度必须在${min}到${max}之间`,
      ERROR_CODES.VALIDATION_ERROR,
      { field: fieldName, length: len, min, max }
    );
  }
  return true;
}

export default {
  AppError,
  ERROR_CODES,
  ErrorHandler,
  handleError,
  asyncHandler,
  syncHandler,
  validateRequired,
  validateLength
};
