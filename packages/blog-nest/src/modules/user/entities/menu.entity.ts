import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('t_menu')
export class Menu extends BaseEntity {
  @Column({ name: 'menu_name', length: 50 })
  name: string;

  @Column({ name: 'path', length: 255, nullable: true })
  path: string;

  @Column({ name: 'component', length: 50, nullable: true })
  component: string;

  @Column({ name: 'icon', length: 50, nullable: true })
  icon: string;

  @Column({ name: 'parent_id', default: 0 })
  parentId: number;

  @Column({ name: 'order_num', default: 1 })
  orderNum: number;

  @Column({ name: 'is_hidden', type: 'tinyint', default: 0 })
  hidden: number;

  get isHidden(): number {
    return this.hidden;
  }

  @Column({ name: 'menu_type', type: 'char', length: 1 })
  type: string;

  @Column({ name: 'perms', length: 100, nullable: true })
  perms: string;

  @Column({ name: 'is_disable', type: 'tinyint', default: 0 })
  disable: boolean;

  @Column({ name: 'create_time', type: 'datetime' })
  createTime: Date;

  @Column({ name: 'update_time', type: 'datetime', nullable: true })
  updateTime: Date;
}
