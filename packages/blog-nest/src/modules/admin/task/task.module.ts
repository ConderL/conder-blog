import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { LogModule } from '../../log/log.module';
import { DynamicTaskManager } from './utils/dynamic-task.util';
import { ScheduleModule } from '@nestjs/schedule';
import { OnlineModule } from '../../online/online.module';
import { ChatModule } from '../../chat/chat.module';
import { BlogModule } from '../../blog/blog.module';
import { VisitLog } from '../../blog/entities/visit-log.entity';
import { Article } from '../../blog/entities/article.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, VisitLog, Article]),
    ScheduleModule.forRoot(),
    LogModule,
    OnlineModule,
    ChatModule,
    BlogModule
  ],
  controllers: [TaskController],
  providers: [TaskService, DynamicTaskManager],
  exports: [TaskService],
})
export class TaskModule { }
