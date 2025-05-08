import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class TaskRunDto {
  @ApiProperty({ description: '任务名称', example: '系统数据备份' })
  @IsNotEmpty({ message: '任务名称不能为空' })
  @IsString()
  taskName: string;

  @ApiProperty({ description: '任务组名', example: 'SYSTEM', required: false })
  @IsOptional()
  @IsString()
  taskGroup?: string;

  @ApiProperty({ description: '调用目标', example: 'handleDatabaseBackup' })
  @IsNotEmpty({ message: '调用目标不能为空' })
  @IsString()
  invokeTarget: string;
}
