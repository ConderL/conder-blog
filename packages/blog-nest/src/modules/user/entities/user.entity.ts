import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('t_user')
export class User extends BaseEntity {
  @Column({ length: 50 })
  nickname: string;

  @Column({ length: 50, unique: true })
  username: string;

  @Column({ select: true })
  password: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ name: 'web_site', nullable: true })
  webSite: string;

  @Column({ type: 'text', nullable: true })
  intro: string;

  @Column({ length: 100, nullable: true })
  email: string;

  @Column({ name: 'ip_address', nullable: true })
  ipAddress: string;

  @Column({ name: 'ip_source', nullable: true })
  ipSource: string;

  @Column({ name: 'login_type', default: 1 })
  loginType: number;

  @Column({ name: 'is_disable', default: 0 })
  isDisable: number;

  @Column({ name: 'login_time', type: 'timestamp', nullable: true })
  loginTime: Date;

  @Column({ name: 'qq_open_id', length: 100, nullable: true })
  qqOpenId: string;

  @Column({ name: 'gitee_open_id', length: 100, nullable: true })
  giteeOpenId: string;

  @Column({ name: 'github_open_id', length: 100, nullable: true })
  githubOpenId: string;
}
