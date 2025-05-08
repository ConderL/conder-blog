import { Entity, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../../modules/user/entities/user.entity';

/**
 * 说说实体
 */
@Entity('t_talk')
export class Talk extends BaseEntity {
  /**
   * 用户ID
   */
  @Column({ name: 'user_id' })
  userId: number;

  /**
   * 用户信息
   */
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  /**
   * 说说内容
   */
  @Column({ name: 'talk_content', length: 2000 })
  talkContent: string;

  /**
   * 说说图片
   */
  @Column({ name: 'images', length: 2500, nullable: true })
  images: string;

  /**
   * 是否置顶（0-否，1-是）
   */
  @Column({ name: 'is_top', type: 'tinyint', width: 1, default: 0 })
  isTop: number;

  /**
   * 状态（1-公开，2-私密）
   */
  @Column({ name: 'status', type: 'tinyint', width: 1, default: 1 })
  status: number;

  /**
   * 创建时间
   */
  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;

  /**
   * 更新时间
   */
  @UpdateDateColumn({ name: 'update_time', nullable: true })
  updateTime: Date;
}
