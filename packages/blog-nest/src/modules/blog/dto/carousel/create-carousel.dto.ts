import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsNumber,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCarouselDto {
  @ApiProperty({ description: '轮播图图片地址', required: true })
  @IsNotEmpty({ message: '轮播图图片地址不能为空' })
  @IsUrl({}, { message: '请输入有效的图片地址' })
  imageUrl: string;

  @ApiProperty({ description: '是否显示', required: false, default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: '状态必须是数字' })
  @Min(0, { message: '状态最小值为0' })
  @Max(1, { message: '状态最大值为1' })
  status?: number = 0;

  @ApiProperty({ description: '备注', required: false })
  @IsOptional()
  @IsString({ message: '备注必须是字符串' })
  remark?: string;
}
