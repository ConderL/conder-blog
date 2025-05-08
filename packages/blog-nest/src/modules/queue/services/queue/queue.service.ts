import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue, JobOptions } from 'bull';
import { InjectQueue } from '@nestjs/bull';

/**
 * 队列服务
 */
@Injectable()
export class QueueService {
  constructor(
    @InjectQueue('default') private defaultQueue: Queue,
    @InjectQueue('email') private emailQueue: Queue,
    private configService: ConfigService,
  ) {}

  /**
   * 添加任务到默认队列
   * @param name 任务名称
   * @param data 任务数据
   * @param opts 队列选项
   */
  async addToDefaultQueue(name: string, data: any, opts?: JobOptions) {
    return this.defaultQueue.add(name, data, opts);
  }

  /**
   * 添加任务到邮件队列
   * @param name 任务名称
   * @param data 任务数据
   * @param opts 队列选项
   */
  async addToEmailQueue(name: string, data: any, opts?: JobOptions) {
    return this.emailQueue.add(name, data, opts);
  }

  /**
   * 清空默认队列
   */
  async cleanDefaultQueue() {
    await this.defaultQueue.clean(0, 'completed');
    await this.defaultQueue.clean(0, 'failed');
    await this.defaultQueue.clean(0, 'delayed');
    await this.defaultQueue.clean(0, 'active');
    await this.defaultQueue.clean(0, 'wait');
  }

  /**
   * 清空邮件队列
   */
  async cleanEmailQueue() {
    await this.emailQueue.clean(0, 'completed');
    await this.emailQueue.clean(0, 'failed');
    await this.emailQueue.clean(0, 'delayed');
    await this.emailQueue.clean(0, 'active');
    await this.emailQueue.clean(0, 'wait');
  }

  /**
   * 获取默认队列信息
   */
  async getDefaultQueueInfo() {
    const [completed, failed, delayed, active, waiting] = await Promise.all([
      this.defaultQueue.getCompleted(),
      this.defaultQueue.getFailed(),
      this.defaultQueue.getDelayed(),
      this.defaultQueue.getActive(),
      this.defaultQueue.getWaiting(),
    ]);

    return {
      completed: completed.length,
      failed: failed.length,
      delayed: delayed.length,
      active: active.length,
      waiting: waiting.length,
    };
  }

  /**
   * 获取邮件队列信息
   */
  async getEmailQueueInfo() {
    const [completed, failed, delayed, active, waiting] = await Promise.all([
      this.emailQueue.getCompleted(),
      this.emailQueue.getFailed(),
      this.emailQueue.getDelayed(),
      this.emailQueue.getActive(),
      this.emailQueue.getWaiting(),
    ]);

    return {
      completed: completed.length,
      failed: failed.length,
      delayed: delayed.length,
      active: active.length,
      waiting: waiting.length,
    };
  }
}
