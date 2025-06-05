import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * SQL注入防护中间件
 * 用于检测和阻止SQL注入攻击
 */
@Injectable()
export class SqlInjectionProtectionMiddleware implements NestMiddleware {
  private readonly logger = new Logger('SqlInjectionProtectionMiddleware');

  // SQL注入攻击的常见模式
  private readonly sqlInjectionPatterns = [
    /(\s|^)(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|TRUNCATE|UNION|JOIN|EXEC|EXECUTE)\s/i,
    /(\s|^)(OR|AND)(\s+|\s*\()\s*['"]?\s*[0-9]+\s*=\s*[0-9]+\s*['"]?/i,
    /(\s|^)(OR|AND)(\s+|\s*\()\s*['"]?\s*[0-9]+\s*=\s*['"]?\s*[0-9]+\s*['"]?/i,
    /(\s|^)(OR|AND)(\s+|\s*\()\s*['"]?\s*[a-zA-Z0-9_]+\s*=\s*['"]?\s*[a-zA-Z0-9_]+\s*['"]?/i,
    /(\s|^)(OR|AND)(\s+|\s*\()\s*['"]?\s*[a-zA-Z0-9_]+\s*!=\s*['"]?\s*[a-zA-Z0-9_]+\s*['"]?/i,
    /(\s|^)(OR|AND)(\s+|\s*\()\s*['"]?\s*[a-zA-Z0-9_]+\s*<>\s*['"]?\s*[a-zA-Z0-9_]+\s*['"]?/i,
    /(\s|^)(OR|AND)(\s+|\s*\()\s*['"]?\s*[a-zA-Z0-9_]+\s*IS\s+NULL\s*['"]?/i,
    /(\s|^)(OR|AND)(\s+|\s*\()\s*['"]?\s*[a-zA-Z0-9_]+\s*IS\s+NOT\s+NULL\s*['"]?/i,
    /(\s|^)(--|\#|\/\*)/i,
    /;.*/i,
    /'\s*OR\s+'[^']+'='[^']+'/i,
    /"\s*OR\s+"[^"]+"="[^"]+"/i,
    /'\s*OR\s+1=1/i,
    /"\s*OR\s+1=1/i,
    /'\s*OR\s+'1'='1/i,
    /"\s*OR\s+"1"="1/i,
    /'\s*OR\s+1\s*=\s*1\s*--/i,
    /"\s*OR\s+1\s*=\s*1\s*--/i,
    /'\s*OR\s+'a'='a/i,
    /"\s*OR\s+"a"="a/i,
    /'\s*OR\s+'\w+'='\w+'/i,
    /"\s*OR\s+"\w+"="\w+"/i,
    /SLEEP\s*\(\s*\d+\s*\)/i,
    /BENCHMARK\s*\(\s*\d+\s*,\s*[^)]+\s*\)/i,
    /WAITFOR\s+DELAY\s+'\d{2}:\d{2}:\d{2}'/i,
  ];

  // 需要排除SQL注入检查的路径
  private readonly excludePaths: string[] = [
    '/api-docs',
    '/swagger-ui',
    '/public',
    '/uploads',
    '/api/admin/talk/add',
    '/api/admin/talk/update',
    '/api/admin/article/create',
    '/api/admin/article/update',
    '/api/admin/comment/create',
    '/api/admin/comment/update',
  ];

  // 需要排除SQL注入检查的字段
  private readonly excludeFields: string[] = [
    'talkContent',
    'articleContent',
    'commentContent',
    'html',
    'content',
    'richText',
    'images',
  ];

  use(req: Request, res: Response, next: NextFunction) {
    // 检查是否在排除路径中
    if (this.isExcludedPath(req.path)) {
      return next();
    }

    // 检查请求体
    if (req.body && this.checkForSqlInjection(req.body)) {
      this.logger.warn(
        `检测到SQL注入尝试 [Body] - IP: ${this.getClientIp(req)}, 路径: ${req.path}`,
      );
      return res.status(403).json({
        statusCode: 403,
        message: '检测到潜在的恶意请求',
      });
    }

    // 检查查询参数
    if (req.query && this.checkForSqlInjection(req.query)) {
      this.logger.warn(
        `检测到SQL注入尝试 [Query] - IP: ${this.getClientIp(req)}, 路径: ${req.path}`,
      );
      return res.status(403).json({
        statusCode: 403,
        message: '检测到潜在的恶意请求',
      });
    }

    // 检查URL参数
    if (req.params && this.checkForSqlInjection(req.params)) {
      this.logger.warn(
        `检测到SQL注入尝试 [Params] - IP: ${this.getClientIp(req)}, 路径: ${req.path}`,
      );
      return res.status(403).json({
        statusCode: 403,
        message: '检测到潜在的恶意请求',
      });
    }

    next();
  }

  /**
   * 检查对象中是否存在SQL注入攻击
   */
  private checkForSqlInjection(obj: any): boolean {
    if (!obj) return false;

    if (typeof obj === 'string') {
      return this.isSqlInjection(obj);
    }

    if (Array.isArray(obj)) {
      return obj.some((item) => this.checkForSqlInjection(item));
    }

    if (typeof obj === 'object') {
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          // 如果字段在排除列表中，则不进行SQL注入检查
          if (this.excludeFields.includes(key)) {
            continue;
          }
          if (this.checkForSqlInjection(obj[key])) {
            return true;
          }
        }
      }
    }

    return false;
  }

  /**
   * 检查字符串是否包含SQL注入攻击
   */
  private isSqlInjection(value: string): boolean {
    if (!value || typeof value !== 'string') return false;

    // 检查是否匹配任何SQL注入模式
    return this.sqlInjectionPatterns.some((pattern) => pattern.test(value));
  }

  /**
   * 检查路径是否在排除列表中
   */
  private isExcludedPath(path: string): boolean {
    return this.excludePaths.some((excludePath) => path.startsWith(excludePath));
  }

  /**
   * 获取客户端真实IP地址
   */
  private getClientIp(req: Request): string {
    const xForwardedFor = req.header('x-forwarded-for');
    if (xForwardedFor) {
      return xForwardedFor.split(',')[0].trim();
    }

    return req.header('x-real-ip') || req.ip || req.connection.remoteAddress || 'unknown';
  }
}
