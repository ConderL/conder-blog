import { Controller, Get, Post, Body, Param, Delete, Put, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TaskLogService } from '../services/task-log.service';
import { TaskLog } from '../entities/task-log.entity';
import { TaskLogPageDto, TaskLogIdListDto } from '../dto/task-log.dto';
import { Result } from '../../../common/utils/result';
import { PageResult } from '../../../common/utils/page-result';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RequirePermission } from '../../../common/decorators/require-permission.decorator';

@ApiTags('任务日志管理')
@Controller('log/task')
@Roles('admin')
@ApiBearerAuth()
export class TaskLogController {
  constructor(private readonly taskLogService: TaskLogService) {}

  @ApiOperation({ summary: '分页查询任务日志' })
  @ApiOkResponse({ description: '分页数据', type: PageResult })
  @RequirePermission('log:task:list')
  @Get('list')
  async findPage(@Query() pageDto: TaskLogPageDto): Promise<Result<PageResult<TaskLog>>> {
    const page = await this.taskLogService.findPage(pageDto);
    return Result.ok(page);
  }

  @ApiOperation({ summary: '获取任务日志详情' })
  @ApiOkResponse({ description: '任务日志详情', type: TaskLog })
  @RequirePermission('log:task:query')
  @Get(':id')
  async findById(@Param('id') id: number): Promise<Result<TaskLog>> {
    const taskLog = await this.taskLogService.findById(id);
    return Result.ok(taskLog);
  }

  @ApiOperation({ summary: '批量删除任务日志' })
  @ApiOkResponse({ description: '操作结果', type: Result })
  @RequirePermission('log:task:remove')
  @Delete('delete')
  async delete(@Body() dto: TaskLogIdListDto): Promise<Result<null>> {
    await this.taskLogService.deleteByIds(dto.idList);
    return Result.ok(null, '删除成功');
  }

  @ApiOperation({ summary: '清空任务日志' })
  @ApiOkResponse({ description: '操作结果', type: Result })
  @RequirePermission('log:task:remove')
  @Delete('clear')
  async clear(): Promise<Result<null>> {
    await this.taskLogService.clear();
    return Result.ok(null, '清空成功');
  }

  @ApiOperation({ summary: '获取任务日志执行统计' })
  @ApiOkResponse({ description: '任务日志统计', type: Object })
  @RequirePermission('log:task:list')
  @Get('statistics')
  async getStatistics(): Promise<Result<any>> {
    const stats = await this.taskLogService.countByStatus();
    return Result.ok(stats);
  }

  @ApiOperation({ summary: '获取最近任务日志' })
  @ApiOkResponse({ description: '最近任务日志', type: [TaskLog] })
  @RequirePermission('log:task:list')
  @Get('recent')
  async getRecentLogs(): Promise<Result<TaskLog[]>> {
    const logs = await this.taskLogService.getRecentLogs();
    return Result.ok(logs);
  }
}
