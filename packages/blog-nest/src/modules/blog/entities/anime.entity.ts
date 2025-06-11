import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

/**
 * 番剧实体
 */
@Entity('t_anime')
export class Anime {
  @ApiProperty({ description: '番剧ID' })
  @PrimaryGeneratedColumn({ comment: '番剧ID' })
  id: number;

  @ApiProperty({ description: '番剧名称' })
  @Column({ name: 'anime_name', comment: '番剧名称', length: 100 })
  animeName: string;

  @ApiProperty({ description: '番剧平台', enum: [1, 2, 3, 4] })
  @Column({
    name: 'platform',
    comment: '番剧平台 (1.bilibili 2.腾讯视频 3.爱奇艺 4.优酷)',
    type: 'tinyint',
    width: 1,
  })
  platform: number;

  @ApiProperty({ description: '番剧ID' })
  @Column({ name: 'anime_id', comment: '番剧ID', length: 50 })
  animeId: string;

  @ApiProperty({ description: '番剧状态', enum: [1, 2] })
  @Column({
    name: 'anime_status',
    comment: '番剧状态 (1.连载中 2.已完结)',
    type: 'tinyint',
    width: 1,
  })
  animeStatus: number;

  @ApiProperty({ description: '追番状态', enum: [1, 2, 3] })
  @Column({
    name: 'watch_status',
    comment: '追番状态 (1.想看 2.在看 3.已看)',
    type: 'tinyint',
    width: 1,
  })
  watchStatus: number;

  @ApiProperty({ description: '封面图片' })
  @Column({ name: 'cover', comment: '封面图片', length: 255, nullable: true })
  cover: string;

  @ApiProperty({ description: '评分' })
  @Column({ name: 'rating', comment: '评分', type: 'decimal', precision: 3, scale: 1, nullable: true })
  rating: number;

  @ApiProperty({ description: '总集数' })
  @Column({ name: 'total_episodes', comment: '总集数', type: 'int', nullable: true })
  totalEpisodes: number;

  @ApiProperty({ description: '已更新集数' })
  @Column({ name: 'current_episodes', comment: '已更新集数', type: 'int', nullable: true })
  currentEpisodes: number;

  @ApiProperty({ description: '简介' })
  @Column({ name: 'description', comment: '简介', type: 'text', nullable: true })
  description: string;

  @ApiProperty({ description: '番剧详情JSON数据' })
  @Column({ name: 'details', comment: '番剧详情JSON数据', type: 'json', nullable: true })
  details: Record<string, any>;

  @ApiProperty({ description: '最后更新时间' })
  @Column({ name: 'last_update_time', comment: '最后更新时间', type: 'datetime', nullable: true })
  lastUpdateTime: Date;

  @ApiProperty({ description: '创建时间' })
  @Column({ name: 'create_time', comment: '创建时间', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createTime: Date;

  @ApiProperty({ description: '更新时间' })
  @Column({ 
    name: 'update_time', 
    comment: '更新时间', 
    type: 'datetime', 
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP'
  })
  updateTime: Date;
} 