import { Request } from 'express';

// 使用异步本地存储来存储当前请求
const asyncLocalStorage = {
  _storage: new Map<string, Request>(),

  /**
   * 设置当前请求
   * @param requestId 请求ID
   * @param request 请求对象
   */
  set(requestId: string, request: Request): void {
    this._storage.set(requestId, request);
  },

  /**
   * 获取当前请求
   * @param requestId 请求ID
   */
  get(requestId: string): Request | undefined {
    return this._storage.get(requestId);
  },

  /**
   * 清除当前请求
   * @param requestId 请求ID
   */
  clear(requestId: string): void {
    this._storage.delete(requestId);
  },
};

// 存储当前执行的请求ID
let currentRequestId: string | null = null;

/**
 * 设置当前请求ID
 * @param requestId 请求ID
 */
export function setCurrentRequestId(requestId: string): void {
  currentRequestId = requestId;
}

/**
 * 获取当前请求ID
 */
export function getCurrentRequestId(): string | null {
  return currentRequestId;
}

/**
 * 设置当前请求对象
 * @param request 请求对象
 */
export function setCurrentRequest(request: Request): string {
  const requestId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
  asyncLocalStorage.set(requestId, request);
  setCurrentRequestId(requestId);
  return requestId;
}

/**
 * 获取当前请求对象
 */
export function getCurrentRequest(): Request {
  const requestId = getCurrentRequestId();
  if (!requestId) {
    return {} as Request; // 返回空对象，避免空指针
  }

  const request = asyncLocalStorage.get(requestId);
  return request || ({} as Request);
}

/**
 * 清除当前请求
 */
export function clearCurrentRequest(): void {
  const requestId = getCurrentRequestId();
  if (requestId) {
    asyncLocalStorage.clear(requestId);
    setCurrentRequestId(null);
  }
}
