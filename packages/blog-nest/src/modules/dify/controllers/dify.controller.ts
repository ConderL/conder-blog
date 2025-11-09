import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
  Res,
  Sse,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { Observable } from 'rxjs';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { DifyService } from '../services/dify.service';
import {
  ChatMessageDto,
  DatasetDocumentDto,
  WorkflowRunDto,
  GenerateArticleContentDto,
  GenerateArticleSummaryDto,
  GenerateSEOMetaDto,
  SuggestTagsDto,
} from '../dto/dify.dto';
import { ResultDto } from '../../../common/dtos/result.dto';
import { Public } from '../../../common/decorators/public.decorator';

@ApiTags('Dify AI')
@Controller('ai/dify')
export class DifyController {
  constructor(private readonly difyService: DifyService) { }

  @Post('chat')
  @ApiOperation({ summary: '发送聊天消息（阻塞模式）' })
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: '聊天成功' })
  async chat(@Body() dto: ChatMessageDto): Promise<ResultDto<any>> {
    console.log('dto', dto);
    try {
      // 如果请求streaming模式，强制使用blocking（因为这是阻塞接口）
      const blockingDto = { ...dto, response_mode: 'blocking' as const };
      const result = await this.difyService.chat(blockingDto);
      return ResultDto.success(result);
    } catch (error) {
      return ResultDto.error(`聊天失败: ${error.message}`);
    }
  }

  @Post('chat/stream')
  @ApiOperation({ summary: '发送聊天消息（SSE流式响应）' })
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: '流式聊天成功' })
  async chatStream(@Body() dto: ChatMessageDto, @Res() res: Response): Promise<void> {
    try {
      // 设置SSE响应头
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no'); // 禁用nginx缓冲

      const stream = await this.difyService.chatStream(dto);

      // 处理流式数据
      let hasAnimeIntent = false;
      let animeData: any = null;

      stream.on('data', (chunk: Buffer) => {
        const data = chunk.toString();
        const lines = data.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonStr = line.substring(6);
            if (jsonStr.trim() === '[DONE]') {
              // 如果检测到推荐番剧意图，但还没有番剧数据，在这里添加
              if (hasAnimeIntent && !animeData) {
                // 这里可以异步获取番剧数据，但由于流式响应已经结束，建议在前端处理
                // 或者使用message_end事件传递
              }
              res.write('data: [DONE]\n\n');
              res.end();
              return;
            }

            try {
              const jsonData = JSON.parse(jsonStr);

              // 检测是否包含推荐番剧的意图
              if (jsonData.metadata?.intent === 'recommend_anime' ||
                jsonData.intent === 'recommend_anime' ||
                (jsonData.answer && /推荐.*番剧|推荐.*动漫|高分.*番剧/.test(jsonData.answer))) {
                hasAnimeIntent = true;
              }

              // 如果metadata中已经包含番剧数据，直接传递
              if (jsonData.metadata?.animes) {
                animeData = jsonData.metadata.animes;
              }

              // 发送SSE格式的数据
              res.write(`data: ${JSON.stringify(jsonData)}\n\n`);
            } catch (e) {
              // 忽略解析错误，继续处理下一行
            }
          } else if (line.trim()) {
            // 直接发送非data行
            res.write(`${line}\n`);
          }
        }
      });

      stream.on('end', () => {
        res.write('data: [DONE]\n\n');
        res.end();
      });

      stream.on('error', (error: Error) => {
        res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
        res.end();
      });
    } catch (error) {
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      res.end();
    }
  }

  @Post('datasets/:datasetId/documents')
  @ApiOperation({ summary: '创建或更新数据集文档' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: '操作成功' })
  async upsertDatasetDocument(
    @Param('datasetId') datasetId: string,
    @Body() dto: DatasetDocumentDto,
  ): Promise<ResultDto<any>> {
    try {
      const result = await this.difyService.upsertDatasetDocument(datasetId, dto);
      return ResultDto.success(result);
    } catch (error) {
      return ResultDto.error(`操作失败: ${error.message}`);
    }
  }

  @Delete('datasets/:datasetId/documents/:documentId')
  @ApiOperation({ summary: '删除数据集文档' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: '删除成功' })
  async deleteDatasetDocument(
    @Param('datasetId') datasetId: string,
    @Param('documentId') documentId: string,
  ): Promise<ResultDto<null>> {
    try {
      await this.difyService.deleteDatasetDocument(datasetId, documentId);
      return ResultDto.success(null, '删除成功');
    } catch (error) {
      return ResultDto.error(`删除失败: ${error.message}`);
    }
  }

  @Post('workflows/:workflowId/run')
  @ApiOperation({ summary: '运行工作流' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: '运行成功' })
  async runWorkflow(
    @Param('workflowId') workflowId: string,
    @Body() dto: WorkflowRunDto,
  ): Promise<ResultDto<any>> {
    try {
      const result = await this.difyService.runWorkflow(workflowId, dto);
      return ResultDto.success(result);
    } catch (error) {
      return ResultDto.error(`工作流运行失败: ${error.message}`);
    }
  }

  @Post('generate/article-content')
  @ApiOperation({ summary: '生成文章内容' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: '生成成功' })
  async generateArticleContent(
    @Body() dto: GenerateArticleContentDto,
  ): Promise<ResultDto<string>> {
    try {
      const content = await this.difyService.generateArticleContent(
        dto.title,
        dto.outline,
        dto.context,
        dto.userId,
      );
      return ResultDto.success(content);
    } catch (error) {
      return ResultDto.error(`生成文章内容失败: ${error.message}`);
    }
  }

  @Post('generate/article-summary')
  @ApiOperation({ summary: '生成文章摘要' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: '生成成功' })
  async generateArticleSummary(
    @Body() dto: GenerateArticleSummaryDto,
  ): Promise<ResultDto<string>> {
    try {
      const summary = await this.difyService.generateArticleSummary(
        dto.content,
        dto.maxLength,
        dto.userId,
      );
      return ResultDto.success(summary);
    } catch (error) {
      return ResultDto.error(`生成文章摘要失败: ${error.message}`);
    }
  }

  @Post('generate/seo-meta')
  @ApiOperation({ summary: '生成SEO元数据' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: '生成成功' })
  async generateSEOMeta(
    @Body() dto: GenerateSEOMetaDto,
  ): Promise<ResultDto<{ description: string; keywords: string[] }>> {
    try {
      const meta = await this.difyService.generateSEOMeta(
        dto.title,
        dto.content,
        dto.userId,
      );
      return ResultDto.success(meta);
    } catch (error) {
      return ResultDto.error(`生成SEO元数据失败: ${error.message}`);
    }
  }

  @Post('suggest/tags')
  @ApiOperation({ summary: '推荐标签' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: '推荐成功' })
  async suggestTags(@Body() dto: SuggestTagsDto): Promise<ResultDto<string[]>> {
    try {
      const tags = await this.difyService.suggestTags(
        dto.title,
        dto.content,
        dto.userId,
      );
      return ResultDto.success(tags);
    } catch (error) {
      return ResultDto.error(`推荐标签失败: ${error.message}`);
    }
  }

  @Get('anime/recommend')
  @ApiOperation({ summary: '获取高分番剧推荐' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: '获取成功' })
  async getAnimeRecommend(@Query('limit') limit?: number): Promise<ResultDto<any>> {
    try {
      const animes = await this.difyService.getTopRatedAnimes(limit || 5);
      return ResultDto.success(animes);
    } catch (error) {
      return ResultDto.error(`获取番剧推荐失败: ${error.message}`);
    }
  }
}


