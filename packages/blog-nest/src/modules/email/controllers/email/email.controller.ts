import { Controller, Post, Body, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { EmailService } from '../../services/email/email.service';

@ApiTags('邮件服务')
@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  /**
   * 发送验证码邮件
   * @param body 包含邮箱地址的请求体
   */
  @Post('code')
  @ApiOperation({ summary: '发送验证码邮件' })
  @ApiResponse({ status: HttpStatus.OK, description: '发送验证码成功' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: '参数错误' })
  async sendVerificationCode(@Body() body: { email: string }) {
    // 生成6位随机验证码
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // 发送验证码邮件
    const result = await this.emailService.sendVerificationCode(body.email, code);

    if (result) {
      return {
        code: 200,
        message: '验证码已发送',
        data: null,
      };
    } else {
      return {
        code: 500,
        message: '验证码发送失败',
        data: null,
      };
    }
  }
}
