import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Like } from 'typeorm';
import { Tag } from '../entities/tag.entity';

@Injectable()
export class TagService {
  constructor(
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
  ) {}

  /**
   * 创建标签
   */
  async create(tag: Partial<Tag>): Promise<Tag> {
    // 创建新标签并设置创建时间
    const newTag = this.tagRepository.create({
      ...tag,
      createTime: new Date(),
    });
    return await this.tagRepository.save(newTag);
  }

  /**
   * 更新标签
   */
  async update(id: number, tag: Partial<Tag>): Promise<Tag> {
    const existingTag = await this.tagRepository.findOne({ where: { id } });
    if (!existingTag) {
      throw new NotFoundException(`标签ID ${id} 不存在`);
    }

    // 合并更新数据并设置更新时间
    const updatedTag = this.tagRepository.merge(existingTag, {
      ...tag,
      updateTime: new Date(),
    });
    return await this.tagRepository.save(updatedTag);
  }

  /**
   * 删除标签
   */
  async remove(id: number): Promise<void> {
    const existingTag = await this.tagRepository.findOne({ where: { id } });
    if (!existingTag) {
      throw new NotFoundException(`标签ID ${id} 不存在`);
    }

    await this.tagRepository.delete(id);
  }

  /**
   * 批量删除标签
   * @param ids 标签ID数组
   */
  async removeMultiple(ids: number[]): Promise<void> {
    if (!ids || ids.length === 0) {
      return;
    }

    const existingTags = await this.tagRepository.find({
      where: { id: In(ids) },
    });

    if (existingTags.length !== ids.length) {
      const foundIds = existingTags.map((tag) => tag.id);
      const missingIds = ids.filter((id) => !foundIds.includes(id));
      throw new NotFoundException(`以下标签ID不存在: ${missingIds.join(', ')}`);
    }

    await this.tagRepository.delete(ids);
  }

  /**
   * 分页查询标签
   * @param page 页码
   * @param limit 每页数量
   * @param keyword 关键词
   */
  async findByPage(
    page: number,
    limit: number,
    keyword?: string,
  ): Promise<{ recordList: any[]; count: number }> {
    try {
      // 先查询符合条件的标签
      const tagQueryBuilder = this.tagRepository.createQueryBuilder('tag');

      if (keyword) {
        tagQueryBuilder.where('tag.tag_name LIKE :keyword', { keyword: `%${keyword}%` });
      }

      // 计算总数
      const total = await tagQueryBuilder.getCount();

      // 查询标签并添加文章数量
      const tags = await tagQueryBuilder
        .orderBy('tag.create_time', 'DESC')
        .skip((page - 1) * limit)
        .take(limit)
        .getMany();

      // 查询每个标签关联的文章数量
      const tagsWithArticleCount = await Promise.all(
        tags.map(async (tag) => {
          const articleCount = await this.getArticleCountByTagId(tag.id);
          return {
            id: tag.id,
            tagName: tag.tagName,
            createTime: tag.createTime,
            articleCount,
          };
        }),
      );

      return { recordList: tagsWithArticleCount, count: total };
    } catch (error) {
      console.error('查询标签列表失败:', error);
      throw error;
    }
  }

  /**
   * 获取标签关联的文章数量
   */
  private async getArticleCountByTagId(tagId: number): Promise<number> {
    try {
      const query = this.tagRepository.manager
        .createQueryBuilder()
        .select('COUNT(article_id) as count')
        .from('t_article_tag', 'at')
        .where('at.tag_id = :tagId', { tagId });

      const result = await query.getRawOne();
      return result ? parseInt(result.count, 10) : 0;
    } catch (error) {
      console.error(`获取标签(ID: ${tagId})关联的文章数量失败:`, error);
      return 0;
    }
  }

  /**
   * 获取标签列表
   */
  async findAll(): Promise<any[]> {
    const tags = await this.tagRepository.find({
      order: { createTime: 'DESC' },
    });

    // 查询每个标签关联的文章数量
    const tagsWithArticleCount = await Promise.all(
      tags.map(async (tag) => {
        const articleCount = await this.getArticleCountByTagId(tag.id);
        return {
          id: tag.id,
          tagName: tag.tagName,
          articleCount,
        };
      }),
    );

    return tagsWithArticleCount;
  }

  /**
   * 根据ID获取标签
   */
  async findById(id: number): Promise<Tag> {
    const tag = await this.tagRepository.findOne({ where: { id } });
    if (!tag) {
      throw new NotFoundException(`标签ID ${id} 不存在`);
    }
    return tag;
  }

  /**
   * 根据名称获取标签
   */
  async findByName(tagName: string): Promise<Tag> {
    return await this.tagRepository.findOne({ where: { tagName } });
  }

  /**
   * 查找或创建标签
   */
  async findOrCreate(tagName: string): Promise<Tag> {
    let tag = await this.findByName(tagName);
    if (!tag) {
      tag = await this.create({ tagName });
    }
    return tag;
  }
}
