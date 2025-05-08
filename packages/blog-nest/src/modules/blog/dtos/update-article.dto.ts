import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateArticleDto {
  @ApiProperty({ description: '文章ID' })
  @IsInt()
  id: number;

  @ApiProperty({ description: '文章标题' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ description: '文章摘要' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: '文章内容' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({ description: '文章封面' })
  @IsOptional()
  @IsString()
  cover?: string;

  @ApiProperty({ description: '分类ID' })
  @IsOptional()
  @IsInt()
  categoryId?: number;

  @ApiProperty({ description: '标签ID列表' })
  @IsOptional()
  @IsArray()
  tagIds?: number[];

  @ApiProperty({ description: '标签名称列表', required: false })
  @IsOptional()
  @IsArray()
  tagNameList?: string[];

  @ApiProperty({ description: '是否原创', default: true })
  @IsOptional()
  @IsBoolean()
  isOriginal?: boolean;

  @ApiProperty({ description: '原文链接', required: false })
  @IsOptional()
  @IsString()
  originalUrl?: string;

  @ApiProperty({ description: '是否置顶', default: false })
  @IsOptional()
  @IsBoolean()
  isTop?: boolean;

  @ApiProperty({ description: '是否发布', default: true })
  @IsOptional()
  @IsBoolean()
  isPublish?: boolean;
}
