import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Request } from 'express';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { ConfigService } from '@nestjs/config';

interface IpApiResponse {
  data?: {
    country?: string;
    region?: string;
    city?: string;
  };
  code?: number;
}

/**
 * IP服务
 * 提供IP地址获取和解析功能
 */
@Injectable()
export class IpService {
  private readonly logger = new Logger(IpService.name);
  private readonly isDev: boolean;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.isDev = this.configService.get('NODE_ENV') !== 'production';
  }

  /**
   * 获取客户端IP地址
   * @param request 请求对象
   * @returns IP地址
   */
  getClientIp(request: Request): string {
    let ip =
      request.headers['x-forwarded-for'] ||
      request.headers['x-real-ip'] ||
      request.connection.remoteAddress ||
      request.socket.remoteAddress;

    // 如果是数组，取第一个
    if (Array.isArray(ip)) {
      ip = ip[0];
    }

    // 如果是IPv6格式的IPv4地址，去掉前缀
    if (typeof ip === 'string' && ip.indexOf('::ffff:') !== -1) {
      ip = ip.substring(7);
    }

    this.logger.log(`获取客户端IP: ${ip}`);
    return typeof ip === 'string' ? ip : '127.0.0.1';
  }

  /**
   * 获取IP地址对应的地理位置
   * @param ip IP地址
   * @returns 地理位置
   */
  async getIpSource(ip: string): Promise<string> {
    // 如果是本地IP，直接返回
    if (['127.0.0.1', 'localhost', '::1'].includes(ip)) {
      return '本地网络';
    }

    // 在开发环境下，直接返回模拟数据
    if (this.isDev) {
      this.logger.log(`开发环境模拟IP ${ip} 的地理位置: 中国-广东省-深圳市`);
      return '中国-广东省-深圳市';
    }

    try {
      // 使用淘宝IP接口查询
      const response = await firstValueFrom(
        this.httpService
          .get<IpApiResponse>(`http://ip.taobao.com/outGetIpInfo?ip=${ip}&accessKey=alibaba-inc`)
          .pipe(
            catchError((error: AxiosError) => {
              this.logger.error(`获取IP地理位置失败: ${error.message}`);
              throw new Error('获取IP地理位置失败');
            }),
          ),
      );

      const apiResponse = response.data as IpApiResponse;

      if (apiResponse && apiResponse.data) {
        const ipInfo = apiResponse.data;
        const country = ipInfo.country || '';
        const region = ipInfo.region || '';
        const city = ipInfo.city || '';

        let location = '';
        if (country) {
          location += country;
          if (region && region !== 'XX') {
            location += `-${region}`;
            if (city && city !== 'XX') {
              location += `-${city}`;
            }
          }
        }

        this.logger.log(`IP ${ip} 的地理位置: ${location || '未知'}`);
        return location || '未知';
      }
    } catch (error) {
      this.logger.error(`解析IP地址失败: ${error.message}`);
    }

    return '未知';
  }

  /**
   * 获取IP地址对应的地理位置
   * 作为 getIpSource 的别名
   * @param ip IP地址
   * @returns 地理位置
   */
  async getIpLocation(ip: string): Promise<string> {
    return this.getIpSource(ip);
  }
}
