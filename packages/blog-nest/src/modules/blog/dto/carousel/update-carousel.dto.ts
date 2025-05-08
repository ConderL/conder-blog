import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateCarouselDto } from './create-carousel.dto';

export class UpdateCarouselDto extends PartialType(CreateCarouselDto) {
  @ApiProperty({ description: '轮播图ID', required: true })
  @IsNotEmpty({ message: '轮播图ID不能为空' })
  @IsNumber({}, { message: '轮播图ID必须是数字' })
  @Type(() => Number)
  id: number;

  @ApiProperty({ description: '轮播图图片地址', required: false })
  @IsOptional()
  @IsUrl({}, { message: '轮播图图片地址格式不正确' })
  imageUrl?: string;

  @ApiProperty({ description: '是否显示', required: false })
  @IsOptional()
  @IsNumber({}, { message: '状态必须是数字' })
  @Min(0, { message: '状态最小值为0' })
  @Max(1, { message: '状态最大值为1' })
  @Type(() => Number)
  status?: number;

  @ApiProperty({ description: '备注', required: false })
  @IsOptional()
  @IsString({ message: '备注必须是字符串' })
  remark?: string;
}
