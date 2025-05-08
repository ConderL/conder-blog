import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl } from 'class-validator';

/**
 * 创建轮播图DTO
 */
export class CreateCarouselDto {
  @ApiProperty({ description: '轮播图URL', example: 'https://example.com/image.jpg' })
  @IsNotEmpty({ message: '轮播图URL不能为空' })
  @IsUrl({}, { message: '请提供有效的URL地址' })
  imgUrl: string;

  @ApiProperty({ description: '是否显示', example: 1, default: 0 })
  @IsOptional()
  @IsNumber({}, { message: '状态必须是数字' })
  status?: number;

  @ApiProperty({ description: '备注', example: '首页轮播图', required: false })
  @IsOptional()
  @IsString({ message: '备注必须是字符串' })
  remark?: string;
}

/**
 * 更新轮播图DTO
 */
export class UpdateCarouselDto {
  @ApiProperty({ description: '轮播图ID' })
  @IsNotEmpty({ message: '轮播图ID不能为空' })
  @IsNumber({}, { message: 'ID必须是数字' })
  id: number;

  @ApiProperty({
    description: '轮播图URL',
    example: 'https://example.com/image.jpg',
    required: false,
  })
  @IsOptional()
  @IsUrl({}, { message: '请提供有效的URL地址' })
  imgUrl?: string;

  @ApiProperty({ description: '是否显示', example: 1, required: false })
  @IsOptional()
  @IsNumber({}, { message: '状态必须是数字' })
  status?: number;

  @ApiProperty({ description: '备注', example: '首页轮播图', required: false })
  @IsOptional()
  @IsString({ message: '备注必须是字符串' })
  remark?: string;
}

/**
 * 轮播图状态DTO
 */
export class CarouselStatusDto {
  @ApiProperty({ description: '轮播图ID' })
  @IsNotEmpty({ message: '轮播图ID不能为空' })
  @IsNumber({}, { message: 'ID必须是数字' })
  id: number;

  @ApiProperty({ description: '是否显示', example: 1 })
  @IsNotEmpty({ message: '状态不能为空' })
  @IsNumber({}, { message: '状态必须是数字' })
  status: number;
}
