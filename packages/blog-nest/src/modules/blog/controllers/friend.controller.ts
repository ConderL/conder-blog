import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { FriendService } from '../services/friend.service';
import { Friend } from '../entities/friend.entity';

@ApiTags('友链管理')
@Controller('friend')
export class FriendController {
  constructor(private readonly friendService: FriendService) {}

  @Get('list')
  @ApiOperation({ summary: '获取友链列表' })
  async findAll(): Promise<Friend[]> {
    return this.friendService.findAll();
  }
}
