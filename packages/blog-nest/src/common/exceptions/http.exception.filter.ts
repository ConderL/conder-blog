import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
  Inject,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ResultDto } from '../dtos/result.dto';
import { StatusCodeEnum } from '../enums/status-code.enum';
import { LogService } from '../../modules/log/log.service';
import { IPUtil } from '../utils/ip.util';

/**
 * HTTP异常过滤器
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  constructor(@Inject(LogService) private readonly logService: LogService) {}

  async catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const message = exception.message || '请求失败';
    const errorResponse = exception.getResponse() as any;
    const { url, method, body, query } = request;
    const userAgent = request.headers['user-agent'];
    const ip = IPUtil.getClientIp(request);

    // 获取控制器和处理方法的元数据（如果有）
    let controllerName = 'Unknown';
    let handlerName = 'Unknown';

    try {
      // 尝试获取控制器信息（仅在路由匹配的情况下有效）
      const handler = request['__handler__'];
      const controller = request['__controller__'];
      if (handler && controller) {
        controllerName = controller.name;
        handlerName = handler.name;
      }
    } catch (error) {
      // 忽略获取控制器信息的错误
    }

    // 设置适当的状态码
    let code = status;
    let msg: string | string[] = message;

    if (exception instanceof UnauthorizedException) {
      code = StatusCodeEnum.UNAUTHORIZED;
    } else if (exception instanceof BadRequestException) {
      code = StatusCodeEnum.VALID_ERROR;
      // 处理验证错误，提取详细错误信息
      if (errorResponse) {
        // 处理自定义Error返回的情况
        if (errorResponse.message instanceof Error) {
          msg = errorResponse.message.message;
        }
        // 处理数组形式的错误信息
        else if (Array.isArray(errorResponse.message)) {
          msg = errorResponse.message.join(', ');
        }
        // 处理字符串形式的错误信息
        else if (typeof errorResponse.message === 'string') {
          msg = errorResponse.message;
        }
        // 处理对象形式的错误信息
        else if (typeof errorResponse.message === 'object' && errorResponse.message !== null) {
          try {
            msg = JSON.stringify(errorResponse.message);
          } catch (e) {
            msg = '请求参数验证失败';
          }
        }
        // 默认错误信息
        else if (errorResponse.error === 'Bad Request') {
          msg = '请求参数验证失败';
        }
        this.logger.debug(`验证错误详情: ${JSON.stringify(errorResponse)}`);
      }
    } else if (exception instanceof ForbiddenException) {
      code = StatusCodeEnum.FAIL;
    } else if (exception instanceof InternalServerErrorException) {
      code = StatusCodeEnum.SYSTEM_ERROR;
    }

    // 将数组转换为字符串
    const messageStr = Array.isArray(msg) ? msg.join(', ') : msg;

    // 使用ResultDto格式返回错误信息
    const resultDto = ResultDto.fail(messageStr, code);

    // 记录错误日志，包含详细错误信息和堆栈
    this.logger.error(`${request.method} ${request.url} - ${status} - ${message}`, exception.stack);

    // 获取浏览器和操作系统信息
    let os = '未知';
    let browser = '未知';

    if (userAgent) {
      if (userAgent.includes('Windows')) {
        os = 'Windows';
      } else if (userAgent.includes('Mac')) {
        os = 'MacOS';
      } else if (userAgent.includes('Linux')) {
        os = 'Linux';
      } else if (userAgent.includes('Android')) {
        os = 'Android';
      } else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
        os = 'iOS';
      }

      if (userAgent.includes('Chrome')) {
        browser = 'Chrome';
      } else if (userAgent.includes('Firefox')) {
        browser = 'Firefox';
      } else if (userAgent.includes('Safari')) {
        browser = 'Safari';
      } else if (userAgent.includes('Edge')) {
        browser = 'Edge';
      } else if (userAgent.includes('MSIE') || userAgent.includes('Trident')) {
        browser = 'Internet Explorer';
      }
    }

    const params = JSON.stringify({ ...body, ...query });

    // 记录异常日志到数据库
    try {
      await this.logService.recordException({
        module: controllerName,
        uri: url,
        name: 'HttpException',
        description: `${controllerName}.${handlerName}执行失败`,
        error_method: `${controllerName}.${handlerName}`,
        message: messageStr,
        params,
        request_method: method,
        ip_address: ip,
        os,
        browser,
      });

      this.logger.log(`异常已记录到数据库: HttpException at ${url}`);
    } catch (logError) {
      this.logger.error(`记录异常日志失败: ${logError.message}`, logError.stack);
    }

    response.status(status).json(resultDto);
  }
}

/**
 * 全局异常过滤器
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(@Inject(LogService) private readonly logService: LogService) {}

  async catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const { url, method, body, query } = request;
    const userAgent = request.headers['user-agent'];
    const ip = IPUtil.getClientIp(request);

    // 获取控制器和处理方法的元数据（如果有）
    let controllerName = 'Unknown';
    let handlerName = 'Unknown';

    try {
      // 尝试获取控制器信息（仅在路由匹配的情况下有效）
      const handler = request['__handler__'];
      const controller = request['__controller__'];
      if (handler && controller) {
        controllerName = controller.name;
        handlerName = handler.name;
      }
    } catch (error) {
      // 忽略获取控制器信息的错误
    }

    // 获取状态码
    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    // 确定错误消息
    let message: any = '服务器内部错误';
    if (exception instanceof HttpException) {
      const errorResponse = exception.getResponse() as any;
      message = errorResponse?.message || exception.message;
      if (message instanceof Error) {
        message = message.message;
      } else if (typeof message === 'object' && message !== null) {
        try {
          message = JSON.stringify(message);
        } catch (e) {
          message = exception.message || '服务器内部错误';
        }
      }
    } else if (exception?.message) {
      message = exception.message;
    }

    // 确保最终返回的是字符串类型
    const messageStr = typeof message === 'string' ? message : JSON.stringify(message);

    // 使用ResultDto格式返回错误信息
    const resultDto = ResultDto.fail(messageStr, StatusCodeEnum.SYSTEM_ERROR);

    // 记录错误日志
    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${messageStr}`,
      exception.stack,
    );

    // 获取浏览器和操作系统信息
    let os = '未知';
    let browser = '未知';

    if (userAgent) {
      if (userAgent.includes('Windows')) {
        os = 'Windows';
      } else if (userAgent.includes('Mac')) {
        os = 'MacOS';
      } else if (userAgent.includes('Linux')) {
        os = 'Linux';
      } else if (userAgent.includes('Android')) {
        os = 'Android';
      } else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
        os = 'iOS';
      }

      if (userAgent.includes('Chrome')) {
        browser = 'Chrome';
      } else if (userAgent.includes('Firefox')) {
        browser = 'Firefox';
      } else if (userAgent.includes('Safari')) {
        browser = 'Safari';
      } else if (userAgent.includes('Edge')) {
        browser = 'Edge';
      } else if (userAgent.includes('MSIE') || userAgent.includes('Trident')) {
        browser = 'Internet Explorer';
      }
    }

    // 获取错误名称
    let errorName = exception.name || 'Unknown';
    if (exception instanceof Error) {
      errorName = exception.name;
    }

    const params = JSON.stringify({ ...body, ...query });

    // 记录异常日志到数据库
    try {
      await this.logService.recordException({
        module: controllerName,
        uri: url,
        name: errorName,
        description: `${controllerName}.${handlerName}执行失败`,
        error_method: `${controllerName}.${handlerName}`,
        message: messageStr,
        params,
        request_method: method,
        ip_address: ip,
        os,
        browser,
      });

      this.logger.log(`异常已记录到数据库: ${errorName} at ${url}`);
    } catch (logError) {
      this.logger.error(`记录异常日志失败: ${logError.message}`, logError.stack);
    }

    response.status(status).json(resultDto);
  }
}
