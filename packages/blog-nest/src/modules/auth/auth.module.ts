import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController, AdminAuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { JwtStrategy } from 'src/common/strategies/jwt.strategy';
import { CaptchaModule } from '../captcha/captcha.module';
import { QueueModule } from '../queue/queue.module';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { OnlineModule } from '../online/online.module';
import { BlogModule } from '../blog/blog.module';

@Module({
  imports: [
    PassportModule,
    UserModule,
    CaptchaModule,
    ConfigModule,
    QueueModule,
    OnlineModule,
    BlogModule,
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        store: await redisStore({
          socket: {
            host: configService.get('redis.host', 'localhost'),
            port: configService.get('redis.port', 6379),
          },
          ttl: 60 * 5 * 1000, // 默认缓存5分钟
        }),
      }),
      inject: [ConfigService],
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('jwt.secret'),
        signOptions: { expiresIn: configService.get('jwt.expiresIn') },
      }),
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController, AdminAuthController],
  exports: [AuthService],
})
export class AuthModule {}
