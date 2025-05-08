import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

/**
 * 任务创建DTO
 */
export class CreateTaskDto {
  @ApiProperty({ description: '任务名称' })
  @IsNotEmpty({ message: '任务名称不能为空' })
  @IsString()
  taskName: string;

  @ApiProperty({ description: '任务组名', default: 'DEFAULT' })
  @IsOptional()
  @IsString()
  taskGroup?: string;

  @ApiProperty({ description: '调用目标' })
  @IsNotEmpty({ message: '调用目标不能为空' })
  @IsString()
  invokeTarget: string;

  @ApiProperty({ description: 'cron执行表达式' })
  @IsNotEmpty({ message: 'cron表达式不能为空' })
  @IsString()
  cronExpression: string;

  @ApiProperty({ description: '错误执行策略', default: 3 })
  @IsOptional()
  @IsNumber()
  misfirePolicy?: number;

  @ApiProperty({ description: '是否并发执行', default: 0 })
  @IsOptional()
  @IsNumber()
  concurrent?: number;

  @ApiProperty({ description: '任务状态', default: 0 })
  @IsOptional()
  @IsNumber()
  status?: number;

  @ApiProperty({ description: '备注信息' })
  @IsOptional()
  @IsString()
  remark?: string;
}

/**
 * 任务更新DTO
 */
export class UpdateTaskDto extends CreateTaskDto {
  @ApiProperty({ description: '任务ID' })
  @IsNotEmpty({ message: '任务ID不能为空' })
  @IsNumber()
  id: number;
}

/**
 * 任务运行DTO
 */
export class RunTaskDto {
  @ApiProperty({ description: '任务ID' })
  @IsNotEmpty({ message: '任务ID不能为空' })
  @IsNumber()
  id: number;

  @ApiProperty({ description: '任务组名', required: false })
  @IsOptional()
  @IsString()
  taskGroup?: string;
}

/**
 * 任务状态更新DTO
 */
export class TaskStatusDto {
  @ApiProperty({ description: '任务ID' })
  @IsNotEmpty({ message: '任务ID不能为空' })
  @IsNumber()
  id: number;

  @ApiProperty({ description: '任务状态', enum: [0, 1] })
  @IsNotEmpty({ message: '任务状态不能为空' })
  @IsNumber()
  status: number;
}
