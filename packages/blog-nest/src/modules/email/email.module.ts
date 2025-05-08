import { Module } from '@nestjs/common';
import { EmailService } from './services/email/email.service';
import { EmailController } from './controllers/email/email.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [EmailController],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
