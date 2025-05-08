import { IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class PaginateDto {
  @ApiProperty({ description: '当前页码', required: true, example: 1 })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  current: number;

  @ApiProperty({ description: '每页条数', required: true, example: 10 })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  size: number;
}
