import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import {
  RateLimitMiddleware,
  XssProtectionMiddleware,
  SqlInjectionProtectionMiddleware,
  SecurityHeadersMiddleware,
} from './index';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from '../../redis/redis.module';

@Module({
  imports: [ConfigModule, RedisModule],
  providers: [
    RateLimitMiddleware,
    XssProtectionMiddleware,
    SqlInjectionProtectionMiddleware,
    SecurityHeadersMiddleware,
  ],
  exports: [
    RateLimitMiddleware,
    XssProtectionMiddleware,
    SqlInjectionProtectionMiddleware,
    SecurityHeadersMiddleware,
  ],
})
export class MiddlewaresModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // 应用安全HTTP头中间件到所有路由
    consumer.apply(SecurityHeadersMiddleware).forRoutes('*');

    // 应用SQL注入防护中间件到所有路由
    consumer.apply(SqlInjectionProtectionMiddleware).forRoutes('*');

    // 应用XSS防护中间件到所有路由
    consumer.apply(XssProtectionMiddleware).forRoutes('*');

    // 应用速率限制中间件到所有API路由，排除静态文件
    consumer
      .apply(RateLimitMiddleware)
      .exclude(
        { path: 'public/(.*)', method: RequestMethod.GET },
        { path: 'uploads/(.*)', method: RequestMethod.GET },
        { path: 'api-docs/(.*)', method: RequestMethod.GET },
        { path: 'swagger-ui/(.*)', method: RequestMethod.GET },
      )
      .forRoutes('*');
  }
}
