import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { OPERATION_LOG_KEY } from '../decorators/operation-log.decorator';
import { IPUtil } from '../utils/ip.util';
import { OperationLog } from '../../modules/log/entities/operation-log.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

/**
 * 操作日志拦截器
 * 用于记录用户操作日志
 */
@Injectable()
export class OperationLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger(OperationLogInterceptor.name);
  private readonly startTimeMap = new Map<string, number>();

  constructor(
    private readonly reflector: Reflector,
    @InjectRepository(OperationLog)
    private readonly operationLogRepository: Repository<OperationLog>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const operationType = this.reflector.get<string>(OPERATION_LOG_KEY, context.getHandler());

    // 如果没有标记 OperationLog 装饰器，则跳过
    if (!operationType) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user; // 由JWT策略注入
    this.logger.debug(`操作日志拦截器 - 用户信息: ${JSON.stringify(user)}`);

    const { url, method, path } = request;
    const userAgent = request.headers['user-agent'];
    const ip = IPUtil.getClientIp(request);
    const requestId = `${context.getClass().name}_${context.getHandler().name}_${Date.now()}`;

    this.logger.debug(
      `操作日志拦截器 - 操作类型: ${operationType}, URL: ${url}, 方法: ${method}, IP: ${ip}`,
    );

    // 记录开始时间
    this.startTimeMap.set(requestId, Date.now());

    // 获取控制器和处理方法的元数据
    const handler = context.getHandler();
    const controller = context.getClass();
    const controllerName = controller.name;
    const handlerName = handler.name;

    // 获取API和方法描述 (通过Swagger注解)
    const apiTags = Reflect.getMetadata('swagger/apiUseTags', controller) || ['未知模块'];
    const apiOperation = Reflect.getMetadata('swagger/apiOperation', handler) || {
      summary: '未知操作',
    };

    return next.handle().pipe(
      tap({
        next: async (data) => {
          // 记录操作成功日志
          try {
            const endTime = Date.now();
            const startTime = this.startTimeMap.get(requestId) || endTime;
            const duration = endTime - startTime;
            this.startTimeMap.delete(requestId);

            const operationLog = new OperationLog();
            operationLog.module = apiTags[0];
            operationLog.type = operationType;
            operationLog.uri = url;
            operationLog.name = `${controllerName}.${handlerName}`;
            operationLog.description = apiOperation.summary;
            operationLog.params = JSON.stringify(request.body || request.query);
            operationLog.method = method;
            operationLog.data = JSON.stringify(data).substring(0, 1000); // 限制长度
            operationLog.user_id = user?.id || 0;
            operationLog.nickname = user?.nickname || user?.username || '未登录用户';
            operationLog.ip_address = ip;
            operationLog.ip_source = await IPUtil.getIpLocation(ip);
            operationLog.times = duration;

            this.logger.debug(`准备保存操作日志: ${JSON.stringify(operationLog)}`);
            await this.operationLogRepository.save(operationLog);
            this.logger.log(`操作日志记录成功: ${operationLog.module}.${operationLog.description}`);
          } catch (error) {
            this.logger.error(`记录操作日志失败: ${error.message}`, error.stack);
          }
        },
        error: async (error) => {
          // 记录操作失败日志
          try {
            const endTime = Date.now();
            const startTime = this.startTimeMap.get(requestId) || endTime;
            const duration = endTime - startTime;
            this.startTimeMap.delete(requestId);

            const operationLog = new OperationLog();
            operationLog.module = apiTags[0];
            operationLog.type = operationType;
            operationLog.uri = url;
            operationLog.name = `${controllerName}.${handlerName}`;
            operationLog.description = apiOperation.summary;
            operationLog.params = JSON.stringify(request.body || request.query);
            operationLog.method = method;
            operationLog.data = JSON.stringify({
              message: error.message,
              stack: process.env.NODE_ENV === 'production' ? null : error.stack,
            }).substring(0, 1000);
            operationLog.user_id = user?.id || 0;
            operationLog.nickname = user?.nickname || user?.username || '未登录用户';
            operationLog.ip_address = ip;
            operationLog.ip_source = await IPUtil.getIpLocation(ip);
            operationLog.times = duration;

            this.logger.debug(`准备保存操作日志: ${JSON.stringify(operationLog)}`);
            await this.operationLogRepository.save(operationLog);
            this.logger.log(`操作日志记录成功: ${operationLog.module}.${operationLog.description}`);
          } catch (logError) {
            this.logger.error(`记录操作日志失败: ${logError.message}`, logError.stack);
          }
        },
      }),
    );
  }
}
