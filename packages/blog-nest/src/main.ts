import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { join } from 'path';
import helmet from 'helmet';
import * as nodeCrypto from 'crypto';

import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { initDatabase } from './database';

const isProduction = process.env.NODE_ENV === 'production';

// Ensure global crypto exists (e.g. for @nestjs/schedule randomUUID usage).
if (!(global as any).crypto || !(global as any).crypto.randomUUID) {
  (global as any).crypto = nodeCrypto as any;
}

// In production, heavy console logging can easily peg CPU and stall the service under load.
// Set ENABLE_CONSOLE_LOG=true to re-enable.
if (isProduction && process.env.ENABLE_CONSOLE_LOG !== 'true') {
  // eslint-disable-next-line no-console
  console.log = () => undefined;
  // eslint-disable-next-line no-console
  console.debug = () => undefined;
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: false,
    logger: isProduction ? ['error', 'warn', 'log'] : ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const logger = new Logger('Bootstrap');

  app.use(helmet());

  const configService = app.get(ConfigService);

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
    'http://192.168.5.17:4000',
    'http://localhost:3334',
  ];

  if (allowedOriginsFromEnv) {
    const additionalOrigins = allowedOriginsFromEnv.split(',');
    allowedOrigins = [...allowedOrigins, ...additionalOrigins];
    logger.log(`Added CORS origins from env: ${additionalOrigins.join(', ')}`);
  }

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, origin);
      } else {
        callback(null, allowedOrigins[0]);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    exposedHeaders: ['Content-Disposition', 'Content-Length', 'Content-Range'],
    maxAge: 3600,
  });

  app.use((req, res, next) => {
    res.header('Vary', 'Origin');
    next();
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false,
      forbidUnknownValues: true,
      enableDebugMessages: !isProduction,
      stopAtFirstError: false,
      transformOptions: {
        enableImplicitConversion: true,
        exposeDefaultValues: true,
      },
    }),
  );

  app.useGlobalInterceptors(new TransformInterceptor());

  app.useStaticAssets(join(__dirname, '..', 'public'), { prefix: '/' });
  app.useStaticAssets(join(__dirname, '..', 'public', 'uploads'), { prefix: '/uploads/' });

  await app.init();

  const enableSwagger =
    process.env.ENABLE_SWAGGER === 'true' || process.env.NODE_ENV !== 'production';
  if (enableSwagger) {
    try {
      const options = new DocumentBuilder()
        .setTitle('博客API文档')
        .setDescription('博客系统后端API接口文档')
        .setVersion('1.0.0')
        .addBearerAuth()
        .build();
      const document = SwaggerModule.createDocument(app, options, {
        deepScanRoutes: true,
        include: [AppModule],
      });
      SwaggerModule.setup('api-docs', app, document);
      SwaggerModule.setup('swagger-ui', app, document);
    } catch (err) {
      new Logger('Swagger').error('Swagger init failed, skipping', err as any);
    }
  }

  const dataSource = app.get(DataSource);
  await initDatabase(dataSource);

  const port = configService.get('PORT', 3000);
  await app.listen(port);
  logger.log(`Listening on http://localhost:${port}`);
  logger.log(`Allowed CORS origins: ${allowedOrigins.join(', ')}`);
}

bootstrap();
