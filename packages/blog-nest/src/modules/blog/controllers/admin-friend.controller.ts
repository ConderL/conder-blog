import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Logger,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { FriendService } from '../services/friend.service';
import { Result } from '../../../common/result';
import { Auth } from '../../../decorators/auth.decorator';
import { IsNotEmpty, IsString, IsNumber, IsUrl } from 'class-validator';
import { Type } from 'class-transformer';
import { OperationLog } from '../../../common/decorators/operation-log.decorator';
import { OperationType } from '../../../common/enums/operation-type.enum';

/**
 * 创建友链DTO
 */
class CreateFriendDto {
  /**
   * 友链名称
   */
  @IsNotEmpty({ message: '友链名称不能为空' })
  @IsString()
  name: string;

  /**
   * 友链颜色
   */
  @IsNotEmpty({ message: '友链颜色不能为空' })
  @IsString()
  color: string;

  /**
   * 友链头像
   */
  @IsNotEmpty({ message: '友链头像不能为空' })
  @IsUrl({}, { message: '友链头像必须是有效URL' })
  avatar: string;

  /**
   * 友链地址
   */
  @IsNotEmpty({ message: '友链地址不能为空' })
  @IsUrl({}, { message: '友链地址必须是有效URL' })
  url: string;

  /**
   * 友链介绍
   */
  @IsNotEmpty({ message: '友链介绍不能为空' })
  @IsString()
  introduction: string;
}

/**
 * 更新友链DTO
 */
class UpdateFriendDto extends CreateFriendDto {
  /**
   * 友链ID
   */
  @IsNotEmpty({ message: '友链ID不能为空' })
  @IsNumber()
  @Type(() => Number)
  id: number;
}

/**
 * 管理端友链控制器
 */
@ApiTags('管理端友链管理')
@Controller('admin/friend')
@Auth()
export class AdminFriendController {
  private readonly logger = new Logger(AdminFriendController.name);

  constructor(private readonly friendService: FriendService) {}

  /**
   * 获取友链列表
   */
  @ApiOperation({ summary: '获取友链列表' })
  @ApiQuery({ name: 'current', required: false, description: '当前页码，默认为1' })
  @ApiQuery({ name: 'size', required: false, description: '每页数量，默认为10' })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    schema: {
      example: {
        code: 200,
        message: '操作成功',
        data: {
          recordList: [
            {
              id: 1,
              name: '示例博客',
              color: '#007BFF',
              avatar: 'https://example.com/avatar.jpg',
              url: 'https://example.com',
              introduction: '一个示例博客',
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
      this.logger.log(`获取友链列表: current=${current}, size=${size}`);

      // 转换参数类型
      const params = {
        current: +current,
        size: +size,
      };

      const { friends, total } = await this.friendService.findPage(params.current, params.size);

      return Result.ok({
        recordList: friends,
        count: friends.length,
        total,
        current: params.current,
        size: params.size,
      });
    } catch (error) {
      this.logger.error(`获取友链列表失败: ${error.message}`);
      return Result.fail('获取友链列表失败');
    }
  }

  /**
   * 获取友链详情
   */
  @ApiOperation({ summary: '获取友链详情' })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    schema: {
      example: {
        code: 200,
        message: '操作成功',
        data: {
          id: 1,
          name: '示例博客',
          color: '#007BFF',
          avatar: 'https://example.com/avatar.jpg',
          url: 'https://example.com',
          introduction: '一个示例博客',
          createTime: '2023-01-01 00:00:00',
          updateTime: '2023-01-01 00:00:00',
        },
      },
    },
  })
  @Get(':id')
  async findOne(@Param('id') id: number) {
    try {
      this.logger.log(`获取友链详情: id=${id}`);

      const friend = await this.friendService.findById(+id);

      if (!friend) {
        return Result.fail('友链不存在', 404);
      }

      return Result.ok(friend);
    } catch (error) {
      this.logger.error(`获取友链详情失败: ${error.message}`);
      return Result.fail('获取友链详情失败');
    }
  }

  /**
   * 添加友链
   */
  @ApiOperation({ summary: '添加友链' })
  @ApiResponse({
    status: 200,
    description: '添加成功',
    schema: {
      example: {
        code: 200,
        message: '添加成功',
        data: {
          id: 1,
          name: '示例博客',
          color: '#007BFF',
          avatar: 'https://example.com/avatar.jpg',
          url: 'https://example.com',
          introduction: '一个示例博客',
          createTime: '2023-01-01 00:00:00',
          updateTime: '2023-01-01 00:00:00',
        },
      },
    },
  })
  @Post('add')
  @OperationLog(OperationType.CREATE)
  async create(@Body() createFriendDto: CreateFriendDto) {
    try {
      this.logger.log(`添加友链: ${JSON.stringify(createFriendDto)}`);

      const friend = await this.friendService.create(createFriendDto);

      return Result.ok(friend, '添加成功');
    } catch (error) {
      this.logger.error(`添加友链失败: ${error.message}`);
      return Result.fail('添加友链失败');
    }
  }

  /**
   * 更新友链
   */
  @ApiOperation({ summary: '更新友链' })
  @ApiResponse({
    status: 200,
    description: '更新成功',
    schema: {
      example: {
        code: 200,
        message: '更新成功',
        data: {
          id: 1,
          name: '示例博客',
          color: '#007BFF',
          avatar: 'https://example.com/avatar.jpg',
          url: 'https://example.com',
          introduction: '一个示例博客',
          createTime: '2023-01-01 00:00:00',
          updateTime: '2023-01-01 00:00:00',
        },
      },
    },
  })
  @Put('update')
  @OperationLog(OperationType.UPDATE)
  async update(@Body() updateFriendDto: UpdateFriendDto) {
    try {
      const { id } = updateFriendDto;
      const friendData = { ...updateFriendDto };
      delete friendData.id; // 从更新数据中移除id

      this.logger.log(`更新友链: id=${id}`);

      // 检查友链是否存在
      const existingFriend = await this.friendService.findById(id);
      if (!existingFriend) {
        return Result.fail('友链不存在', 404);
      }

      const updatedFriend = await this.friendService.update(id, friendData);

      return Result.ok(updatedFriend, '更新成功');
    } catch (error) {
      this.logger.error(`更新友链失败: ${error.message}`);
      return Result.fail('更新友链失败');
    }
  }

  /**
   * 删除友链
   */
  @ApiOperation({ summary: '删除友链' })
  @ApiResponse({
    status: 200,
    description: '删除成功',
    schema: {
      example: {
        code: 200,
        message: '删除成功',
        data: null,
      },
    },
  })
  @Delete('delete')
  @OperationLog(OperationType.DELETE)
  async remove(@Body() ids: number[]) {
    try {
      this.logger.log(`删除友链: ids=${ids}`);

      await this.friendService.remove(ids);

      return Result.ok(null, '删除成功');
    } catch (error) {
      this.logger.error(`删除友链失败: ${error.message}`);
      return Result.fail('删除友链失败');
    }
  }
}
