import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Carousel } from '../entities/carousel.entity';
import { CreateCarouselDto, CarouselQuery, UpdateCarouselDto } from '../dto/carousel.dto';
import { UploadFileEntity } from '../../upload/entities/file.entity';

/**
 * 轮播图服务
 * 提供轮播图的增删改查功能
 */
@Injectable()
export class CarouselService {
  private readonly logger = new Logger(CarouselService.name);

  constructor(
    @InjectRepository(Carousel)
    private readonly carouselRepository: Repository<Carousel>,
    @InjectRepository(UploadFileEntity)
    private readonly fileRepository: Repository<UploadFileEntity>,
  ) {}

  /**
   * 创建轮播图
   * @param createCarouselDto 创建轮播图数据
   * @returns 创建的轮播图信息
   */
  async create(createCarouselDto: CreateCarouselDto): Promise<Carousel> {
    this.logger.log(`创建轮播图: ${JSON.stringify(createCarouselDto)}`);
    const carousel = this.carouselRepository.create({
      ...createCarouselDto,
      createTime: new Date(),
    });
    return await this.carouselRepository.save(carousel);
  }

  /**
   * 查询轮播图列表
   * @param query 查询条件
   * @returns 查询结果
   */
  async findAll(query: CarouselQuery) {
    const { page = 1, pageSize = 10, status } = query;
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.carouselRepository.createQueryBuilder('carousel');

    // 构建查询条件
    if (status !== undefined && status !== null && !isNaN(Number(status))) {
      queryBuilder.andWhere('carousel.status = :status', { status });
    }

    // 查询总数
    const total = await queryBuilder.getCount();

    // 分页查询数据
    const recordList = await queryBuilder
      .orderBy('carousel.createTime', 'DESC')
      .skip(skip)
      .take(pageSize)
      .getMany();

    return {
      recordList,
      pagination: {
        total,
        page,
        pageSize,
      },
    };
  }

  /**
   * 查询前台展示的轮播图列表
   * @returns 前台展示的轮播图列表
   */
  async findFrontList() {
    return await this.carouselRepository.find({
      where: { status: 1 },
      order: { createTime: 'DESC' },
    });
  }

  /**
   * 查询单个轮播图
   * @param id 轮播图ID
   * @returns 轮播图信息
   */
  async findOne(id: number): Promise<Carousel> {
    const carousel = await this.carouselRepository.findOne({ where: { id } });
    if (!carousel) {
      throw new NotFoundException(`轮播图 ID ${id} 不存在`);
    }
    return carousel;
  }

  /**
   * 更新轮播图
   * @param id 轮播图ID
   * @param updateCarouselDto 更新数据
   * @returns 更新后的轮播图信息
   */
  async update(id: number, updateCarouselDto: UpdateCarouselDto): Promise<Carousel> {
    this.logger.log(`更新轮播图 ID: ${id}, 数据: ${JSON.stringify(updateCarouselDto)}`);

    const carousel = await this.findOne(id);

    // 合并更新数据
    const updatedCarousel = this.carouselRepository.merge(carousel, updateCarouselDto);

    return await this.carouselRepository.save(updatedCarousel);
  }

  /**
   * 删除轮播图
   * @param ids 轮播图ID数组
   */
  async remove(ids: number[]): Promise<{ success: number[]; failed: number[] }> {
    const result = { success: [], failed: [] };

    // 确保所有ID都是数字
    const validIds = ids.map((id) => Number(id)).filter((id) => !isNaN(id));

    this.logger.log(`批量删除轮播图, IDs: ${validIds.join(', ')}`);

    if (validIds.length === 0) {
      return result;
    }

    // 一次性查询所有存在的记录
    const carousels = await this.carouselRepository.findBy({
      id: In(validIds),
    });

    // 找出存在的ID
    const existingIds = carousels.map((carousel) => carousel.id);

    // 尝试清理关联的文件记录
    for (const carousel of carousels) {
      try {
        if (carousel.imgUrl) {
          // 从URL中提取文件名
          const fileName = carousel.imgUrl.split('/').pop();
          if (fileName) {
            this.logger.log(`尝试清理文件记录: ${carousel.imgUrl}`);

            // 查找并删除匹配的文件记录
            const files = await this.fileRepository.find({
              where: { url: carousel.imgUrl },
            });

            if (files.length > 0) {
              await this.fileRepository.remove(files);
              this.logger.log(`已删除${files.length}条关联的文件记录`);
            }
          }
        }
      } catch (error) {
        this.logger.error(`清理文件记录失败: ${error.message}`, error.stack);
        // 继续处理，不中断删除轮播图的流程
      }
    }

    // 批量删除存在的记录
    if (existingIds.length > 0) {
      await this.carouselRepository.remove(carousels);
      result.success = existingIds;
    }

    // 记录失败的ID
    result.failed = validIds.filter((id) => !existingIds.includes(id));

    return result;
  }
}
