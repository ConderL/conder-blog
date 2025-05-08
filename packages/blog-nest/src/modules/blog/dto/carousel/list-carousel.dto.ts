import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ListCarouselDto {
  @ApiProperty({ description: '页码', required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: '页码必须是数字' })
  @Min(1, { message: '页码最小值为1' })
  page?: number = 1;

  @ApiProperty({ description: '每页数量', required: false, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: '每页数量必须是数字' })
  @Min(1, { message: '每页数量最小值为1' })
  pageSize?: number = 10;

  @ApiProperty({ description: '轮播图标题', required: false })
  @IsOptional()
  @IsString({ message: '轮播图标题必须是字符串' })
  title?: string;

  @ApiProperty({ description: '是否显示', required: false })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean({ message: '是否显示必须是布尔值' })
  isShow?: boolean;
}
