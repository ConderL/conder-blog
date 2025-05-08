import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CommentService } from '../services/comment.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { ResultDto } from '../../../common/dtos/result.dto';
import { Comment } from '../entities/comment.entity';
import { OperationLog } from '../../../common/decorators/operation-log.decorator';
import { OperationType } from '../../../common/enums/operation-type.enum';

@ApiTags('评论提交')
@Controller('comment-submit')
export class CommentSubmitController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  @ApiOperation({ summary: '创建评论' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @OperationLog(OperationType.CREATE)
  async create(@Body() createCommentDto: any, @Req() req: any): Promise<ResultDto<Comment>> {
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
        content: createCommentDto.commentContent || createCommentDto.content,
        typeId: createCommentDto.typeId,
        commentType: createCommentDto.commentType || 1, // 默认为文章评论
        parentId: createCommentDto.parentId || 0,
        replyId: createCommentDto.replyId || 0,
        userId: userId,
        isCheck: 1, // 默认已审核
      };

      console.log('构建的评论数据:', comment);

      const result = await this.commentService.create(comment);
      return ResultDto.success(result, '评论成功');
    } catch (error) {
      console.error('创建评论失败:', error);
      return ResultDto.fail('创建评论失败: ' + error.message);
    }
  }
}
