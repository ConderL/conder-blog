import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Query,
  Req,
  Request,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { CommentService } from '../services/comment.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { ResultDto } from '../../../common/dtos/result.dto';
import { Comment } from '../entities/comment.entity';
import { OperationLog } from '../../../common/decorators/operation-log.decorator';
import { OperationType } from '../../../common/enums/operation-type.enum';
import { Public } from '../../../common/decorators/public.decorator';
import { UserService } from '../../user/user.service';
import { RedisService } from '../../../redis/redis.service';
import { RedisConstant } from '../../../common/constants/redis.constant';
import { CreateCommentDto } from '../dto/comment.dto';

@ApiTags('评论管理')
@Controller('comments')
export class CommentController {
  constructor(
    private readonly commentService: CommentService,
    private readonly userService: UserService,
    private readonly redisService: RedisService,
  ) {}

  @Post('add')
  @ApiOperation({ summary: '创建评论' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @OperationLog(OperationType.CREATE)
  async create(
    @Body() createCommentDto: CreateCommentDto,
    @Req() req: any,
  ): Promise<ResultDto<Comment>> {
    try {
      console.log('创建评论请求:', createCommentDto);
      console.log('请求用户信息:', req.user);

      // 确保能获取到用户ID
      const userId = req.user?.id || req.user?.userId || req.user?.sub;

      if (!userId) {
        console.error('无法获取用户ID，用户数据:', req.user);
        return ResultDto.fail('无法获取用户ID，请重新登录');
      }

      // 根据请求体构建评论数据
      const comment: Partial<Comment> = {
        content: createCommentDto.commentContent,
        typeId: createCommentDto.typeId,
        commentType: createCommentDto.commentType,
        parentId: createCommentDto.parentId || 0,
        replyId: createCommentDto.replyId || 0,
        toUid: createCommentDto.toUid || 0,
        userId: userId,
      };

      console.log('构建的评论数据:', comment);

      const result = await this.commentService.create(comment);
      return ResultDto.success(result, '评论成功');
    } catch (error) {
      console.error('创建评论失败:', error);
      return ResultDto.fail('创建评论失败: ' + error.message);
    }
  }

  /**
   * 获取评论列表
   */
  @Get('list')
  @ApiOperation({ summary: '获取评论列表' })
  async findAll(@Query() query): Promise<ResultDto<{ recordList: any[]; count: number }>> {
    try {
      // 解析并验证查询参数
      const page = Number(query.current) || Number(query.page) || 1;
      const limit = Number(query.size) || Number(query.limit) || 10;

      // 处理类型ID
      const typeId = query.typeId ? Number(query.typeId) : null;
      // 处理评论类型
      const commentType = query.commentType !== undefined ? Number(query.commentType) : null;

      // 前端API默认只显示已审核的评论
      const showAll = false;

      console.log(
        `获取评论列表: page=${page}, limit=${limit}, typeId=${typeId}, commentType=${commentType}, showAll=${showAll}`,
      );

      // 调用服务获取评论列表
      const [comments, count] = await this.commentService.findAll(
        page,
        limit,
        typeId,
        commentType,
        showAll,
      );

      // 格式化主评论
      const formattedComments = [];

      // 处理每条评论，获取其回复列表
      for (const comment of comments) {
        // 获取评论点赞数
        const likeCount =
          (await this.redisService.getHash(
            RedisConstant.COMMENT_LIKE_COUNT,
            comment.id.toString(),
          )) || 0;

        // 查询该评论的回复列表（限制3条）
        const replies = await this.commentService.getReplies(comment.id, 1, 3, showAll);
        const replyCount = await this.commentService.getReplyCount(comment.id);

        // 格式化回复列表
        const replyVOList = [];

        // 为每条回复获取被回复用户的昵称
        for (const reply of replies) {
          // 获取回复的点赞数
          const replyLikeCount =
            (await this.redisService.getHash(
              RedisConstant.COMMENT_LIKE_COUNT,
              reply.id.toString(),
            )) || 0;

          let toNickname = '';

          // 如果有指定回复用户ID，查找被回复用户
          if (reply.toUid) {
            try {
              const toUser = await this.commentService.findById(reply.toUid);
              if (toUser) {
                toNickname = toUser.user?.nickname || toUser.user?.username || '未知用户';
              }
            } catch (error) {
              console.error(`获取被回复用户昵称失败，用户ID: ${reply.toUid}`, error);
            }
          } else {
            // 如果没有指定回复用户ID，则是回复主评论，获取主评论用户昵称
            toNickname = comment.user?.nickname || comment.user?.username || '未知用户';
          }

          replyVOList.push({
            id: reply.id,
            fromNickname: reply.user?.nickname || reply.user?.username || '匿名用户',
            fromUid: reply.userId,
            avatar: reply.user?.avatar || 'http://img.conder.top/config/default_avatar.jpg',
            toUid: reply.toUid || comment.userId, // 如果没有指定，则使用主评论用户ID
            toNickname: toNickname,
            commentContent: reply.content,
            createTime: reply.createTime,
            likeCount: replyLikeCount,
          });
        }

        // 添加格式化后的评论
        formattedComments.push({
          id: comment.id,
          fromNickname: comment.user?.nickname || comment.user?.username || '匿名用户',
          fromUid: comment.userId,
          avatar: comment.user?.avatar || 'http://img.conder.top/config/default_avatar.jpg',
          commentContent: comment.content,
          createTime: comment.createTime,
          likeCount: likeCount,
          replyCount: replyCount, // 实际回复数量
          replyVOList: replyVOList, // 前3条回复列表
        });
      }

      return ResultDto.success({
        recordList: formattedComments,
        count,
        current: page,
        size: limit,
        total: count,
      });
    } catch (error) {
      console.error('获取评论列表失败:', error);
      return ResultDto.fail('获取评论列表失败: ' + error.message);
    }
  }

  /**
   * 获取最新评论
   */
  @Get('recent')
  @ApiOperation({ summary: '获取最新评论' })
  @Public()
  async getRecentComments(): Promise<ResultDto<any>> {
    try {
      console.log('接收到获取最新评论请求');
      // 只获取已审核的最新评论
      const recentComments = await this.commentService.getRecentComments(5);

      if (!recentComments || recentComments.length === 0) {
        return ResultDto.success([], '暂无评论');
      }

      // 只返回已审核的评论
      const filteredComments = recentComments.filter((comment) => comment.isCheck === 1);

      // 格式化评论数据
      const formattedComments = filteredComments.map((comment) => {
        // 处理用户信息
        const nickname = comment.user?.nickname || comment.user?.username || '匿名用户';
        const avatar = comment.user?.avatar || '';

        // 根据评论类型获取不同的标题
        let articleTitle = '未知内容';
        if (comment.commentType === 1 && comment.article) {
          // 文章评论
          articleTitle = comment.article.articleTitle || '未知文章';
        } else if (comment.commentType === 2) {
          // 友链评论
          articleTitle = '友情链接';
        } else if (comment.commentType === 3) {
          // 说说评论
          articleTitle = '说说';
        } else if (comment.commentType === 4) {
          // 留言评论
          articleTitle = '留言板';
        }

        return {
          id: comment.id,
          commentContent: comment.content,
          createTime: comment.createTime,
          fromUid: comment.userId,
          typeId: comment.typeId,
          commentType: comment.commentType,
          nickname,
          avatar,
          articleTitle,
        };
      });

      console.log(`成功获取最新评论，共${formattedComments.length}条`);
      return ResultDto.success(formattedComments);
    } catch (error) {
      console.error('获取最新评论失败:', error);
      return ResultDto.fail('获取最新评论失败: ' + error.message);
    }
  }

  /**
   * 获取文章评论列表(含子评论)
   */
  @Get('article/:articleId')
  @ApiOperation({ summary: '获取指定文章的评论树' })
  @ApiParam({ name: 'articleId', description: '文章ID' })
  async getArticleComments(@Param('articleId') articleId: number): Promise<ResultDto<any[]>> {
    try {
      console.log(`获取文章评论树, 文章ID: ${articleId}`);

      // 默认只显示已审核的评论
      const showAll = false;

      const comments = await this.commentService.findByArticleId(articleId, showAll);

      // 转换为前端期望的格式
      const formattedComments = [];

      for (const comment of comments) {
        // 获取评论点赞数
        const likeCount =
          (await this.redisService.getHash(
            RedisConstant.COMMENT_LIKE_COUNT,
            comment.id.toString(),
          )) || 0;

        // 格式化子评论
        const replyVOList = [];

        if (comment.children && comment.children.length > 0) {
          for (const reply of comment.children) {
            // 获取回复的点赞数
            const replyLikeCount =
              (await this.redisService.getHash(
                RedisConstant.COMMENT_LIKE_COUNT,
                reply.id.toString(),
              )) || 0;

            replyVOList.push({
              id: reply.id,
              fromNickname: reply.user?.nickname || reply.user?.username || '匿名用户',
              fromUid: reply.userId,
              avatar: reply.user?.avatar || 'http://img.conder.top/config/default_avatar.jpg',
              toUid: reply.toUid,
              toNickname: '', // 需要单独获取
              commentContent: reply.content,
              createTime: reply.createTime,
              likeCount: replyLikeCount,
            });
          }
        }

        // 格式化主评论
        formattedComments.push({
          id: comment.id,
          fromNickname: comment.user?.nickname || comment.user?.username || '匿名用户',
          fromUid: comment.userId,
          avatar: comment.user?.avatar || 'http://img.conder.top/config/default_avatar.jpg',
          commentContent: comment.content,
          createTime: comment.createTime,
          likeCount: likeCount,
          replyCount: comment['replyCount'] || comment.children?.length || 0,
          replyVOList: replyVOList,
        });
      }

      console.log(`格式化后的评论树结果: ${formattedComments.length}条评论`);
      return ResultDto.success(formattedComments);
    } catch (error) {
      console.error('获取文章评论树失败:', error);
      return ResultDto.fail('获取文章评论树失败: ' + error.message);
    }
  }

  /**
   * 获取评论树
   */
  @Get('tree/:articleId')
  @ApiOperation({ summary: '查询评论树' })
  async findTree(@Param('articleId') articleId: string): Promise<ResultDto<any[]>> {
    try {
      console.log(`获取评论树, 文章ID: ${articleId}`);

      // 根据评论服务实现，在findTree方法中添加过滤未审核评论的功能
      // 因为我们已经修改了CommentService，所有查询默认都会过滤未审核的评论
      const comments = await this.commentService.findTree(+articleId);

      // 进一步过滤未审核的评论
      const approvedComments = comments.filter((comment) => comment.isCheck === 1);

      // 转换为前端期望的格式
      const formattedComments = [];

      for (const comment of approvedComments) {
        // 获取评论点赞数
        const likeCount =
          (await this.redisService.getHash(
            RedisConstant.COMMENT_LIKE_COUNT,
            comment.id.toString(),
          )) || 0;

        // 子评论列表将通过另一个API获取
        formattedComments.push({
          id: comment.id,
          fromNickname: comment.user?.nickname || comment.user?.username || '匿名用户',
          fromUid: comment.userId,
          avatar: comment.user?.avatar || 'http://img.conder.top/config/default_avatar.jpg',
          commentContent: comment.content,
          createTime: comment.createTime,
          likeCount: likeCount,
          replyCount: 0, // 将通过单独查询获取
          replyVOList: [], // 初始为空，会由前端按需加载
        });
      }

      console.log(`格式化后的评论树结果: ${formattedComments.length}条评论`);
      return ResultDto.success(formattedComments);
    } catch (error) {
      console.error('获取评论树失败:', error);
      return ResultDto.fail('获取评论树失败: ' + error.message);
    }
  }

  /**
   * 获取评论详情
   */
  @Get(':id')
  @ApiOperation({ summary: '查询评论详情' })
  async findById(@Param('id') id: string): Promise<ResultDto<Comment>> {
    const result = await this.commentService.findById(+id);
    return ResultDto.success(result);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新评论' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @OperationLog(OperationType.UPDATE)
  async update(
    @Param('id') id: string,
    @Body() updateCommentDto: any,
  ): Promise<ResultDto<Comment>> {
    const result = await this.commentService.update(+id, updateCommentDto);
    return ResultDto.success(result);
  }

  /**
   * 点赞或取消点赞评论
   */
  @Post(':id/like')
  @ApiOperation({ summary: '点赞或取消点赞评论' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async likeComment(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ): Promise<ResultDto<any>> {
    try {
      const userId = req.user?.id || req.user?.userId || req.user?.sub;

      if (!userId) {
        return ResultDto.fail('无法获取用户ID，请重新登录');
      }

      // 获取用户点赞集合的键
      const key = `${RedisConstant.USER_COMMENT_LIKE}${userId}`;

      // 检查用户是否已经点赞过该评论
      const isLiked = await this.redisService.sismember(key, id.toString());

      let likeCount = 0;

      if (isLiked) {
        // 如果已点赞，则取消点赞
        await this.redisService.srem(key, id.toString());
        // 减少点赞数
        const currentLikes = await this.redisService.getHash(
          RedisConstant.COMMENT_LIKE_COUNT,
          id.toString(),
        );
        if (currentLikes > 0) {
          likeCount = await this.redisService.hincrby(
            RedisConstant.COMMENT_LIKE_COUNT,
            id.toString(),
            -1,
          );
        }
        console.log(`用户 ${userId} 取消点赞评论 ${id}, 当前点赞数: ${likeCount}`);
      } else {
        // 如果未点赞，则添加点赞
        await this.redisService.sadd(key, id.toString());
        // 增加点赞数
        likeCount = await this.redisService.hincrby(
          RedisConstant.COMMENT_LIKE_COUNT,
          id.toString(),
          1,
        );
        console.log(`用户 ${userId} 点赞评论 ${id}, 当前点赞数: ${likeCount}`);
      }

      return ResultDto.success({ likeCount }, isLiked ? '取消点赞成功' : '点赞成功');
    } catch (error) {
      console.error('点赞操作失败:', error);
      return ResultDto.fail('操作失败: ' + error.message);
    }
  }

  /**
   * 获取评论回复列表
   */
  @Get(':commentId/reply')
  @ApiOperation({ summary: '获取评论的回复列表' })
  @ApiParam({ name: 'commentId', description: '评论ID' })
  async getReplyList(
    @Param('commentId') commentId: number,
    @Query() query: any,
  ): Promise<ResultDto<any[]>> {
    try {
      console.log(`获取评论回复列表, 评论ID: ${commentId}`);
      const page = Number(query.current) || Number(query.page) || 1;
      const limit = Number(query.size) || Number(query.limit) || 5;

      // 获取回复
      const replies = await this.commentService.getReplies(commentId, page, limit);

      // 首先获取父评论信息，用于处理回复主评论的情况
      const parentComment = await this.commentService.findById(commentId);
      const parentUserNickname =
        parentComment?.user?.nickname || parentComment?.user?.username || '未知用户';

      // 格式化为前端期望的格式
      const formattedReplies = [];

      for (const reply of replies) {
        let toNickname = '';
        // 获取被回复用户的昵称
        if (reply.toUid) {
          try {
            console.log(`查询被回复用户, 用户ID: ${reply.toUid}`);
            const toUser = await this.userService.findById(reply.toUid);
            if (toUser) {
              toNickname = toUser.nickname || toUser.username || '未知用户';
              console.log(`找到被回复用户昵称: ${toNickname}`);
            } else {
              console.log(`未找到被回复用户, ID: ${reply.toUid}`);
              toNickname = '未知用户';
            }
          } catch (error) {
            console.error(`查询被回复用户昵称失败, 用户ID: ${reply.toUid}`, error);
            toNickname = '未知用户';
          }
        } else {
          // 如果没有toUserId，则是回复主评论
          toNickname = parentUserNickname;
          console.log(`回复主评论，使用父评论用户昵称: ${toNickname}`);
        }

        // 获取回复的点赞数
        const likeCount =
          (await this.redisService.getHash(
            RedisConstant.COMMENT_LIKE_COUNT,
            reply.id.toString(),
          )) || 0;

        formattedReplies.push({
          id: reply.id,
          fromNickname: reply.user?.nickname || reply.user?.username || '匿名用户',
          fromUid: reply.userId,
          avatar: reply.user?.avatar || 'http://img.conder.top/config/default_avatar.jpg',
          toUid: reply.toUid || parentComment?.userId,
          toNickname: toNickname,
          commentContent: reply.content,
          createTime: reply.createTime,
          likeCount: likeCount, // 使用从Redis获取的点赞数
        });
      }

      console.log(`格式化完成, 获取到${formattedReplies.length}条回复`);
      return ResultDto.success(formattedReplies);
    } catch (error) {
      console.error('获取评论回复列表失败:', error);
      return ResultDto.fail('获取评论回复列表失败: ' + error.message);
    }
  }
}
