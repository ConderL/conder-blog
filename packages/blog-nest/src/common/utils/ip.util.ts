import { Request } from 'express';
import { Socket } from 'socket.io';
import axios from 'axios';
import { Logger } from '@nestjs/common';
import { getCurrentRequest } from './request.util';

/**
 * IP工具类
 * 提供IP地址相关的工具方法，如获取客户端IP、判断是否为内网IP等
 */
export class IPUtil {
  private static readonly logger = new Logger('IPUtil');
  private static readonly ipLocationCache = new Map<string, { value: string; expiresAt: number }>();
  private static readonly ipLocationCacheTtlMs = 24 * 60 * 60 * 1000;
  private static readonly ipLocationCacheMaxSize = 10_000;

  /**
   * 获取客户端IP地址
   * @param request 请求对象
   * @returns 客户端IP地址
   */
  static getClientIp(request: Request): string {
    // 尝试从各种header中获取
    let ip: string = null;

    // 检查X-Forwarded-For头
    if (request.headers['x-forwarded-for']) {
      const forwardedIps = request.headers['x-forwarded-for'];
      if (Array.isArray(forwardedIps)) {
        ip = forwardedIps[0];
      } else {
        ip = forwardedIps.split(',')[0].trim();
      }
    }

    // 检查X-Real-IP头
    if (!ip && request.headers['x-real-ip']) {
      ip = request.headers['x-real-ip'] as string;
    }

    // 从连接中获取
    if (!ip && request.connection && request.connection.remoteAddress) {
      ip = request.connection.remoteAddress;
    }

    // 清理IPv6前缀
    if (ip && ip.indexOf('::ffff:') !== -1) {
      ip = ip.substring(7);
    }

    // 格式化特殊地址
    if (ip === '::1') {
      ip = '127.0.0.1';
    }

    return ip || '127.0.0.1';
  }

  /**
   * 获取WebSocket客户端IP
   * @param client Socket客户端
   * @returns 客户端IP
   */
  static getSocketIp(client: Socket): string {
    // 从Socket握手请求中获取
    let address = '127.0.0.1';

    try {
      // 尝试从不同字段获取IP
      if (client.handshake.headers['x-forwarded-for']) {
        const forwardedIps = client.handshake.headers['x-forwarded-for'] as string;
        address = forwardedIps.split(',')[0].trim();
      } else if (client.handshake.headers['x-real-ip']) {
        address = client.handshake.headers['x-real-ip'] as string;
      } else if (client.handshake.address) {
        address = client.handshake.address;
      } else if (
        client.request &&
        client.request.connection &&
        client.request.connection.remoteAddress
      ) {
        address = client.request.connection.remoteAddress;
      }

      // 清理IPv6前缀
      if (address && address.indexOf('::ffff:') !== -1) {
        address = address.substring(7);
      }

      // 格式化特殊地址
      if (address === '::1') {
        address = '127.0.0.1';
      }
    } catch (error) {
      console.error('获取Socket IP失败:', error);
    }

    return address;
  }

  /**
   * 判断是否为内网IP
   *
   * @param ip 要检查的IP地址
   * @returns 是否为内网IP
   */
  static isInternalIp(ip: string): boolean {
    if (!ip) return false;

    // 判断是否是本地回环地址
    if (ip === '127.0.0.1' || ip === 'localhost' || ip === '::1') {
      return true;
    }

    // 内网IP段的正则表达式
    const patterns = [
      /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/, // 10.0.0.0 - 10.255.255.255
      /^172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}$/, // 172.16.0.0 - 172.31.255.255
      /^192\.168\.\d{1,3}\.\d{1,3}$/, // 192.168.0.0 - 192.168.255.255
    ];

    // 检查IP是否匹配内网IP段
    for (const pattern of patterns) {
      if (pattern.test(ip)) {
        return true;
      }
    }

    return false;
  }

  /**
   * 获取当前请求对象
   * @returns 请求对象
   */
  static getRequestObject(): Request {
    return getCurrentRequest();
  }

  /**
   * 获取IP地理位置
   * @param ip IP地址
   * @returns IP地理位置信息
   */
  static async getIpLocation(ip: string): Promise<string> {
    // 如果是内网IP或本地IP，直接返回
    if (this.isInternalIp(ip) || ip === '127.0.0.1') {
      return '内网IP';
    }

    const cached = this.ipLocationCache.get(ip);
    if (cached && cached.expiresAt > Date.now()) return cached.value;

    try {
      // 使用IP地址查询API
      const response = await axios.get(`http://ip-api.com/json/${ip}?lang=zh-CN`, {
        timeout: 2000,
      });
      const data = response.data;

      if (data.status === 'success') {
        const value = `${data.country || ''} ${data.regionName || ''} ${data.city || ''}`.trim();
        this.setIpLocationCache(ip, value);
        return value;
      }

      // 备用查询方法，如果第一个API不可用
      const fallback = await this.getIpSourceBackup(ip);
      this.setIpLocationCache(ip, fallback);
      return fallback;
    } catch (error) {
      this.logger.error(`获取IP地址位置失败: ${error.message}`);

      // 尝试备用方法
      const fallback = await this.getIpSourceBackup(ip);
      this.setIpLocationCache(ip, fallback);
      return fallback;
    }
  }

  /**
   * 获取IP来源地
   * 兼容性方法，作为 getIpLocation 的别名
   * @param ip IP地址
   * @returns IP地理位置信息
   */
  static async getIpSource(ip: string): Promise<string> {
    return this.getIpLocation(ip);
  }

  /**
   * 备用IP地址查询方法
   * @param ip IP地址
   * @returns IP地理位置信息
   */
  private static async getIpSourceBackup(ip: string): Promise<string> {
    try {
      // 使用备用API
      const response = await axios.get(`https://ipapi.co/${ip}/json/`, { timeout: 2000 });
      const data = response.data;

      if (data && !data.error) {
        return `${data.country_name || ''} ${data.region || ''} ${data.city || ''}`;
      }

      return '未知位置';
    } catch (error) {
      this.logger.error(`备用IP查询也失败: ${error.message}`);
      return '未知位置';
    }
  }

  private static setIpLocationCache(ip: string, value: string) {
    const expiresAt = Date.now() + this.ipLocationCacheTtlMs;
    this.ipLocationCache.set(ip, { value, expiresAt });

    while (this.ipLocationCache.size > this.ipLocationCacheMaxSize) {
      const oldestKey = this.ipLocationCache.keys().next().value as string | undefined;
      if (!oldestKey) break;
      this.ipLocationCache.delete(oldestKey);
    }
  }

  /**
   * 获取IP
   * 作为 getClientIp 的别名，用于从请求中提取IP地址
   * @param request 请求对象
   * @returns IP地址
   */
  static getIp(request: Request): string {
    return this.getClientIp(request);
  }
}

// 导出实例以便于单例使用
export const IP_UTIL = new IPUtil();
