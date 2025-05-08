import {
  Controller,
  Get,
  Delete,
  Query,
  Logger,
  Body,
  ValidationPipe,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../../common/decorators/roles.decorator';
import { OperationLogService } from '../services/operation-log.service';
import { DeleteOperationLogDto, QueryOperationLogDto } from '../dto/operation-log.dto';
import { Request } from 'express';
import { OperationLog } from '../../../common/decorators/operation-log.decorator';
import { OperationType } from '../../../common/enums/operation-type.enum';

/**
 * 管理员操作日志控制器
 */
@ApiTags('管理员操作日志相关接口')
@Controller('admin/operation')
@Roles('admin')
@ApiBearerAuth()
export class AdminOperationLogController {
  private readonly logger = new Logger(AdminOperationLogController.name);

  constructor(private readonly operationLogService: OperationLogService) {}

  /**
   * 获取操作日志列表
   */
  @Get('list')
  @ApiOperation({ summary: '获取操作日志列表' })
  async getOperationLogs(
    @Query(new ValidationPipe({ transform: true })) queryDto: QueryOperationLogDto,
  ) {
    this.logger.log(`获取操作日志列表：第${queryDto.current}页，每页${queryDto.size}条`);

    // 处理时间参数
    const startDate = queryDto.startTime ? new Date(queryDto.startTime) : undefined;
    const endDate = queryDto.endTime ? new Date(queryDto.endTime) : undefined;

    return this.operationLogService.findAll(
      queryDto.current,
      queryDto.size,
      queryDto.keywords,
      queryDto.module,
      startDate,
      endDate,
    );
  }

  /**
   * 删除操作日志
   */
  @Delete('delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '删除操作日志' })
  async deleteOperationLogs(
    @Req() request: Request,
    @Body(
      new ValidationPipe({
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    )
    deleteDto: DeleteOperationLogDto,
  ) {
    // 记录原始请求体
    this.logger.debug(`原始请求体: ${JSON.stringify(request.body)}`);
    this.logger.debug(`请求体类型: ${typeof request.body}`);
    this.logger.debug(`Content-Type: ${request.headers['content-type']}`);

    this.logger.log(
      `接收到删除操作日志请求，ID数据类型: ${typeof deleteDto.ids}, 值: ${JSON.stringify(deleteDto.ids)}`,
    );
    if (!Array.isArray(deleteDto.ids)) {
      this.logger.warn(`ID不是数组类型: ${typeof deleteDto.ids}`);
      return { success: false, message: 'ID必须是数组' };
    }

    this.logger.log(`删除操作日志，ID：${deleteDto.ids.join(',')}`);
    try {
      await this.operationLogService.remove(deleteDto.ids);
      return { success: true, message: '删除成功' };
    } catch (error) {
      this.logger.error(`删除操作日志失败: ${error.message}`);
      return { success: false, message: error.message };
    }
  }

  /**
   * 清空操作日志
   */
  @Delete('clear')
  @ApiOperation({ summary: '清空操作日志' })
  @OperationLog(OperationType.DELETE)
  async clearOperationLogs() {
    this.logger.log('清空操作日志');
    return this.operationLogService.clear();
  }
}
