import { Entity, Column, CreateDateColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

/**
 * 访问日志实体
 * 记录用户访问网站的相关信息，如IP地址、浏览器、操作系统等
 */
@Entity('t_visit_log')
export class VisitLog extends BaseEntity {
  /**
   * 访问的页面URL
   */
  @Column({ name: 'page', nullable: true })
  pageUrl: string;

  /**
   * 访客IP地址
   */
  @Column({ name: 'ip_address' })
  ipAddress: string;

  /**
   * IP地址来源
   */
  @Column({ name: 'ip_source', nullable: true })
  ipSource: string;

  /**
   * 操作系统
   */
  @Column({ name: 'os', nullable: true })
  os: string;

  /**
   * 浏览器
   */
  @Column({ name: 'browser', nullable: true })
  browser: string;

  /**
   * 创建时间
   */
  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;
}
