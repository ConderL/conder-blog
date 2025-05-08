import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Talk } from '../entities/talk.entity';

/**
 * 说说服务
 * 提供说说的增删改查功能
 */
@Injectable()
export class TalkService {
  private readonly logger = new Logger(TalkService.name);

  constructor(
    @InjectRepository(Talk)
    private readonly talkRepository: Repository<Talk>,
  ) {}

  /**
   * 查询说说列表
   * @param current 当前页
   * @param size 每页数量
   * @param keyword 关键词(可选)
   * @param status 状态(可选)
   * @returns 说说列表及分页信息
   */
  async findAll(
    current: number,
    size: number,
    keyword?: string,
    status?: number,
  ): Promise<{ records: Talk[]; count: number }> {
    this.logger.log(`查询说说列表：第${current}页，每页${size}条`);
    try {
      const queryBuilder = this.talkRepository
        .createQueryBuilder('talk')
        .leftJoinAndSelect('talk.user', 'user');

      // 根据关键词过滤
      if (keyword) {
        queryBuilder.andWhere('talk.talkContent LIKE :keyword', { keyword: `%${keyword}%` });
      }

      // 根据状态过滤
      if (status !== undefined && !Number.isNaN(status)) {
        queryBuilder.andWhere('talk.status = :status', { status });
      }

      // 排序：置顶说说在前，然后按创建时间倒序
      queryBuilder.orderBy('talk.isTop', 'DESC').addOrderBy('talk.createTime', 'DESC');

      // 分页
      const total = await queryBuilder.getCount();
      const records = await queryBuilder
        .skip((current - 1) * size)
        .take(size)
        .getMany();

      this.logger.log(`查询说说列表成功，共${total}条记录`);
      return {
        records,
        count: total,
      };
    } catch (error) {
      this.logger.error(`查询说说列表失败：${error.message}`);
      throw error;
    }
  }

  /**
   * 创建说说
   * @param talk 说说数据
   * @returns 创建后的说说
   */
  async create(talk: Partial<Talk>): Promise<Talk> {
    this.logger.log(`创建说说：${JSON.stringify(talk)}`);
    try {
      const newTalk = this.talkRepository.create(talk);
      const savedTalk = await this.talkRepository.save(newTalk);
      this.logger.log(`创建说说成功，ID：${savedTalk.id}`);
      return savedTalk;
    } catch (error) {
      this.logger.error(`创建说说失败：${error.message}`);
      throw error;
    }
  }

  /**
   * 更新说说
   * @param id 说说ID
   * @param talk 更新的说说数据
   * @returns 更新结果
   */
  async update(id: number, talk: Partial<Talk>): Promise<Talk> {
    this.logger.log(`更新说说：ID=${id}, 数据=${JSON.stringify(talk)}`);
    try {
      await this.talkRepository.update(id, talk);
      const updatedTalk = await this.talkRepository.findOne({
        where: { id },
        relations: ['user'],
      });
      this.logger.log(`更新说说成功，ID：${id}`);
      return updatedTalk;
    } catch (error) {
      this.logger.error(`更新说说失败：${error.message}`);
      throw error;
    }
  }

  /**
   * 删除说说
   * @param ids 说说ID数组
   */
  async remove(id): Promise<void> {
    this.logger.log(`删除说说：ID=${id}`);
    try {
      const talk = await this.talkRepository.findOne({ where: { id } });
      if (talk) {
        await this.talkRepository.remove(talk);
        this.logger.log(`删除说说成功，ID：${id}`);
      } else {
        this.logger.log(`未找到要删除的说说，ID：${id}`);
      }
    } catch (error) {
      this.logger.error(`删除说说失败：${error.message}`);
      throw error;
    }
  }

  /**
   * 根据ID查询说说
   * @param id 说说ID
   * @returns 说说信息
   */
  async findById(id: number): Promise<Talk> {
    this.logger.log(`查询说说详情：ID=${id}`);
    try {
      const talk = await this.talkRepository.findOne({
        where: { id },
        relations: ['user'],
      });
      this.logger.log(`查询说说详情成功，ID：${id}`);
      return talk;
    } catch (error) {
      this.logger.error(`查询说说详情失败：${error.message}`);
      throw error;
    }
  }

  /**
   * 更新说说置顶状态
   * @param id 说说ID
   * @param isTop 置顶状态(1-置顶,0-不置顶)
   * @returns 更新结果
   */
  async updateTopStatus(id: number, isTop: number): Promise<Talk> {
    this.logger.log(`更新说说置顶状态：ID=${id}, isTop=${isTop}`);
    try {
      await this.talkRepository.update(id, { isTop });
      const updatedTalk = await this.talkRepository.findOne({
        where: { id },
        relations: ['user'],
      });
      this.logger.log(`更新说说置顶状态成功，ID：${id}`);
      return updatedTalk;
    } catch (error) {
      this.logger.error(`更新说说置顶状态失败：${error.message}`);
      throw error;
    }
  }
}
