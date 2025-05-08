import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskLog } from '../entities/task-log.entity';
import { TaskLogPageDto, TaskStatus } from '../dto/task-log.dto';

@Injectable()
export class TaskLogService {
  constructor(
    @InjectRepository(TaskLog)
    private readonly taskLogRepository: Repository<TaskLog>,
  ) {}

  /**
   * 创建任务日志
   * @param taskLog 任务日志信息
   */
  async create(taskLog: Partial<TaskLog>): Promise<TaskLog> {
    return this.taskLogRepository.save(taskLog);
  }

  /**
   * 分页查询任务日志
   * @param pageDto 分页查询参数
   */
  async findPage(pageDto: TaskLogPageDto) {
    const { current = 1, size = 10, taskName, taskGroup, status, startTime, endTime } = pageDto;

    const queryBuilder = this.taskLogRepository.createQueryBuilder('taskLog');

    if (taskName) {
      queryBuilder.andWhere('taskLog.taskName LIKE :taskName', { taskName: `%${taskName}%` });
    }

    if (taskGroup) {
      queryBuilder.andWhere('taskLog.taskGroup LIKE :taskGroup', { taskGroup: `%${taskGroup}%` });
    }

    if (status !== undefined) {
      queryBuilder.andWhere('taskLog.status = :status', { status });
    }

    if (startTime && endTime) {
      queryBuilder.andWhere('taskLog.createTime BETWEEN :startTime AND :endTime', {
        startTime,
        endTime,
      });
    }

    const total = await queryBuilder.getCount();

    const records = await queryBuilder
      .orderBy('taskLog.createTime', 'DESC')
      .skip((current - 1) * size)
      .take(size)
      .getMany();

    return {
      records,
      count: total,
      current,
      size,
    };
  }

  /**
   * 根据ID获取任务日志详情
   * @param id 日志ID
   */
  async findById(id: number): Promise<TaskLog> {
    return this.taskLogRepository.findOne({ where: { id } });
  }

  /**
   * 批量删除任务日志
   * @param ids 日志ID列表
   */
  async deleteByIds(ids: number[]): Promise<void> {
    await this.taskLogRepository.delete(ids);
  }

  /**
   * 清空所有任务日志
   */
  async clear(): Promise<void> {
    await this.taskLogRepository.clear();
  }

  /**
   * 根据条件查询任务日志
   * @param options 查询条件
   */
  async findByCondition(options: any = {}) {
    return this.taskLogRepository.find(options);
  }

  /**
   * 统计任务执行状态
   * @returns {Promise<{success: number, failure: number}>} 成功和失败数量
   */
  async countByStatus(): Promise<{ success: number; failure: number }> {
    const success = await this.taskLogRepository.count({
      where: { status: TaskStatus.SUCCESS },
    });

    const failure = await this.taskLogRepository.count({
      where: { status: TaskStatus.FAILURE },
    });

    return { success, failure };
  }

  /**
   * 获取最近的任务日志
   * @param limit 返回数量
   */
  async getRecentLogs(limit: number = 10): Promise<TaskLog[]> {
    return this.taskLogRepository.find({
      order: { createTime: 'DESC' },
      take: limit,
    });
  }
}
