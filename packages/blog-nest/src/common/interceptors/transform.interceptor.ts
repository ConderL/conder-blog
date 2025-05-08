import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response } from 'express';
import { ResultDto } from '../dtos/result.dto';

/**
 * 全局响应拦截器
 * 统一处理返回结果格式
 */
@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const response = context.switchToHttp().getResponse<Response>();

    // 如果响应已经被处理，直接返回
    if (response.headersSent) {
      return next.handle();
    }

    return next.handle().pipe(
      map((data) => {
        // 已经是标准格式的不处理
        if (data && (data.flag !== undefined || data.code !== undefined)) {
          // 确保flag字段存在
          if (data.flag === undefined && data.code !== undefined) {
            data.flag = data.code >= 200 && data.code < 300;
          }
          return data;
        }

        // 使用ResultDto格式化响应
        return ResultDto.success(data);
      }),
    );
  }
}
