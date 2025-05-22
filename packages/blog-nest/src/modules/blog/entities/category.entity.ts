import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('t_category')
export class Category extends BaseEntity {
  @Column({ length: 50, name: 'category_name' })
  categoryName: string;

  @Column({ name: 'parent_id', default: 0 })
  parentId: number;

  // 虚拟字段
  children: any[];
}
