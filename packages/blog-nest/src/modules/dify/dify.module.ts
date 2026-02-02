import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { DifyService } from './services/dify.service';
import { DifyController } from './controllers/dify.controller';
import { BlogModule } from '../blog/blog.module';

@Module({
  imports: [
    HttpModule.register({
      timeout: 30000,
      maxRedirects: 5,
    }),
    ConfigModule,
    BlogModule, // 导入BlogModule以使用AnimeService
  ],
  providers: [DifyService],
  controllers: [DifyController],
  exports: [DifyService],
})
export class DifyModule {}
