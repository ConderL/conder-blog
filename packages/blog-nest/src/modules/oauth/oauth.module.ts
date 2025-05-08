import { Module, Logger } from '@nestjs/common';
import { OauthService } from './services/oauth.service';
import { OauthController } from './controllers/oauth.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OauthUserEntity } from './entities/oauth-user.entity';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { OauthLoginController } from './controllers/oauth-login.controller';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([OauthUserEntity]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('jwt.secret'),
        signOptions: {
          expiresIn: configService.get('jwt.expiresIn') || '24h',
        },
      }),
    }),
    UserModule,
  ],
  providers: [OauthService, Logger],
  controllers: [OauthController, OauthLoginController],
  exports: [OauthService],
})
export class OauthModule {}
