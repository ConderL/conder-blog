import { ApiProperty } from '@nestjs/swagger';

/**
 * 文章搜索结果
 */
export class ArticleSearch {
  /**
   * 文章ID
   */
  @ApiProperty({ description: '文章ID', example: 1 })
  id: number;

  /**
   * 文章标题
   */
  @ApiProperty({ description: '文章标题', example: '博客系统设计' })
  articleTitle: string;

  /**
   * 文章内容（摘要）
   */
  @ApiProperty({ description: '文章内容摘要', example: '这是一篇关于博客系统设计的文章...' })
  articleContent: string;
}
