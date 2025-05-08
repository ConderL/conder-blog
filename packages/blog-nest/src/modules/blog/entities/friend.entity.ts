import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('t_friend')
export class Friend {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'name', length: 20 })
  name: string;

  @Column({ name: 'color', length: 20 })
  color: string;

  @Column({ name: 'avatar', length: 255 })
  avatar: string;

  @Column({ name: 'url', length: 50 })
  url: string;

  @Column({ name: 'introduction', length: 100 })
  introduction: string;

  @CreateDateColumn({ name: 'create_time' })
  createTime?: Date;

  @UpdateDateColumn({ name: 'update_time', nullable: true })
  updateTime?: Date;
}
