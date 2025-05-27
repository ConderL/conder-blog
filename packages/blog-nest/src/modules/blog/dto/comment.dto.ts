import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { CommentType } from '../entities/comment.entity';

export class CreateCommentDto {
  @ApiProperty({ description: '评论内容', example: '这篇文章写得很好！' })
  @IsString()
  @MinLength(1, { message: '评论内容不能为空' })
  @MaxLength(500, { message: '评论内容不能超过500个字符' })
  commentContent: string;

  @ApiProperty({
    description: '类型ID (文章ID、友链ID或说说ID)',
    example: 1,
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsNumber({}, { message: 'typeId必须是数字' })
  typeId?: number;

  @ApiProperty({
    description: '评论类型 (1: 文章评论, 2: 友链评论, 3: 说说评论, 4: 留言评论)',
    enum: CommentType,
    example: CommentType.ARTICLE,
  })
  @IsEnum(CommentType)
  commentType: CommentType;

  @ApiProperty({ description: '父评论ID', required: false, example: 0 })
  @IsOptional()
  @IsNumber()
  parentId?: number;

  @ApiProperty({ description: '回复评论ID', required: false, example: 0 })
  @IsOptional()
  @IsNumber()
  replyId?: number;

  @ApiProperty({ description: '回复用户ID', required: false, example: 0 })
  @IsOptional()
  @IsNumber()
  toUid?: number;
}

export class CommentResponseDto {
  @ApiProperty({ description: '评论ID' })
  id: number;

  @ApiProperty({ description: '评论内容' })
  content: string;

  @ApiProperty({ description: '评论类型', enum: CommentType })
  commentType: CommentType;

  @ApiProperty({ description: '类型ID (文章ID、友链ID或说说ID)' })
  typeId: number;

  @ApiProperty({ description: '评论用户ID' })
  userId: number;

  @ApiProperty({ description: '回复用户ID' })
  toUid: number;

  @ApiProperty({ description: '父评论ID' })
  parentId: number;

  @ApiProperty({ description: '回复评论ID' })
  replyId: number;

  @ApiProperty({ description: '是否审核 (0-未审核，1-已审核)' })
  isCheck: number;

  @ApiProperty({ description: '点赞数量' })
  likeCount: number;

  @ApiProperty({ description: '创建时间' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  updatedAt: Date;

  @ApiProperty({ description: '子评论列表', type: [CommentResponseDto], required: false })
  children?: CommentResponseDto[];
}
