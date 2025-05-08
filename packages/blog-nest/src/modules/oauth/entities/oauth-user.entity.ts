import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * 第三方用户信息临时存储实体
 */
@Entity('oauth_user_info')
export class OauthUserEntity {
  @PrimaryGeneratedColumn({ comment: '主键ID' })
  id: number;

  @Column({ type: 'varchar', length: 50, comment: '用户来源标识ID' })
  sourceId: string;

  @Column({ type: 'varchar', length: 50, comment: '用户名' })
  username: string;

  @Column({ type: 'varchar', length: 50, comment: '用户昵称' })
  nickname: string;

  @Column({ type: 'varchar', length: 255, comment: '用户头像' })
  avatar: string;

  @Column({ type: 'varchar', length: 100, nullable: true, comment: '用户邮箱' })
  email: string;

  @Column({ type: 'tinyint', default: 0, comment: '登录方式 (1邮箱 2QQ 3Gitee 4Github)' })
  loginType: number;

  @Column({ type: 'varchar', length: 255, comment: '访问令牌' })
  accessToken: string;

  @Column({ type: 'int', nullable: true, comment: '关联的系统用户ID' })
  userId: number;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', comment: '创建时间' })
  createTime: Date;

  @Column({ type: 'datetime', nullable: true, default: null, comment: '更新时间' })
  updateTime: Date;
}
