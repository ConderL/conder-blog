import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import * as svgCaptcha from 'svg-captcha';
import { CaptchaResponseDto } from './dto/captcha.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class CaptchaService {
  constructor(
    private configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /**
   * 平台类型枚举
   */
  private PlatformType = {
    ADMIN: 'ConderAdmin',
    BLOG: 'ConderView',
  };

  /**
   * 验证码缓存前缀
   */
  private readonly CAPTCHA_PREFIX = 'captcha:';

  /**
   * 验证码过期时间（分钟）
   */
  private readonly CAPTCHA_EXPIRE_TIME = 2;

  /**
   * 生成验证码
   * @param type 平台类型（前台/后台）
   * @returns 验证码信息
   */
  async generateCaptcha(type: string): Promise<CaptchaResponseDto> {
    // 判断平台类型
    if (type !== this.PlatformType.ADMIN && type !== this.PlatformType.BLOG) {
      type = this.PlatformType.BLOG;
    }

    // 生成验证码
    const captcha = svgCaptcha.create({
      size: 4, // 验证码长度
      ignoreChars: '0o1il', // 排除容易混淆的字符
      noise: 2, // 干扰线条数
      color: true, // 验证码颜色
      background: '#f9fbdc', // 背景色
      width: 150, // 宽度
      height: 50, // 高度
      fontSize: 50, // 字体大小
    });

    // 生成验证码UUID
    const captchaUuid = randomUUID().replace(/-/g, '');

    // 缓存验证码，有效期2分钟
    await this.cacheManager.set(
      `${this.CAPTCHA_PREFIX}${type}:${captchaUuid}`,
      captcha.text,
      this.CAPTCHA_EXPIRE_TIME * 60 * 1000, // 毫秒
    );

    // 返回验证码信息
    return {
      captchaUuid,
      captchaImg: captcha.data,
    };
  }

  /**
   * 验证验证码
   * @param captchaUuid 验证码UUID
   * @param captchaCode 用户输入的验证码
   * @param type 平台类型
   * @returns 是否验证通过
   */
  async validateCaptcha(captchaUuid: string, captchaCode: string, type: string): Promise<boolean> {
    // 判断平台类型
    if (type !== this.PlatformType.ADMIN && type !== this.PlatformType.BLOG) {
      type = this.PlatformType.BLOG;
    }

    // 从缓存中获取验证码
    const key = `${this.CAPTCHA_PREFIX}${type}:${captchaUuid}`;
    const cachedCode = await this.cacheManager.get<string>(key);

    // 校验验证码 - 忽略大小写
    if (!cachedCode || cachedCode.toLowerCase() !== captchaCode.toLowerCase()) {
      return false;
    }

    // 验证成功后删除缓存
    await this.cacheManager.del(key);

    return true;
  }
}
