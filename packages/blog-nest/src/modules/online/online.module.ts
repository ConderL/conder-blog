import { Module } from '@nestjs/common';
import { OnlineController } from './online.controller';
import { OnlineService } from './online.service';
import { RedisModule } from '../../redis/redis.module';

/**
 * 在线用户模块
 */
@Module({
  imports: [RedisModule],
  controllers: [OnlineController],
  providers: [OnlineService],
  exports: [OnlineService],
})
export class OnlineModule {}
