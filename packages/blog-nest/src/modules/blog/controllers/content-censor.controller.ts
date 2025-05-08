import { Controller, Post, Body, UseGuards, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { ContentCensorService } from '../services/content-censor.service';
import { ResultDto } from '../../../common/dtos/result.dto';
import { OperationLog } from '../../../common/decorators/operation-log.decorator';
import { OperationType } from '../../../common/enums/operation-type.enum';

/**
 * 内容审核控制器
 * 提供手动触发百度文本审核功能
 */
@ApiTags('内容审核管理')
@Controller('admin/content-censor')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ContentCensorController {
  private readonly logger = new Logger(ContentCensorController.name);

  constructor(private readonly contentCensorService: ContentCensorService) {}

  /**
   * 手动审核单条评论
   */
  @Post('comment')
  @ApiOperation({ summary: '手动审核单条评论' })
  @OperationLog(OperationType.UPDATE)
  async censorComment(@Body() data: { commentId: number }): Promise<ResultDto<any>> {
    try {
      this.logger.log(`手动触发评论审核: commentId=${data.commentId}`);
      const isSafe = await this.contentCensorService.censorComment(data.commentId);
      return ResultDto.success(
        { passed: isSafe },
        `评论审核${isSafe ? '通过' : '不通过'}，ID: ${data.commentId}`,
      );
    } catch (error) {
      this.logger.error(`评论审核失败: ${error.message}`, error.stack);
      return ResultDto.fail('评论审核失败: ' + error.message);
    }
  }

  /**
   * 手动审核单条留言
   */
  @Post('message')
  @ApiOperation({ summary: '手动审核单条留言' })
  @OperationLog(OperationType.UPDATE)
  async censorMessage(@Body() data: { messageId: number }): Promise<ResultDto<any>> {
    try {
      this.logger.log(`手动触发留言审核: messageId=${data.messageId}`);
      const isSafe = await this.contentCensorService.censorMessage(data.messageId);
      return ResultDto.success(
        { passed: isSafe },
        `留言审核${isSafe ? '通过' : '不通过'}，ID: ${data.messageId}`,
      );
    } catch (error) {
      this.logger.error(`留言审核失败: ${error.message}`, error.stack);
      return ResultDto.fail('留言审核失败: ' + error.message);
    }
  }

  /**
   * 批量审核所有待审核评论
   */
  @Post('batch-comments')
  @ApiOperation({ summary: '批量审核所有待审核评论' })
  @OperationLog(OperationType.UPDATE)
  async batchCensorComments(): Promise<ResultDto<any>> {
    try {
      this.logger.log('手动触发批量评论审核');
      const result = await this.contentCensorService.batchCensorPendingComments();
      return ResultDto.success(
        result,
        `批量评论审核完成，共${result.total}条，通过${result.passed}条`,
      );
    } catch (error) {
      this.logger.error(`批量评论审核失败: ${error.message}`, error.stack);
      return ResultDto.fail('批量评论审核失败: ' + error.message);
    }
  }

  /**
   * 批量审核所有待审核留言
   */
  @Post('batch-messages')
  @ApiOperation({ summary: '批量审核所有待审核留言' })
  @OperationLog(OperationType.UPDATE)
  async batchCensorMessages(): Promise<ResultDto<any>> {
    try {
      this.logger.log('手动触发批量留言审核');
      const result = await this.contentCensorService.batchCensorPendingMessages();
      return ResultDto.success(
        result,
        `批量留言审核完成，共${result.total}条，通过${result.passed}条`,
      );
    } catch (error) {
      this.logger.error(`批量留言审核失败: ${error.message}`, error.stack);
      return ResultDto.fail('批量留言审核失败: ' + error.message);
    }
  }

  /**
   * 批量审核所有待审核内容（评论和留言）
   */
  @Post('batch-all')
  @ApiOperation({ summary: '批量审核所有待审核内容（评论和留言）' })
  @OperationLog(OperationType.UPDATE)
  async batchCensorAll(): Promise<ResultDto<any>> {
    try {
      this.logger.log('手动触发批量内容审核（评论和留言）');

      // 分别审核评论和留言
      const commentResult = await this.contentCensorService.batchCensorPendingComments();
      const messageResult = await this.contentCensorService.batchCensorPendingMessages();

      // 合并结果
      const result = {
        comments: commentResult,
        messages: messageResult,
        total: commentResult.total + messageResult.total,
        passed: commentResult.passed + messageResult.passed,
      };

      return ResultDto.success(
        result,
        `批量内容审核完成，共${result.total}条，通过${result.passed}条`,
      );
    } catch (error) {
      this.logger.error(`批量内容审核失败: ${error.message}`, error.stack);
      return ResultDto.fail('批量内容审核失败: ' + error.message);
    }
  }
}
