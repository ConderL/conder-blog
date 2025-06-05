import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * 安全HTTP头中间件
 * 用于添加安全相关的HTTP头
 */
@Injectable()
export class SecurityHeadersMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // 防止点击劫持攻击
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');

    // 阻止浏览器猜测（嗅探）响应的MIME类型
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // 启用XSS过滤器
    res.setHeader('X-XSS-Protection', '1; mode=block');

    // 限制网站只能通过HTTPS访问
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

    // 控制哪些网站可以在iframe中嵌入当前页面
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'",
    );

    // 禁止浏览器发送Referer头
    res.setHeader('Referrer-Policy', 'same-origin');

    // 禁止浏览器缓存包含敏感信息的页面
    if (req.method === 'GET') {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }

    // 添加Feature-Policy头，限制浏览器特性
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

    next();
  }
}
