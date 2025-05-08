import { Controller, Get, Query, Delete, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ChatService } from '../services/chat.service';
import { Result } from '../../../common/result';
import { Auth, Role } from '../../../decorators/auth.decorator';

/**
 * 聊天控制器
 */
@ApiTags('聊天管理')
@Controller('chat')
export class ChatController {
  private readonly logger = new Logger(ChatController.name);

  constructor(private readonly chatService: ChatService) {}

  /**
   * 获取历史消息
   */
  @ApiOperation({ summary: '获取历史消息' })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    schema: {
      example: {
        code: 200,
        message: '操作成功',
        data: [
          {
            id: 1,
            nickname: '用户1',
            avatar: 'http://example.com/avatar.jpg',
            content: '你好！',
            ipAddress: '127.0.0.1',
            ipSource: '内网IP',
            type: 1,
            createTime: '2023-01-01 00:00:00',
          },
        ],
      },
    },
  })
  @Get('history')
  async getHistory(@Query('limit') limit = 100) {
    try {
      this.logger.log(`获取历史聊天消息, limit: ${limit}`);
      const history = await this.chatService.getHistory(+limit);
      return Result.ok(history.reverse());
    } catch (error) {
      this.logger.error(`获取历史聊天消息失败: ${error.message}`);
      return Result.fail('获取历史聊天消息失败');
    }
  }

  /**
   * 清空历史消息
   */
  @ApiOperation({ summary: '清空历史消息' })
  @ApiResponse({
    status: 200,
    description: '清空成功',
    schema: {
      example: {
        code: 200,
        message: '清空成功',
        data: null,
      },
    },
  })
  @Delete('clear')
  @Auth(Role.ADMIN)
  async clearHistory() {
    try {
      this.logger.log('清空历史聊天消息');
      await this.chatService.clearHistory();
      return Result.ok(null, '清空成功');
    } catch (error) {
      this.logger.error(`清空历史聊天消息失败: ${error.message}`);
      return Result.fail('清空历史聊天消息失败');
    }
  }
}
