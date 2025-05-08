import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThan, In, Like } from 'typeorm';
import { VisitLog } from './entities/visit-log.entity';
import { OperationLog } from './entities/operation-log.entity';
import * as moment from 'moment';
import axios from 'axios';
import { ExceptionLog } from './entities/exception-log.entity';
import { TaskLog } from './entities/task-log.entity';
import { LoginLog } from './entities/login-log.entity';

@Injectable()
export class LogService {
  private readonly logger = new Logger(LogService.name);

  constructor(
    @InjectRepository(VisitLog)
    public readonly visitLogRepository: Repository<VisitLog>,
    @InjectRepository(OperationLog)
    private readonly operationLogRepository: Repository<OperationLog>,
    @InjectRepository(ExceptionLog)
    private readonly exceptionLogRepository: Repository<ExceptionLog>,
    @InjectRepository(LoginLog)
    private readonly loginLogRepository: Repository<LoginLog>,
    @InjectRepository(TaskLog)
    private readonly taskLogRepository: Repository<TaskLog>,
  ) {}

  /**
   * 记录访问日志
   */
  async recordVisit(data: {
    ip: string;
    userAgent: string;
    url: string;
    page: string;
  }): Promise<VisitLog> {
    try {
      let browser = '未知';
      let os = '未知';

      if (data.userAgent.includes('Chrome')) {
        browser = 'Chrome';
      } else if (data.userAgent.includes('Firefox')) {
        browser = 'Firefox';
      } else if (data.userAgent.includes('Safari')) {
        browser = 'Safari';
      } else if (data.userAgent.includes('Edge')) {
        browser = 'Edge';
      } else if (data.userAgent.includes('MSIE') || data.userAgent.includes('Trident')) {
        browser = 'Internet Explorer';
      }

      if (data.userAgent.includes('Windows')) {
        os = 'Windows';
      } else if (data.userAgent.includes('Mac')) {
        os = 'MacOS';
      } else if (data.userAgent.includes('Linux')) {
        os = 'Linux';
      } else if (data.userAgent.includes('Android')) {
        os = 'Android';
      } else if (data.userAgent.includes('iPhone')) {
        os = 'iOS';
      } else if (data.userAgent.includes('iPad')) {
        os = 'iOS';
      }

      // 尝试获取IP地理位置
      let ipSourceInfo = '';
      try {
        ipSourceInfo = (await this.getIpSource(data.ip)) || '';
      } catch (error) {
        this.logger.error(`获取IP地理位置失败: ${error.message}`);
      }

      // 创建VisitLog对象，字段名与实体定义一致
      const visitLog = new VisitLog();
      visitLog.ipAddress = data.ip;
      visitLog.page = data.page;
      visitLog.browser = browser;
      visitLog.os = os;
      visitLog.ipSource = ipSourceInfo;
      visitLog.createTime = new Date(); // 手动设置当前时间

      return this.visitLogRepository.save(visitLog);
    } catch (error) {
      this.logger.error(`记录访问日志失败: ${error.message}`);
      return null;
    }
  }

  /**
   * 记录操作日志
   */
  async recordOperation(data: {
    userId?: number;
    nickname?: string;
    type: string;
    module?: string;
    description?: string;
    method?: string;
    uri?: string;
    name?: string;
    params?: string;
    ip?: string;
    userAgent?: string;
    data?: string;
    times?: number;
  }): Promise<OperationLog> {
    try {
      let ipSource = '';
      if (data.ip) {
        try {
          ipSource = (await this.getIpSource(data.ip)) || '';
        } catch (error) {
          this.logger.error(`获取IP地理位置失败: ${error.message}`);
        }
      }

      const operationLog = this.operationLogRepository.create({
        user_id: data.userId,
        nickname: data.nickname,
        type: data.type,
        module: data.module,
        description: data.description,
        method: data.method,
        uri: data.uri || '',
        name: data.name || '',
        params: data.params,
        ip_address: data.ip,
        ip_source: ipSource,
        data: data.data,
        times: data.times,
      });

      return this.operationLogRepository.save(operationLog);
    } catch (error) {
      this.logger.error(`记录操作日志失败: ${error.message}`);
      return null;
    }
  }

  /**
   * 获取IP地理位置
   * @param ip IP地址
   */
  private async getIpSource(ip: string): Promise<string | null> {
    if (
      ip.startsWith('127.') ||
      ip.startsWith('192.168.') ||
      ip.startsWith('10.') ||
      ip === '::1'
    ) {
      return '内网IP';
    }

    try {
      const response = await axios.get(`http://ip-api.com/json/${ip}?lang=zh-CN`);
      if (response.data && response.data.status === 'success') {
        const { country, regionName, city, isp } = response.data;
        return `${country} ${regionName} ${city} ${isp}`;
      }
      return null;
    } catch (error) {
      this.logger.error(`查询IP地理位置失败: ${error.message}`);
      return null;
    }
  }

