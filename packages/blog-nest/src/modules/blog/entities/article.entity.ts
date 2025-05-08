import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
  AfterLoad,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Category } from './category.entity';
import { Tag } from './tag.entity';

/**
 * 文章实体
 */
@Entity('t_article')
export class Article extends BaseEntity {
  /**
   * 用户ID
   */
  @Column({ name: 'user_id' })
  userId: number;

  /**
   * 文章标题
   */
  @Column({ name: 'article_title', length: 50 })
  articleTitle: string;

  /**
   * 文章内容
   */
  @Column({ name: 'article_content', type: 'longtext' })
  articleContent: string;

  /**
   * 文章描述
   */
  @Column({ name: 'article_desc', length: 100 })
  articleDesc: string;

  /**
   * 文章类型（1-原创，2-转载，3-翻译）
   */
  @Column({ name: 'article_type', type: 'tinyint', width: 1, default: 1 })
  articleType: number;

  /**
   * 文章状态（1-公开，2-私密，3-草稿）
   */
  @Column({ name: 'status', type: 'tinyint', width: 1, default: 1 })
  status: number;

  /**
   * 是否置顶（0-否，1-是）
   */
  @Column({ name: 'is_top', default: 0 })
  isTop: number;

  /**
   * 是否删除（0-否，1-是）
   */
  @Column({ name: 'is_delete', default: 0 })
  isDelete: number;

  /**
   * 文章封面
   */
  @Column({ name: 'article_cover', nullable: true })
  articleCover: string;

  /**
   * 分类ID
   */
  @Column({ name: 'category_id' })
  categoryId: number;

  /**
   * 分类
   */
  @ManyToOne(() => Category)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  /**
   * 标签
   */
  @ManyToMany(() => Tag)
  @JoinTable({
    name: 't_article_tag',
    joinColumn: { name: 'article_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'id' },
  })
  tags: Tag[];

  /**
   * 是否推荐（0-否，1-是）
   */
  @Column({ name: 'is_recommend', default: 0 })
  isRecommend: number;

  /**
   * 创建时间
   */
  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;

  /**
   * 更新时间
   */
  @UpdateDateColumn({ name: 'update_time', nullable: true })
  updateTime: Date;

  /**
   * 原文链接（转载文章使用）- 虚拟字段，不映射到数据库
   */
  originalUrl?: string;

  /**
   * 阅读量 - 虚拟字段，不映射到数据库
   */
  viewCount: number = 0;

  /**
   * 点赞量 - 虚拟字段，不映射到数据库
   */
  likeCount: number = 0;

  /**
   * 是否允许评论 - 虚拟字段，不映射到数据库
   */
  isComment: number = 1;

  /**
   * 实体加载后设置虚拟字段的默认值
   */
  @AfterLoad()
  setVirtualProperties() {
    this.viewCount = 0;
    this.likeCount = 0;
    this.isComment = 1;
    this.originalUrl = '';
  }
}
