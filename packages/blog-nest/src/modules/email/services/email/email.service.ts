import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

/**
 * 邮件服务
 */
@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    // 创建邮件传输器
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('mail.host'),
      port: this.configService.get('mail.port', 465),
      secure: true, // true for 465, false for other ports
      auth: {
        user: this.configService.get('mail.username'),
        pass: this.configService.get('mail.password'),
      },
    });
  }

  /**
   * 发送文本邮件
   * @param to 收件人
   * @param subject 主题
   * @param text 文本内容
   * @returns 发送结果
   */
  async sendTextMail(to: string, subject: string, text: string): Promise<boolean> {
    try {
      const mailOptions = {
        from: this.configService.get('mail.username'),
        to,
        subject,
        text,
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('发送文本邮件失败:', error);
      return false;
    }
  }

  /**
   * 发送HTML邮件
   * @param to 收件人
   * @param subject 主题
   * @param html HTML内容
   * @returns 发送结果
   */
  async sendHtmlMail(to: string, subject: string, html: string): Promise<boolean> {
    try {
      const mailOptions = {
        from: this.configService.get('mail.username'),
        to,
        subject,
        html,
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('发送HTML邮件失败:', error);
      return false;
    }
  }

  /**
   * 发送验证码邮件
   * @param to 收件人
   * @param code 验证码
   * @returns 发送结果
   */
  async sendVerificationCode(to: string, code: string): Promise<boolean> {
    const subject = '博客系统 - 邮箱验证码';
    const html = `
      <div style="background-color: #f5f5f5; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #fff; padding: 20px; border-radius: 5px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
          <h2 style="color: #333;">邮箱验证码</h2>
          <p style="color: #666;">您好，您的验证码是：</p>
          <div style="font-size: 24px; font-weight: bold; color: #007bff; margin: 15px 0; padding: 10px; background-color: #f8f9fa; border-radius: 5px; text-align: center;">
            ${code}
          </div>
          <p style="color: #666;">验证码有效期为5分钟，请勿将验证码告知他人。</p>
          <p style="color: #999; margin-top: 20px; font-size: 12px;">此邮件由系统自动发送，请勿回复。</p>
        </div>
      </div>
    `;

    return this.sendHtmlMail(to, subject, html);
  }
}
