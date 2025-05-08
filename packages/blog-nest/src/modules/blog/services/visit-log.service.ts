import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { VisitLog } from '../entities/visit-log.entity';
import * as moment from 'moment';

/**
 * 访问日志服务
 * 提供访问日志的创建、查询和统计功能
 */
@Injectable()
export class VisitLogService {
  constructor(
    @InjectRepository(VisitLog)
    private readonly visitLogRepository: Repository<VisitLog>,
  ) {}

  /**
   * 创建访问日志
   * @param visitLog 访问日志数据
   * @returns 创建后的访问日志
   */
  async create(visitLog: Partial<VisitLog>): Promise<VisitLog> {
    // 确保必填字段都有值，并且适应现有表结构
    const newVisitLog = this.visitLogRepository.create({
      ipAddress: visitLog.ipAddress || '0.0.0.0',
      pageUrl: visitLog.pageUrl || '/',
      ipSource: visitLog.ipSource || '',
      browser: visitLog.browser || '未知浏览器',
      os: visitLog.os || '未知系统',
      createTime: new Date(), // 手动设置当前时间
    });

    return await this.visitLogRepository.save(newVisitLog);
  }

  /**
   * 统计今日访问量
   * @returns 今日访问量
   */
  async countTodayVisits(): Promise<number> {
    const today = new Date();
    const startOfDay = moment(today).startOf('day').toDate();
    const endOfDay = moment(today).endOf('day').toDate();

    // 使用查询构建器以避免列名映射问题
    return await this.visitLogRepository
      .createQueryBuilder('visit')
      .where('visit.create_time BETWEEN :startOfDay AND :endOfDay', {
        startOfDay,
        endOfDay,
      })
      .getCount();
  }

  /**
   * 统计总访问量
   * @returns 总访问量
   */
  async countTotalVisits(): Promise<number> {
    return await this.visitLogRepository.count();
  }

  /**
   * 获取最近七天的访问统计
   * @returns 最近七天的访问统计数据
   */
  async getWeeklyVisitStats(): Promise<{ date: string; count: number }[]> {
    const today = new Date();
    const sevenDaysAgo = moment(today).subtract(6, 'days').startOf('day').toDate();

    // 查询最近七天的访问记录
    const visits = await this.visitLogRepository
      .createQueryBuilder('visit')
      .select("DATE_FORMAT(visit.create_time, '%Y-%m-%d')", 'date')
      .addSelect('COUNT(visit.id)', 'count')
      .where('visit.create_time >= :sevenDaysAgo', { sevenDaysAgo })
      .groupBy('date')
      .orderBy('date', 'ASC')
      .getRawMany();

    // 生成最近七天的日期列表
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = moment(sevenDaysAgo).add(i, 'days').format('YYYY-MM-DD');
      dates.push(date);
    }

    // 合并查询结果和日期列表，确保每一天都有数据
    return dates.map((date) => {
      const found = visits.find((v) => v.date === date);
      return {
        date,
        count: found ? parseInt(found.count) : 0,
      };
    });
  }

  /**
   * 分页查询访问日志
   * @param page 页码
   * @param limit 每页数量
   * @returns 访问日志列表及总数
   */
  async findAll(page: number = 1, limit: number = 10): Promise<[VisitLog[], number]> {
    return this.visitLogRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: {
        id: 'DESC',
      },
    });
  }

  /**
   * 获取操作系统统计
   * @returns 操作系统分布统计
   */
  async getOsStats(): Promise<any[]> {
    const osData = await this.visitLogRepository
      .createQueryBuilder('visitLog')
      .select('visitLog.os', 'os')
      .addSelect('COUNT(visitLog.id)', 'count')
      .groupBy('visitLog.os')
      .getRawMany();

    return osData.map((item) => ({
      name: item.os || '未知',
      value: parseInt(item.count),
    }));
  }

  /**
   * 获取浏览器统计
   * @returns 浏览器分布统计
   */
  async getBrowserStats(): Promise<any[]> {
    const browserData = await this.visitLogRepository
      .createQueryBuilder('visitLog')
      .select('visitLog.browser', 'browser')
      .addSelect('COUNT(visitLog.id)', 'count')
      .groupBy('visitLog.browser')
      .getRawMany();

    return browserData.map((item) => ({
      name: item.browser || '未知',
      value: parseInt(item.count),
    }));
  }

  /**
   * 删除指定天数之前的日志
   * @param days 天数，默认30天
   */
  async deleteOldLogs(days: number = 30): Promise<void> {
    const cutoffDate = moment().subtract(days, 'days').toDate();

    await this.visitLogRepository
      .createQueryBuilder()
      .delete()
      .where('create_time < :cutoffDate', { cutoffDate })
      .execute();
  }
}
