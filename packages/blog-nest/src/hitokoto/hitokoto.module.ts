import { Module } from '@nestjs/common';
import { HitokotoController } from './hitokoto.controller';

@Module({
  controllers: [HitokotoController],
})
export class HitokotoModule {}
