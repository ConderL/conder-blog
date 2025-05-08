import { Controller, Get, Delete, Query, Logger, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { LogService } from '../log.service';
import { OperationLog } from '../../../common/decorators/operation-log.decorator';
import { OperationType } from '../../../common/constants/operation-type.enum';
import { Result } from '../../../common/utils/result';
import { In } from 'typeorm';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';

/**
 * 访问日志管理控制器
 */
@ApiTags('访问日志管理')
@Controller('admin/visit')
@Roles('admin')
@ApiBearerAuth()
export class AdminVisitLogController {
  private readonly logger = new Logger(AdminVisitLogController.name);

  constructor(private readonly logService: LogService) {}

  /**
   * 查询访问日志列表
   */
  @ApiOperation({ summary: '查询访问日志列表', description: '分页查询访问日志列表' })
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
              page: '首页',
              ip_address: '127.0.0.1',
              ip_source: '内网IP',
              os: 'Windows',
              browser: 'Chrome',
              create_time: '2023-01-01 12:00:00',
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
      this.logger.log(`查询访问日志列表：第${current}页，每页${size}条`);

      // 构建查询条件
      const queryBuilder = this.logService.visitLogRepository.createQueryBuilder('visitLog');

      // 关键词搜索
      if (keywords) {
        queryBuilder.andWhere(
          '(visitLog.page LIKE :keywords OR visitLog.ip_address LIKE :keywords OR visitLog.ip_source LIKE :keywords)',
          { keywords: `%${keywords}%` },
        );
      }

      // 时间范围筛选
      if (startTime && endTime) {
        queryBuilder.andWhere('visitLog.create_time BETWEEN :startTime AND :endTime', {
          startTime,
          endTime,
        });
      } else if (startTime) {
        queryBuilder.andWhere('visitLog.create_time >= :startTime', { startTime });
      } else if (endTime) {
        queryBuilder.andWhere('visitLog.create_time <= :endTime', { endTime });
      }

      // 按时间倒序排列
      queryBuilder.orderBy('visitLog.create_time', 'DESC');

      // 分页
      const total = await queryBuilder.getCount();
      const records = await queryBuilder
        .skip((current - 1) * size)
        .take(size)
        .getMany();

      // 转换字段名为前端需要的格式
      const formattedRecords = records.map((record) => ({
        id: record.id,
        page: record.page,
        ip_address: record.ipAddress,
        ip_source: record.ipSource,
        os: record.os,
        browser: record.browser,
        create_time: record.createTime,
      }));

      return Result.ok({
        recordList: formattedRecords,
        current,
        size,
        count: total,
      });
    } catch (error) {
      this.logger.error(`查询访问日志列表失败: ${error.message}`);
      return Result.fail('查询访问日志列表失败');
    }
  }

  /**
   * 删除访问日志
   */
  @ApiOperation({ summary: '删除访问日志', description: '根据ID删除访问日志' })
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
      this.logger.log(`删除访问日志: id=${idList}`);
      // 查询要删除的记录
      const logs = await this.logService.visitLogRepository.findBy({ id: In(idList) });
      if (logs.length > 0) {
        // 执行删除
        await this.logService.visitLogRepository.remove(logs);
        this.logger.log(`成功删除${logs.length}条访问日志`);
      }
      return Result.ok(null, '删除成功');
    } catch (error) {
      this.logger.error(`删除访问日志失败: ${error.message}`);
      return Result.fail('删除访问日志失败');
    }
  }

  /**
   * 清空访问日志
   */
  @ApiOperation({ summary: '清空访问日志', description: '清空所有访问日志' })
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
      this.logger.log('清空访问日志');
      await this.logService.visitLogRepository.clear();
      return Result.ok(null, '清空成功');
    } catch (error) {
      this.logger.error(`清空访问日志失败: ${error.message}`);
      return Result.fail('清空访问日志失败');
    }
  }
}
