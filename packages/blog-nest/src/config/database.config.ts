import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';
import * as mysql from 'mysql2/promise';
import { Logger } from '@nestjs/common';

dotenv.config();

/**
 * 获取基础数据库配置
 */
export function getBaseDbConfig(configService: ConfigService) {
  return {
    type: 'mysql' as const,
    host: configService.get('database.host', process.env.DB_HOST),
    port: configService.get('database.port', process.env.DB_PORT),
    username: configService.get('database.username', process.env.DB_USERNAME),
    password: configService.get('database.password', process.env.DB_PASSWORD),
    database: configService.get('database.database', process.env.DB_DATABASE),
    timezone: '+08:00',
    charset: 'utf8mb4',
    logging: configService.get<boolean>('database.logging', false),
  };
}

/**
 * 确保数据库存在
 */
export async function ensureDatabaseExists(configService: ConfigService): Promise<void> {
  const logger = new Logger('DatabaseInit');
  const maxRetries = 3;
  const retryDelay = 2000; // 2秒
  const { host, port, username, password, database } = getBaseDbConfig(configService);

  for (let i = 0; i < maxRetries; i++) {
    try {
      logger.log(
        `尝试连接数据库 (第 ${i + 1} 次): host=${host}, port=${port}, username=${username}, database=${database}`,
      );

      const connection = await mysql.createConnection({
        host,
        port,
        user: username,
        password,
      });

      await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` 
                            CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);

      logger.log(`已成功创建/确认数据库 ${database} 存在`);
      await connection.end();
      return;
    } catch (error) {
      logger.warn(`第 ${i + 1} 次尝试连接数据库失败: ${error.message}`);
      if (i < maxRetries - 1) {
        logger.log(`等待 ${retryDelay / 1000} 秒后重试...`);
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      } else {
        logger.warn(`数据库连接失败，但将继续启动应用`);
        return;
      }
    }
  }
}

/**
 * 创建TypeORM配置
 */
export const createTypeOrmOptions = async (
  configService: ConfigService,
): Promise<TypeOrmModuleOptions> => {
  const logger = new Logger('DatabaseConfig');
  const baseConfig = getBaseDbConfig(configService);

  logger.log(
    `数据库配置: host=${baseConfig.host}, port=${baseConfig.port}, username=${baseConfig.username}, database=${baseConfig.database}`,
  );

  // 先确保数据库存在
  await ensureDatabaseExists(configService);

  return {
    ...baseConfig,
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: process.env.NODE_ENV === 'development',
  };
};
