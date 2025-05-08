import { Module } from '@nestjs/common';
import { QueueService } from './services/queue/queue.service';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailProcessor } from './processors/email.processor';
import { DefaultProcessor } from './processors/default.processor';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    ConfigModule,
    EmailModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get('redis.host', 'localhost'),
          port: configService.get('redis.port', 6379),
        },
        defaultJobOptions: {
          attempts: 3,
          removeOnComplete: true,
          removeOnFail: false,
        },
      }),
    }),
    BullModule.registerQueue(
      {
        name: 'default',
      },
      {
        name: 'email',
      },
    ),
  ],
  providers: [QueueService, EmailProcessor, DefaultProcessor],
  exports: [QueueService],
})
export class QueueModule {}
