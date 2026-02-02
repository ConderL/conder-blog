import { Request } from 'express';
import { AsyncLocalStorage } from 'node:async_hooks';

const requestStorage = new AsyncLocalStorage<Request>();

export function runWithRequest<T>(request: Request, fn: () => T): T {
  return requestStorage.run(request, fn);
}

/**
 * 获取当前请求对象
 */
export function getCurrentRequest(): Request {
  return requestStorage.getStore() || ({} as Request);
}
