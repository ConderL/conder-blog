import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../../modules/user/entities/user.entity';
import { Article } from './article.entity';

/**
 * 评论类型常量
 */
export enum CommentType {
  ARTICLE = 1, // 文章评论
  FRIEND = 2, // 友链评论
  TALK = 3, // 说说评论
  MESSAGE = 4, // 留言评论
}

/**
 * 评论实体
 */
@Entity('t_comment')
export class Comment extends BaseEntity {
  /**
   * 评论类型 (0: 文章评论, 1: 友链评论, 2: 说说评论)
   */
  @Column({ name: 'comment_type', type: 'tinyint', width: 1 })
  commentType: number;

  /**
   * 类型ID (文章ID、友链ID或说说ID)
   */
  @Column({ name: 'type_id', nullable: true })
  typeId: number;

  /**
   * 评论内容
   */
  @Column({ name: 'comment_content', type: 'text' })
  content: string;

  /**
   * 评论用户ID
   */
  @Column({ name: 'from_uid' })
  userId: number;

  /**
   * 回复用户ID
   */
  @Column({ name: 'to_uid', nullable: true })
  toUid: number;

  /**
   * 父评论ID
   */
  @Column({ name: 'parent_id', nullable: true })
  parentId: number;

  /**
   * 回复评论ID
   */
  @Column({ name: 'reply_id', nullable: true })
  replyId: number;

  /**
   * 是否审核
   * 0-未审核，1-已审核
   */
  @Column({ name: 'is_check', type: 'tinyint', width: 1, default: 1 })
  isCheck: number;

  /**
   * 点赞数量
   */
  @Column({ name: 'like_count', default: 0 })
  likeCount: number;

  /**
   * 文章
   */
  @ManyToOne(() => Article)
  @JoinColumn({ name: 'type_id' })
  article: Article;

  /**
   * 用户
   */
  @ManyToOne(() => User)
  @JoinColumn({ name: 'from_uid' })
  user: User;

  /**
   * 子评论列表 - 非数据库字段
   */
  children: Comment[];

  // 兼容性getter
  get articleId(): number {
    return this.typeId;
  }

  get ipAddress(): string {
    return null;
  }

  get ipSource(): string {
    return null;
  }

  get device(): string {
    return null;
  }
}
