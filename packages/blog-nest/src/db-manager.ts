/**
 * 数据库管理工具
 * 提供数据库初始化、同步和修复功能
 */

import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import * as mysql from 'mysql2/promise';

/**
 * 加载环境变量
 */
function loadEnv() {
  try {
    const envFile = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envFile)) {
      console.log(`加载环境变量文件: ${envFile}`);
      dotenv.config({ path: envFile });
    } else {
      console.log('未找到.env文件，将使用默认配置');
      dotenv.config();
    }
  } catch (error) {
    console.warn('加载环境变量时出错，将使用默认配置:', error.message);
  }
}

/**
 * 获取数据库配置
 */
function getDbConfig() {
  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_DATABASE || 'blog',
  };
}

/**
 * 查找所有实体文件
 */
function findEntityFiles(srcPath: string = path.join(__dirname, '../../')): string[] {
  const entityFiles = [];

  function scanDir(dirPath: string) {
    try {
      const files = fs.readdirSync(dirPath);

      for (const file of files) {
        const filePath = path.join(dirPath, file);

        try {
          const stat = fs.statSync(filePath);

          // 跳过数据库文件夹和node_modules等特定目录
          if (
            stat.isDirectory() &&
            !filePath.includes('db_data') &&
            !filePath.includes('node_modules') &&
            !filePath.includes('dist')
          ) {
            scanDir(filePath);
          } else if (file.endsWith('.entity.ts') || file.endsWith('.entity.js')) {
            entityFiles.push(filePath);
          }
        } catch (fileError) {
          // 忽略无法访问的文件
          console.log(`跳过无法访问的文件: ${filePath}`);
        }
      }
    } catch (dirError) {
      // 忽略无法访问的目录
      console.log(`跳过无法访问的目录: ${dirPath}`);
    }
  }

  try {
    scanDir(srcPath);
    console.log(`找到 ${entityFiles.length} 个实体文件`);
    return entityFiles;
  } catch (error) {
    console.error('查找实体文件时出错:', error);
    return [];
  }
}

/**
 * 创建数据源连接
 */
function createDataSource(withSync: boolean = false): DataSource {
  const dbConfig = getDbConfig();
  const entityFiles = findEntityFiles();

  return new DataSource({
    type: 'mysql',
    host: dbConfig.host,
    port: dbConfig.port,
    username: dbConfig.username,
    password: dbConfig.password,
    database: dbConfig.database,
    entities: entityFiles,
    synchronize: withSync,
    logging: true,
    charset: 'utf8mb4_unicode_ci',
  });
}

/**
 * 从SQL文件初始化数据库
 * @param sqlFilePath SQL文件路径
 */
async function initDatabaseFromSqlFile(
  sqlFilePath: string = path.join(process.cwd(), 'blog.sql'),
): Promise<void> {
  loadEnv();
  const dbConfig = getDbConfig();

  try {
    console.log(`\n准备从SQL文件初始化数据库: ${sqlFilePath}`);

    if (!fs.existsSync(sqlFilePath)) {
      throw new Error(`SQL文件不存在: ${sqlFilePath}`);
    }

    console.log('尝试连接到MySQL...');
    // 创建数据库连接
    const connection = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.username,
      password: dbConfig.password,
      multipleStatements: true, // 允许多条SQL语句
    });

    console.log('MySQL连接成功!');

    // 执行创建数据库语句
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` 
                           CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log(`确保数据库 ${dbConfig.database} 存在`);

    // 切换到指定数据库
    await connection.query(`USE \`${dbConfig.database}\``);
    console.log(`已切换到数据库: ${dbConfig.database}`);

    // 读取SQL文件内容
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

    // 执行SQL文件
    console.log('正在执行SQL脚本...');
    await connection.query(sqlContent);
    console.log('SQL脚本执行完成!');

    // 确保t_visit_log表的create_time字段有默认值
    console.log('检查t_visit_log表的create_time字段是否有默认值...');

    try {
      const [rows] = await connection.query(`
        SELECT COLUMN_NAME, COLUMN_DEFAULT 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = '${dbConfig.database}' 
        AND TABLE_NAME = 't_visit_log' 
        AND COLUMN_NAME = 'create_time'
      `);

      const createTimeColumnInfo = rows as any[];
      if (createTimeColumnInfo.length > 0 && createTimeColumnInfo[0].COLUMN_DEFAULT === null) {
        console.log('create_time字段没有默认值，正在添加...');
        await connection.query(`
          ALTER TABLE t_visit_log 
          MODIFY COLUMN create_time datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
        `);
        console.log('已成功为create_time字段添加默认值');
      } else {
        console.log('create_time字段已有默认值或不存在');
      }
    } catch (error) {
      console.error('检查create_time字段时出错:', error);
    }

    // 关闭连接
    await connection.end();
    console.log('数据库初始化成功!');
  } catch (error) {
    console.error('初始化数据库时出错:', error);
    throw error;
  }
}

