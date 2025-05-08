import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Article } from '../entities/article.entity';
import { Tag } from '../entities/tag.entity';
import { CategoryService } from './category.service';
import { TagService } from './tag.service';
import { Comment } from '../entities/comment.entity';
import { RedisService } from '../../../redis/redis.service';
import { RedisConstant } from '../../../common/constants/redis.constant';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
    private readonly categoryService: CategoryService,
    private readonly tagService: TagService,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    private readonly redisService: RedisService,
  ) {}

  /**
   * 创建文章
   */
  async create(article: Partial<Article>, tagIds: number[] = []): Promise<Article> {
    // 保存文章基本信息
    const savedArticle = await this.articleRepository.save(article);

    // 如果有标签，关联标签
    if (tagIds.length > 0) {
      const tags = await this.tagRepository.findBy({ id: In(tagIds) });
      savedArticle.tags = tags;
      await this.articleRepository.save(savedArticle);
    }

    return savedArticle;
  }

  /**
   * 查询文章列表
   */
  async findAll(
    page: number = 1,
    limit: number = 10,
    keyword?: string,
    categoryId?: number,
    tagId?: number,
    status?: number,
    isDelete: number = 0,
    articleType?: number,
  ): Promise<{ recordList: Article[]; count: number }> {
    const qb = this.articleRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.category', 'category')
      .leftJoinAndSelect('article.tags', 'tag');

    // 关键字搜索
    if (keyword) {
      qb.andWhere('article.articleTitle LIKE :keyword', { keyword: `%${keyword}%` });
    }

    // 分类过滤
    if (categoryId) {
      qb.andWhere('article.categoryId = :categoryId', { categoryId });
    }

    // 标签过滤
    if (tagId) {
      qb.andWhere('tag.id = :tagId', { tagId });
    }

    // 状态过滤
    if (status !== undefined) {
      qb.andWhere('article.status = :status', { status });
    }

    // 文章类型过滤
    if (articleType !== undefined) {
      qb.andWhere('article.articleType = :articleType', { articleType });
    }

    // 删除状态过滤
    qb.andWhere('article.isDelete = :isDelete', { isDelete });

    // 排序: 置顶文章在前，然后按创建时间降序
    qb.orderBy('article.isTop', 'DESC').addOrderBy('article.createTime', 'DESC');

    const count = await qb.getCount();
    const articles = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    // 为每个文章添加tagVOList属性
    const recordList = articles.map((article) => {
      const articleObj = article as any;
      articleObj.tagVOList = article.tags.map((tag) => ({
        tagId: tag.id,
        tagName: tag.tagName,
      }));
      return articleObj;
    }) as Article[];

    return { recordList, count };
  }

  /**
   * 查找文章详情并增加阅读量
   */
  async findById(id: number): Promise<Article> {
    const article = await this.articleRepository.findOne({
      where: { id },
      relations: ['category', 'tags'],
    });

    if (!article) {
      throw new NotFoundException(`文章ID ${id} 不存在`);
    }

    // 更新阅读量 - 仅在内存中处理，不更新数据库
    article.viewCount = (article.viewCount || 0) + 1;

    // 不再尝试更新数据库中不存在的字段
    // await this.articleRepository.update(id, { viewCount: article.viewCount });

    return article;
  }

  /**
   * 更新文章
   */
  async update(id: number, article: Partial<Article>, tagIds: number[] = []): Promise<Article> {
    console.log(
      `执行文章更新, ID: ${id}, 内容前30个字符: ${article.articleContent?.substring(0, 30)}...`,
    );

    const existingArticle = await this.articleRepository.findOne({
      where: { id },
      relations: ['tags'],
    });

    if (!existingArticle) {
      throw new NotFoundException(`文章ID ${id} 不存在`);
    }

    console.log(`现有文章内容前30个字符: ${existingArticle.articleContent?.substring(0, 30)}...`);

    try {
      // 合并文章对象并保存，使用save而不是update以确保完整更新
      const mergedArticle = this.articleRepository.merge(existingArticle, article);
      console.log(`合并后文章内容前30个字符: ${mergedArticle.articleContent?.substring(0, 30)}...`);

      // 保存文章基本信息
      await this.articleRepository.save(mergedArticle);
      console.log(`文章基本信息已保存`);

      // 如果有标签，重新关联标签
      if (tagIds.length > 0) {
        console.log(`更新文章标签，标签ID数量: ${tagIds.length}`);
        const tags = await this.tagRepository.findBy({ id: In(tagIds) });

        // 重新查询文章以获取最新版本
        const updatedArticle = await this.articleRepository.findOne({
          where: { id },
          relations: ['tags'],
        });

        updatedArticle.tags = tags;
        await this.articleRepository.save(updatedArticle);
        console.log(`文章标签已更新`);
      }

      // 查询更新后的文章
      const result = await this.findById(id);
      console.log(`更新后文章内容前30个字符: ${result.articleContent?.substring(0, 30)}...`);

      return result;
    } catch (error) {
      console.error(`更新文章失败:`, error);
      throw error;
    }
  }

  /**
   * 删除文章
   */
  async remove(ids: number[]): Promise<void> {
    if (!ids || ids.length === 0) {
      return;
    }

    // 查找相关的评论并删除
    try {
      console.log(`准备删除文章ID为 ${ids.join(', ')} 的相关评论`);

      // 批量查找关联评论更高效
      const comments = await this.commentRepository.find({
        where: {
          typeId: In(ids),
          commentType: 1, // 文章评论类型
        },
      });

      if (comments.length > 0) {
        console.log(`找到 ${comments.length} 条关联评论，准备删除`);

        // 按文章ID分组记录评论数量，用于日志
        const commentCountByArticle = comments.reduce((acc, comment) => {
          acc[comment.typeId] = (acc[comment.typeId] || 0) + 1;
          return acc;
        }, {});

        for (const [articleId, count] of Object.entries(commentCountByArticle)) {
          console.log(`文章ID=${articleId} 有 ${count} 条评论将被删除`);
        }

        // 批量删除评论
        await this.commentRepository.remove(comments);
        console.log(`成功删除 ${comments.length} 条评论`);
      } else {
        console.log(`未找到与文章关联的评论，无需删除`);
      }
    } catch (error) {
      console.error('删除文章相关评论失败，但将继续删除文章:', error);
      // 错误被捕获但不抛出，允许继续执行文章删除
    }

    // 删除文章
    try {
      const articles = await this.articleRepository.findBy({ id: In(ids) });

      if (articles.length > 0) {
        console.log(`找到 ${articles.length} 篇文章，准备删除`);
        await this.articleRepository.remove(articles);
        console.log(`成功删除 ${articles.length} 篇文章`);
      } else {
        console.log(`未找到指定ID的文章，无需删除`);
      }
    } catch (error) {
      console.error('删除文章失败:', error);
      throw error; // 文章删除失败是关键错误，需要抛出
    }
  }

  /**
   * 更新文章删除状态（回收或恢复）
   */
  async updateIsDelete(id: number, isDelete: number): Promise<void> {
    const article = await this.articleRepository.findOne({ where: { id } });
    if (!article) {
      throw new NotFoundException(`文章ID ${id} 不存在`);
    }

    await this.articleRepository.update(id, { isDelete });
  }

  /**
   * 更新文章置顶状态
   */
  async updateIsTop(id: number, isTop: number): Promise<void> {
    const article = await this.articleRepository.findOne({ where: { id } });
    if (!article) {
      throw new NotFoundException(`文章ID ${id} 不存在`);
    }

    await this.articleRepository.update(id, { isTop });
  }

  /**
   * 更新文章推荐状态
   */
  async updateIsRecommend(id: number, isRecommend: number): Promise<void> {
    const article = await this.articleRepository.findOne({ where: { id } });
    if (!article) {
      throw new NotFoundException(`文章ID ${id} 不存在`);
    }

    await this.articleRepository.update(id, { isRecommend });
  }

  /**
   * 查询推荐文章列表
   * @param page 当前页
   * @param limit 每页条数
   * @returns 推荐文章列表及总数
   */
  async findRecommendArticles(): Promise<Article[]> {
    const qb = this.articleRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.category', 'category')
      .leftJoinAndSelect('article.tags', 'tag')
      .where('article.isDelete = :isDelete', { isDelete: 0 })
      .andWhere('article.status = :status', { status: 1 }) // 只查询公开的文章
      .andWhere('article.isRecommend = :isRecommend', { isRecommend: 1 }); // 只查询推荐的文章

    // 排序: 置顶文章在前，然后按创建时间降序
    qb.orderBy('article.isTop', 'DESC').addOrderBy('article.createTime', 'DESC');

    const articles = await qb.getMany();

    // 为每个文章添加tagVOList属性
    const recordList = articles.map((article) => {
      const articleObj = article as any;
      articleObj.tagVOList = article.tags.map((tag) => ({
        tagId: tag.id,
        tagName: tag.tagName,
      }));
      return articleObj;
    }) as Article[];

    return recordList;
  }

  /**
   * 增加文章点赞数
   * @param articleId 文章ID
   * @returns 增加后的点赞数
   */
  async incrementLikes(articleId: number): Promise<number> {
    try {
      const newCount = await this.redisService.hincrby(
        RedisConstant.ARTICLE_LIKE_COUNT,
        articleId.toString(),
        1,
      );
      return newCount;
    } catch (error) {
      console.error(`增加文章点赞数失败: ${error.message}`);
      return 0;
    }
  }

  /**
   * 减少文章点赞数
   * @param articleId 文章ID
   * @returns 减少后的点赞数
   */
  async decrementLikes(articleId: number): Promise<number> {
    try {
      // 获取当前点赞数
      const currentCount = await this.redisService.getHash(
        RedisConstant.ARTICLE_LIKE_COUNT,
        articleId.toString(),
      );

      // 如果当前点赞数大于0，才减少
      if (currentCount > 0) {
        const newCount = await this.redisService.hincrby(
          RedisConstant.ARTICLE_LIKE_COUNT,
          articleId.toString(),
          -1,
        );
        return newCount;
      }

      return currentCount;
    } catch (error) {
      console.error(`减少文章点赞数失败: ${error.message}`);
      return 0;
    }
  }

  /**
   * 获取文章点赞数
   * @param articleId 文章ID
   * @returns 点赞数
   */
  async getLikeCount(articleId: number): Promise<number> {
    try {
      return await this.redisService.getHash(
        RedisConstant.ARTICLE_LIKE_COUNT,
        articleId.toString(),
      );
    } catch (error) {
      console.error(`获取文章点赞数失败: ${error.message}`);
      return 0;
    }
  }

  /**
   * 获取多个文章的点赞数
   * @param articleIds 文章ID数组
   * @returns 文章ID与点赞数的映射
   */
  async getLikeCounts(articleIds: number[]): Promise<Record<string, number>> {
    try {
      const likeCountMap = await this.redisService.getHashAll(RedisConstant.ARTICLE_LIKE_COUNT);

      // 过滤出请求的文章ID的点赞数
      const result: Record<string, number> = {};
      for (const articleId of articleIds) {
        const id = articleId.toString();
        result[id] = likeCountMap[id] || 0;
      }

      return result;
    } catch (error) {
      console.error(`获取多篇文章点赞数失败: ${error.message}`);
      return {};
    }
  }
}
