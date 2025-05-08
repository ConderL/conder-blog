import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Album } from '../entities/album.entity';

/**
 * 相册服务
 * 提供相册的增删改查功能
 */
@Injectable()
export class AlbumService {
  private readonly logger = new Logger(AlbumService.name);

  constructor(
    @InjectRepository(Album)
    private readonly albumRepository: Repository<Album>,
  ) {}

  /**
   * 查询相册列表
   * @param current 当前页
   * @param size 每页数量
   * @param status 状态(可选)
   * @returns 相册列表及分页信息
   */
  async findAll(
    current: number,
    size: number,
    status?: number,
  ): Promise<{ records: Album[]; count: number }> {
    this.logger.log(`查询相册列表：第${current}页，每页${size}条`);
    try {
      const queryBuilder = this.albumRepository.createQueryBuilder('album');

      // 根据状态过滤
      if (status !== undefined && !Number.isNaN(status)) {
        queryBuilder.andWhere('album.status = :status', { status });
      }

      // 按创建时间倒序排序
      queryBuilder.orderBy('album.createTime', 'DESC');

      // 分页
      const total = await queryBuilder.getCount();
      const records = await queryBuilder
        .skip((current - 1) * size)
        .take(size)
        .getMany();

      this.logger.log(`查询相册列表成功，共${total}条记录`);
      return {
        records,
        count: total,
      };
    } catch (error) {
      this.logger.error(`查询相册列表失败：${error.message}`);
      throw error;
    }
  }

  /**
   * 创建相册
   * @param album 相册数据
   * @returns 创建后的相册
   */
  async create(album: Partial<Album>): Promise<Album> {
    this.logger.log(`创建相册：${JSON.stringify(album)}`);
    try {
      const newAlbum = this.albumRepository.create(album);
      const savedAlbum = await this.albumRepository.save(newAlbum);
      this.logger.log(`创建相册成功，ID：${savedAlbum.id}`);
      return savedAlbum;
    } catch (error) {
      this.logger.error(`创建相册失败：${error.message}`);
      throw error;
    }
  }

  /**
   * 更新相册
   * @param id 相册ID
   * @param album 更新的相册数据
   * @returns 更新结果
   */
  async update(id: number, album: Partial<Album>): Promise<Album> {
    this.logger.log(`更新相册：ID=${id}, 数据=${JSON.stringify(album)}`);
    try {
      await this.albumRepository.update(id, album);
      const updatedAlbum = await this.albumRepository.findOne({ where: { id } });
      this.logger.log(`更新相册成功，ID：${id}`);
      return updatedAlbum;
    } catch (error) {
      this.logger.error(`更新相册失败：${error.message}`);
      throw error;
    }
  }

  /**
   * 删除相册
   * @param id 相册ID
   */
  async remove(id: number): Promise<void> {
    console.log('id', id);
    if (!id) {
      return;
    }

    this.logger.log(`删除相册：ID=${id}`);
    try {
      const albums = await this.albumRepository.findBy({ id });
      if (albums.length > 0) {
        await this.albumRepository.remove(albums);
        this.logger.log(`删除相册成功，ID：${id}`);
      } else {
        this.logger.log(`未找到要删除的相册，ID：${id}`);
      }
    } catch (error) {
      this.logger.error(`删除相册失败：${error.message}`);
      throw error;
    }
  }

  /**
   * 根据ID查询相册
   * @param id 相册ID
   * @returns 相册信息
   */
  async findById(id: number): Promise<Album> {
    this.logger.log(`查询相册详情：ID=${id}`);
    try {
      const album = await this.albumRepository.findOne({ where: { id } });
      this.logger.log(`查询相册详情成功，ID：${id}`);
      return album;
    } catch (error) {
      this.logger.error(`查询相册详情失败：${error.message}`);
      throw error;
    }
  }
}
