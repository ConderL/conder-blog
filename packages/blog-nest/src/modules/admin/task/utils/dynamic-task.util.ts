import { Injectable, Logger } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { TaskService } from '../task.service';
import { Task } from '../entities/task.entity';

/**
 * 动态任务管理器
 * 用于在运行时添加、删除、暂停和恢复定时任务
 */
@Injectable()
export class DynamicTaskManager {
  private readonly logger = new Logger(DynamicTaskManager.name);

  // 存储自定义函数的映射
  private taskFunctions = new Map<string, () => Promise<any>>();

  constructor(
    private schedulerRegistry: SchedulerRegistry,
    private taskService: TaskService,
  ) {
    // 注册一些内置的任务函数
    this.registerTaskFunction('system.logMemoryUsage', this.logMemoryUsage.bind(this));
    this.registerTaskFunction('system.logActiveUsers', this.logActiveUsers.bind(this));
  }

  /**
   * 注册任务函数
   * @param functionName 函数名称，用于在调用目标中引用
   * @param fn 要执行的函数
   */
  registerTaskFunction(functionName: string, fn: () => Promise<any>) {
    this.taskFunctions.set(functionName, fn);
    this.logger.log(`已注册任务函数: ${functionName}`);
  }

  /**
   * 添加定时任务
   * @param name 任务名称
   * @param cronExpression cron表达式
   * @param functionName 要执行的函数名称
   */
  addCronJob(name: string, cronExpression: string, functionName: string) {
    const fn = this.taskFunctions.get(functionName);

    if (!fn) {
      throw new Error(`未找到任务函数: ${functionName}`);
    }

    // 转换cron表达式，确保兼容性
    const fixedExpression = this.normalizeCronExpression(cronExpression);
    this.logger.log(`原始cron表达式: ${cronExpression}, 转换后: ${fixedExpression}`);

    try {
      const job = new CronJob(fixedExpression, () => {
        this.logger.log(`执行定时任务: ${name}`);
        fn().catch((err) => {
          this.logger.error(`任务执行失败 ${name}: ${err.message}`);
        });
      });

      this.schedulerRegistry.addCronJob(name, job as unknown as any);
      job.start();
      this.logger.log(`任务已添加并启动: ${name}`);
      return true;
    } catch (error) {
      this.logger.error(`添加任务失败 ${name}: ${error.message}, 表达式: ${fixedExpression}`);
      return false;
    }
  }

  /**
   * 规范化cron表达式，确保兼容node-cron库
   * @param expression 原始cron表达式
   * @returns 规范化后的表达式
   */
  private normalizeCronExpression(expression: string): string {
    if (!expression) {
      throw new Error('Cron表达式不能为空');
    }

    // 移除表达式中的多余空格
    const normalized = expression.trim().replace(/\s+/g, ' ');

    // 分割cron表达式的各个部分
    const parts = normalized.split(' ');

    // 检查是否是6位cron表达式（秒 分 时 日 月 周）
    if (parts.length !== 6) {
      throw new Error(`无效的cron表达式: ${expression}, 必须是6个字段`);
    }

    // 替换问号为星号，node-cron不支持问号(?)语法
    // L、W、#等特殊字符也可能需要转换
    for (let i = 0; i < parts.length; i++) {
      // 仅处理日期(3)和星期(5)字段中的问号
      if (i === 3 || i === 5) {
        if (parts[i] === '?') {
          parts[i] = '*';
        }
      }

      // 确保没有使用 */1 这样会导致每秒/每分钟/每小时执行的表达式
      if (parts[i] === '*/1') {
        parts[i] = '*';
      }

      // 检查是否包含有效的cron字符，防止非法字符导致意外行为
      if (!/^[\d\/\*\-\,]+$/.test(parts[i].replace(/\s/g, ''))) {
        this.logger.warn(`cron表达式字段包含非标准字符: ${parts[i]}, 位置 ${i}`);
      }
    }

    const result = parts.join(' ');
    this.logger.log(`规范化cron表达式: ${expression} -> ${result}`);
    return result;
  }

  /**
   * 删除定时任务
   * @param name 任务名称
   */
  deleteCronJob(name: string) {
    try {
      this.schedulerRegistry.deleteCronJob(name);
      this.logger.log(`任务已删除: ${name}`);
      return true;
    } catch (error) {
      this.logger.error(`删除任务失败 ${name}: ${error.message}`);
      return false;
    }
  }

  /**
   * 暂停定时任务
   * @param name 任务名称
   */
  pauseCronJob(name: string) {
    try {
      const job = this.schedulerRegistry.getCronJob(name);
      job.stop();
      this.logger.log(`任务已暂停: ${name}`);
      return true;
    } catch (error) {
      this.logger.error(`暂停任务失败 ${name}: ${error.message}`);
      return false;
    }
  }

  /**
   * 恢复定时任务
   * @param name 任务名称
   */
  resumeCronJob(name: string) {
    try {
      const job = this.schedulerRegistry.getCronJob(name);
      job.start();
      this.logger.log(`任务已恢复: ${name}`);
      return true;
    } catch (error) {
      this.logger.error(`恢复任务失败 ${name}: ${error.message}`);
      return false;
    }
  }

  /**
   * 立即执行一次定时任务
   * @param functionName 要执行的函数名称
   */
  async executeOnce(functionName: string) {
    const fn = this.taskFunctions.get(functionName);

    if (!fn) {
      throw new Error(`未找到任务函数: ${functionName}`);
    }

    this.logger.log(`手动执行任务: ${functionName}`);
    return await fn();
  }

  /**
   * 获取所有定时任务及下次执行时间
   */
  async getCronJobs() {
    const cronJobs = [];
    const jobs = this.schedulerRegistry.getCronJobs();

    jobs.forEach((value, key) => {
      let nextTime = null;
      try {
        const cronJob = value as unknown as CronJob;
        const next = cronJob.nextDate();
        if (next) {
          nextTime = next.toJSDate ? next.toJSDate() : next;
        }
      } catch (e) {
        this.logger.error(e);
      }

      cronJobs.push({
        id: key,
        name: key,
        nextTime,
      });
    });

    const tasks = await this.taskService.findAll();
    for (const task of tasks) {
      const name = this.generateTaskName(task);
      const index = cronJobs.findIndex((job) => job.name === name);
      if (index > -1) {
        cronJobs[index].id = task.id;
        cronJobs[index].name = task.taskName;
      }
    }

    return cronJobs;
  }

  /**
   * 获取内存使用情况的示例任务
   */
  private async logMemoryUsage(): Promise<any> {
    const memoryUsage = process.memoryUsage();
    this.logger.log(`内存使用情况: ${JSON.stringify(memoryUsage)}`);
    return {
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
      external: `${Math.round(memoryUsage.external / 1024 / 1024)} MB`,
    };
  }

  /**
   * 记录活跃用户的示例任务
   */
  private async logActiveUsers(): Promise<any> {
    // 这里可以接入实际的用户统计服务
    const mockActiveUsers = Math.floor(Math.random() * 100);
    this.logger.log(`当前活跃用户数: ${mockActiveUsers}`);
    return { activeUsers: mockActiveUsers };
  }

  private generateTaskName(task: Task): string {
    // 生成任务名称，格式：任务组_任务名_任务ID
    return `${task.taskGroup}_${task.taskName}_${task.id}`;
  }
}
