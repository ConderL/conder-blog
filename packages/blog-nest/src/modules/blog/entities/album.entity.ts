import { Entity, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

/**
 * 相册实体
 */
@Entity('t_album')
export class Album extends BaseEntity {
  /**
   * 相册名
   */
  @Column({ name: 'album_name', length: 20 })
  albumName?: string;

  /**
   * 相册封面
   */
  @Column({ name: 'album_cover', length: 255 })
  albumCover?: string;

  /**
   * 相册描述
   */
  @Column({ name: 'album_desc', length: 50 })
  albumDesc?: string;

  /**
   * 状态(1公开 2私密)
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
