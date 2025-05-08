import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LOG_KEY, LogOptions } from '../decorators/log.decorator';

@Injectable()
export class LogInterceptor implements NestInterceptor {
  private readonly logger = new Logger('LogInterceptor');

  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { url, method, body, params, query, user } = request;
    const now = Date.now();
    const controller = context.getClass().name;
    const handler = context.getHandler().name;

    const logOptions: LogOptions = this.reflector.get(LOG_KEY, context.getHandler()) || {};
    const { description, disableArgsLogging, disableResultLogging } = logOptions;

    // 记录请求信息
    this.logger.log(
      `[${method}] ${url} - ${controller}.${handler}${
        description ? ` - ${description}` : ''
      }${user ? ` - User: ${user.id}` : ''}`,
    );

    // 记录请求参数
    if (!disableArgsLogging) {
      const args = { body, params, query };
      this.logger.debug(`Request args: ${JSON.stringify(args)}`);
    }

    // 拦截响应
    return next.handle().pipe(
      tap({
        next: (data) => {
          const duration = Date.now() - now;
          this.logger.log(`[${method}] ${url} - ${duration}ms - ${controller}.${handler}`);

          // 记录响应结果
          if (!disableResultLogging) {
            try {
              const result = typeof data === 'object' ? JSON.stringify(data) : data;
              this.logger.debug(`Response: ${result}`);
            } catch (error) {
              this.logger.debug(`Response: [无法序列化的响应]`);
            }
          }
        },
        error: (error) => {
          const duration = Date.now() - now;
          this.logger.error(
            `[${method}] ${url} - ${duration}ms - ${controller}.${handler} - ${error.message}`,
            error.stack,
          );
        },
      }),
    );
  }
}
