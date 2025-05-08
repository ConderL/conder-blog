import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

/**
 * 任务实体
 */
@Entity('t_task')
export class Task {
  @ApiProperty({ description: '任务ID' })
  @PrimaryGeneratedColumn({ comment: '任务ID' })
  id: number;

  @ApiProperty({ description: '任务名称' })
  @Column({ name: 'task_name', comment: '任务名称', length: 64 })
  taskName: string;

  @ApiProperty({ description: '任务组名' })
  @Column({ name: 'task_group', comment: '任务组名', length: 64, default: 'DEFAULT' })
  taskGroup: string;

  @ApiProperty({ description: '调用目标' })
  @Column({ name: 'invoke_target', comment: '调用目标', length: 500 })
  invokeTarget: string;

  @ApiProperty({ description: 'cron执行表达式' })
  @Column({ name: 'cron_expression', comment: 'cron执行表达式', nullable: true })
  cronExpression: string;

  @ApiProperty({ description: '计划执行错误策略' })
  @Column({
    name: 'misfire_policy',
    comment: '计划执行错误策略 (1立即执行 2执行一次 3放弃执行)',
    type: 'tinyint',
    width: 1,
    default: 3,
  })
  misfirePolicy: number;

  @ApiProperty({ description: '是否并发执行' })
  @Column({
    name: 'concurrent',
    comment: '是否并发执行 (0否 1是)',
    type: 'tinyint',
    width: 1,
    default: 0,
  })
  concurrent: number;

  @ApiProperty({ description: '任务状态' })
  @Column({
    name: 'status',
    comment: '任务状态 (0运行 1暂停)',
    type: 'tinyint',
    width: 1,
    default: 0,
  })
  status: number;

  @ApiProperty({ description: '任务备注信息' })
  @Column({ name: 'remark', comment: '任务备注信息', length: 500, nullable: true })
  remark: string;

  @ApiProperty({ description: '创建时间' })
  @Column({ name: 'create_time', comment: '创建时间', type: 'datetime', nullable: true })
  createTime: Date;

  @ApiProperty({ description: '更新时间' })
  @Column({ name: 'update_time', comment: '更新时间', type: 'datetime', nullable: true })
  updateTime: Date;
}
