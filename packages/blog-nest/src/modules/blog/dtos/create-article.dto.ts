import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateArticleDto {
  @ApiProperty({ description: '文章标题' })
  @IsNotEmpty({ message: '文章标题不能为空' })
  @IsString()
  title: string;

  @ApiProperty({ description: '文章摘要' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: '文章内容' })
  @IsNotEmpty({ message: '文章内容不能为空' })
  @IsString()
  content: string;

  @ApiProperty({ description: '文章封面' })
  @IsOptional()
  @IsString()
  cover?: string;

  @ApiProperty({ description: '分类ID' })
  @IsNotEmpty({ message: '分类ID不能为空' })
  @IsInt()
  categoryId: number;

  @ApiProperty({ description: '标签ID列表' })
  @IsArray()
  @IsOptional()
  tagIds?: number[];

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
