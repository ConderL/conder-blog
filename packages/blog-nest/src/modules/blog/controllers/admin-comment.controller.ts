import { Controller, Get, Body, Param, Delete, UseGuards, Query, Put } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CommentService } from '../services/comment.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { ResultDto } from '../../../common/dtos/result.dto';
import { Comment } from '../entities/comment.entity';
import { OperationLog } from '../../../common/decorators/operation-log.decorator';
import { OperationType } from '../../../common/enums/operation-type.enum';
import { UserService } from '../../../modules/user/user.service';
import { Logger } from '@nestjs/common';

@ApiTags('后台评论管理')
@Controller('admin/comment')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AdminCommentController {
  private readonly logger = new Logger(AdminCommentController.name);

  constructor(
    private readonly commentService: CommentService,
    private readonly userService: UserService,
  ) {}

  /**
   * 获取评论列表
   */
  @Get('list')
  @ApiOperation({ summary: '获取评论列表（分页）' })
  @ApiQuery({ name: 'current', description: '当前页码', required: false, type: Number })
  @ApiQuery({ name: 'size', description: '每页条数', required: false, type: Number })
  @ApiQuery({ name: 'articleId', description: '文章ID', required: false, type: Number })
  @ApiQuery({ name: 'keyword', description: '搜索关键词', required: false, type: String })
  @ApiQuery({
    name: 'isCheck',
    description: '审核状态(0-未审核,1-已审核)',
    required: false,
    type: Number,
  })
  async findAll(
    @Query('current') current = 1,
    @Query('size') size = 10,
    @Query('articleId') articleId?: string,
    @Query('keyword') keyword?: string,
    @Query('isCheck') isCheck?: string,
  ): Promise<ResultDto<{ recordList: any[]; count: number; pageCount: number }>> {
    // 转换与验证参数
    const currentPage = Number(current) || 1;
    const pageSize = Number(size) || 10;

    // 只有当articleId是有效数字时才传递
    const articleIdNum = articleId ? Number(articleId) : null;
    const validArticleId = !isNaN(articleIdNum) ? articleIdNum : null;

    // 只有当isCheck是有效数字时才传递
    const isCheckNum = isCheck ? Number(isCheck) : null;
    const validisCheck = !isNaN(isCheckNum) ? isCheckNum : null;

    console.log(
      `获取评论列表：页码=${currentPage}, 每页=${pageSize}, 文章ID=${validArticleId}, 关键词=${keyword}, 审核状态=${validisCheck}`,
    );

    try {
      const [comments, count] = await this.commentService.findAllForAdmin(
        currentPage,
        pageSize,
        validArticleId,
        keyword,
        validisCheck,
      );

      // 处理评论数据，格式化为前端需要的格式
      const formattedComments = comments.map((comment) => {
        // 从关联数据中提取所需字段
        const userData = comment.user
          ? {
              id: comment.user.id,
              nickname: comment.user.nickname || comment.user.username,
              avatar: comment.user.avatar,
            }
          : null;

        const articleData = comment.article
          ? {
              id: comment.article.id,
              article_title: comment.article.articleTitle,
            }
          : null;

        // 返回格式化后的评论数据
        return {
          id: comment.id,
          from_uid: comment.userId,
          from_nickname: comment.user ? comment.user.nickname : '未知用户', // 添加发送者昵称
          type_id: comment.typeId,
          comment_content: comment.content,
          create_time: comment.createTime,
          is_check: comment.isCheck,
          parent_id: comment.parentId,
          reply_id: comment.replyId,
          to_uid: comment.toUid,
          reply_nickname: '', // 初始化被回复者昵称，后续会更新
          comment_type: comment.commentType,
          user: userData,
          avatar: userData?.avatar ?? 'http://img.conder.top/config/default_avatar.jpg',
          article: articleData,
          article_title: articleData?.article_title ?? '无',
        };
      });

      // 为每条评论查找回复的用户昵称
      for (const comment of formattedComments) {
        if (comment.to_uid) {
          try {
            // 查找被回复的用户
            const replyUser = await this.userService.findById(comment.to_uid);
            if (replyUser) {
              comment.reply_nickname = replyUser.nickname || replyUser.username || '未知用户';
            }
          } catch (error) {
            console.error(`获取用户昵称失败，用户ID: ${comment.to_uid}`, error);
          }
        }
      }

      // 计算总页数
      const pageCount = Math.ceil(count / pageSize);

      return ResultDto.success({
        recordList: formattedComments,
        count,
        pageCount,
      });
    } catch (error) {
      console.error('获取评论列表失败:', error);
      return ResultDto.fail('获取评论列表失败: ' + error.message);
    }
  }

  /**
   * 获取评论详情
   */
  @Get(':id')
  @ApiOperation({ summary: '获取评论详情' })
  async findOne(@Param('id') id: number): Promise<ResultDto<Comment>> {
    try {
      const comment = await this.commentService.findById(id);
      return ResultDto.success(comment);
    } catch (error) {
      return ResultDto.fail('获取评论详情失败: ' + error.message);
    }
  }

  /**
   * 删除评论
   */
  @Delete('delete')
  @ApiOperation({ summary: '删除评论' })
  @OperationLog(OperationType.DELETE)
  async remove(@Body() idList: number[]): Promise<ResultDto<null>> {
    try {
      await this.commentService.remove(idList);
      return ResultDto.success(null, '评论已删除');
    } catch (error) {
      return ResultDto.fail('删除评论失败: ' + error.message);
    }
  }

  /**
   * 批量审核评论
   */
  @Put('pass')
  @ApiOperation({ summary: '批量审核评论' })
  @OperationLog(OperationType.UPDATE)
  async batchReview(
    @Body() reviewData: { idList: number[]; isCheck: number },
  ): Promise<ResultDto<null>> {
    try {
      const { idList, isCheck } = reviewData;
      if (!idList || idList.length === 0) {
        return ResultDto.fail('评论ID列表不能为空');
      }

      this.logger.log(`批量审核评论，IDs: ${idList.join(', ')}, 状态: ${isCheck}`);

      // 批量更新评论审核状态
      for (const id of idList) {
        await this.commentService.update(id, { isCheck });
      }

      return ResultDto.success(null, `${idList.length}条评论审核状态已更新`);
    } catch (error) {
      this.logger.error(`批量审核评论失败: ${error.message}`, error.stack);
      return ResultDto.fail('批量更新评论审核状态失败: ' + error.message);
    }
  }
}
