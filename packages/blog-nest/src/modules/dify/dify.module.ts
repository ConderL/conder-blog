import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { DifyService } from './services/dify.service';
import { DifyController } from './controllers/dify.controller';

@Module({
  imports: [
    HttpModule.register({
      timeout: 30000,
      maxRedirects: 5,
    }),
    ConfigModule,
  ],
  providers: [DifyService],
  controllers: [DifyController],
  exports: [DifyService],
})
export class DifyModule { }


