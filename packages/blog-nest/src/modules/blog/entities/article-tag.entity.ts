import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('t_article_tag')
export class ArticleTag {
  @PrimaryColumn({ name: 'article_id' })
  articleId: number;

  @PrimaryColumn({ name: 'tag_id' })
  tagId: number;
}
