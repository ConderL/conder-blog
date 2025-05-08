import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Article } from '../../blog/entities/article.entity';
import { VisitLog } from '../../log/entities/visit-log.entity';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { UserModule } from '../../user/user.module';
import { LogModule } from '../../log/log.module';
import { OnlineModule } from '../../online/online.module';
import { Task } from './entities/task.entity';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([Article, VisitLog, Task]),
    UserModule,
    LogModule,
    OnlineModule,
  ],
  controllers: [TaskController],
  providers: [TaskService],
  exports: [TaskService],
})
export class TaskModule {}
