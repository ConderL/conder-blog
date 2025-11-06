import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsObject, IsArray } from 'class-validator';

/**
 * 聊天消息DTO
 */
export class ChatMessageDto {
  @ApiProperty({ description: '用户消息', example: '你好' })
  @IsString()
  @IsNotEmpty()
  query: string;

  @ApiPropertyOptional({ description: '输入变量', example: {} })
  @IsObject()
  @IsOptional()
  inputs?: Record<string, any>;

  @ApiPropertyOptional({ description: '响应模式', enum: ['blocking', 'streaming'], default: 'blocking' })
  @IsString()
  @IsOptional()
  response_mode?: 'blocking' | 'streaming';

  @ApiPropertyOptional({ description: '用户ID', example: 'user-123' })
  @IsString()
  @IsOptional()
  user?: string;

  @ApiPropertyOptional({ description: '会话ID', example: 'conv-123' })
  @IsString()
  @IsOptional()
  conversation_id?: string;
}

/**
 * 聊天消息响应
 */
export interface ChatMessageResponse {
  event: string;
  task_id: string;
  id: string;
  message_id: string;
  conversation_id: string;
  answer: string;
  metadata?: {
    usage?: {
      prompt_tokens?: number;
      completion_tokens?: number;
      total_tokens?: number;
    };
  };
  created_at: number;
}

/**
 * 数据集文档DTO
 */
export class DatasetDocumentDto {
  @ApiProperty({ description: '文档名称', example: '文章标题' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: '文档内容', example: '这是一篇文章的内容...' })
  @IsString()
  @IsNotEmpty()
  text: string;

  @ApiPropertyOptional({ description: '文档ID（更新时使用）', example: 'doc-123' })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({ description: '索引技术', enum: ['high_quality', 'economy'], default: 'high_quality' })
  @IsString()
  @IsOptional()
  indexing_technique?: 'high_quality' | 'economy';

  @ApiPropertyOptional({ description: '元数据', example: { source: 'blog', category: 'tech' } })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

/**
 * 数据集文档响应
 */
export interface DatasetDocumentResponse {
  document: {
    id: string;
    name: string;
    data_source_type: string;
    data_source_info: any;
    dataset_process_rule_id: string;
    batch: string;
    error: string | null;
    status: string;
    created_at: number;
    updated_at: number;
    indexing_status: string;
    completed_at: number | null;
    paused_at: number | null;
    error_at: number | null;
    indexing_latency: number | null;
    tokens: number;
    position: number;
    word_count: number;
    parsing_completed_at: number | null;
  };
}

/**
 * 工作流运行DTO
 */
export class WorkflowRunDto {
  @ApiPropertyOptional({ description: '输入变量', example: {} })
  @IsObject()
  @IsOptional()
  inputs?: Record<string, any>;

  @ApiPropertyOptional({ description: '响应模式', enum: ['blocking', 'streaming'], default: 'blocking' })
  @IsString()
  @IsOptional()
  response_mode?: 'blocking' | 'streaming';

  @ApiPropertyOptional({ description: '用户ID', example: 'user-123' })
  @IsString()
  @IsOptional()
  user?: string;
}

/**
 * 工作流运行响应
 */
export interface WorkflowRunResponse {
  workflow_run_id: string;
  task_id: string;
  data: any;
  created_at: number;
}

/**
 * 生成文章内容DTO
 */
export class GenerateArticleContentDto {
  @ApiProperty({ description: '文章标题' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ description: '文章大纲' })
  @IsString()
  @IsOptional()
  outline?: string;

  @ApiPropertyOptional({ description: '上下文信息' })
  @IsString()
  @IsOptional()
  context?: string;

  @ApiPropertyOptional({ description: '用户ID' })
  @IsString()
  @IsOptional()
  userId?: string;
}

/**
 * 生成文章摘要DTO
 */
export class GenerateArticleSummaryDto {
  @ApiProperty({ description: '文章内容' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({ description: '最大长度', default: 200 })
  @IsOptional()
  maxLength?: number;

  @ApiPropertyOptional({ description: '用户ID' })
  @IsString()
  @IsOptional()
  userId?: string;
}

/**
 * 生成SEO元数据DTO
 */
export class GenerateSEOMetaDto {
  @ApiProperty({ description: '文章标题' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: '文章内容' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({ description: '用户ID' })
  @IsString()
  @IsOptional()
  userId?: string;
}

/**
 * 推荐标签DTO
 */
export class SuggestTagsDto {
  @ApiProperty({ description: '文章标题' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: '文章内容' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({ description: '用户ID' })
  @IsString()
  @IsOptional()
  userId?: string;
}


