import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

/**
 * 轮播图实体
 */
@Entity('t_carousel')
export class Carousel {
  @ApiProperty({ description: '轮播图ID' })
  @PrimaryGeneratedColumn({ comment: '主键' })
  id: number;

  @ApiProperty({ description: '轮播图图片地址' })
  @Column({ name: 'img_url', length: 255, comment: '轮播图地址' })
  imgUrl: string;

  @ApiProperty({ description: '是否显示' })
  @Column({ name: 'status', default: 0, comment: '是否显示 (0否 1是)' })
  status: number;

  @ApiProperty({ description: '备注' })
  @Column({ name: 'remark', length: 50, nullable: true, default: '', comment: '备注' })
  remark: string;

  @ApiProperty({ description: '创建时间' })
  @Column({
    name: 'create_time',
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
    comment: '创建时间',
  })
  createTime: Date;

  @ApiProperty({ description: '更新时间' })
  @UpdateDateColumn({
    name: 'update_time',
    type: 'datetime',
    nullable: true,
    comment: '更新时间',
  })
  updateTime: Date;
}
