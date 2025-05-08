import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In, Raw } from 'typeorm';
import { Article } from '../entities/article.entity';
import { Tag } from '../entities/tag.entity';
import { Category } from '../entities/category.entity';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  /**
   * 搜索文章
   */
  async searchArticles(
    keyword: string,
    page = 1,
    limit = 10,
  ): Promise<{ items: Article[]; total: number }> {
    const queryBuilder = this.articleRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.category', 'category')
      .leftJoinAndSelect('article.tags', 'tag')
      .leftJoinAndSelect('article.user', 'user')
      .where('article.isDelete = :isDelete', { isDelete: 0 })
      .andWhere('article.status = :status', { status: 1 }); // 只搜索公开的文章

    if (keyword) {
      queryBuilder.andWhere(
        '(article.articleTitle LIKE :keyword OR article.articleDesc LIKE :keyword OR article.articleContent LIKE :keyword)',
        { keyword: `%${keyword}%` },
      );
    }

    const total = await queryBuilder.getCount();
    const items = await queryBuilder
      .orderBy('article.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { items, total };
  }

  /**
   * 热门搜索
   */
  async getHotSearch(limit = 10): Promise<Article[]> {
    return this.articleRepository.find({
      where: { isDelete: 0, status: 1 },
      order: { createdAt: 'DESC' },
      take: limit,
      relations: ['category', 'user'],
    });
  }

  /**
   * 标签搜索
   */
  async searchByTag(
    tagId: number,
    page = 1,
    limit = 10,
  ): Promise<{ items: Article[]; total: number }> {
    const queryBuilder = this.articleRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.category', 'category')
      .leftJoinAndSelect('article.tags', 'tag')
      .leftJoinAndSelect('article.user', 'user')
      .where('article.isDelete = :isDelete', { isDelete: 0 })
      .andWhere('article.status = :status', { status: 1 })
      .andWhere('tag.id = :tagId', { tagId });

    const total = await queryBuilder.getCount();
    const items = await queryBuilder
      .orderBy('article.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { items, total };
  }

  /**
   * 全文搜索
   */
  async fullTextSearch(
    keyword: string,
    page = 1,
    limit = 10,
  ): Promise<{ items: Article[]; total: number }> {
    const queryBuilder = this.articleRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.category', 'category')
      .leftJoinAndSelect('article.tags', 'tag')
      .leftJoinAndSelect('article.user', 'user')
      .where('article.isDelete = :isDelete', { isDelete: 0 })
      .andWhere('article.status = :status', { status: 1 });

    if (keyword) {
      queryBuilder.andWhere(
        `MATCH(article.articleTitle, article.articleDesc, article.articleContent) AGAINST (:keyword IN BOOLEAN MODE)`,
        { keyword: `${keyword}*` },
      );
    }

    const total = await queryBuilder.getCount();
    const items = await queryBuilder
      .orderBy('article.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { items, total };
  }

  /**
   * 获取标签云
   */
  async getTagCloud(): Promise<{ tagName: string; count: number }[]> {
    // 使用原生SQL查询更高效
    const result = await this.articleRepository.query(`
      SELECT t.id, t.tag_name as tagName, COUNT(at.article_id) as count 
      FROM tags t 
      LEFT JOIN article_tags at ON t.id = at.tag_id 
      LEFT JOIN articles a ON at.article_id = a.id AND a.is_delete = 0 AND a.status = 1
      GROUP BY t.id 
      ORDER BY count DESC
    `);

    return result;
  }

  /**
   * 相关文章推荐
   */
  async getRelatedArticles(articleId: number, limit = 5): Promise<Article[]> {
    // 获取当前文章的标签
    const article = await this.articleRepository.findOne({
      where: { id: articleId },
      relations: ['tags'],
    });

    if (!article || !article.tags || article.tags.length === 0) {
      // 如果没有标签，返回最新的文章
      return this.articleRepository.find({
        where: { isDelete: 0, status: 1 },
        order: { createdAt: 'DESC' },
        take: limit,
        relations: ['category', 'user'],
      });
    }

    const tagIds = article.tags.map((tag) => tag.id);

    // 查找拥有相同标签的文章
    const queryBuilder = this.articleRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.category', 'category')
      .leftJoinAndSelect('article.user', 'user')
      .leftJoin('article.tags', 'tag')
      .where('article.id != :articleId', { articleId })
      .andWhere('article.isDelete = :isDelete', { isDelete: 0 })
      .andWhere('article.status = :status', { status: 1 })
      .andWhere('tag.id IN (:...tagIds)', { tagIds });

    return queryBuilder.orderBy('article.createdAt', 'DESC').take(limit).getMany();
  }
}
