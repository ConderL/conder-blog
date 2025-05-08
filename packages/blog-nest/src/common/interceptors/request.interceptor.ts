import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, finalize } from 'rxjs/operators';
import { setCurrentRequest, clearCurrentRequest } from '../utils/request.util';

/**
 * 请求拦截器
 * 用于在请求处理过程中保存请求对象，使其在整个请求生命周期内可访问
 */
@Injectable()
export class RequestInterceptor implements NestInterceptor {
  /**
   * 拦截请求
   * @param context 执行上下文
   * @param next 调用处理器
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // 获取请求对象
    const request = context.switchToHttp().getRequest();

    // 设置当前请求
    setCurrentRequest(request);

    // 处理请求
    return next.handle().pipe(
      // 请求处理完成后清除当前请求
      finalize(() => {
        clearCurrentRequest();
      }),
    );
  }
}
