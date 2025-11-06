import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { RequestInterceptor } from './common/interceptors/request.interceptor';
import { TokenBlacklistGuard } from './common/guards/token-blacklist.guard';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { BlogModule } from './modules/blog/blog.module';
import { QueueModule } from './modules/queue/queue.module';
import { OauthModule } from './modules/oauth/oauth.module';
import { UploadModule } from './modules/upload/upload.module';
import { EmailModule } from './modules/email/email.module';
import { CacheModule } from '@nestjs/cache-manager';
import { CaptchaModule } from './modules/captcha/captcha.module';
import { HttpModule, HttpService } from '@nestjs/axios';
import { IpService } from './services/ip.service';
import { ChatModule } from './modules/chat/chat.module';
import { ToolsModule } from './modules/tools/tools.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join, resolve } from 'path';
import { VisitLogInterceptor } from './common/interceptors/visit-log.interceptor';
import { OperationLogInterceptor } from './common/interceptors/operation-log.interceptor';
import { OnlineUserInterceptor } from './common/interceptors/online-user.interceptor';
import {
  AllExceptionsFilter,
  HttpExceptionFilter,
} from './common/exceptions/http.exception.filter';
import { LogModule } from './modules/log/log.module';
import { OnlineModule } from './modules/online/online.module';
import { MiddlewaresModule } from './common/middlewares/middlewares.module';

import configuration from './config/configuration';
import { createTypeOrmOptions } from './config/database.config';
import { AdminModule } from './modules/admin/admin.modules';
import { DifyModule } from './modules/dify/dify.module';

@Module({
  imports: [
    // 配置模块
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: resolve(__dirname, '.env'),
    }),
    // 缓存模块
    CacheModule.register({
      isGlobal: true, // 全局可用
      ttl: 60 * 60 * 1000, // 默认缓存1小时
    }),
    // 数据库模块
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        try {
          return await createTypeOrmOptions(configService);
        } catch (error) {
          // 记录错误但不中断启动
          console.warn('数据库连接失败，但将继续启动应用:', error.message);
          return null;
        }
      },
    }),
    // 安全中间件模块
    MiddlewaresModule,
    // 业务模块
    EmailModule,
    UploadModule,
    OauthModule,
    QueueModule,
    AuthModule,
    UserModule,
    BlogModule,
    CaptchaModule,
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    ChatModule,
    ToolsModule,
    OnlineModule,
    AdminModule,
    DifyModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      exclude: ['/api*'],
    }),
    LogModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: TokenBlacklistGuard,
    },
    {
      provide: IpService,
      useFactory: (httpService: HttpService, configService: ConfigService) => {
        return new IpService(httpService, configService);
      },
      inject: [HttpService, ConfigService],
    },
    // 全局日志拦截器
    {
      provide: APP_INTERCEPTOR,
      useClass: VisitLogInterceptor,
    },
    // 全局操作日志拦截器
    {
      provide: APP_INTERCEPTOR,
      useClass: OperationLogInterceptor,
    },
    // 在线用户拦截器
    {
      provide: APP_INTERCEPTOR,
      useClass: OnlineUserInterceptor,
    },
    // 全局异常过滤器
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    // HTTP异常过滤器
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
  exports: [IpService],
})
export class AppModule {}
