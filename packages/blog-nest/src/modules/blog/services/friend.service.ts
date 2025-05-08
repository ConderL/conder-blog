import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Friend } from '../entities/friend.entity';

@Injectable()
export class FriendService {
  private readonly logger = new Logger(FriendService.name);

  constructor(
    @InjectRepository(Friend)
    private readonly friendRepository: Repository<Friend>,
  ) {}

  /**
   * 创建友链
   */
  async create(friend: Partial<Friend>): Promise<Friend> {
    this.logger.log(`创建友链: ${JSON.stringify(friend)}`);
    // 手动设置创建时间和更新时间
    const now = new Date();
    const newFriend = this.friendRepository.create({
      ...friend,
      createTime: now,
      updateTime: now,
    });
    return this.friendRepository.save(newFriend);
  }

  /**
   * 更新友链
   */
  async update(id: number, friend: Partial<Friend>): Promise<Friend> {
    this.logger.log(`更新友链: id=${id}, data=${JSON.stringify(friend)}`);
    const now = new Date();
    await this.friendRepository.update(id, {
      ...friend,
      updateTime: now,
    });
    return this.findById(id);
  }

  /**
   * 删除友链
   */
  async remove(ids: number[]): Promise<void> {
    this.logger.log(`删除友链: ids=${ids}`);
    await this.friendRepository.delete(ids);
  }

  /**
   * 获取友链列表
   */
  async findAll(): Promise<Friend[]> {
    this.logger.log('获取所有友链');
    return this.friendRepository.find({
      order: { createTime: 'DESC' },
    });
  }

  /**
   * 根据ID获取友链
   */
  async findById(id: number): Promise<Friend> {
    this.logger.log(`根据ID获取友链: id=${id}`);
    return this.friendRepository.findOne({ where: { id } });
  }

  /**
   * 分页获取友链列表
   * @param current 当前页
   * @param size 每页数量
   * @returns 友链列表及总数
   */
  async findPage(current: number, size: number): Promise<{ friends: Friend[]; total: number }> {
    this.logger.log(`分页获取友链: current=${current}, size=${size}`);
    const queryBuilder = this.friendRepository.createQueryBuilder('friend');

    // 计算总数
    const total = await queryBuilder.getCount();

    // 按创建时间倒序排序并分页
    const friends = await queryBuilder
      .orderBy('friend.create_time', 'DESC')
      .skip((current - 1) * size)
      .take(size)
      .getMany();

    return { friends, total };
  }
}
