import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Like } from 'typeorm';
import { Category } from '../entities/category.entity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  /**
   * 创建分类
   */
  async create(category: Partial<Category>): Promise<Category> {
    const newCategory = this.categoryRepository.create({
      ...category,
      createTime: new Date(),
    });
    return this.categoryRepository.save(newCategory);
  }

  /**
   * 更新分类
   */
  async update(id: number, category: Partial<Category>): Promise<Category> {
    const existCategory = await this.categoryRepository.findOne({ where: { id } });
    if (!existCategory) {
      throw new NotFoundException(`分类ID ${id} 不存在`);
    }

    // 更新数据并设置更新时间
    await this.categoryRepository.update(id, {
      ...category,
      updateTime: new Date(),
    });

    return this.categoryRepository.findOne({ where: { id } });
  }

  /**
   * 删除分类
   */
  async remove(id: number): Promise<void> {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException(`分类ID ${id} 不存在`);
    }
    await this.categoryRepository.remove(category);
  }

  /**
   * 批量删除分类
   */
  async removeMultiple(ids: number[]): Promise<void> {
    if (!ids || ids.length === 0) {
      return;
    }

    const existingCategories = await this.categoryRepository.find({
      where: { id: In(ids) },
    });

    if (existingCategories.length !== ids.length) {
      const foundIds = existingCategories.map((category) => category.id);
      const missingIds = ids.filter((id) => !foundIds.includes(id));
      throw new NotFoundException(`以下分类ID不存在: ${missingIds.join(', ')}`);
    }

    await this.categoryRepository.delete(ids);
  }

  /**
   * 获取所有分类
   */
  async findAll(): Promise<any[]> {
    const categories = await this.categoryRepository.find({
      order: { createTime: 'DESC' },
    });

    // 获取每个分类下的文章数量
    const result = await Promise.all(
      categories.map(async (category) => {
        const articleCount = await this.getArticleCountByCategory(category.id);
        return {
          id: category.id,
          categoryName: category.categoryName,
          articleCount,
        };
      }),
    );

    return result;
  }

  /**
   * 分页查询分类
   */
  async findByPage(
    page: number = 1,
    limit: number = 10,
    keyword?: string,
  ): Promise<{ recordList: any[]; count: number }> {
    const queryBuilder = this.categoryRepository.createQueryBuilder('category');

    if (keyword) {
      queryBuilder.where('category.category_name LIKE :keyword', { keyword: `%${keyword}%` });
    }

    queryBuilder.orderBy('category.create_time', 'DESC');

    const total = await queryBuilder.getCount();
    const items = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    // 获取每个分类下的文章数量并转换为前端需要的格式
    const categoriesWithArticleCount = await Promise.all(
      items.map(async (category) => {
        const articleCount = await this.getArticleCountByCategory(category.id);
        return {
          id: category.id,
          categoryName: category.categoryName,
          parentId: category.parentId,
          createTime: category.createTime,
          articleCount,
        };
      }),
    );

    return { recordList: categoriesWithArticleCount, count: total };
  }

  /**
   * 获取分类树
   */
  async findTree(): Promise<Category[]> {
    const categories = await this.categoryRepository.find({ order: { createTime: 'DESC' } });
    return this.buildTree(categories);
  }

  /**
   * 根据ID查找分类
   */
  async findById(id: number): Promise<Category> {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException(`分类ID ${id} 不存在`);
    }
    return category;
  }

  /**
   * 获取分类下的文章数量
   */
  private async getArticleCountByCategory(categoryId: number): Promise<number> {
    // 这里需要根据实际表结构查询文章数量
    // 如果文章表中有category_id字段，可以直接统计
    try {
      const queryBuilder = this.categoryRepository.manager
        .createQueryBuilder()
        .select('COUNT(id)', 'count')
        .from('t_article', 'article')
        .where('article.category_id = :categoryId', { categoryId });

      const result = await queryBuilder.getRawOne();
      return result ? Number(result.count) : 0;
    } catch (error) {
      console.error('获取分类文章数量失败', error);
      return 0;
    }
  }

  /**
   * 构建分类树
   */
  private buildTree(categories: Category[], parentId: number = 0): Category[] {
    const result: Category[] = [];

    for (const category of categories) {
      if (category.parentId === parentId) {
        const children = this.buildTree(categories, category.id);
        if (children.length > 0) {
          // @ts-expect-error 分类树子节点不在实体定义中
          category.children = children;
        }
        result.push(category);
      }
    }

    return result;
  }
}
