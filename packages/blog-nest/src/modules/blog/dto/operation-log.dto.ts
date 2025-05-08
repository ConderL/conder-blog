import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString, IsInt, Min, IsNumber } from 'class-validator';
import { Transform, Type } from 'class-transformer';

/**
 * 操作日志删除DTO
 */
export class DeleteOperationLogDto {
  @ApiProperty({ description: '操作日志ID数组', type: [Number] })
  @IsArray({ message: '操作日志ID必须是数组' })
  @IsNotEmpty({ message: '操作日志ID不能为空' })
  @Transform(
    ({ value }) => {
      // 记录转换前的值类型
      console.log('转换前ids的值类型:', typeof value, '值:', value);

      // 如果已经是数组，则直接转换每个元素为数字
      if (Array.isArray(value)) {
        return value.map((v) => Number(v));
      }

      // 如果是字符串，尝试解析JSON
      if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value);
          if (Array.isArray(parsed)) {
            return parsed.map((v) => Number(v));
          }
          return [Number(value)];
        } catch (e) {
          // 如果JSON解析失败，可能是单个值
          return [Number(value)];
        }
      }

      // 其他情况，尝试转换为数组
      return [Number(value)];
    },
    { toClassOnly: true },
  )
  @IsInt({ each: true, message: '操作日志ID必须是整数' })
  ids: number[];
}

/**
 * 操作日志查询参数DTO
 */
export class QueryOperationLogDto {
  @ApiProperty({ description: '当前页', default: 1 })
  @Type(() => Number)
  @IsInt({ message: '当前页必须是整数' })
  @Min(1, { message: '当前页不能小于1' })
  current: number = 1;

  @ApiProperty({ description: '每页数量', default: 10 })
  @Type(() => Number)
  @IsInt({ message: '每页数量必须是整数' })
  @Min(1, { message: '每页数量不能小于1' })
  size: number = 10;

  @ApiProperty({ description: '关键词', required: false })
  @IsOptional()
  @IsString({ message: '关键词必须是字符串' })
  keywords?: string;

  @ApiProperty({ description: '操作模块', required: false })
  @IsOptional()
  @IsString({ message: '操作模块必须是字符串' })
  module?: string;

  @ApiProperty({ description: '开始时间', required: false })
  @IsOptional()
  @IsString({ message: '开始时间必须是字符串' })
  startTime?: string;

  @ApiProperty({ description: '结束时间', required: false })
  @IsOptional()
  @IsString({ message: '结束时间必须是字符串' })
  endTime?: string;
}
