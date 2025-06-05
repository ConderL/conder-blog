import { Controller, Get } from '@nestjs/common';
import { Public } from '../../../common/decorators/public.decorator';
import { HitokotoService } from '../services/hitokoto.service';

@Controller('hitokoto')
export class HitokotoController {
  constructor(private readonly hitokotoService: HitokotoService) {}

  @Public()
  @Get()
  getRandomHitokoto() {
    return this.hitokotoService.getRandomHitokoto();
  }
}
