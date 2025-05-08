import { Controller, Get, Delete, Query, Logger, Body, UseGuards, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { LogService } from '../log.service';
import { TaskLogService } from '../services/task-log.service';
import { OperationLog } from '../../../common/decorators/operation-log.decorator';
import { OperationType } from '../../../common/constants/operation-type.enum';
import { Result } from '../../../common/utils/result';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RequirePermission } from '../../../common/decorators/require-permission.decorator';
import { TaskLogPageDto, TaskLogIdListDto } from '../dto/task-log.dto';

/**
 * 任务日志管理控制器
 */
@ApiTags('任务日志管理')
@Controller('admin/taskLog')
@Roles('admin')
@ApiBearerAuth()
export class AdminTaskLogController {
  private readonly logger = new Logger(AdminTaskLogController.name);

  constructor(
    private readonly logService: LogService,
    private readonly taskLogService: TaskLogService,
  ) {}

  /**
   * 查询任务日志列表
   */
  @ApiOperation({ summary: '查询任务日志列表', description: '分页查询任务日志列表' })
  @ApiResponse({
    status: 200,
    description: '查询成功',
    schema: {
      example: {
        code: 200,
        message: '查询成功',
        data: {
          recordList: [
            {
              id: 1,
              taskName: '系统默认（无参）',
              taskGroup: 'DEFAULT',
              invokeTarget: 'taskNoParams',
              taskMessage: '执行成功',
              status: 1,
              errorInfo: null,
              create_time: '2023-01-01 12:00:00',
            },
          ],
          current: 1,
          size: 10,
          count: 1,
        },
      },
    },
  })
  @RequirePermission('log:task:list')
  @Get('list')
  async findAll(@Query() pageDto: TaskLogPageDto) {
    try {
      this.logger.log(`查询任务日志列表：第${pageDto.current}页，每页${pageDto.size}条`);

      const result = await this.taskLogService.findPage(pageDto);

      // 转换字段名为前端需要的格式
      const formattedRecords = result.records.map((record) => ({
        id: record.id,
        taskName: record.taskName,
        taskGroup: record.taskGroup,
        invokeTarget: record.invokeTarget,
        taskMessage: record.jobMessage,
        status: record.status,
        errorInfo: record.exceptionInfo,
        create_time: record.createTime,
      }));

      return Result.ok({
        recordList: formattedRecords,
        current: result.current,
        size: result.size,
        count: result.count,
      });
    } catch (error) {
      this.logger.error(`查询任务日志列表失败: ${error.message}`);
      return Result.fail('查询任务日志列表失败');
    }
  }

  /**
   * 获取任务日志详情
   */
  @ApiOperation({ summary: '获取任务日志详情', description: '根据ID获取任务日志详情' })
  @ApiResponse({
    status: 200,
    description: '查询成功',
    schema: {
      example: {
        code: 200,
        message: '查询成功',
        data: {
          id: 1,
          taskName: '系统默认（无参）',
          taskGroup: 'DEFAULT',
          invokeTarget: 'taskNoParams',
          taskMessage: '执行成功',
          status: 1,
          errorInfo: null,
          create_time: '2023-01-01 12:00:00',
        },
      },
    },
  })
  @RequirePermission('log:task:query')
  @Get(':id')
  async findById(@Param('id') id: number) {
    try {
      this.logger.log(`获取任务日志详情: id=${id}`);
      const taskLog = await this.taskLogService.findById(id);

      if (!taskLog) {
        return Result.fail('任务日志不存在');
      }

      return Result.ok({
        id: taskLog.id,
        taskName: taskLog.taskName,
        taskGroup: taskLog.taskGroup,
        invokeTarget: taskLog.invokeTarget,
        taskMessage: taskLog.jobMessage,
        status: taskLog.status,
        errorInfo: taskLog.exceptionInfo,
        create_time: taskLog.createTime,
        executionTime: taskLog.getExecutionTime(),
      });
    } catch (error) {
      this.logger.error(`获取任务日志详情失败: ${error.message}`);
      return Result.fail('获取任务日志详情失败');
    }
  }

  /**
   * 删除任务日志
   */
  @ApiOperation({ summary: '删除任务日志', description: '根据ID删除任务日志' })
  @ApiResponse({
    status: 200,
    description: '删除成功',
    schema: {
      example: {
        code: 200,
        message: '删除成功',
        data: null,
      },
    },
  })
  @RequirePermission('log:task:remove')
  @Delete('delete')
  @OperationLog(OperationType.DELETE)
  async remove(@Body() dto: TaskLogIdListDto) {
    try {
      this.logger.log(`删除任务日志: id=${dto.idList}`);
      await this.taskLogService.deleteByIds(dto.idList);
      return Result.ok(null, '删除成功');
    } catch (error) {
      this.logger.error(`删除任务日志失败: ${error.message}`);
      return Result.fail('删除任务日志失败');
    }
  }

  /**
   * 清空任务日志
   */
  @ApiOperation({ summary: '清空任务日志', description: '清空所有任务日志' })
  @ApiResponse({
    status: 200,
    description: '清空成功',
    schema: {
      example: {
        code: 200,
        message: '清空成功',
        data: null,
      },
    },
  })
  @RequirePermission('log:task:remove')
  @Delete('clear')
  @OperationLog(OperationType.DELETE)
  async clear() {
    try {
      this.logger.log('清空任务日志');
      await this.taskLogService.clear();
      return Result.ok(null, '清空成功');
    } catch (error) {
      this.logger.error(`清空任务日志失败: ${error.message}`);
      return Result.fail('清空任务日志失败');
    }
  }
}
