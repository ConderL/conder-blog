import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, SchedulerRegistry } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThan } from 'typeorm';
import { Article } from '../../blog/entities/article.entity';
import { VisitLog } from '../../log/entities/visit-log.entity';
import * as fs from 'fs';
import * as path from 'path';
import * as moment from 'moment';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as config from '../../../config/configuration';
import { LogService } from '../../log/log.service';
import { OnlineService } from '../../online/online.service';
import { Task } from './entities/task.entity';
import { DynamicTaskManager } from './utils/dynamic-task.util';
import { CronJob } from 'cron';

const execAsync = promisify(exec);

@Injectable()
export class TaskService implements OnModuleInit {
  private readonly logger = new Logger(TaskService.name);
  private readonly backupDir = path.join(process.cwd(), 'backups');
  private dynamicTaskManager: DynamicTaskManager;

  constructor(
    private schedulerRegistry: SchedulerRegistry,
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
    @InjectRepository(VisitLog)
    private readonly visitLogRepository: Repository<VisitLog>,
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    private readonly logService: LogService,
    private readonly onlineService: OnlineService,
  ) {
    this.logger.log('TaskService initialized');
    // 确保备份目录存在
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  /**
   * 初始化服务
   */
  async onModuleInit() {
    // 初始化动态任务管理器
    this.dynamicTaskManager = new DynamicTaskManager(this.schedulerRegistry, this);

    // 注册任务函数
    this.registerTaskFunctions();

    // 从数据库加载自定义任务
    await this.loadTasksFromDatabase();
  }

  /**
   * 注册可用的任务函数
   */
  private registerTaskFunctions() {
    // 注册系统任务
    this.dynamicTaskManager.registerTaskFunction(
      // 数据库备份
      'taskService.handleDatabaseBackup',
      this.handleDatabaseBackup.bind(this),
    );
    this.dynamicTaskManager.registerTaskFunction(
      // 每小时访问统计
      'taskService.handleHourlyVisitStats',
      this.handleHourlyVisitStats.bind(this),
    );
    this.dynamicTaskManager.registerTaskFunction(
      // 执行数据清理
      'taskService.handleDataCleanup',
      this.handleDataCleanup.bind(this),
    );
    this.dynamicTaskManager.registerTaskFunction(
      // 清理过期的在线用户会话
      'taskService.handleExpiredSessions',
      this.handleExpiredSessions.bind(this),
    );
    this.dynamicTaskManager.registerTaskFunction(
      // 手动触发备份
      'taskService.manualBackup',
      this.manualBackup.bind(this),
    );

    this.dynamicTaskManager.registerTaskFunction(
      // 清除访问记录
      'taskService.clearVisitorRecords',
      this.clearVisitorRecords.bind(this),
    );

    this.dynamicTaskManager.registerTaskFunction(
      // 清除一周前的访问日志
      'taskService.clearOldVisitLogs',
      this.clearOldVisitLogs.bind(this),
    );

    this.dynamicTaskManager.registerTaskFunction(
      // 测试任务
      'taskService.testTask',
      this.testTask.bind(this),
    );
  }

  /**
   * 从数据库加载自定义任务
   */
  private async loadTasksFromDatabase() {
    try {
      const tasks = await this.taskRepository.find({ where: { status: 0 } });

      for (const task of tasks) {
        try {
          // 为每个任务创建一个唯一的名称
          const jobName = `${task.taskGroup}_${task.taskName}_${task.id}`;

          // 添加任务到调度器
          this.dynamicTaskManager.addCronJob(jobName, task.cronExpression, task.invokeTarget);
        } catch (error) {
          this.logger.error(`加载任务失败 [${task.taskName}]: ${error.message}`);
        }
      }

      this.logger.log(`已从数据库加载 ${tasks.length} 个任务`);
    } catch (error) {
      this.logger.error(`加载数据库任务失败: ${error.message}`);
    }
  }

  /**
   * 记录任务执行日志封装方法
   * @param taskName 任务名称
   * @param taskGroup 任务分组
   * @param invokeTarget 调用目标
   * @param fn 实际执行的函数
   */
  private async executeWithLog(
    taskName: string,
    taskGroup: string,
    invokeTarget: string,
    fn: () => Promise<any>,
  ): Promise<any> {
    const startTime = new Date();
    try {
      // 执行任务
      const result = await fn();

      // 记录成功日志
      await this.logService.recordTaskLog({
        taskName,
        taskGroup,
        invokeTarget,
        taskMessage: `${taskName} 执行成功，耗时: ${new Date().getTime() - startTime.getTime()}毫秒`,
        status: 1, // 成功
      });

      return result;
    } catch (error) {
      // 记录失败日志
      await this.logService.recordTaskLog({
        taskName,
        taskGroup,
        invokeTarget,
        taskMessage: `${taskName} 执行失败`,
        status: 0, // 失败
        errorInfo: error.message || JSON.stringify(error),
      });

      // 重新抛出异常，让上层捕获
      throw error;
    }
  }

  /**
   * 每天凌晨3点执行数据库备份
   */
  @Cron('0 0 3 * * *')
  async handleDatabaseBackup() {
    await this.executeWithLog(
      '数据库备份',
      'SYSTEM',
      'taskService.handleDatabaseBackup',
      async () => {
        this.logger.log('执行定时数据库备份...');
        await this.performBackup(`backup_${moment().format('YYYY-MM-DD_HH-mm-ss')}.sql`);
        // 保留最近30天的备份
        this.cleanupOldBackups(30);
      },
    );
  }

  /**
   * 每小时执行一次访问统计
   */
  @Cron('0 0 * * * *')
  async handleHourlyVisitStats() {
    await this.executeWithLog(
      '访问统计',
      'SYSTEM',
      'taskService.handleHourlyVisitStats',
      async () => {
        this.logger.log('收集小时访问统计...');
        const now = new Date();
        const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);

        const visits = await this.visitLogRepository.count({
          where: {
            createTime: Between(hourAgo, now) as any,
          },
        });

        this.logger.log(`过去一小时的访问量: ${visits}`);
        return visits;
      },
    );
  }

