import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { initDatabase } from './database';
// 导入helmet
import helmet from 'helmet';

async function bootstrap() {
  // 创建应用实例
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: false, // 禁用默认CORS配置
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });
  const logger = new Logger('Bootstrap');

  // 应用helmet中间件增强安全性 - 使用函数调用方式
  app.use(helmet());

  // 获取配置服务
  const configService = app.get(ConfigService);

  // 获取允许的域名列表，如果环境变量中有ALLOWED_ORIGINS，则使用它
  const allowedOriginsFromEnv = configService.get<string>('ALLOWED_ORIGINS');
  let allowedOrigins = [
    'http://admin.conder.top',
    'https://admin.conder.top',
    'http://conder.top',
    'https://conder.top',
    'http://www.conder.top',
    'https://www.conder.top',
    'http://localhost:4173',
    'http://localhost:4000',
    'http://192.168.83.207:4000',
    'http://localhost:3334',
  ];

  // 如果有设置环境变量ALLOWED_ORIGINS，则添加到允许列表中
  if (allowedOriginsFromEnv) {
    const additionalOrigins = allowedOriginsFromEnv.split(',');
    allowedOrigins = [...allowedOrigins, ...additionalOrigins];
    logger.log(`添加额外的CORS origins: ${additionalOrigins.join(', ')}`);
  }

  // 自定义CORS配置 - 更安全的配置，只允许特定来源
  app.enableCors({
    origin: (origin, callback) => {
      console.log(`收到的Origin: ${origin}`); // 添加日志记录

      if (!origin || allowedOrigins.includes(origin)) {
        // 设置Vary头，表明响应可能因Origin而不同
        callback(null, origin);
      } else {
        console.log(`不允许的Origin: ${origin}`);
        callback(null, allowedOrigins[0]); // 默认允许第一个域名，避免错误
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    exposedHeaders: ['Content-Disposition', 'Content-Length', 'Content-Range'],
    maxAge: 3600,
  });

  // 配置全局管道
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false,
      forbidUnknownValues: true,
      enableDebugMessages: true,
      stopAtFirstError: false,
      transformOptions: {
        enableImplicitConversion: true,
        exposeDefaultValues: true,
      },
    }),
  );

  // 配置全局拦截器
  app.useGlobalInterceptors(new TransformInterceptor());

  // 配置静态文件服务
  app.useStaticAssets(join(__dirname, '..', 'public'), {
    prefix: '/',
  });

  // 上传文件目录
  app.useStaticAssets(join(__dirname, '..', 'public', 'uploads'), {
    prefix: '/uploads/',
  });

  // 配置Swagger
  const options = new DocumentBuilder()
    .setTitle('博客API文档')
    .setDescription('博客系统后端API接口文档')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api-docs', app, document);
  SwaggerModule.setup('swagger-ui', app, document);

  // 获取数据源
  const dataSource = app.get(DataSource);

  // 初始化数据库数据
  await initDatabase(dataSource);

  const port = configService.get('PORT', 3000);
  await app.listen(port);
  logger.log(`应用已启动: http://localhost:${port}`);
  logger.log(`允许的CORS Origins: ${allowedOrigins.join(', ')}`);

  // 在NestJS应用的中间件或响应拦截器中添加
  app.use((req, res, next) => {
    res.header('Vary', 'Origin');
    next();
  });
}

bootstrap();