  /**
   * 清理指定日期之前的访问日志
   */
  async cleanupOldLogs(days: number = 30): Promise<number> {
    try {
      const cutoffDate = moment().subtract(days, 'days').toDate();
      const result = await this.visitLogRepository.delete({
        createTime: LessThan(cutoffDate) as any,
      });

      return result.affected || 0;
    } catch (error) {
      this.logger.error(`清理旧日志失败: ${error.message}`);
      return 0;
    }
  }

  /**
   * 获取最近的访问日志
   */
  async getRecentVisits(limit: number = 10): Promise<VisitLog[]> {
    return this.visitLogRepository.find({
      order: { createTime: 'DESC' } as any,
      take: limit,
    });
  }

  /**
   * 获取最近的操作日志
   */
  async getRecentOperations(limit: number = 10): Promise<OperationLog[]> {
    return this.operationLogRepository.find({
      order: { createTime: 'DESC' } as any,
      take: limit,
    });
  }

  /**
   * 统计一段时间内的访问量
   */
  async countVisits(startDate: Date, endDate: Date): Promise<number> {
    return this.visitLogRepository.count({
      where: {
        createTime: Between(startDate, endDate) as any,
      },
    });
  }

  /**
   * 统计一段时间内的独立访客数
   */
  async countUniqueVisitors(startDate: Date, endDate: Date): Promise<number> {
    const result = await this.visitLogRepository
      .createQueryBuilder('log')
      .select('COUNT(DISTINCT log.ipAddress)', 'count')
      .where('log.createTime BETWEEN :startDate AND :endDate', { startDate, endDate })
      .getRawOne();

    return parseInt(result.count, 10);
  }

  /**
   * 获取按小时统计的访问量
   */
  async getHourlyVisits(date: Date = new Date()): Promise<any[]> {
    const startOfDay = moment(date).startOf('day').toDate();
    const endOfDay = moment(date).endOf('day').toDate();

    const result = await this.visitLogRepository
      .createQueryBuilder('log')
      .select('HOUR(log.createTime)', 'hour')
      .addSelect('COUNT(log.id)', 'count')
      .where('log.createTime BETWEEN :startOfDay AND :endOfDay', { startOfDay, endOfDay })
      .groupBy('hour')
      .orderBy('hour', 'ASC')
      .getRawMany();

    const hourlyData = Array(24)
      .fill(0)
      .map((_, hour) => ({ hour, count: 0 }));

    result.forEach((item) => {
      hourlyData[item.hour].count = parseInt(item.count, 10);
    });

    return hourlyData;
  }

  /**
   * 根据ID删除操作日志
   * @param ids 操作日志ID数组
   */
  async removeOperationLogs(ids: number[]): Promise<void> {
    this.logger.log(`删除操作日志，ID：${ids.join(',')}`);
    try {
      if (!ids || ids.length === 0) {
        return;
      }

      // 查询要删除的记录
      const logs = await this.operationLogRepository.findBy({ id: In(ids) });
      if (logs.length > 0) {
        // 执行删除
        await this.operationLogRepository.remove(logs);
        this.logger.log(`成功删除${logs.length}条操作日志`);
      } else {
        this.logger.log('未找到要删除的操作日志');
      }
    } catch (error) {
      this.logger.error(`删除操作日志失败：${error.message}`);
      throw error;
    }
  }

  /**
   * 清空所有操作日志
   */
  async clearOperationLogs(): Promise<any> {
    this.logger.log('清空所有操作日志');
    try {
      // 直接使用delete方法删除所有记录
      const result = await this.operationLogRepository.createQueryBuilder().delete().execute();

      this.logger.log(`成功清空操作日志，影响行数：${result.affected}`);
      return result;
    } catch (error) {
      this.logger.error(`清空操作日志失败：${error.message}`);
      throw error;
    }
  }

  /**
   * 根据关键词搜索操作日志
   */
  async searchOperations(keywords: string): Promise<OperationLog[]> {
    return this.operationLogRepository.find({
      where: [
        { module: Like(`%${keywords}%`) },
        { description: Like(`%${keywords}%`) },
        { name: Like(`%${keywords}%`) },
        { nickname: Like(`%${keywords}%`) },
      ],
      order: { createTime: 'DESC' } as any,
      take: 100,
    });
  }

  /**
   * 记录异常日志
   */
  async recordException(data: {
    module: string;
    uri: string;
    name: string;
    description: string;
    error_method: string;
    message: string;
    params: string;
    request_method: string;
    ip_address: string;
    os: string;
    browser: string;
  }): Promise<ExceptionLog> {
    try {
      // 尝试获取IP地理位置
      let ipSource = '';
      if (data.ip_address) {
        try {
          ipSource = (await this.getIpSource(data.ip_address)) || '';
        } catch (error) {
          this.logger.error(`获取IP地理位置失败: ${error.message}`);
        }
      }

      const exceptionLog = this.exceptionLogRepository.create({
        ...data,
        ip_source: ipSource,
      });

      return this.exceptionLogRepository.save(exceptionLog);
    } catch (error) {
      this.logger.error(`记录异常日志失败: ${error.message}`);
      return null;
    }
  }

