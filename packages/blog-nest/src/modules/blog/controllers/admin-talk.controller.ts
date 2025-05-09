import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Query,
  Logger,
  Req,
  Param,
  ParseIntPipe,
  Put,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { TalkService } from '../services/talk.service';
import { Result } from '../../../common/result';
import { Auth } from '../../../decorators/auth.decorator';
import { Public } from '../../../common/decorators/public.decorator';
import { CommentService } from '../services/comment.service';
import { CommentType } from '../entities/comment.entity';
import { OperationLog } from '../../../common/decorators/operation-log.decorator';
import { OperationType } from '../../../common/enums/operation-type.enum';
import { UserService } from '../../user/user.service';
import { RedisService } from '../../../redis/redis.service';
import { RedisConstant } from '../../../common/constants/redis.constant';

/**
 * 管理端说说控制器
 * 用于管理员管理说说
 */
@ApiTags('管理端说说管理')
@Controller('admin/talk')
@Auth()
export class AdminTalkController {
  private logger = new Logger(AdminTalkController.name);

  constructor(private readonly talkService: TalkService) {}

  /**
   * 获取说说列表（后台）
   * 支持按内容关键词和状态筛选
   */
  @ApiOperation({
    summary: '获取说说列表',
    description: '获取所有说说列表，支持按内容关键词和状态筛选',
  })
  @ApiQuery({ name: 'current', required: false, description: '当前页码，默认为1' })
  @ApiQuery({ name: 'size', required: false, description: '每页数量，默认为10' })
  @ApiQuery({ name: 'keyword', required: false, description: '关键词' })
  @ApiQuery({ name: 'status', required: false, description: '状态（1-公开，2-私密）' })
  @ApiResponse({
    status: 200,
    description: '返回说说列表及分页信息',
    schema: {
      example: {
        code: 200,
        message: '操作成功',
        data: {
          recordList: [
            {
              id: 1,
              userId: 1,
              talkContent: '说说内容',
              images: '图片URL',
              isTop: 0,
              status: 1,
              createTime: '2023-01-01 00:00:00',
              updateTime: '2023-01-01 00:00:00',
              user: {
                id: 1,
                username: '用户名',
                nickname: '用户昵称',
                avatar: '头像URL',
              },
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
  async findAll(
    @Query('current') current = 1,
    @Query('size') size = 10,
    @Query('keyword') keyword?: string,
    @Query('status') status?: number,
  ) {
    try {
      this.logger.log(
        `获取说说列表: current=${current}, size=${size}, keyword=${keyword}, status=${status}`,
      );

      // 转换参数类型
      const params = {
        current: +current,
        size: +size,
        keyword,
        status: status !== undefined ? (Number.isNaN(+status) ? undefined : +status) : undefined,
      };

      const { records, count } = await this.talkService.findAll(
        params.current,
        params.size,
        params.keyword,
        params.status,
      );

      return Result.ok({
        recordList: records,
        count: records.length,
        total: count,
        current: params.current,
        size: params.size,
      });
    } catch (error) {
      this.logger.error(`获取说说列表失败: ${error.message}`);
      return Result.fail('获取说说列表失败');
    }
  }

  /**
   * 发布说说
   */
  @ApiOperation({ summary: '发布说说', description: '创建一条新的说说' })
  @ApiResponse({
    status: 200,
    description: '发布成功',
    schema: {
      example: {
        code: 200,
        message: '发布成功',
        data: {
          id: 1,
          userId: 1,
          talkContent: '说说内容',
          images: '图片URL',
          isTop: 0,
          status: 1,
          createTime: '2023-01-01 00:00:00',
          updateTime: '2023-01-01 00:00:00',
        },
      },
    },
  })
  @Post('add')
  @OperationLog(OperationType.CREATE)
  async create(@Body() talkData: any, @Req() req: any) {
    try {
      this.logger.log(`发布说说: ${JSON.stringify(talkData)}`);

      // 获取当前登录用户ID
      const userId = req.user?.id || req.user?.userId || req.user?.sub;

      if (!userId) {
        return Result.fail('无法获取用户ID，请重新登录');
      }

      // 创建说说数据对象
      const talk = {
        userId,
        talkContent: talkData.talkContent,
        images: talkData.images || '',
        isTop: talkData.isTop || 0,
        status: talkData.status || 1,
      };

      const result = await this.talkService.create(talk);

      return Result.ok(result, '发布成功');
    } catch (error) {
      this.logger.error(`发布说说失败: ${error.message}`);
      return Result.fail('发布说说失败');
    }
  }

  /**
   * 删除说说
   */
  @ApiOperation({ summary: '删除说说', description: '根据ID删除说说' })
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
  @Delete('delete/:id')
  @OperationLog(OperationType.DELETE)
  async remove(@Param('id') id: number) {
    try {
      this.logger.log(`删除说说: id=${id}`);
      await this.talkService.remove(id);
      return Result.ok(null, '删除成功');
    } catch (error) {
      this.logger.error(`删除说说失败: ${error.message}`);
      return Result.fail('删除说说失败');
    }
  }

  /**
   * 更新说说置顶状态
   */
  @ApiOperation({ summary: '更新说说置顶状态', description: '更新说说的置顶状态' })
  @ApiResponse({
    status: 200,
    description: '更新成功',
    schema: {
      example: {
        code: 200,
        message: '更新成功',
        data: null,
      },
    },
  })
  @Post('top')
  @OperationLog(OperationType.UPDATE)
  async updateTopStatus(@Body() body: { id: number; isTop: number }) {
    try {
      this.logger.log(`更新说说置顶状态: id=${body.id}, isTop=${body.isTop}`);
      await this.talkService.updateTopStatus(body.id, body.isTop);
      return Result.ok(null, '更新成功');
    } catch (error) {
      this.logger.error(`更新说说置顶状态失败: ${error.message}`);
      return Result.fail('更新说说置顶状态失败');
    }
  }

  /**
   * 获取说说编辑信息
   */
  @ApiOperation({ summary: '获取说说编辑信息', description: '根据ID获取说说信息用于编辑' })
  @ApiParam({ name: 'id', description: '说说ID' })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    schema: {
      example: {
        code: 200,
        message: '获取成功',
        data: {
          id: 1,
          talkContent: '说说内容',
          images: '图片URL',
          imgList: ['图片URL1', '图片URL2'],
          isTop: 0,
          status: 1,
        },
      },
    },
  })
  @Get('edit/:id')
  async findById(@Param('id') id: number) {
    try {
      this.logger.log(`获取说说编辑信息: id=${id}`);

      const talk = await this.talkService.findById(+id);

      if (!talk) {
        return Result.fail('说说不存在');
      }

      // 将图片字符串转换为数组方便前端显示
      const imgList = talk.images ? talk.images.split(',').filter((img) => img) : [];

      const talkDto = {
        id: talk.id,
        talkContent: talk.talkContent,
        images: talk.images,
        imgList: imgList,
        isTop: talk.isTop,
        status: talk.status,
      };

      return Result.ok(talkDto, '获取成功');
    } catch (error) {
      this.logger.error(`获取说说编辑信息失败: ${error.message}`);
      return Result.fail('获取说说编辑信息失败');
    }
  }

  /**
   * 更新说说
   */
  @ApiOperation({ summary: '更新说说', description: '更新已有的说说' })
  @ApiResponse({
    status: 200,
    description: '更新成功',
    schema: {
      example: {
        code: 200,
        message: '更新成功',
        data: null,
      },
    },
  })
  @Put('update')
  @OperationLog(OperationType.UPDATE)
  async update(@Body() talkData: any) {
    try {
      this.logger.log(`更新说说: ${JSON.stringify(talkData)}`);

      if (!talkData.id) {
        return Result.fail('说说ID不能为空');
      }

      // 创建更新数据对象
      const talk = {
        talkContent: talkData.talkContent,
        images: talkData.images || '',
        isTop: talkData.isTop || 0,
        status: talkData.status || 1,
      };

      await this.talkService.update(talkData.id, talk);

      return Result.ok(null, '更新成功');
    } catch (error) {
      this.logger.error(`更新说说失败: ${error.message}`);
      return Result.fail('更新说说失败');
    }
  }
}

@ApiTags('博客端说说管理')
@Controller('talk')
@Public()
export class TalkController {
  private logger = new Logger(TalkController.name);

  constructor(
    private readonly talkService: TalkService,
    private readonly commentService: CommentService,
    private readonly userService: UserService,
    private readonly redisService: RedisService,
  ) {}

  /**
   * 获取主页简化说说列表
   */
  @ApiOperation({
    summary: '获取主页说说列表',
    description: '获取简化的说说列表，只返回内容',
  })
  @ApiQuery({ name: 'limit', required: false, description: '返回数量，默认为3' })
  @Get('home')
  async getHomeList(@Query('limit') limit = 3) {
    try {
      this.logger.log(`获取主页说说列表: limit=${limit}`);

      // 转换参数类型
      const params = {
        current: 1,
        size: +limit,
        status: 1, // 只获取公开的说说
      };

      const { records } = await this.talkService.findAll(
        params.current,
        params.size,
        undefined, // 不需要关键词过滤
        params.status,
      );

      // 只提取说说内容
      const talkContents = records.map((talk) => talk.talkContent);

      return {
        flag: true,
        code: 200,
        msg: '操作成功',
        data: talkContents,
      };
    } catch (error) {
      this.logger.error(`获取主页说说列表失败: ${error.message}`);
      return {
        flag: false,
        code: 500,
        msg: '获取说说列表失败',
        data: null,
      };
    }
  }

  /**
   * 获取说说列表（前台）
   */
  @ApiOperation({
    summary: '获取说说列表',
    description: '获取所有公开的说说列表',
  })
  @ApiQuery({ name: 'current', required: false, description: '当前页码，默认为1' })
  @ApiQuery({ name: 'size', required: false, description: '每页数量，默认为10' })
  @Get('list')
  async findAll(@Query('current') current = 1, @Query('size') size = 10) {
    try {
      this.logger.log(`获取前台说说列表: current=${current}, size=${size}`);

      // 转换参数类型
      const params = {
        current: +current,
        size: +size,
        status: 1, // 只获取公开的说说
      };

      const { records, count } = await this.talkService.findAll(
        params.current,
        params.size,
        undefined, // 不需要关键词过滤
        params.status,
      );

      // 格式化数据为前端需要的格式并获取评论数量
      const recordListPromises = records.map(async (talk) => {
        // 获取说说的评论数量，commentType=3代表说说评论
        const commentCount = await this.commentService.countCommentsByTypeAndId(
          talk.id,
          CommentType.TALK,
        );

        // 获取说说的点赞数
        const likeCount = await this.redisService.getHash(
          RedisConstant.TALK_LIKE_COUNT,
          talk.id.toString(),
        );

        return {
          id: talk.id,
          nickname: talk.user?.nickname || talk.user?.username || '匿名用户',
          avatar: talk.user?.avatar || 'https://img.conder.top/config/default_avatar.jpg',
          talkContent: talk.talkContent,
          imgList: talk.images ? talk.images.split(',').filter((img) => img) : [],
          isTop: talk.isTop,
          likeCount, // 从Redis获取实际点赞数
          commentCount, // 设置实际的评论数量
          createTime: talk.createTime,
        };
      });

      const recordList = await Promise.all(recordListPromises);

      return {
        flag: true,
        code: 200,
        msg: '操作成功',
        data: {
          recordList,
          count,
        },
      };
    } catch (error) {
      this.logger.error(`获取前台说说列表失败: ${error.message}`);
      return {
        flag: false,
        code: 500,
        msg: '获取说说列表失败',
        data: null,
      };
    }
  }

  /**
   * 获取说说详情
   */
  @ApiOperation({ summary: '获取说说详情', description: '根据ID获取说说详情' })
  @ApiParam({ name: 'id', description: '说说ID' })
  @Get(':id')
  async findById(@Param('id') id: string) {
    try {
      this.logger.log(`获取说说详情: id=${id}`);

      const talk = await this.talkService.findById(+id);

      if (!talk) {
        return {
          flag: false,
          code: 404,
          msg: '说说不存在',
          data: null,
        };
      }

      // 只允许查看公开的说说
      if (talk.status !== 1) {
        return {
          flag: false,
          code: 403,
          msg: '说说不可见',
          data: null,
        };
      }

      // 获取说说的评论数量，commentType=3代表说说评论
      const commentCount = await this.commentService.countCommentsByTypeAndId(
        talk.id,
        CommentType.TALK,
      );

      // 获取说说的点赞数
      const likeCount = await this.redisService.getHash(
        RedisConstant.TALK_LIKE_COUNT,
        talk.id.toString(),
      );

      // 格式化数据为前端需要的格式
      const formattedTalk = {
        id: talk.id,
        nickname: talk.user?.nickname || talk.user?.username || '匿名用户',
        avatar: talk.user?.avatar || 'https://img.conder.top/config/default_avatar.jpg',
        talkContent: talk.talkContent,
        imgList: talk.images ? talk.images.split(',').filter((img) => img) : [],
        isTop: talk.isTop,
        likeCount, // 从Redis获取实际点赞数
        commentCount, // 设置实际的评论数量
        createTime: talk.createTime,
      };

      return {
        flag: true,
        code: 200,
        msg: '操作成功',
        data: formattedTalk,
      };
    } catch (error) {
      this.logger.error(`获取说说详情失败: ${error.message}`);
      return {
        flag: false,
        code: 500,
        msg: '获取说说详情失败',
        data: null,
      };
    }
  }

  /**
   * 点赞说说
   */
  @Post(':id/like')
  @ApiOperation({ summary: '点赞或取消点赞说说', description: '根据用户是否已点赞进行相应操作' })
  @ApiBearerAuth()
  @Auth()
  async likeTalk(@Param('id', ParseIntPipe) id: number, @Req() req: any): Promise<any> {
    try {
      const userId = req.user?.id || req.user?.userId || req.user?.sub;

      if (!userId) {
        return Result.fail('无法获取用户ID，请重新登录');
      }

      // 获取用户点赞集合的键
      const key = `${RedisConstant.USER_TALK_LIKE}${userId}`;

      // 检查用户是否已经点赞过该说说
      const isLiked = await this.redisService.sismember(key, id.toString());

      let likeCount = 0;

      if (isLiked) {
        // 如果已点赞，则取消点赞
        await this.redisService.srem(key, id.toString());
        // 减少点赞数
        const currentLikes = await this.redisService.getHash(
          RedisConstant.TALK_LIKE_COUNT,
          id.toString(),
        );
        if (currentLikes > 0) {
          likeCount = await this.redisService.hincrby(
            RedisConstant.TALK_LIKE_COUNT,
            id.toString(),
            -1,
          );
        }
        this.logger.log(`用户 ${userId} 取消点赞说说 ${id}, 当前点赞数: ${likeCount}`);
      } else {
        // 如果未点赞，则添加点赞
        await this.redisService.sadd(key, id.toString());
        // 增加点赞数
        likeCount = await this.redisService.hincrby(
          RedisConstant.TALK_LIKE_COUNT,
          id.toString(),
          1,
        );
        this.logger.log(`用户 ${userId} 点赞说说 ${id}, 当前点赞数: ${likeCount}`);
      }

      return Result.ok({ likeCount }, isLiked ? '取消点赞成功' : '点赞成功');
    } catch (error) {
      this.logger.error(`点赞操作失败: ${error.message}`);
      return Result.fail('操作失败: ' + error.message);
    }
  }
}
