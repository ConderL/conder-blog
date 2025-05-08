import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('t_role')
export class Role extends BaseEntity {
  @Column({ name: 'role_name', length: 50 })
  roleName: string;

  @Column({ name: 'role_desc', length: 50, nullable: true })
  roleDesc: string;

  @Column({ name: 'is_disable', type: 'tinyint', default: 0 })
  isDisable: number;

  @Column({ name: 'create_time', type: 'datetime' })
  createTime: Date;

  @Column({ name: 'update_time', type: 'datetime', nullable: true })
  updateTime: Date;

  // 添加getter以保持向后兼容
  get roleLabel(): string {
    return this.roleName;
  }

  // 添加getter以保持向后兼容
  get remark(): string {
    return this.roleDesc;
  }
}
