import { Controller, Get, Post, Query, Body } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CaptchaService } from './captcha.service';
import { CaptchaRequestDto, CaptchaResponseDto, ValidateCaptchaDto } from './dto/captcha.dto';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('验证码')
@Controller('captcha')
export class CaptchaController {
  constructor(private readonly captchaService: CaptchaService) {}

  /**
   * 获取验证码
   * @param captchaRequestDto 验证码请求DTO
   * @returns 验证码信息
   */
  @ApiOperation({ summary: '获取验证码' })
  @ApiResponse({
    status: 200,
    description: '成功获取验证码',
    type: CaptchaResponseDto,
  })
  @Public()
  @Get()
  async getCaptcha(@Query() captchaRequestDto: CaptchaRequestDto): Promise<CaptchaResponseDto> {
    return this.captchaService.generateCaptcha(captchaRequestDto.type);
  }

  /**
   * 验证验证码
   * @param validateCaptchaDto 验证码验证DTO
   * @returns 验证结果
   */
  @ApiOperation({ summary: '验证验证码' })
  @ApiResponse({
    status: 200,
    description: '验证结果',
    schema: {
      type: 'object',
      properties: {
        valid: {
          type: 'boolean',
          description: '是否验证通过',
        },
      },
    },
  })
  @Public()
  @Post('validate')
  async validateCaptcha(
    @Body() validateCaptchaDto: ValidateCaptchaDto,
  ): Promise<{ valid: boolean }> {
    const valid = await this.captchaService.validateCaptcha(
      validateCaptchaDto.captchaUuid,
      validateCaptchaDto.captchaCode,
      validateCaptchaDto.type,
    );
    return { valid };
  }
}
