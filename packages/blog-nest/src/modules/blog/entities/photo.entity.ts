import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

/**
 * 照片实体
 */
@Entity('t_photo')
export class Photo {
  /**
   * 照片ID
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * 所属相册ID
   */
  @Column({ name: 'album_id', comment: '所属相册ID' })
  albumId: number;

  /**
   * 照片URL
   */
  @Column({ name: 'photo_url', comment: '照片URL', type: 'text' })
  photoUrl: string;

  /**
   * 照片名称
   */
  @Column({ name: 'photo_name', comment: '照片名称', type: 'text' })
  photoName: string;

  /**
   * 照片描述
   */
  @Column({ name: 'photo_desc', comment: '照片描述', length: 50, nullable: true })
  photoDesc: string;

  /**
   * 创建时间
   */
  @Column({ name: 'create_time', comment: '创建时间' })
  createTime: Date;

  /**
   * 更新时间
   */
  @Column({ name: 'update_time', comment: '更新时间', nullable: true })
  updateTime: Date;
}