  /**
   * 每天凌晨2点执行数据清理
   */
  @Cron('0 0 2 * * *')
  async handleDataCleanup() {
    await this.executeWithLog('数据清理', 'SYSTEM', 'taskService.handleDataCleanup', async () => {
      this.logger.log('清理过期访问日志...');
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const result = await this.visitLogRepository.delete({
        createTime: LessThan(thirtyDaysAgo) as any,
      });

      this.logger.log(`已清理 ${result.affected || 0} 条过期访问日志`);
      return result;
    });
  }

  /**
   * 每5分钟执行一次，清理过期的在线用户会话
   * 过期时间为30分钟
   */
  @Cron('0 */5 * * * *')
  async handleExpiredSessions() {
    await this.executeWithLog(
      '清理过期会话',
      'SYSTEM',
      'taskService.handleExpiredSessions',
      async () => {
        this.logger.log('清理过期的在线用户会话...');
        const expireTime = 30 * 60 * 1000; // 30分钟未活动的会话视为过期
        const removedCount = await this.onlineService.clearExpiredSessions(expireTime);
        this.logger.log(`已清理 ${removedCount} 个过期会话`);
        return removedCount;
      },
    );
  }

  /**
   * 手动触发备份
   */
  async manualBackup(): Promise<string> {
    return this.executeWithLog('手动备份', 'MANUAL', 'taskService.manualBackup', async () => {
      const filename = `manual_backup_${moment().format('YYYY-MM-DD_HH-mm-ss')}.sql`;
      await this.performBackup(filename);
      return path.join(this.backupDir, filename);
    });
  }