  /**
   * 分页查询异常日志
   */
  async findExceptionLogs(
    current: number,
    size: number,
    keywords?: string,
    startTime?: Date,
    endTime?: Date,
  ) {
    try {
      const queryBuilder = this.exceptionLogRepository.createQueryBuilder('exceptionLog');

      // 关键词搜索
      if (keywords) {
        queryBuilder.andWhere(
          '(exceptionLog.description LIKE :keywords OR exceptionLog.message LIKE :keywords OR exceptionLog.name LIKE :keywords)',
          { keywords: `%${keywords}%` },
        );
      }

      // 时间范围筛选
      if (startTime && endTime) {
        queryBuilder.andWhere('exceptionLog.createTime BETWEEN :startTime AND :endTime', {
          startTime,
          endTime,
        });
      } else if (startTime) {
        queryBuilder.andWhere('exceptionLog.createTime >= :startTime', { startTime });
      } else if (endTime) {
        queryBuilder.andWhere('exceptionLog.createTime <= :endTime', { endTime });
      }

      // 按时间倒序排列
      queryBuilder.orderBy('exceptionLog.createTime', 'DESC');

      // 分页
      const total = await queryBuilder.getCount();
      const records = await queryBuilder
        .skip((current - 1) * size)
        .take(size)
        .getMany();

      return {
        recordList: records,
        current,
        size,
        count: total,
      };
    } catch (error) {
      this.logger.error(`查询异常日志列表失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 根据ID删除异常日志
   * @param ids 异常日志ID数组
   */
  async removeExceptionLogs(ids: number[]): Promise<void> {
    this.logger.log(`删除异常日志，ID：${ids.join(',')}`);
    try {
      if (!ids || ids.length === 0) {
        return;
      }

      // 查询要删除的记录
      const logs = await this.exceptionLogRepository.findBy({ id: In(ids) });
      if (logs.length > 0) {
        // 执行删除
        await this.exceptionLogRepository.remove(logs);
        this.logger.log(`成功删除${logs.length}条异常日志`);
      } else {
        this.logger.log('未找到要删除的异常日志');
      }
    } catch (error) {
      this.logger.error(`删除异常日志失败：${error.message}`);
      throw error;
    }
  }

  /**
   * 清空所有异常日志
   */
  async clearExceptionLogs(): Promise<any> {
    this.logger.log('清空所有异常日志');
    try {
      // 直接使用delete方法删除所有记录
      const result = await this.exceptionLogRepository.createQueryBuilder().delete().execute();

      this.logger.log(`成功清空异常日志，影响行数：${result.affected}`);
      return result;
    } catch (error) {
      this.logger.error(`清空异常日志失败：${error.message}`);
      throw error;
    }
  }

  /**
   * 获取最近的异常日志
   */
  async getRecentExceptions(limit: number = 10): Promise<ExceptionLog[]> {
    return this.exceptionLogRepository.find({
      order: { createTime: 'DESC' } as any,
      take: limit,
    });
  }

  /**
   * 记录任务日志
   */
  async recordTaskLog(data: {
    taskName: string;
    taskGroup: string;
    invokeTarget: string;
    taskMessage?: string;
    status: number;
    errorInfo?: string;
  }): Promise<TaskLog> {
    try {
      // 使用正确的实体字段名创建对象
      const taskLog = new TaskLog();
      taskLog.taskName = data.taskName;
      taskLog.taskGroup = data.taskGroup;
      taskLog.invokeTarget = data.invokeTarget;
      taskLog.jobMessage = data.taskMessage || ''; // 映射到正确的字段名
      taskLog.status = data.status;
      taskLog.exceptionInfo = data.errorInfo; // 映射到正确的字段名

      return this.taskLogRepository.save(taskLog);
    } catch (error) {
      this.logger.error(`记录任务日志失败: ${error.message}`);
      return null;
    }
  }

  /**
   * 获取任务日志列表
   */
  async getTaskLogs(params: {
    current: number;
    size: number;
    taskName?: string;
    taskGroup?: string;
    status?: number;
    startTime?: Date;
    endTime?: Date;
  }) {
    const { current, size, taskName, taskGroup, status, startTime, endTime } = params;
    const queryBuilder = this.taskLogRepository.createQueryBuilder('taskLog');

    // 构建查询条件
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

    // 排序和分页
    queryBuilder.orderBy('taskLog.createTime', 'DESC');
    queryBuilder.skip((current - 1) * size);
    queryBuilder.take(size);

    // 获取结果
    const [records, total] = await queryBuilder.getManyAndCount();

    return {
      records,
      total,
    };
  }

  /**
   * 清空任务日志
   */
  async clearTaskLogs() {
    return await this.taskLogRepository.clear();
  }

  /**
   * 删除任务日志
   */
  async deleteTaskLogs(idList: number[]) {
    return await this.taskLogRepository.delete(idList);
  }

  /**
   * 保存任务日志
   */
  async saveTaskLog(taskLog: TaskLog) {
    return await this.taskLogRepository.save(taskLog);
  }
}
