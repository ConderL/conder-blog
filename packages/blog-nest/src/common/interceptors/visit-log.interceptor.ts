import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { VISIT_LOG_KEY } from '../decorators/visit-log.decorator';
import { IPUtil } from '../utils/ip.util';
import { VisitLogService } from '../../modules/blog/services/visit-log.service';

/**
 * 访问日志拦截器
 * 用于自动记录使用@VisitLog装饰器的接口的访问日志
 */
@Injectable()
export class VisitLogInterceptor implements NestInterceptor {
  private readonly minLogIntervalMs = 10_000;
  private readonly lastLogAtByKey = new Map<string, number>();

  constructor(
    private reflector: Reflector,
    private visitLogService: VisitLogService,
  ) {}

  /**
   * 拦截方法
   * @param context 执行上下文
   * @param next 请求处理
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const pageName = this.reflector.get<string>(VISIT_LOG_KEY, context.getHandler());

    // 如果没有页面名称元数据，则不处理
    if (!pageName) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const { url, headers } = request;

    // 获取客户端信息
    const ipAddress = IPUtil.getClientIp(request);
    const userAgent = headers['user-agent'];
    const throttleKey = `${ipAddress}:${pageName}`;

    // 解析UA (简化版本，不使用ua-parser-js库)
    const browser = this.getBrowserInfo(userAgent);
    const os = this.getOsInfo(userAgent);

    // 返回的结果处理
    return next.handle().pipe(
      tap(() => {
        if (!this.shouldLog(throttleKey)) return;
        // 创建访问日志
        void this.visitLogService
          .create({
            ipAddress,
            pageUrl: url,
            browser: browser,
            os: os,
          })
          .catch(() => undefined);
      }),
    );
  }

  private shouldLog(key: string): boolean {
    const now = Date.now();
    const last = this.lastLogAtByKey.get(key) ?? 0;
    if (now - last < this.minLogIntervalMs) return false;

    this.lastLogAtByKey.set(key, now);

    // Prevent unbounded growth under crawler/bot traffic.
    if (this.lastLogAtByKey.size > 50_000) {
      this.lastLogAtByKey.clear();
    }

    return true;
  }

  /**
   * 获取浏览器信息
   * @param userAgent 用户代理字符串
   * @returns 浏览器信息
   */
  private getBrowserInfo(userAgent: string): string {
    if (!userAgent) return '未知浏览器';

    if (userAgent.includes('Edge')) return 'Microsoft Edge';
    if (userAgent.includes('Firefox')) return 'Mozilla Firefox';
    if (userAgent.includes('Chrome') && !userAgent.includes('Chromium')) return 'Google Chrome';
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Apple Safari';
    if (userAgent.includes('MSIE') || userAgent.includes('Trident')) return 'Internet Explorer';
    if (userAgent.includes('Opera') || userAgent.includes('OPR')) return 'Opera';

    return '其他浏览器';
  }

  /**
   * 获取操作系统信息
   * @param userAgent 用户代理字符串
   * @returns 操作系统信息
   */
  private getOsInfo(userAgent: string): string {
    if (!userAgent) return '未知系统';

    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac OS')) return 'MacOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS') || userAgent.includes('iPhone') || userAgent.includes('iPad'))
      return 'iOS';

    return '其他系统';
  }
}
