import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Like, Between } from 'typeorm';
import { OperationLog } from '../../log/entities/operation-log.entity';
import { LogService } from '../../log/log.service';

/**
 * 操作日志服务
 * 注意：此服务已被废弃，请使用 LogService
 * @deprecated 请使用 LogService
 */
@Injectable()
export class OperationLogService {
  private readonly logger = new Logger(OperationLogService.name);

  constructor(
    @InjectRepository(OperationLog)
    private readonly operationLogRepository: Repository<OperationLog>,
    @Inject(forwardRef(() => LogService))
    private readonly logService: LogService,
  ) {}

  /**
   * 查询操作日志列表
   * @param current 当前页
   * @param size 每页数量
   * @param keywords 关键词（可选）
   * @param module 操作模块（可选）
   * @param startTime 开始时间（可选）
   * @param endTime 结束时间（可选）
   * @returns 操作日志列表和分页信息
   */
  async findAll(
    current: number,
    size: number,
    keywords?: string,
    module?: string,
    startTime?: Date,
    endTime?: Date,
  ) {
    this.logger.log(`查询操作日志列表：第${current}页，每页${size}条`);
    try {
      const queryBuilder = this.operationLogRepository.createQueryBuilder('operationLog');

      // 关键词搜索
      if (keywords) {
        queryBuilder.andWhere(
          '(operationLog.description LIKE :keywords OR operationLog.nickname LIKE :keywords)',
          { keywords: `%${keywords}%` },
        );
      }

      // 模块筛选
      if (module) {
        queryBuilder.andWhere('operationLog.module = :module', { module });
      }

      // 时间范围筛选
      if (startTime && endTime) {
        queryBuilder.andWhere('operationLog.create_time BETWEEN :startTime AND :endTime', {
          startTime,
          endTime,
        });
      } else if (startTime) {
        queryBuilder.andWhere('operationLog.create_time >= :startTime', { startTime });
      } else if (endTime) {
        queryBuilder.andWhere('operationLog.create_time <= :endTime', { endTime });
      }

      // 按时间倒序排列
      queryBuilder.orderBy('operationLog.create_time', 'DESC');

      // 分页
      const total = await queryBuilder.getCount();
      const records = await queryBuilder
        .skip((current - 1) * size)
        .take(size)
        .getMany();

      this.logger.log(`查询操作日志列表成功，共${total}条记录`);
      return {
        recordList: records,
        count: records.length,
        current,
        size,
        total,
      };
    } catch (error) {
      this.logger.error(`查询操作日志列表失败：${error.message}`);
      throw error;
    }
  }

  /**
   * 根据ID删除操作日志
   * @param ids 操作日志ID数组
   */
  async remove(ids: number[]) {
    return this.logService.removeOperationLogs(ids);
  }

  /**
   * 清空所有操作日志
   */
  async clear() {
    return this.logService.clearOperationLogs();
  }
}
