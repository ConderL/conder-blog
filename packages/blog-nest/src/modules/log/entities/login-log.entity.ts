import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

/**
 * 登录日志实体
 */
@Entity('login_log')
export class LoginLog {
  @ApiProperty({ description: '访问ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '用户账号' })
  @Column({ name: 'username', length: 50, comment: '用户账号' })
  username: string;

  @ApiProperty({ description: '登录IP地址' })
  @Column({ name: 'ip_address', length: 128, comment: '登录IP地址' })
  ipAddress: string;

  @ApiProperty({ description: '登录地点' })
  @Column({ name: 'login_location', length: 255, comment: '登录地点', nullable: true })
  loginLocation: string;

  @ApiProperty({ description: '浏览器类型' })
  @Column({ name: 'browser', length: 50, comment: '浏览器类型', nullable: true })
  browser: string;

  @ApiProperty({ description: '操作系统' })
  @Column({ name: 'os', length: 50, comment: '操作系统', nullable: true })
  os: string;

  @ApiProperty({ description: '登录状态（0成功 1失败）' })
  @Column({ name: 'status', comment: '登录状态（0成功 1失败）', default: 0 })
  status: number;

  @ApiProperty({ description: '提示消息' })
  @Column({ name: 'msg', length: 255, comment: '提示消息', nullable: true })
  msg: string;

  @ApiProperty({ description: '访问时间' })
  @CreateDateColumn({ name: 'login_time', comment: '访问时间' })
  loginTime: Date;
}
