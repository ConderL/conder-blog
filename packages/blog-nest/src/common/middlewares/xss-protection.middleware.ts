import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
// 使用CommonJS方式导入XSS
const xss = require('xss');

/**
 * XSS防护中间件
 * 用于过滤请求中可能的XSS攻击
 */
@Injectable()
export class XssProtectionMiddleware implements NestMiddleware {
  private readonly logger = new Logger('XssProtectionMiddleware');

  // 需要排除XSS过滤的路径
  private readonly excludePaths: string[] = [
    '/api/article/create',
    '/api/article/update',
    '/api/comment/create',
  ];

  // 需要排除XSS过滤的字段
  private readonly excludeFields: string[] = ['content', 'html', 'richText'];

  use(req: Request, res: Response, next: NextFunction) {
    // 设置安全相关的HTTP头
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // 检查是否在排除路径中
    if (this.isExcludedPath(req.path)) {
      return next();
    }

    // 只处理POST、PUT、PATCH请求
    if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
      req.body = this.sanitizeObject(req.body);
    }

    // 处理查询参数
    if (req.query) {
      req.query = this.sanitizeObject(req.query);
    }

    next();
  }

  /**
   * 检查路径是否在排除列表中
   */
  private isExcludedPath(path: string): boolean {
    return this.excludePaths.some((excludePath) => path.startsWith(excludePath));
  }

  /**
   * 递归清理对象中的XSS攻击代码
   */
  private sanitizeObject(obj: any): any {
    if (!obj) return obj;

    if (typeof obj === 'string') {
      return xss(obj);
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.sanitizeObject(item));
    }

    if (typeof obj === 'object') {
      const result = {};
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          // 如果字段在排除列表中，则不进行XSS过滤
          if (this.excludeFields.includes(key)) {
            result[key] = obj[key];
          } else {
            result[key] = this.sanitizeObject(obj[key]);
          }
        }
      }
      return result;
    }

    return obj;
  }
}
