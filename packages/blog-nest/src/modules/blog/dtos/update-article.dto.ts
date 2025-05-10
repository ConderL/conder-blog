import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateArticleDto {
  @ApiProperty({ description: '文章ID' })
  @IsInt()
  id: number;

  @ApiProperty({ description: '文章标题' })
  @IsOptional()
  @IsString()
  articleTitle?: string;

  @ApiProperty({ description: '文章摘要' })
  @IsOptional()
  @IsString()
  articleDesc?: string;

  @ApiProperty({ description: '文章内容' })
  @IsOptional()
  @IsString()
  articleContent?: string;

  @ApiProperty({ description: '文章封面' })
  @IsOptional()
  @IsString()
  articleCover?: string;

  @ApiProperty({ description: '文章类型（1-原创，2-转载，3-翻译）', default: 1 })
  @IsOptional()
  @IsInt()
  articleType?: number;

  @ApiProperty({ description: '文章状态（1-公开，2-私密，3-草稿）', default: 1 })
  @IsOptional()
  @IsInt()
  status?: number;

  @ApiProperty({ description: '是否置顶（0-否，1-是）', default: 0 })
  @IsOptional()
  @IsInt()
  isTop?: number;

  @ApiProperty({ description: '是否删除（0-否，1-是）', default: 0 })
  @IsOptional()
  @IsInt()
  isDelete?: number;

  @ApiProperty({ description: '分类ID' })
  @IsOptional()
  @IsInt()
  categoryId?: number;

  @ApiProperty({ description: '标签ID列表' })
  @IsOptional()
  @IsArray()
  tags?: Record<string, any>[];

  @ApiProperty({ description: '标签名称列表' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tagNameList?: string[];

  @ApiProperty({ description: '是否推荐（0-否，1-是）', default: 0 })
  @IsOptional()
  @IsInt()
  isRecommend?: number;

  @ApiProperty({ description: '原文链接（转载文章使用）' })
  @IsOptional()
  @IsString()
  originalUrl?: string;

  @ApiProperty({ description: '是否允许评论（0-否，1-是）', default: 1 })
  @IsOptional()
  @IsInt()
  isComment?: number;
}