/**
 * 同步数据库结构
 */
async function syncDatabase(): Promise<void> {
  loadEnv();

  try {
    console.log('\n准备同步数据库结构...');
    const dataSource = createDataSource(true); // 启用自动同步

    // 初始化数据源
    await dataSource.initialize();
    console.log('数据库连接成功!');

    console.log('正在同步数据库结构...');
    // 自动同步已在DataSource配置中启用

    console.log('数据库结构同步完成!');

    // 关闭数据源
    await dataSource.destroy();
  } catch (error) {
    console.error('同步数据库结构时出错:', error);
    handleDbError(error);
  }
}

/**
 * 初始化数据库数据
 */
async function initializeData(): Promise<void> {
  loadEnv();

  try {
    console.log('\n准备初始化数据库数据...');

    // 检查SQL文件是否存在
    const sqlFilePath = path.join(process.cwd(), 'blog.sql');
    if (fs.existsSync(sqlFilePath)) {
      // 使用SQL文件初始化数据库
      await initDatabaseFromSqlFile(sqlFilePath);
    } else {
      console.log('未找到SQL文件，使用代码方式初始化数据库...');

      // 创建数据源
      const dataSource = createDataSource();
      await dataSource.initialize();
      console.log('数据库连接成功!');
    }
  } catch (error) {
    console.error('数据库数据初始化失败:', error);
    handleDbError(error);
  }
}

/**
 * 处理数据库错误
 */
function handleDbError(error: any): void {
  if (error.code === 'ER_ACCESS_DENIED_ERROR') {
    console.error('错误: 数据库访问被拒绝。请检查用户名和密码设置。');
  } else if (error.code === 'ECONNREFUSED') {
    console.error('错误: 无法连接到数据库服务器。请检查主机和端口设置，并确保MySQL服务正在运行。');
  } else if (error.code === 'ER_BAD_DB_ERROR') {
    console.error('错误: 数据库不存在。请检查数据库名称或创建该数据库。');
  }
}

/**
 * 主函数
 */
async function main() {
  loadEnv();

  // 获取命令行参数
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    // 显示帮助信息
    console.log('数据库管理工具使用说明:');
    console.log('  npm run db:init    - 从SQL文件初始化数据库');
    console.log('  npm run db:sync    - 同步数据库结构');
    console.log('  npm run db:fix     - 修复数据库结构和数据');
    console.log('  npm run db:admin   - 修复管理员账号');
    console.log('  npm run db:help    - 显示帮助信息');
    return;
  }

  const command = args[0];

  try {
    switch (command) {
      case 'init':
        await initializeData();
        break;
      case 'sync':
        await syncDatabase();
        break;
      default:
        console.log(`未知命令: ${command}`);
        console.log('使用 --help 或 -h 查看帮助信息');
    }

    console.log('操作完成!');
  } catch (error) {
    console.error('执行过程中出错:', error);
    process.exit(1);
  }
}

// 执行主函数
if (require.main === module) {
  main().catch((error) => {
    console.error('程序执行失败:', error);
    process.exit(1);
  });
}

// 导出函数，以便其他模块调用
export { initializeData, syncDatabase, createDataSource, fixTableStructure };

/**
 * 修复表结构
 * 为用户表添加status字段
 * 为访问日志表添加referer字段
 * 为上传文件表添加file_size字段
 */
async function fixTableStructure() {
  console.log('开始修复表结构...');

  const dataSource = createDataSource();
  const connection = dataSource.createQueryRunner();
  await connection.connect();

  try {
    // 检查t_user表中是否存在status字段
    const userColumnsResult = await connection.query('SHOW COLUMNS FROM t_user');
    const userColumns = userColumnsResult.map((col) => col.Field);

    if (!userColumns.includes('status')) {
      console.log('t_user表中缺少status字段，开始添加...');
      await connection.query(
        'ALTER TABLE t_user ADD COLUMN status INT DEFAULT 1 COMMENT "用户状态：0-禁用，1-正常"',
      );
      console.log('t_user表status字段添加成功');
    } else {
      console.log('t_user表已存在status字段，无需修复');
    }

    console.log('表结构修复完成');
  } catch (e) {
    console.error('修复表结构失败：', e.message);
    throw e;
  } finally {
    await connection.release();
  }
}
