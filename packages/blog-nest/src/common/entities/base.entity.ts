import { PrimaryGeneratedColumn, Column, BeforeInsert } from 'typeorm';

export abstract class BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'create_time', type: 'datetime', nullable: true })
  createTime: Date;

  // 设置select: false，防止自动包含此字段
  @Column({
    name: 'update_time',
    type: 'datetime',
    nullable: true,
    select: false,
    insert: false,
    update: false,
  })
  updateTime: Date;

  // 添加getter以保持向后兼容
  get createdAt(): Date {
    return this.createTime;
  }

  get updatedAt(): Date {
    return this.updateTime;
  }

  @BeforeInsert()
  setCreateTime() {
    this.createTime = new Date();
  }
}
