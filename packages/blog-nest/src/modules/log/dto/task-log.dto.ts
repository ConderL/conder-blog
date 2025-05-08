import {
  IsOptional,
  IsInt,
  Min,
  IsString,
  IsDateString,
  IsNumber,
  IsArray,
  IsEnum,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

/**
 * 任务状态枚举
 */
export enum TaskStatus {
  /** 失败 */
  FAILURE = 0,
  /** 成功 */
  SUCCESS = 1,
}

/**
 * 任务日志分页查询DTO
 */
export class TaskLogPageDto {
  @ApiProperty({ description: '当前页码', default: 1 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  current?: number;

  @ApiProperty({ description: '每页数量', default: 10 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  size?: number;

  @ApiProperty({ description: '任务名称', required: false })
  @IsOptional()
  @IsString()
  taskName?: string;

  @ApiProperty({ description: '任务分组', required: false })
  @IsOptional()
  @IsString()
  taskGroup?: string;

  @ApiProperty({ description: '执行状态', enum: TaskStatus, required: false })
  @IsOptional()
  @IsEnum(TaskStatus)
  @Type(() => Number)
  status?: TaskStatus;

  @ApiProperty({ description: '开始日期', required: false })
  @IsOptional()
  @IsDateString()
  startTime?: string;

  @ApiProperty({ description: '结束日期', required: false })
  @IsOptional()
  @IsDateString()
  endTime?: string;
}

/**
 * 任务日志ID列表DTO
 */
export class TaskLogIdListDto {
  @ApiProperty({ description: '日志ID列表', type: [Number] })
  @IsArray()
  @IsNumber({}, { each: true })
  @IsNotEmpty({ message: '日志ID列表不能为空' })
  idList: number[];
}
