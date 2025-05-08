import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

/**
 * 聊天消息实体
 */
@Entity('t_chat_record')
export class ChatMessage {
  /**
   * 主键ID
   */
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  /**
   * 用户ID
   */
  @Column({
    name: 'user_id',
    type: 'int',
    nullable: true,
    comment: '用户id',
  })
  userId: number;

  /**
   * 发送者昵称
   */
  @Column({ name: 'nickname', type: 'varchar', length: 50, comment: '用户昵称' })
  nickname: string;

  /**
   * 发送者头像
   */
  @Column({ name: 'avatar', type: 'varchar', length: 255, comment: '头像' })
  avatar: string;

  /**
   * 消息内容
   */
  @Column({ name: 'content', type: 'varchar', length: 1000, comment: '聊天内容' })
  content: string;

  /**
   * 发送者IP地址
   */
  @Column({ name: 'ip_address', type: 'varchar', length: 50, comment: 'ip地址' })
  ipAddress: string;

  /**
   * 发送者IP归属地
   */
  @Column({ name: 'ip_source', type: 'varchar', length: 50, comment: 'ip来源' })
  ipSource: string;

  /**
   * 创建时间
   */
  @CreateDateColumn({ name: 'create_time', type: 'datetime', comment: '创建时间' })
  createTime: Date;
}
