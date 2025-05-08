import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { Repository } from 'typeorm';
import { SiteConfig } from '../../blog/entities/site-config.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { LocalTextFilterService } from './local-text-filter.service';

interface CensorResult {
  isSafe: boolean;
  filteredText: string;
  reasons?: string[];
  originalText?: string;
}

/**
 * 百度文本审核服务
 * 使用百度内容审核平台API进行文本内容审核
 */
@Injectable()
export class BaiduTextCensorService {
  private readonly logger = new Logger(BaiduTextCensorService.name);
  private readonly API_KEY: string;
  private readonly SECRET_KEY: string;
  private accessToken: string;
  private tokenExpireTime: number;

  // 错误计数和服务状态
  private errorCount: number = 0;
  private lastErrorTime: number = 0;
  private serviceAvailable: boolean = true;
  private readonly MAX_ERROR_COUNT: number = 5; // 最大错误次数
  private readonly ERROR_RESET_TIME: number = 30 * 60 * 1000; // 错误重置时间(30分钟)

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(SiteConfig)
    private readonly siteConfigRepository: Repository<SiteConfig>,
    private readonly localTextFilterService: LocalTextFilterService,
  ) {
    this.API_KEY = this.configService.get<string>('baidu.apiKey');
    this.SECRET_KEY = this.configService.get<string>('baidu.secretKey');
    this.accessToken = null;
    this.tokenExpireTime = 0;

    if (!this.API_KEY || !this.SECRET_KEY) {
      this.logger.warn('百度API密钥未配置，文本审核将使用本地过滤');
      this.serviceAvailable = false;
    } else {
      this.getAccessToken().catch((err) => {
        this.logger.error(`初始化百度API访问令牌失败: ${err.message}`);
        this.recordError();
      });
    }
  }

  /**
   * 获取服务可用状态
   * @returns 百度审核服务是否可用
   */
  public isServiceAvailable(): boolean {
    // 检查错误重置时间
    this.checkErrorReset();
    return this.serviceAvailable && !!this.API_KEY && !!this.SECRET_KEY;
  }

  /**
   * 记录错误并检查错误次数
   */
  private recordError(): void {
    this.errorCount++;
    this.lastErrorTime = Date.now();

    this.logger.warn(
      `百度审核服务出现错误，当前错误计数: ${this.errorCount}/${this.MAX_ERROR_COUNT}`,
    );

    if (this.errorCount >= this.MAX_ERROR_COUNT) {
      this.serviceAvailable = false;
      this.logger.error(
        `百度审核服务错误次数过多，服务暂时不可用。将在${this.ERROR_RESET_TIME / 60000}分钟后重试`,
      );
    }
  }

  /**
   * 检查是否需要重置错误计数
   */
  private checkErrorReset(): void {
    if (!this.serviceAvailable && this.lastErrorTime > 0) {
      const now = Date.now();
      if (now - this.lastErrorTime > this.ERROR_RESET_TIME) {
        this.logger.log('重置百度审核服务错误计数，尝试恢复服务');
        this.errorCount = 0;
        this.lastErrorTime = 0;
        this.serviceAvailable = true;
      }
    }
  }

  /**
   * 获取百度API访问令牌
   */
  private async getAccessToken(): Promise<string> {
    // 如果令牌有效期内，直接返回
    if (this.accessToken && Date.now() < this.tokenExpireTime) {
      return this.accessToken;
    }

    try {
      const response = await axios.post(
        `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${this.API_KEY}&client_secret=${this.SECRET_KEY}`,
      );

      if (response.data && response.data.access_token) {
        this.accessToken = response.data.access_token;
        // 设置过期时间，提前5分钟过期以防万一
        this.tokenExpireTime = Date.now() + (response.data.expires_in - 300) * 1000;
        this.logger.log('百度API访问令牌获取成功');
        return this.accessToken;
      }

      throw new Error('获取访问令牌失败: ' + JSON.stringify(response.data));
    } catch (error) {
      this.logger.error(`获取百度API访问令牌失败: ${error.message}`);
      this.recordError();
      throw error;
    }
  }

  /**
   * 文本内容审核
   * @param text 待审核文本
   * @returns 审核结果
   */
  async textCensor(text: string): Promise<CensorResult> {
    // 如果文本为空，直接返回安全
    if (!text || text.trim() === '') {
      return {
        isSafe: true,
        filteredText: text,
      };
    }

    // 如果服务不可用，使用本地敏感词过滤
    if (!this.isServiceAvailable()) {
      return this.localFilter(text);
    }

    const [siteConfig] = await this.siteConfigRepository.find();

    try {
      // 如果未配置API密钥，使用本地敏感词过滤
      if (!this.API_KEY || !this.SECRET_KEY || siteConfig.baiduCheck === 0) {
        return this.localFilter(text);
      }

      // 获取访问令牌
      const accessToken = await this.getAccessToken();

      // 调用百度文本审核API
      const response = await axios.post(
        `https://aip.baidubce.com/rest/2.0/solution/v1/text_censor/v2/user_defined?access_token=${accessToken}`,
        `text=${encodeURIComponent(text)}`,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      // 解析审核结果
      const result = response.data;
      this.logger.debug(`百度文本审核结果: ${JSON.stringify(result)}`);

      // 如果审核成功
      if (result.conclusion) {
        const isSafe = result.conclusionType === 1; // 1表示合规
        let filteredText = text;
        const reasons = [];

        // 如果结果不合规或疑似，处理敏感词
        if (result.conclusionType === 2 || result.conclusionType === 3) {
          // 获取所有敏感词
          const sensitiveWords = new Set<string>();
          if (result.data && result.data.length > 0) {
            result.data.forEach((item) => {
              // 记录不合规原因
              reasons.push(item.msg);

              // 收集敏感词
              if (item.hits && item.hits.length > 0) {
                item.hits.forEach((hit) => {
                  if (hit.words && hit.words.length > 0) {
                    hit.words.forEach((word) => sensitiveWords.add(word));
                  }
                });
              }
            });
          }

          // 替换敏感词
          filteredText = text;
          sensitiveWords.forEach((word) => {
            // 使用星号替换敏感词，保持长度一致
            const replacement = '*'.repeat(word.length);
            // 使用全局替换
            const regex = new RegExp(this.escapeRegExp(word), 'g');
            filteredText = filteredText.replace(regex, replacement);
          });

          this.logger.warn(`百度审核发现敏感内容: "${text}" -> "${filteredText}"`);
        }

        return {
          isSafe,
          filteredText,
          reasons: reasons.length > 0 ? reasons : undefined,
          originalText: isSafe ? undefined : text,
        };
      }

      // 审核失败的情况
      this.logger.warn(`百度文本审核返回结果异常: ${JSON.stringify(result)}`);
      this.recordError();
      return this.localFilter(text);
    } catch (error) {
      this.logger.error(`百度文本审核请求失败: ${error.message}`, error.stack);
      this.recordError();
      return this.localFilter(text);
    }
  }

  /**
   * 本地敏感词过滤（备用方案）
   * @param text 待过滤文本
   * @returns 过滤结果
   */
  private localFilter(text: string): Promise<CensorResult> {
    const result = this.localTextFilterService.filter(text);
    return Promise.resolve(result);
  }

  /**
   * 转义正则表达式特殊字符
   */
  private escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
