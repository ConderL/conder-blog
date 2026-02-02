import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, Subscription } from 'rxjs';
import { runWithRequest } from '../utils/request.util';

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

    return new Observable((subscriber) => {
      let subscription: Subscription | undefined;

      runWithRequest(request, () => {
        subscription = next.handle().subscribe({
          next: (value) => subscriber.next(value),
          error: (error) => subscriber.error(error),
          complete: () => subscriber.complete(),
        });
      });

      return () => subscription?.unsubscribe();
    });
  }
}
