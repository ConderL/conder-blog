import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { EmailService } from '../../email/services/email/email.service';

/**
 * 邮件队列处理器
 */
@Processor('email')
export class EmailProcessor {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(private readonly emailService: EmailService) {}

  /**
   * 处理发送文本邮件任务
   * @param job 任务对象
   */
  @Process('sendTextMail')
  async handleSendTextMail(job: Job) {
    this.logger.debug(`开始处理邮件发送任务: ${job.id}`);

    try {
      const { to, subject, text } = job.data;
      await this.emailService.sendTextMail(to, subject, text);
      this.logger.debug(`邮件发送成功: ${job.id}`);
      return true;
    } catch (error) {
      this.logger.error(`邮件发送失败: ${job.id}`, error.stack);
      throw error;
    }
  }

  /**
   * 处理发送HTML邮件任务
   * @param job 任务对象
   */
  @Process('sendHtmlMail')
  async handleSendHtmlMail(job: Job) {
    this.logger.debug(`开始处理HTML邮件发送任务: ${job.id}`);

    try {
      const { to, subject, html } = job.data;
      await this.emailService.sendHtmlMail(to, subject, html);
      this.logger.debug(`HTML邮件发送成功: ${job.id}`);
      return true;
    } catch (error) {
      this.logger.error(`HTML邮件发送失败: ${job.id}`, error.stack);
      throw error;
    }
  }

  /**
   * 处理发送验证码邮件任务
   * @param job 任务对象
   */
  @Process('sendVerificationCode')
  async handleSendVerificationCode(job: Job) {
    this.logger.debug(`开始处理验证码邮件发送任务: ${job.id}`);

    try {
      const { to, code } = job.data;
      await this.emailService.sendVerificationCode(to, code);
      this.logger.debug(`验证码邮件发送成功: ${job.id}`);
      return true;
    } catch (error) {
      this.logger.error(`验证码邮件发送失败: ${job.id}`, error.stack);
      throw error;
    }
  }
}
