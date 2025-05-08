import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SiteConfig } from '../blog/entities/site-config.entity';
import { BaiduTextCensorService } from './services/baidu-text-censor.service';
import { LocalTextFilterService } from './services/local-text-filter.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
    }),
    ConfigModule,
    TypeOrmModule.forFeature([SiteConfig]),
  ],
  providers: [BaiduTextCensorService, LocalTextFilterService],
  exports: [BaiduTextCensorService, LocalTextFilterService],
})
export class ToolsModule {}
