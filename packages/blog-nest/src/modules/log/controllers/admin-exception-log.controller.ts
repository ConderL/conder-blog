import { Controller, Get, Post, Body, Query, Delete, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LogService } from '../log.service';
import { OperationLog } from '../../../common/decorators/operation-log.decorator';
import { OperationType } from '../../../common/constants/operation-type.enum';
import { Result } from '../../../common/utils/result';

/**
 * 异常日志管理控制器
 */
@ApiTags('异常日志管理')
@Controller('admin/exception')
export class AdminExceptionLogController {
  private readonly logger = new Logger(AdminExceptionLogController.name);

  constructor(private readonly logService: LogService) {}

  /**
   * 查询异常日志列表
   */
  @ApiOperation({ summary: '查询异常日志列表', description: '分页查询异常日志列表' })
  @ApiResponse({
    status: 200,
    description: '查询成功',
    schema: {
      example: {
        code: 200,
        message: '查询成功',
        data: {
          records: [
            {
              id: 1,
              module: '系统',
              uri: '/api/admin/user/list',
              name: 'NullPointerException',
              description: '查询用户列表',
              error_method: 'UserController.findAll',
              message: '空指针异常',
              params: '{}',
              request_method: 'GET',
              ip_address: '127.0.0.1',
              ip_source: '内网IP',
              os: 'Windows',
              browser: 'Chrome',
              createTime: '2023-01-01 12:00:00',
            },
          ],
          current: 1,
          size: 10,
          total: 1,
        },
      },
    },
  })
  @Get('list')
  async findAll(
    @Query('current') current = 1,
    @Query('size') size = 10,
    @Query('keywords') keywords?: string,
    @Query('startTime') startTime?: Date,
    @Query('endTime') endTime?: Date,
  ) {
    try {
      this.logger.log(`查询异常日志列表：第${current}页，每页${size}条`);
      const result = await this.logService.findExceptionLogs(
        current,
        size,
        keywords,
        startTime,
        endTime,
      );
      return Result.ok(result);
    } catch (error) {
      this.logger.error(`查询异常日志列表失败: ${error.message}`);
      return Result.fail('查询异常日志列表失败');
    }
  }

  /**
   * 删除异常日志
   */
  @ApiOperation({ summary: '删除异常日志', description: '根据ID删除异常日志' })
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
  @Delete('delete')
  @OperationLog(OperationType.DELETE)
  async remove(@Body() idList: number[]) {
    try {
      this.logger.log(`删除异常日志: id=${idList}`);
      await this.logService.removeExceptionLogs(idList);
      return Result.ok(null, '删除成功');
    } catch (error) {
      this.logger.error(`删除异常日志失败: ${error.message}`);
      return Result.fail('删除异常日志失败');
    }
  }

  /**
   * 清空异常日志
   */
  @ApiOperation({ summary: '清空异常日志', description: '清空所有异常日志' })
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
  @Delete('clear')
  @OperationLog(OperationType.DELETE)
  async clear() {
    try {
      this.logger.log('清空异常日志');
      await this.logService.clearExceptionLogs();
      return Result.ok(null, '清空成功');
    } catch (error) {
      this.logger.error(`清空异常日志失败: ${error.message}`);
      return Result.fail('清空异常日志失败');
    }
  }
}
