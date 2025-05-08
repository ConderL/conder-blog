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

async function bootstrap() {
  // 创建应用实例
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: false, // 禁用默认CORS配置
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });
  const logger = new Logger('Bootstrap');

  // 自定义CORS配置 - 更安全的配置，只允许特定来源
  app.enableCors({
    origin: [
      'http://localhost',
      'http://localhost:8080',
      'http://127.0.0.1',
      'http://127.0.0.1:8080',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Disposition'],
    maxAge: 3600,
  });

  // 获取配置服务
  const configService = app.get(ConfigService);

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
}

bootstrap();
