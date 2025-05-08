import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * 留言板实体
 */
@Entity('t_message')
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * 昵称
   */
  @Column({ name: 'nickname', length: 50, comment: '昵称' })
  nickname: string;

  /**
   * 头像
   */
  @Column({ name: 'avatar', length: 255, comment: '头像' })
  avatar: string;

  /**
   * 留言内容
   */
  @Column({ name: 'message_content', length: 255, comment: '留言内容' })
  messageContent: string;

  /**
   * 用户IP
   */
  @Column({ name: 'ip_address', length: 50, comment: 'IP地址' })
  ipAddress: string;

  /**
   * 用户地址
   */
  @Column({ name: 'ip_source', length: 50, comment: 'IP来源' })
  ipSource: string;

  /**
   * 是否审核（0-未审核，1-已审核）
   */
  @Column({ name: 'is_check', default: 1, comment: '是否审核通过（0：未通过，1：通过）' })
  isCheck: number;

  /**
   * 创建时间
   */
  @Column({ name: 'create_time', type: 'datetime', comment: '创建时间' })
  createTime: Date;

  /**
   * 更新时间
   */
  @Column({ name: 'update_time', type: 'datetime', comment: '更新时间', nullable: true })
  updateTime: Date;
}
