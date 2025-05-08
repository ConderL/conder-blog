import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';
import { getBaseDbConfig } from './config/database.config';

// 加载环境变量
dotenv.config();

const configService = new ConfigService();
const baseConfig = getBaseDbConfig(configService);

export default new DataSource({
  ...baseConfig,
  entities: ['dist/**/*.entity.js', 'src/**/*.entity{.ts,.js}'],
  migrations: ['dist/migrations/*{.ts,.js}', 'src/migrations/*{.ts,.js}'],
  // 迁移时禁用自动同步
  synchronize: false,
});
