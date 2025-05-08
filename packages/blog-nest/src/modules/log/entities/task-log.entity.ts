import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { TaskStatus } from '../dto/task-log.dto';

/**
 * 任务日志实体
 */
@Entity('t_task_log')
export class TaskLog {
  @ApiProperty({ description: '日志ID' })
  @PrimaryGeneratedColumn({ comment: '日志ID' })
  id: number;

  @ApiProperty({ description: '任务名称' })
  @Column({ name: 'task_name', comment: '任务名称', length: 64 })
  taskName: string;

  @ApiProperty({ description: '任务分组' })
  @Column({ name: 'task_group', comment: '任务分组', length: 64 })
  taskGroup: string;

  @ApiProperty({ description: '调用目标' })
  @Column({ name: 'invoke_target', comment: '调用目标', length: 255 })
  invokeTarget: string;

  @ApiProperty({ description: '日志信息' })
  @Column({ name: 'task_message', comment: '日志信息', length: 255, nullable: true, default: '' })
  jobMessage: string;

  @ApiProperty({ description: '执行状态', enum: TaskStatus })
  @Column({ name: 'status', comment: '执行状态（0失败 1成功）', default: 1 })
  status: TaskStatus;

  @ApiProperty({ description: '异常信息' })
  @Column({ name: 'error_info', comment: '错误信息', type: 'longtext', nullable: true })
  exceptionInfo: string;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn({ name: 'create_time', comment: '创建时间' })
  createTime: Date;

  /**
   * 获取执行耗时
   * @returns 执行耗时（毫秒）
   */
  getExecutionTime(): string {
    return '0毫秒'; // 由于数据库表中没有开始时间和结束时间字段，直接返回0
  }
}
