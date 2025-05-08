import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VisitLog } from './entities/visit-log.entity';
import { OperationLog } from './entities/operation-log.entity';
import { ExceptionLog } from './entities/exception-log.entity';
import { LogService } from './log.service';
import { LogController } from './log.controller';
import { AdminExceptionLogController } from './controllers/admin-exception-log.controller';
import { AdminVisitLogController } from './controllers/admin-visit-log.controller';
import { UserModule } from '../user/user.module';
import { TaskLog } from './entities/task-log.entity';
import { TaskLogService } from './services/task-log.service';
import { TaskLogController } from './controllers/task-log.controller';
import { LoginLog } from './entities/login-log.entity';
import { AdminTaskLogController } from './controllers/admin-task-log.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([VisitLog, OperationLog, ExceptionLog, TaskLog, LoginLog]),
    UserModule,
  ],
  controllers: [
    LogController,
    AdminExceptionLogController,
    AdminVisitLogController,
    TaskLogController,
    AdminTaskLogController,
  ],
  providers: [LogService, TaskLogService],
  exports: [
    LogService,
    TypeOrmModule.forFeature([VisitLog, OperationLog, ExceptionLog, TaskLog, LoginLog]),
  ],
})
export class LogModule {}
