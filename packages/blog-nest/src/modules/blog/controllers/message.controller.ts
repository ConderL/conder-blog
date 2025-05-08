import { Controller, Get, Post, Body, Query, Logger, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { Request } from 'express';
import { MessageService } from '../services/message.service';
import { Result } from '../../../common/result';
import { IpService } from '../../../services/ip.service';
import { CreateMessageDto } from '../dto/create-message.dto';

/**
 * 前台留言控制器
 * 用于用户查看和提交留言
 */
@ApiTags('留言管理')
@Controller('message')
export class MessageController {
  private logger = new Logger(MessageController.name);

  constructor(
    private readonly messageService: MessageService,
    private readonly ipService: IpService,
  ) {}

  /**
   * 获取留言列表
   * 仅返回审核通过的留言
   */
  @ApiOperation({
    summary: '获取留言列表',
    description: '获取已审核通过的留言列表，按创建时间倒序排列',
  })
  @ApiQuery({ name: 'current', required: false, description: '当前页码，默认为1' })
  @ApiQuery({ name: 'size', required: false, description: '每页数量，默认为10' })
  @ApiResponse({
    status: 200,
    description: '返回留言列表及分页信息',
    schema: {
      example: {
        code: 200,
        message: '操作成功',
        data: {
          recordList: [
            {
              id: 1,
              nickname: '用户昵称',
              avatar: '头像URL',
              messageContent: '留言内容',
              ipAddress: 'IP地址',
              ipSource: 'IP来源',
              isCheck: 1,
              createTime: '2023-01-01 00:00:00',
              updateTime: '2023-01-01 00:00:00',
            },
          ],
          count: 1,
          total: 10,
          current: 1,
          size: 10,
        },
      },
    },
  })
  @Get('list')
  async findAll(@Query('current') current = 1, @Query('size') size = 10) {
    try {
      this.logger.log(`获取留言列表: current=${current}, size=${size}`);

      // 转换参数类型
      const params = {
        current: +current,
        size: +size,
      };

      // 只查询审核通过的留言
      const { records } = await this.messageService.findAll(
        params.current,
        params.size,
        undefined, // 昵称参数为空
        1, // isCheck=1 表示只查询审核通过的留言
        false, // showAll=false 表示不显示所有留言，只显示已审核的
      );

      return Result.ok(records);
    } catch (error) {
      this.logger.error(`获取留言列表失败: ${error.message}`);
      return Result.fail('获取留言列表失败');
    }
  }

  /**
   * 提交留言
   * 自动记录用户IP和地理位置
   */
  @ApiOperation({
    summary: '提交留言',
    description: '提交新留言，系统会自动记录用户IP和地址',
  })
  @ApiResponse({
    status: 200,
    description: '留言提交成功',
    schema: {
      example: {
        code: 200,
        message: '留言成功',
        data: {
          id: 1,
          nickname: '用户昵称',
          avatar: '头像URL',
          messageContent: '留言内容',
          ipAddress: 'IP地址',
          ipSource: 'IP来源',
          isCheck: 1,
          createTime: '2023-01-01 00:00:00',
          updateTime: '2023-01-01 00:00:00',
        },
      },
    },
  })
  @Post('add')
  async create(@Body() messageData: CreateMessageDto, @Req() request: Request) {
    try {
      this.logger.log(`提交留言: ${JSON.stringify(messageData)}`);

      // 获取用户IP和地址
      const ipAddress = this.ipService.getClientIp(request);
      let ipSource = '未知';
      try {
        ipSource = await this.ipService.getIpSource(ipAddress);
      } catch (ipError) {
        this.logger.error(`获取IP来源失败: ${ipError.message}`);
      }

      // 构建留言对象
      const message = {
        nickname: messageData.nickname,
        avatar: messageData.avatar,
        messageContent: messageData.messageContent,
        ipAddress,
        ipSource,
      };

      // 保存留言
      const result = await this.messageService.create(message);

      return Result.ok(result, '留言成功');
    } catch (error) {
      this.logger.error(`提交留言失败: ${error.message}`);
      return Result.fail('提交留言失败');
    }
  }
}
