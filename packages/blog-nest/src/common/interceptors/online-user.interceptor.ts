import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { OnlineService } from '../../modules/online/online.service';

/**
 * 在线用户拦截器
 * 用于更新在线用户的最后访问时间
 */
@Injectable()
export class OnlineUserInterceptor implements NestInterceptor {
  constructor(private readonly onlineService: OnlineService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    // 获取请求对象
    const request = context.switchToHttp().getRequest();

    // 从请求头中获取令牌
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);

      // 异步更新用户最后访问时间
      setTimeout(async () => {
        try {
          await this.onlineService.updateLastAccessTime(token);
        } catch (error) {
          console.error('更新用户最后访问时间失败:', error);
        }
      }, 0);
    }

    // 继续处理请求
    return next.handle().pipe(
      tap(() => {
        // 请求完成后的操作（如有需要）
      }),
    );
  }
}
