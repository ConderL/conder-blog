import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

/**
 * 异常日志实体
 */
@Entity('t_exception_log')
export class ExceptionLog extends BaseEntity {
  /**
   * 异常id
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * 异常模块
   */
  @Column({ length: 20 })
  module: string;

  /**
   * 异常uri
   */
  @Column({ length: 255 })
  uri: string;

  /**
   * 异常名称
   */
  @Column({ length: 255 })
  name: string;

  /**
   * 操作描述
   */
  @Column({ length: 255 })
  description: string;

  /**
   * 异常方法
   */
  @Column({ name: 'error_method', length: 255 })
  error_method: string;

  /**
   * 异常信息
   */
  @Column({ type: 'longtext' })
  message: string;

  /**
   * 请求参数
   */
  @Column({ type: 'longtext' })
  params: string;

  /**
   * 请求方式
   */
  @Column({ name: 'request_method', length: 20 })
  request_method: string;

  /**
   * 操作ip
   */
  @Column({ length: 50, name: 'ip_address' })
  ip_address: string;

  /**
   * 操作地址
   */
  @Column({ length: 50, name: 'ip_source' })
  ip_source: string;

  /**
   * 操作系统
   */
  @Column({ length: 50 })
  os: string;

  /**
   * 浏览器
   */
  @Column({ length: 50 })
  browser: string;
}
