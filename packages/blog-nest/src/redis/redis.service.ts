import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private redisClient: Redis.Redis;

  constructor(private readonly configService: ConfigService) {}

  /**
   * 在模块初始化时连接Redis
   */
  async onModuleInit() {
    try {
      this.redisClient = new Redis.Redis({
        host: this.configService.get('redis.host', 'localhost'),
        port: this.configService.get('redis.port', 6379),
        password: this.configService.get('redis.password', null),
        db: this.configService.get('redis.db', 0),
        enableReadyCheck: true, // 确保 ready 事件只在连接真正就绪后触发
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000);
          this.logger.log(`Redis 连接重试 (${times})，延迟 ${delay}ms`);
          return delay;
        },
      });

      this.redisClient.on('connect', () => {
        this.logger.log('Redis连接成功');
        // 连接成功后设置 stop-writes-on-bgsave-error 为 no
        this.redisClient
          .config('SET', 'stop-writes-on-bgsave-error', 'no')
          .then(() => this.logger.log('已禁用 stop-writes-on-bgsave-error 选项'))
          .catch((err) => this.logger.error(`设置 Redis 配置失败: ${err.message}`));
      });

      this.redisClient.on('ready', () => {
        this.logger.log('Redis 实例准备就绪');
        this.checkRedisHealth();
      });

      this.redisClient.on('error', (error) => {
        this.logger.error(`Redis连接错误: ${error.message}`);
      });
    } catch (error) {
      this.logger.error(`初始化Redis客户端失败: ${error.message}`);
    }
  }

  /**
   * 检查 Redis 健康状况并尝试修复常见问题
   */
  private async checkRedisHealth() {
    try {
      // 检查并设置常见的 Redis 问题解决方案
      await this.redisClient.config('SET', 'stop-writes-on-bgsave-error', 'no');

      // 获取 Redis 内存使用情况
      const info = await this.redisClient.info('memory');
      const memoryMatch = /used_memory_human:(\S+)/.exec(info);
      if (memoryMatch) {
        this.logger.log(`Redis 内存使用: ${memoryMatch[1]}`);
      }

      // 检查 maxmemory 配置和淘汰策略
      const configMaxmemory = await this.redisClient.config('GET', 'maxmemory');
      const configMaxmemoryPolicy = await this.redisClient.config('GET', 'maxmemory-policy');

      this.logger.log(`Redis maxmemory: ${configMaxmemory[1] || '未设置'}`);
      this.logger.log(`Redis maxmemory-policy: ${configMaxmemoryPolicy[1] || '未设置'}`);

      // 如果没有设置 maxmemory-policy，配置一个合理的策略
      if (!configMaxmemoryPolicy[1] || configMaxmemoryPolicy[1] === 'noeviction') {
        await this.redisClient.config('SET', 'maxmemory-policy', 'allkeys-lru');
        this.logger.log('已设置 Redis maxmemory-policy 为 allkeys-lru');
      }

      this.logger.log('Redis 健康检查完成');
    } catch (error) {
      this.logger.error(`Redis 健康检查失败: ${error.message}`);
    }
  }

  /**
   * 在模块销毁时断开Redis连接
   */
  async onModuleDestroy() {
    if (this.redisClient) {
      await this.redisClient.quit();
      this.logger.log('Redis连接已关闭');
    }
  }

  /**
   * 获取Redis客户端实例
   */
  getClient(): Redis.Redis {
    return this.redisClient;
  }

  /**
   * 向集合中添加元素
   * @param key Redis键
   * @param members 要添加的成员
   * @returns 添加成功的成员数量
   */
  async sadd(key: string, ...members: (string | number)[]): Promise<number> {
    try {
      return await this.redisClient.sadd(key, ...members);
    } catch (error) {
      this.logger.error(`sadd操作失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 从集合中移除元素
   * @param key Redis键
   * @param members 要移除的成员
   * @returns 移除成功的成员数量
   */
  async srem(key: string, ...members: (string | number)[]): Promise<number> {
    try {
      return await this.redisClient.srem(key, ...members);
    } catch (error) {
      this.logger.error(`srem操作失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 获取集合中所有成员
   * @param key Redis键
   * @returns 集合中的所有成员
   */
  async smembers(key: string): Promise<string[]> {
    try {
      return await this.redisClient.smembers(key);
    } catch (error) {
      this.logger.error(`smembers操作失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 判断元素是否是集合的成员
   * @param key Redis键
   * @param member 要检查的成员
   * @returns 如果成员是集合的元素，则返回1，否则返回0
   */
  async sismember(key: string, member: string | number): Promise<number> {
    try {
      return await this.redisClient.sismember(key, member);
    } catch (error) {
      this.logger.error(`sismember操作失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 获取集合成员数
   * @param key Redis键
   * @returns 集合成员数量
   */
  async scard(key: string): Promise<number> {
    try {
      return await this.redisClient.scard(key);
    } catch (error) {
      this.logger.error(`scard操作失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 设置键值对
   * @param key Redis键
   * @param value 值
   * @param ttl 过期时间(秒)
   */
  async set(key: string, value: string | number, ttl?: number): Promise<'OK'> {
    try {
      if (ttl) {
        return await this.redisClient.set(key, value, 'EX', ttl);
      }
      return await this.redisClient.set(key, value);
    } catch (error) {
      this.logger.error(`set操作失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 获取键值
   * @param key Redis键
   */
  async get(key: string): Promise<string | null> {
    try {
      return await this.redisClient.get(key);
    } catch (error) {
      this.logger.error(`get操作失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 删除键
   * @param key Redis键
   */
  async del(key: string): Promise<number> {
    try {
      return await this.redisClient.del(key);
    } catch (error) {
      this.logger.error(`del操作失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 获取哈希表中的值
   * @param key Redis键
   * @param field 字段名
   * @returns 字段值
   */
  async hget(key: string, field: string): Promise<string | null> {
    try {
      return await this.redisClient.hget(key, field);
    } catch (error) {
      this.logger.error(`hget操作失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 设置哈希表字段的值
   * @param key Redis键
   * @param field 字段名
   * @param value 字段值
   * @returns OK
   */
  async hset(key: string, field: string, value: string | number): Promise<number> {
    try {
      return await this.redisClient.hset(key, field, value.toString());
    } catch (error) {
      this.logger.error(`hset操作失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 获取哈希表中所有的字段和值
   * @param key Redis键
   * @returns 字段和值的对象
   */
  async hgetall(key: string): Promise<Record<string, string>> {
    try {
      return await this.redisClient.hgetall(key);
    } catch (error) {
      this.logger.error(`hgetall操作失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 为哈希表中的字段值加上指定增量值
   * @param key Redis键
   * @param field 字段名
   * @param increment 增量值(可以是负数)
   * @returns 增加后的值
   */
  async hincrby(key: string, field: string, increment: number): Promise<number> {
    try {
      return await this.redisClient.hincrby(key, field, increment);
    } catch (error) {
      this.logger.error(`hincrby操作失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 删除哈希表中的字段
   * @param key Redis键
   * @param field 字段名
   * @returns 删除的字段数量
   */
  async hdel(key: string, field: string): Promise<number> {
    try {
      return await this.redisClient.hdel(key, field);
    } catch (error) {
      this.logger.error(`hdel操作失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 查看哈希表中指定字段是否存在
   * @param key Redis键
   * @param field 字段名
   * @returns 是否存在(1存在，0不存在)
   */
  async hexists(key: string, field: string): Promise<number> {
    try {
      return await this.redisClient.hexists(key, field);
    } catch (error) {
      this.logger.error(`hexists操作失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 获取哈希表中所有值转换为数字类型
   * @param key Redis键
   * @returns 字段名与数字值的映射
   */
  async getHashAll(key: string): Promise<Record<string, number>> {
    try {
      const hash = await this.hgetall(key);
      const result: Record<string, number> = {};

      for (const field in hash) {
        result[field] = parseInt(hash[field], 10) || 0;
      }

      return result;
    } catch (error) {
      this.logger.error(`getHashAll操作失败: ${error.message}`);
      return {};
    }
  }

  /**
   * 获取哈希表中指定字段的数字值
   * @param key Redis键
   * @param field 字段名
   * @returns 字段的数字值
   */
  async getHash(key: string, field: string): Promise<number> {
    try {
      const value = await this.hget(key, field);
      return parseInt(value, 10) || 0;
    } catch (error) {
      this.logger.error(`getHash操作失败: ${error.message}`);
      return 0;
    }
  }

  /**
   * 获取有序集合的所有元素和分数
   * @param key Redis键
   * @returns 元素与分数的映射
   */
  async getZsetAllScore(key: string): Promise<Record<string, number>> {
    try {
      const result: Record<string, number> = {};
      const ranges = await this.redisClient.zrange(key, 0, -1, 'WITHSCORES');

      for (let i = 0; i < ranges.length; i += 2) {
        const member = ranges[i];
        const score = parseFloat(ranges[i + 1]) || 0;
        result[member] = score;
      }

      return result;
    } catch (error) {
      this.logger.error(`getZsetAllScore操作失败: ${error.message}`);
      return {};
    }
  }

  /**
   * 获取有序集合中成员的分数
   * @param key Redis键
   * @param member 成员
   * @returns 分数
   */
  async getZsetScore(key: string, member: string | number): Promise<number> {
    try {
      const score = await this.redisClient.zscore(key, member.toString());
      return score ? parseFloat(score) : 0;
    } catch (error) {
      this.logger.error(`getZsetScore操作失败: ${error.message}`);
      return 0;
    }
  }

  /**
   * 有序集合中对指定成员的分数加上增量
   * @param key Redis键
   * @param member 成员
   * @param increment 增量
   * @returns 增加后的分数
   */
  async incrZet(key: string, member: string | number, increment: number): Promise<number> {
    try {
      const score = await this.redisClient.zincrby(key, increment, member.toString());
      return parseFloat(score);
    } catch (error) {
      this.logger.error(`incrZet操作失败: ${error.message}`);
      throw error;
    }
  }
}