  /**
   * 执行实际的备份操作
   */
  private async performBackup(filename: string): Promise<void> {
    const dbConfig = config.default().database;
    const backupPath = path.join(this.backupDir, filename);

    try {
      const command = `mysqldump -h ${dbConfig.host} -P ${dbConfig.port} -u ${dbConfig.username} -p${dbConfig.password} ${dbConfig.database} > ${backupPath}`;
      await execAsync(command);
      this.logger.log(`数据库备份成功: ${backupPath}`);
    } catch (error) {
      this.logger.error(`数据库备份失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 清理旧备份
   */
  private cleanupOldBackups(days: number): void {
    try {
      const files = fs.readdirSync(this.backupDir);
      const now = moment();

      files.forEach((file) => {
        const filePath = path.join(this.backupDir, file);
        const stats = fs.statSync(filePath);
        const fileDate = moment(stats.mtime);

        if (now.diff(fileDate, 'days') > days) {
          fs.unlinkSync(filePath);
          this.logger.log(`已删除旧备份: ${file}`);
        }
      });
    } catch (error) {
      this.logger.error(`清理旧备份失败: ${error.message}`);
    }
  }

  /**
   * 获取统计摘要
   */
  async getStatsSummary(): Promise<any> {
    return this.executeWithLog('统计摘要', 'SYSTEM', 'taskService.getStatsSummary', async () => {
      const articleCount = await this.articleRepository.count({
        where: { isDelete: 0 },
      });

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayVisits = await this.visitLogRepository.count({
        where: {
          createTime: Between(today, new Date()) as any,
        },
      });

      const totalVisits = await this.visitLogRepository.count();

      // 获取过去7天的访问趋势
      const weeklyTrend = await this.getWeeklyVisitTrend();

      return {
        articleCount,
        todayVisits,
        totalVisits,
        weeklyTrend,
      };
    });
  }

  /**
   * 获取过去7天的访问趋势
   */
  private async getWeeklyVisitTrend(): Promise<any[]> {
    const result = [];
    const today = moment().startOf('day');

    for (let i = 6; i >= 0; i--) {
      const date = moment(today).subtract(i, 'days');
      const nextDate = moment(date).add(1, 'days');

      const count = await this.visitLogRepository.count({
        where: {
          createTime: Between(date.toDate(), nextDate.toDate()) as any,
        },
      });

      result.push({
        date: date.format('YYYY-MM-DD'),
        count,
      });
    }

    return result;
  }

  /**
   * 获取备份文件列表
   */
  async getBackupList(): Promise<any[]> {
    return this.executeWithLog('获取备份列表', 'SYSTEM', 'taskService.getBackupList', async () => {
      try {
        const files = fs.readdirSync(this.backupDir);

        return files
          .filter((file) => file.endsWith('.sql'))
          .map((file) => {
            const filePath = path.join(this.backupDir, file);
            const stats = fs.statSync(filePath);
            return {
              filename: file,
              size: stats.size,
              createTime: stats.mtime,
            };
          })
          .sort((a, b) => b.createTime.getTime() - a.createTime.getTime());
      } catch (error) {
        this.logger.error(`获取备份列表失败: ${error.message}`);
        throw error;
      }
    });
  }

  /**
   * 删除备份文件
   */
  async deleteBackup(filename: string): Promise<boolean> {
    return this.executeWithLog('删除备份', 'SYSTEM', 'taskService.deleteBackup', async () => {
      const filePath = path.join(this.backupDir, filename);

      try {
        if (!fs.existsSync(filePath)) {
          throw new Error(`文件不存在: ${filename}`);
        }

        fs.unlinkSync(filePath);
        this.logger.log(`备份文件已删除: ${filename}`);
        return true;
      } catch (error) {
        this.logger.error(`删除备份文件失败: ${error.message}`);
        throw error;
      }
    });
  }

  /**
   * 获取访问统计
   */
  async getVisitStats(period: string = 'week'): Promise<any> {
    return this.executeWithLog('访问统计', 'SYSTEM', 'taskService.getVisitStats', async () => {
      let startDate: Date;
      const endDate = new Date();

      // 根据周期确定开始日期
      switch (period) {
        case 'day':
          startDate = moment().startOf('day').toDate();
          break;
        case 'week':
          startDate = moment().subtract(6, 'days').startOf('day').toDate();
          break;
        case 'month':
          startDate = moment().subtract(29, 'days').startOf('day').toDate();
          break;
        default:
          startDate = moment().subtract(6, 'days').startOf('day').toDate();
      }

      // 获取日访问统计
      const dailyStats = await this.getDailyVisitStats(startDate, endDate);

      // 获取IP访问排行
      const topIPs = await this.getTopIPs(startDate, endDate);

      // 获取页面访问排行
      const topPages = await this.getTopPages(startDate, endDate);

      return {
        period,
        dailyStats,
        topIPs,
        topPages,
      };
    });
  }

  /**
   * 获取每日访问统计
   */
  private async getDailyVisitStats(startDate: Date, endDate: Date): Promise<any[]> {
    const result = [];
    let current = moment(startDate).startOf('day');
    const end = moment(endDate).startOf('day');

    while (current.isSameOrBefore(end)) {
      const nextDay = moment(current).add(1, 'days');

      const count = await this.visitLogRepository.count({
        where: {
          createTime: Between(current.toDate(), nextDay.toDate()) as any,
        },
      });

      result.push({
        date: current.format('YYYY-MM-DD'),
        count,
      });

      current = nextDay;
    }

    return result;
  }

  /**
   * 获取访问量最高的IP
   */
  private async getTopIPs(startDate: Date, endDate: Date, limit: number = 10): Promise<any[]> {
    const result = await this.visitLogRepository
      .createQueryBuilder('visitLog')
      .select('visitLog.ipAddress')
      .addSelect('COUNT(*)', 'count')
      .where('visitLog.createTime BETWEEN :startDate AND :endDate', { startDate, endDate })
      .groupBy('visitLog.ipAddress')
      .orderBy('count', 'DESC')
      .limit(limit)
      .getRawMany();

    return result;
  }

  /**
   * 获取访问量最高的页面
   */
  private async getTopPages(startDate: Date, endDate: Date, limit: number = 10): Promise<any[]> {
    const result = await this.visitLogRepository
      .createQueryBuilder('visitLog')
      .select('visitLog.page')
      .addSelect('COUNT(*)', 'count')
      .where('visitLog.createTime BETWEEN :startDate AND :endDate', { startDate, endDate })
      .groupBy('visitLog.page')
      .orderBy('count', 'DESC')
      .limit(limit)
      .getRawMany();

    return result;
  }

  /**
   * 获取内容统计数据
   */
  async getContentStats(): Promise<any> {
    // 文章数量统计
    const totalArticles = await this.articleRepository.count({
      where: { isDelete: 0 },
    });

    const publishedArticles = await this.articleRepository.count({
      where: { isDelete: 0, status: 1 },
    });

    const draftArticles = await this.articleRepository.count({
      where: { isDelete: 0, status: 0 },
    });

    // 分类统计
    const categoryStats = await this.articleRepository.query(`
      SELECT c.name, COUNT(a.id) as count
      FROM category c
      LEFT JOIN article a ON a.categoryId = c.id AND a.isDelete = 0
      GROUP BY c.id
      ORDER BY count DESC
    `);

    // 标签统计
    const tagStats = await this.articleRepository.query(`
      SELECT t.name, COUNT(DISTINCT at.articleId) as count
      FROM tag t
      LEFT JOIN article_tag at ON at.tagId = t.id
      LEFT JOIN article a ON at.articleId = a.id AND a.isDelete = 0
      GROUP BY t.id
      ORDER BY count DESC
      LIMIT 10
    `);

    // 按月份统计文章数量
    const monthlyArticles = await this.getMonthlyArticleStats();

    return {
      articles: {
        total: totalArticles,
        published: publishedArticles,
        draft: draftArticles,
      },
      categories: categoryStats,
      tags: tagStats,
      monthlyArticles,
    };
  }

  /**
   * 获取按月统计的文章数量
   */
  private async getMonthlyArticleStats(): Promise<any[]> {
    // 获取最近12个月的数据
    const result = [];
    const today = moment().startOf('month');

    for (let i = 11; i >= 0; i--) {
      const month = moment(today).subtract(i, 'months');
      const startDate = month.clone().startOf('month').toDate();
      const endDate = month.clone().endOf('month').toDate();

      const count = await this.articleRepository.count({
        where: {
          createdAt: Between(startDate, endDate) as any,
          isDelete: 0,
        },
      });

      result.push({
        month: month.format('YYYY-MM'),
        count,
      });
    }

    return result;
  }

  /**
   * 获取所有任务
   */
  async findAll(): Promise<Task[]> {
    return this.taskRepository.find();
  }

  /**
   * 获取所有任务（别名方法，保持与原代码兼容）
   */
  async getAllTasks(): Promise<Task[]> {
    return this.findAll();
  }

  /**
   * 根据ID获取任务
   */
  async getTaskById(id: number): Promise<Task> {
    return this.taskRepository.findOne({ where: { id } });
  }

  /**
   * 创建任务
   */
  async createTask(taskData: Partial<Task>): Promise<Task> {
    // 验证cron表达式
    if (!taskData.cronExpression) {
      throw new Error('cron表达式不能为空');
    }

    try {
      // 预先测试cron表达式的有效性
      const testExpression = this.dynamicTaskManager['normalizeCronExpression'](
        taskData.cronExpression,
      );
      this.logger.log(`验证cron表达式: ${taskData.cronExpression} -> ${testExpression}`);

      // 尝试创建一个临时的CronJob来验证表达式
      const testJob = new CronJob(testExpression, () => {});

      // 确保任务不会立即执行
      if (testJob.nextDate) {
        const nextDate = testJob.nextDate();
        this.logger.log(`下次执行时间: ${nextDate}`);

        // 如果下次执行时间与当前时间相差不到1分钟，可能是表达式有问题
        const now = new Date();
        // 将nextDate转换为JavaScript Date对象
        const nextDateTime = nextDate.toJSDate
          ? nextDate.toJSDate()
          : new Date(nextDate.toString());
        const diffSeconds = Math.floor((nextDateTime.getTime() - now.getTime()) / 1000);
        if (diffSeconds < 60) {
          this.logger.warn(`警告：任务将在${diffSeconds}秒后执行，可能配置有误`);
        }
      }
    } catch (error) {
      this.logger.error(`无效的cron表达式: ${taskData.cronExpression}`);
      throw new Error(`无效的cron表达式: ${error.message}`);
    }

    // 设置默认值
    const task = this.taskRepository.create({
      ...taskData,
      taskGroup: taskData.taskGroup || 'DEFAULT',
      status: taskData.status ?? 0, // 默认为启动状态
      concurrent: taskData.concurrent ?? 0,
      misfirePolicy: taskData.misfirePolicy ?? 3,
      createTime: new Date(),
    });

    // 保存到数据库
    const savedTask = await this.taskRepository.save(task);

    // 如果任务状态为启动，则添加到调度器
    if (savedTask.status === 0) {
      const jobName = `${savedTask.taskGroup}_${savedTask.taskName}_${savedTask.id}`;
      this.dynamicTaskManager.addCronJob(jobName, savedTask.cronExpression, savedTask.invokeTarget);
    }

    return savedTask;
  }

  /**
   * 更新任务
   */
  async updateTask(id: number, taskData: Partial<Task>): Promise<Task> {
    const task = await this.getTaskById(id);
    if (!task) {
      throw new Error('任务不存在');
    }

    const oldJobName = `${task.taskGroup}_${task.taskName}_${task.id}`;

    // 更新数据库中的任务
    await this.taskRepository.update(id, {
      ...taskData,
      updateTime: new Date(),
    });

    // 获取更新后的任务
    const updatedTask = await this.getTaskById(id);

    // 如果任务存在且之前是运行状态，则需要更新调度器中的任务
    if (task.status === 0) {
      // 先删除旧任务
      try {
        this.dynamicTaskManager.deleteCronJob(oldJobName);
      } catch (error) {
        this.logger.warn(`删除旧任务失败，可能不存在: ${error.message}`);
      }

      // 如果更新后仍然是运行状态，则添加新任务
      if (updatedTask.status === 0) {
        const newJobName = `${updatedTask.taskGroup}_${updatedTask.taskName}_${updatedTask.id}`;
        this.dynamicTaskManager.addCronJob(
          newJobName,
          updatedTask.cronExpression,
          updatedTask.invokeTarget,
        );
      }
    }
    // 如果之前是暂停状态，但现在是运行状态，则添加新任务
    else if (task.status === 1 && updatedTask.status === 0) {
      const newJobName = `${updatedTask.taskGroup}_${updatedTask.taskName}_${updatedTask.id}`;
      this.dynamicTaskManager.addCronJob(
        newJobName,
        updatedTask.cronExpression,
        updatedTask.invokeTarget,
      );
    }

    return updatedTask;
  }

  /**
   * 删除任务
   */
  async deleteTask(id: number): Promise<boolean> {
    const task = await this.getTaskById(id);
    if (!task) {
      return false;
    }

    // 如果任务存在于调度器中，先删除
    const jobName = `${task.taskGroup}_${task.taskName}_${task.id}`;
    try {
      this.dynamicTaskManager.deleteCronJob(jobName);
    } catch (error) {
      this.logger.warn(`删除调度器任务失败，可能不存在: ${error.message}`);
    }

    // 从数据库中删除
    const result = await this.taskRepository.delete(id);
    return result.affected > 0;
  }

  /**
   * 切换任务状态
   */
  async toggleTaskStatus(id: number, status: number): Promise<Task> {
    const task = await this.getTaskById(id);
    if (!task) {
      throw new Error('任务不存在');
    }

    const jobName = `${task.taskGroup}_${task.taskName}_${task.id}`;

    if (status === 0) {
      // 启动任务
      if (task.status === 1) {
        // 如果当前是暂停状态
        try {
          // 先尝试恢复任务
          const resumed = this.dynamicTaskManager.resumeCronJob(jobName);
          if (!resumed) {
            // 如果恢复失败，可能是任务不存在，尝试添加任务
            this.dynamicTaskManager.addCronJob(jobName, task.cronExpression, task.invokeTarget);
          }
        } catch (error) {
          // 如果恢复失败，尝试添加任务
          this.dynamicTaskManager.addCronJob(jobName, task.cronExpression, task.invokeTarget);
        }
      }
    } else {
      // 暂停任务
      if (task.status === 0) {
        // 如果当前是运行状态
        this.dynamicTaskManager.pauseCronJob(jobName);
      }
    }

    // 更新任务状态
    task.status = status;
    return await this.taskRepository.save(task);
  }

  /**
   * 执行任务
   */
  async executeTask(invokeTarget: string): Promise<any> {
    try {
      return await this.dynamicTaskManager.executeOnce(invokeTarget);
    } catch (error) {
      this.logger.error(`执行任务失败 [${invokeTarget}]: ${error.message}`);
      throw error;
    }
  }

  /**
   * 根据条件搜索任务
   */
  async searchTasks(params: {
    taskName?: string;
    taskGroup?: string;
    status?: number;
    current?: number;
    size?: number;
  }): Promise<{ list: Task[]; total: number }> {
    const { taskName, taskGroup, status, current = 1, size = 10 } = params;

    const queryBuilder = this.taskRepository.createQueryBuilder('task');

    if (taskName) {
      queryBuilder.andWhere('task.task_name LIKE :taskName', { taskName: `%${taskName}%` });
    }

    if (taskGroup) {
      queryBuilder.andWhere('task.task_group = :taskGroup', { taskGroup });
    }

    if (status !== undefined && status !== null && !isNaN(Number(status))) {
      queryBuilder.andWhere('task.status = :status', { status: Number(status) });
    }

    const total = await queryBuilder.getCount();

    const list = await queryBuilder
      .orderBy('task.id', 'DESC')
      .skip((current - 1) * size)
      .take(size)
      .getMany();

    return { list, total };
  }

  /**
   * 清除访问记录
   */
  async clearVisitorRecords(): Promise<any> {
    return this.executeWithLog(
      '清除访问记录',
      'SYSTEM',
      'taskService.clearVisitorRecords',
      async () => {
        this.logger.log('清除临时访问记录');
        // 这里可以接入实际的Redis服务来清除
        return { message: '访问记录已清除' };
      },
    );
  }

  /**
   * 清除一周前的访问日志
   */
  async clearOldVisitLogs(): Promise<any> {
    return this.executeWithLog(
      '清除旧访问日志',
      'SYSTEM',
      'taskService.clearOldVisitLogs',
      async () => {
        this.logger.log('清除一周前的访问日志');
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const result = await this.visitLogRepository.delete({
          createTime: LessThan(oneWeekAgo) as any,
        });

        this.logger.log(`已清理 ${result.affected || 0} 条一周前的访问日志`);
        return result;
      },
    );
  }

  /**
   * 测试任务
   */
  async testTask(): Promise<any> {
    return this.executeWithLog('测试任务', 'SYSTEM', 'taskService.testTask', async () => {
      this.logger.log('执行测试任务');
      return { message: '测试任务已执行' };
    });
  }
}
