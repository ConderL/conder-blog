import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateCarouselDto {
  @ApiProperty({ description: '轮播图图片地址', example: 'https://example.com/banner.jpg' })
  @IsNotEmpty({ message: '图片地址不能为空' })
  @IsString({ message: '图片地址必须是字符串' })
  @MaxLength(255, { message: '图片地址长度不能超过255个字符' })
  imgUrl: string;

  @ApiProperty({ description: '是否显示', default: 0, example: 1 })
  @IsOptional()
  @IsNumber({}, { message: '状态必须是数字' })
  @Type(() => Number)
  status?: number = 0;

  @ApiProperty({ description: '备注', required: false })
  @IsOptional()
  @IsString({ message: '备注必须是字符串' })
  @MaxLength(50, { message: '备注长度不能超过50个字符' })
  remark?: string;
}

export class UpdateCarouselDto {
  @ApiProperty({ description: '轮播图ID', required: true })
  @IsNumber({}, { message: '轮播图ID必须是数字' })
  @Type(() => Number)
  id: number;

  @ApiProperty({
    description: '轮播图图片地址',
    required: false,
    example: 'https://example.com/banner.jpg',
  })
  @IsOptional()
  @IsString({ message: '图片地址必须是字符串' })
  @MaxLength(255, { message: '图片地址长度不能超过255个字符' })
  imgUrl?: string;

  @ApiProperty({ description: '是否显示', required: false, example: 1 })
  @IsOptional()
  @IsNumber({}, { message: '状态必须是数字' })
  @Type(() => Number)
  status?: number;

  @ApiProperty({ description: '备注', required: false })
  @IsOptional()
  @IsString({ message: '备注必须是字符串' })
  @MaxLength(50, { message: '备注长度不能超过50个字符' })
  remark?: string;

  @ApiProperty({ description: '创建时间', required: false })
  @IsOptional()
  @IsDateString({}, { message: '创建时间必须是ISO日期字符串' })
  createTime?: string;

  @ApiProperty({ description: '更新时间', required: false })
  @IsOptional()
  @IsDateString({}, { message: '更新时间必须是ISO日期字符串' })
  updateTime?: string;
}

export class CarouselQuery {
  @ApiProperty({ description: '页码', default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiProperty({ description: '每页数量', default: 10 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  pageSize?: number = 10;

  @ApiProperty({ description: '是否显示', required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  status?: number;
}

export class CarouselIdParam {
  @ApiProperty({ description: '轮播图ID' })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  id: number;
}

export class CarouselStatusDto {
  @ApiProperty({ description: '是否显示', example: 1 })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  status: number;
}
