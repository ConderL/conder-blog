import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CaptchaController } from './captcha.controller';
import { CaptchaService } from './captcha.service';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [ConfigModule, CommonModule],
  controllers: [CaptchaController],
  providers: [CaptchaService],
  exports: [CaptchaService],
})
export class CaptchaModule {}
