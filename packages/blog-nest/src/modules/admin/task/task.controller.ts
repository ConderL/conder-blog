import {
  Controller,
  Post,
  Get,
  UseGuards,
  Query,
  Param,
  Delete,
  Body,
  Logger,
  Put,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { TaskService } from './task.service';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Result } from '../../../common/utils/result';
import { LogService } from '../../log/log.service';
import { Task } from './entities/task.entity';
import { TaskRunDto } from './dto/task-run.dto';
// 暂时注释掉权限相关导入
// import { Permissions } from '../../common/decorators/permissions.decorator';
// import { PermissionGuard } from '../../common/guards/permission.guard';

@ApiTags('任务管理')
@Controller('admin/task')
@Roles('admin')
@ApiBearerAuth()
export class TaskController {
  private readonly logger = new Logger(TaskController.name);

  constructor(
    private readonly taskService: TaskService,
    private readonly logService: LogService,
  ) {}

  @Get('list')
  @ApiOperation({ summary: '获取定时任务列表' })
  @ApiQuery({ name: 'taskName', required: false, description: '任务名称' })
  @ApiQuery({ name: 'taskGroup', required: false, description: '任务组名' })
  @ApiQuery({ name: 'status', required: false, description: '任务状态(0运行 1暂停)' })
  @ApiQuery({ name: 'current', required: false, description: '当前页码' })
  @ApiQuery({ name: 'size', required: false, description: '每页条数' })
  async getTaskList(
    @Query('taskName') taskName?: string,
    @Query('taskGroup') taskGroup?: string,
    @Query('status') status?: number,
    @Query('current') current: number = 1,
    @Query('size') size: number = 10,
  ) {
    try {
      const { list, total } = await this.taskService.searchTasks({
        taskName,
        taskGroup,
        status,
        current,
        size,
      });
      return Result.ok({
        recordList: list,
        pagination: {
          total,
          size,
          current,
        },
      });
    } catch (error) {
      this.logger.error(`获取任务列表失败: ${error.message}`);
      return Result.fail('获取任务列表失败');
    }
  }

  @Get('info/:id')
  @ApiOperation({ summary: '获取定时任务详情' })
  async getTaskInfo(@Param('id') id: number) {
    try {
      const task = await this.taskService.getTaskById(id);
      return Result.ok(task);
    } catch (error) {
      this.logger.error(`获取任务详情失败: ${error.message}`);
      return Result.fail('获取任务详情失败');
    }
  }

  @Post('add')
  @ApiOperation({ summary: '添加定时任务' })
  @ApiBody({ type: Task })
  async addTask(@Body() taskData: Partial<Task>) {
    try {
      // 设置创建时间
      taskData.createTime = new Date();
      taskData.updateTime = new Date();

      const task = await this.taskService.createTask(taskData);
      return Result.ok(task, '添加任务成功');
    } catch (error) {
      this.logger.error(`添加任务失败: ${error.message}`);
      return Result.fail(`添加任务失败: ${error.message}`);
    }
  }

  @Put('update')
  @ApiOperation({ summary: '更新定时任务' })
  @ApiBody({ type: Task })
  async updateTask(@Body() taskData: Partial<Task>) {
    try {
      if (!taskData.id) {
        return Result.fail('任务ID不能为空');
      }

      // 设置更新时间
      taskData.updateTime = new Date();

      const task = await this.taskService.updateTask(taskData.id, taskData);
      return Result.ok(task, '更新任务成功');
    } catch (error) {
      this.logger.error(`更新任务失败: ${error.message}`);
      return Result.fail(`更新任务失败: ${error.message}`);
    }
  }

  @Delete('delete/:ids')
  @ApiOperation({ summary: '删除定时任务' })
  async deleteTask(@Param('ids') idsStr: string) {
    try {
      const ids = idsStr.split(',').map((id) => parseInt(id, 10));
      const results = await Promise.all(ids.map((id) => this.taskService.deleteTask(id)));
      const success = results.every((result) => result);
      return Result.ok(null, success ? '删除任务成功' : '部分任务删除失败');
    } catch (error) {
      this.logger.error(`删除任务失败: ${error.message}`);
      return Result.fail(`删除任务失败: ${error.message}`);
    }
  }

