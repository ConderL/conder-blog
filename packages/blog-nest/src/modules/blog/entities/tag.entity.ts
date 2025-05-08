import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('t_tag')
export class Tag extends BaseEntity {
  @Column({ name: 'tag_name', length: 20 })
  tagName: string;
}
