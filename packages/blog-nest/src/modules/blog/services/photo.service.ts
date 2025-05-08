import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Photo } from '../entities/photo.entity';

/**
 * 照片服务
 * 提供照片的增删改查功能
 */
@Injectable()
export class PhotoService {
  private readonly logger = new Logger(PhotoService.name);

  constructor(
    @InjectRepository(Photo)
    private readonly photoRepository: Repository<Photo>,
  ) {}

  /**
   * 查询相册中的照片列表
   * @param current 当前页
   * @param size 每页数量
   * @param albumId 相册ID
   * @returns 照片列表及分页信息
   */
  async findAll(
    current: number,
    size: number,
    albumId: number,
  ): Promise<{ records: Photo[]; count: number }> {
    this.logger.log(`查询相册照片：相册ID=${albumId}，第${current}页，每页${size}条`);
    try {
      const queryBuilder = this.photoRepository.createQueryBuilder('photo');

      // 根据相册ID过滤
      queryBuilder.andWhere('photo.albumId = :albumId', { albumId });

      // 按创建时间倒序排序
      queryBuilder.orderBy('photo.createTime', 'DESC');

      // 分页
      const total = await queryBuilder.getCount();
      const records = await queryBuilder
        .skip((current - 1) * size)
        .take(size)
        .getMany();

      this.logger.log(`查询相册照片成功，共${total}条记录`);
      return {
        records,
        count: total,
      };
    } catch (error) {
      this.logger.error(`查询相册照片失败：${error.message}`);
      throw error;
    }
  }

  /**
   * 创建照片
   * @param photo 照片数据
   * @returns 创建后的照片
   */
  async create(photo: Partial<Photo>): Promise<Photo> {
    this.logger.log(`创建照片：${JSON.stringify(photo)}`);
    try {
      const newPhoto = this.photoRepository.create({
        ...photo,
        createTime: new Date(),
        updateTime: new Date(),
      });
      const savedPhoto = await this.photoRepository.save(newPhoto);
      this.logger.log(`创建照片成功，ID：${savedPhoto.id}`);
      return savedPhoto;
    } catch (error) {
      this.logger.error(`创建照片失败：${error.message}`);
      throw error;
    }
  }

  /**
   * 批量创建照片
   * @param photos 照片数据数组
   * @returns 创建后的照片数组
   */
  async createBatch(photos: Partial<Photo>[]): Promise<Photo[]> {
    this.logger.log(`批量创建照片：${photos.length}张`);
    try {
      const now = new Date();
      const newPhotos = photos.map((photo) =>
        this.photoRepository.create({
          ...photo,
          createTime: now,
          updateTime: now,
        }),
      );
      const savedPhotos = await this.photoRepository.save(newPhotos);
      this.logger.log(`批量创建照片成功，数量：${savedPhotos.length}`);
      return savedPhotos;
    } catch (error) {
      this.logger.error(`批量创建照片失败：${error.message}`);
      throw error;
    }
  }

  /**
   * 删除照片
   * @param ids 照片ID数组
   */
  async remove(ids: number[]): Promise<void> {
    if (!ids || ids.length === 0) {
      return;
    }

    this.logger.log(`删除照片：ID=${ids.join(',')}`);
    try {
      await this.photoRepository.delete(ids);
      this.logger.log(`删除照片成功，ID：${ids.join(',')}`);
    } catch (error) {
      this.logger.error(`删除照片失败：${error.message}`);
      throw error;
    }
  }

  /**
   * 根据相册ID删除所有照片
   * @param albumId 相册ID
   */
  async removeByAlbumId(albumId: number): Promise<void> {
    this.logger.log(`删除相册所有照片：相册ID=${albumId}`);
    try {
      await this.photoRepository.delete({ albumId });
      this.logger.log(`删除相册所有照片成功，相册ID：${albumId}`);
    } catch (error) {
      this.logger.error(`删除相册所有照片失败：${error.message}`);
      throw error;
    }
  }

  /**
   * 根据相册ID获取照片数量
   * @param albumId 相册ID
   * @returns 照片数量
   */
  async countByAlbumId(albumId: number): Promise<number> {
    this.logger.log(`获取相册照片数量：相册ID=${albumId}`);
    try {
      const count = await this.photoRepository.count({ where: { albumId } });
      this.logger.log(`获取相册照片数量成功，相册ID：${albumId}，数量：${count}`);
      return count;
    } catch (error) {
      this.logger.error(`获取相册照片数量失败：${error.message}`);
      throw error;
    }
  }
}