  @Put('status/:id/:status')
  @ApiOperation({ summary: '修改任务状态' })
  async changeTaskStatus(@Param('id') id: number, @Param('status') status: number) {
    try {
      const task = await this.taskService.toggleTaskStatus(id, status);
      return Result.ok(task, status === 0 ? '启动任务成功' : '暂停任务成功');
    } catch (error) {
      this.logger.error(`修改任务状态失败: ${error.message}`);
      return Result.fail(`修改任务状态失败: ${error.message}`);
    }
  }

  @Post('run/:id')
  @ApiOperation({ summary: '立即执行任务' })
  async runTaskById(@Param('id') id: number) {
    try {
      const task = await this.taskService.getTaskById(id);
      if (!task) {
        return Result.fail('任务不存在');
      }

      return await this.runTask({
        taskName: task.taskName,
        taskGroup: task.taskGroup,
        invokeTarget: task.invokeTarget,
      });
    } catch (error) {
      this.logger.error(`执行任务失败: ${error.message}`);
      return Result.fail(`执行任务失败: ${error.message}`);
    }
  }

  @Post('backup')
  @ApiOperation({ summary: '手动触发数据备份' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  // 暂时注释掉权限检查
  // @UseGuards(JwtAuthGuard, PermissionGuard)
  // @Permissions('system:backup:trigger')
  async triggerBackup() {
    const backupPath = await this.taskService.manualBackup();
    return { message: '备份任务已成功执行', backupPath };
  }

  @Get('backup/list')
  @ApiOperation({ summary: '获取备份文件列表' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  // 暂时注释掉权限检查
  // @UseGuards(JwtAuthGuard, PermissionGuard)
  // @Permissions('system:backup:list')
  async getBackupList(): Promise<any[]> {
    return this.taskService.getBackupList();
  }

  @Delete('backup/:filename')
  @ApiOperation({ summary: '删除指定备份文件' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  // 暂时注释掉权限检查
  // @UseGuards(JwtAuthGuard, PermissionGuard)
  // @Permissions('system:backup:delete')
  async deleteBackup(
    @Param('filename') filename: string,
  ): Promise<{ success: boolean; message: string }> {
    const result = await this.taskService.deleteBackup(filename);
    return {
      success: result,
      message: result ? '备份文件删除成功' : '备份文件删除失败',
    };
  }

  @Get('stats/summary')
  @ApiOperation({ summary: '获取统计数据摘要' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async getStatsSummary() {
    try {
      const data = await this.taskService.getStatsSummary();
      return Result.ok(data);
    } catch (error) {
      this.logger.error(`获取统计摘要失败: ${error.message}`);
      return Result.fail('获取统计摘要失败');
    }
  }

  @Get('stats/content')
  @ApiOperation({ summary: '获取内容统计数据' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async getContentStats() {
    return await this.taskService.getContentStats();
  }

  @Get('stats/visits')
  @ApiOperation({ summary: '获取访问统计数据' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiQuery({
    name: 'period',
    required: false,
    description: '统计周期，可选值：day, week, month，默认为week',
  })
  async getVisitStats(@Query('period') period?: string) {
    return await this.taskService.getVisitStats(period);
  }

  @ApiOperation({ summary: '手动执行任务' })
  @Post('run')
  @ApiBody({ type: TaskRunDto })
  async runTask(@Body() data: TaskRunDto) {
    try {
      const { taskName, taskGroup = 'MANUAL', invokeTarget } = data;

      // 记录任务开始日志
      await this.logService.recordTaskLog({
        taskName,
        taskGroup,
        invokeTarget,
        taskMessage: `手动执行任务: ${taskName}`,
        status: 1,
      });

      this.logger.log(`手动执行任务: ${taskName}, ${invokeTarget}`);

      // 执行任务
      let result;
      try {
        result = await this.taskService.executeTask(invokeTarget);
      } catch (error) {
        // 记录失败日志
        await this.logService.recordTaskLog({
          taskName,
          taskGroup,
          invokeTarget,
          taskMessage: `手动执行任务失败: ${taskName}`,
          status: 0,
          errorInfo: error.message,
        });
        throw error;
      }

      return Result.ok(result, '任务执行成功');
    } catch (error) {
      this.logger.error(`执行任务失败: ${error.message}`);
      return Result.fail(`执行任务失败: ${error.message}`);
    }
  }
}
