import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import {
  ChatMessageDto,
  ChatMessageResponse,
  DatasetDocumentDto,
  DatasetDocumentResponse,
  WorkflowRunDto,
  WorkflowRunResponse,
} from '../dto/dify.dto';

/**
 * Dify 服务
 * 提供与 Dify AI 平台的集成功能
 */
@Injectable()
export class DifyService {
  private readonly logger = new Logger(DifyService.name);
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>('DIFY_BASE_URL') || 'https://api.dify.ai';
    this.apiKey = this.configService.get<string>('DIFY_API_KEY') || '';

    if (!this.apiKey) {
      this.logger.warn('DIFY_API_KEY 未配置，Dify 功能将不可用');
    }
  }

  /**
   * 发送聊天消息
   * @param dto 聊天消息DTO
   * @returns 聊天响应
   */
  async chat(dto: ChatMessageDto): Promise<ChatMessageResponse> {
    try {
      const url = `${this.baseUrl}/v1/chat-messages`;
      const response = await firstValueFrom(
        this.httpService.post<ChatMessageResponse>(
          url,
          {
            inputs: dto.inputs || {},
            query: dto.query,
            response_mode: dto.response_mode || 'blocking',
            user: dto.user || 'anonymous',
            conversation_id: dto.conversation_id,
          },
          {
            headers: {
              Authorization: `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      return response.data;
    } catch (error) {
      this.logger.error(`发送聊天消息失败: ${error.message}`, error.stack);
      throw new Error(`Dify 聊天请求失败: ${error.message}`);
    }
  }

  /**
   * 流式聊天（SSE）
   * @param dto 聊天消息DTO
   * @returns 流式响应流
   */
  async chatStream(dto: ChatMessageDto): Promise<NodeJS.ReadableStream> {
    try {
      const url = `${this.baseUrl}/v1/chat-messages`;
      const response = await firstValueFrom(
        this.httpService.post(
          url,
          {
            inputs: dto.inputs || {},
            query: dto.query,
            response_mode: 'streaming',
            user: dto.user || 'anonymous',
            conversation_id: dto.conversation_id,
          },
          {
            headers: {
              Authorization: `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json',
            },
            responseType: 'stream',
          },
        ),
      );

      return response.data;
    } catch (error) {
      this.logger.error(`流式聊天失败: ${error.message}`, error.stack);
      throw new Error(`Dify 流式聊天请求失败: ${error.message}`);
    }
  }

  /**
   * 创建或更新数据集文档
   * @param datasetId 数据集ID
   * @param dto 文档DTO
   * @returns 文档响应
   */
  async upsertDatasetDocument(
    datasetId: string,
    dto: DatasetDocumentDto,
  ): Promise<DatasetDocumentResponse> {
    try {
      const url = `${this.baseUrl}/v1/datasets/${datasetId}/documents`;
      const response = await firstValueFrom(
        this.httpService.post<DatasetDocumentResponse>(
          url,
          {
            name: dto.name,
            text: dto.text,
            indexing_technique: dto.indexing_technique || 'high_quality',
            metadata: dto.metadata || {},
            ...(dto.id && { document_id: dto.id }),
          },
          {
            headers: {
              Authorization: `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      return response.data;
    } catch (error) {
      this.logger.error(
        `创建/更新数据集文档失败: ${error.message}`,
        error.stack,
      );
      throw new Error(`Dify 数据集文档操作失败: ${error.message}`);
    }
  }

  /**
   * 删除数据集文档
   * @param datasetId 数据集ID
   * @param documentId 文档ID
   */
  async deleteDatasetDocument(
    datasetId: string,
    documentId: string,
  ): Promise<void> {
    try {
      const url = `${this.baseUrl}/v1/datasets/${datasetId}/documents/${documentId}`;
      await firstValueFrom(
        this.httpService.delete(url, {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
          },
        }),
      );
    } catch (error) {
      this.logger.error(
        `删除数据集文档失败: ${error.message}`,
        error.stack,
      );
      throw new Error(`Dify 删除文档失败: ${error.message}`);
    }
  }

  /**
   * 运行工作流
   * @param workflowId 工作流ID
   * @param dto 工作流运行DTO
   * @returns 工作流响应
   */
  async runWorkflow(
    workflowId: string,
    dto: WorkflowRunDto,
  ): Promise<WorkflowRunResponse> {
    try {
      const url = `${this.baseUrl}/v1/workflows/run`;
      const response = await firstValueFrom(
        this.httpService.post<WorkflowRunResponse>(
          url,
          {
            inputs: dto.inputs || {},
            user: dto.user || 'anonymous',
            response_mode: dto.response_mode || 'blocking',
            ...(workflowId && { workflow_id: workflowId }),
          },
          {
            headers: {
              Authorization: `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      return response.data;
    } catch (error) {
      this.logger.error(`运行工作流失败: ${error.message}`, error.stack);
      throw new Error(`Dify 工作流运行失败: ${error.message}`);
    }
  }

  /**
   * 生成文章内容
   * @param title 文章标题
   * @param outline 文章大纲
   * @param context 上下文信息
   * @param userId 用户ID
   * @returns 生成的内容
   */
  async generateArticleContent(
    title: string,
    outline?: string,
    context?: string,
    userId?: string,
  ): Promise<string> {
    const prompt = `基于以下信息生成文章内容：
标题：${title}
${outline ? `大纲：${outline}` : ''}
${context ? `上下文：${context}` : ''}

请生成完整的文章内容，使用 Markdown 格式。`;

    const response = await this.chat({
      query: prompt,
      user: userId || 'blog-generator',
      inputs: {
        title,
        outline: outline || '',
        context: context || '',
      },
    });

    return response.answer || '';
  }

  /**
   * 生成文章摘要
   * @param content 文章内容
   * @param maxLength 最大长度
   * @param userId 用户ID
   * @returns 生成的摘要
   */
  async generateArticleSummary(
    content: string,
    maxLength: number = 200,
    userId?: string,
  ): Promise<string> {
    const prompt = `请为以下文章生成一个简洁的摘要（${maxLength}字以内）：

${content.substring(0, 5000)}`;

    const response = await this.chat({
      query: prompt,
      user: userId || 'blog-summarizer',
      inputs: {
        content: content.substring(0, 5000),
        maxLength,
      },
    });

    return response.answer || '';
  }

  /**
   * 生成SEO元数据
   * @param title 文章标题
   * @param content 文章内容
   * @param userId 用户ID
   * @returns SEO元数据
   */
  async generateSEOMeta(
    title: string,
    content: string,
    userId?: string,
  ): Promise<{
    description: string;
    keywords: string[];
  }> {
    const prompt = `为以下文章生成SEO元数据（描述和关键词）：

标题：${title}
内容：${content.substring(0, 2000)}

请返回JSON格式：
{
  "description": "文章描述（150字以内）",
  "keywords": ["关键词1", "关键词2", ...]
}`;

    const response = await this.chat({
      query: prompt,
      user: userId || 'blog-seo',
      inputs: {
        title,
        content: content.substring(0, 2000),
      },
    });

    try {
      const jsonMatch = response.answer.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      this.logger.warn('解析SEO元数据JSON失败，返回默认值');
    }

    return {
      description: content.substring(0, 150).replace(/\n/g, ' '),
      keywords: [],
    };
  }

  /**
   * 推荐标签
   * @param title 文章标题
   * @param content 文章内容
   * @param userId 用户ID
   * @returns 推荐的标签列表
   */
  async suggestTags(
    title: string,
    content: string,
    userId?: string,
  ): Promise<string[]> {
    const prompt = `为以下文章推荐5-10个标签：

标题：${title}
内容：${content.substring(0, 2000)}

请返回标签列表，用逗号分隔。`;

    const response = await this.chat({
      query: prompt,
      user: userId || 'blog-tagger',
      inputs: {
        title,
        content: content.substring(0, 2000),
      },
    });

    const tags = response.answer
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    return tags.slice(0, 10);
  }
}


