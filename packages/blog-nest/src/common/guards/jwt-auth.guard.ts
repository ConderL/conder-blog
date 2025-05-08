import { ExecutionContext, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(private reflector: Reflector) {
    super();
  }

  // 公开访问的路径
  private readonly publicPaths: string[] = [
    '/auth/login',
    '/admin/auth/login',
    '/users/register',
    '/articles', // 文章列表公开
    '/articles/list', // 文章列表公开
    '/articles/recommend', // 推荐文章公开
    '/articles/search', // 文章搜索公开
    '/categories',
    '/tags',
    '/comments/list',
    '/friend',
    '/message',
    '/album',
    '/site-config/frontend',
    '/search',
    '/visit-logs',
    '/report',
    '/',
    '/about',
    // Swagger API文档相关路径
    '/doc.html',
    '/api-docs',
    '/swagger-ui',
    '/swagger-resources',
    '/v2/api-docs',
    '/v3/api-docs',
    '/favicon.ico',
  ];

  // 需要精确匹配的路径（不应用于子路径）
  private readonly exactMatchPaths: string[] = ['/articles'];

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest();
    this.logger.debug(`请求路径: ${request.method} ${request.url}, 是否公开接口: ${isPublic}`);

    if (isPublic) {
      this.logger.log('Endpoint is marked as public, skipping authentication');
      return true;
    }

    // 检查是否有Authorization头
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      this.logger.warn('请求缺少Authorization头');
    } else {
      const [type, token] = authHeader.split(' ');
      this.logger.debug(
        `Authorization头类型: ${type}, 令牌: ${token ? token.substring(0, 15) + '...' : 'missing'}, 完整值: ${authHeader}`,
      );

      if (type !== 'Bearer') {
        this.logger.warn(`无效的认证头前缀: ${type}, 应为Bearer`);
      }

      if (!token) {
        this.logger.warn('无效的认证头: 缺少token部分');
      } else if (token === '[object Object]' || token.includes('[object Object]')) {
        this.logger.warn(`无效的token格式: ${token}`);
      }
    }

    // 检查是否是公开路径
    const { url, method } = request;
    this.logger.log(`Checking access to ${method} ${url}`);

    if (url) {
      // 移除查询参数
      const path = url.split('?')[0];

      // 检查是否完全匹配公开路径
      if (this.publicPaths.includes(path)) {
        this.logger.log(`Path ${path} exactly matches a public path, skipping authentication`);
        return true;
      }

      // 检查是否是需要子路径匹配的公开路径
      for (const publicPath of this.publicPaths) {
        // 如果是精确匹配路径，则跳过子路径匹配
        if (this.exactMatchPaths.includes(publicPath)) {
          continue;
        }

        // 对于其他路径，检查是否以公开路径开头，并且后面跟着/或结束
        if (path.startsWith(publicPath + '/')) {
          // 特殊处理点赞路径，确保像/articles/123/like这样的路径需要认证
          if (path.match(/\/articles\/\d+\/like$/)) {
            this.logger.log(`Path ${path} is an article like endpoint, requiring authentication`);
            break; // 跳出循环，进行认证
          }

          this.logger.log(
            `Path ${path} matches public path ${publicPath}, skipping authentication`,
          );
          return true;
        }
      }
    }

    // 调用父类的 canActivate 方法进行 JWT 验证
    this.logger.log(`Path ${url} requires authentication, validating JWT token`);
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      this.logger.error(`认证失败: ${err?.message || info?.message || '未知错误'}`);
      throw err || new UnauthorizedException('认证失败，请重新登录');
    }

    this.logger.debug(`认证成功，用户: ${user.username}`);
    return user;
  }
}
