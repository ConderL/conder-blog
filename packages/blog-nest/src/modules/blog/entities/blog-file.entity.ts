import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../user/entities/user.entity';

@Entity('t_blog_file')
export class BlogFile extends BaseEntity {
  @Column({ name: 'file_name' })
  fileName: string;

  @Column({ name: 'file_url' })
  fileUrl: string;

  @Column({ name: 'file_size' })
  fileSize: number;

  @Column({ name: 'file_type' })
  fileType: string;

  @Column({ name: 'file_md5', nullable: true })
  fileMd5: string;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'is_delete', default: 0 })
  isDelete: number;
}
