import { Controller, Get, Delete, Param, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { OnlineService } from './online.service';
import { OnlineUserDto } from './dto/online-user.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { RequiredPermission } from '../../common/decorators/required-permission.decorator';

/**
 * 在线用户控制器
 */
@ApiTags('在线用户管理')
@Controller('monitor/online')
@ApiBearerAuth()
export class OnlineController {
  constructor(private readonly onlineService: OnlineService) {}

  /**
   * 获取在线用户列表
   */
  @Get()
  @RequiredPermission('monitor:online:list')
  @ApiOperation({ summary: '获取在线用户列表' })
  @ApiResponse({
    status: 200,
    description: '返回在线用户列表',
    type: [OnlineUserDto],
  })
  async getOnlineUsers(): Promise<OnlineUserDto[]> {
    return this.onlineService.getOnlineUsers();
  }

  /**
   * 强制用户下线
   */
  @Delete(':tokenId')
  @RequiredPermission('monitor:online:kick')
  @ApiOperation({ summary: '强制用户下线' })
  @ApiParam({ name: 'tokenId', description: '会话ID' })
  @ApiResponse({
    status: 200,
    description: '下线成功',
  })
  async forceOffline(@Param('tokenId') tokenId: string): Promise<void> {
    await this.onlineService.forceOffline(tokenId);
  }

  /**
   * 获取在线用户数量
   */
  @Get('count')
  @ApiOperation({ summary: '获取在线用户数量' })
  @ApiResponse({
    status: 200,
    description: '返回在线用户数量',
    type: Number,
  })
  async getOnlineUserCount(): Promise<number> {
    return this.onlineService.getOnlineUserCount();
  }

  /**
   * 获取用户会话列表
   */
  @Get('user/:userId')
  @RequiredPermission('monitor:online:list')
  @ApiOperation({ summary: '获取用户会话列表' })
  @ApiParam({ name: 'userId', description: '用户ID' })
  @ApiResponse({
    status: 200,
    description: '返回用户会话列表',
    type: [OnlineUserDto],
  })
  async getUserSessions(@Param('userId') userId: number): Promise<OnlineUserDto[]> {
    return this.onlineService.getUserSessions(userId);
  }

  /**
   * 清除过期会话
   */
  @Delete('expired')
  @RequiredPermission('monitor:online:kick')
  @ApiOperation({ summary: '清除过期会话' })
  @ApiResponse({
    status: 200,
    description: '清除成功，返回清除的会话数',
    type: Number,
  })
  async clearExpiredSessions(@Query('expireTime') expireTime: number): Promise<number> {
    return this.onlineService.clearExpiredSessions(expireTime);
  }
}
