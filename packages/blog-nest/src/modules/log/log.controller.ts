import { Controller, Get, Post, Body, UseGuards, Query, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { LogService } from './log.service';
// 暂时注释掉权限相关导入
// import { Permissions } from '../../common/decorators/permissions.decorator';
// import { PermissionGuard } from '../../common/guards/permission.guard';

@ApiTags('日志管理')
@Controller('logs')
export class LogController {
  constructor(private readonly logService: LogService) {}

  @Get('visits')
  @ApiOperation({ summary: '获取最近访问日志' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  // 暂时注释掉权限检查
  // @UseGuards(JwtAuthGuard, PermissionGuard)
  // @Permissions('system:logs:view')
  @ApiQuery({ name: 'limit', required: false, description: '返回记录数量限制', type: Number })
  async getRecentVisits(@Query('limit') limit?: string) {
    return this.logService.getRecentVisits(limit ? parseInt(limit, 10) : 10);
  }

  @Get('operations')
  @ApiOperation({ summary: '获取最近操作日志' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  // 暂时注释掉权限检查
  // @UseGuards(JwtAuthGuard, PermissionGuard)
  // @Permissions('system:logs:view')
  @ApiQuery({ name: 'limit', required: false, description: '返回记录数量限制', type: Number })
  async getRecentOperations(@Query('limit') limit?: string) {
    return this.logService.getRecentOperations(limit ? parseInt(limit, 10) : 10);
  }

  @Get('visits/hourly')
  @ApiOperation({ summary: '获取按小时统计的访问量' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiQuery({ name: 'date', required: false, description: '指定日期 (YYYY-MM-DD)' })
  async getHourlyVisits(@Query('date') dateStr?: string) {
    const date = dateStr ? new Date(dateStr) : new Date();
    return this.logService.getHourlyVisits(date);
  }

  @Post('cleanup')
  @ApiOperation({ summary: '清理过期访问日志' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  // 暂时注释掉权限检查
  // @UseGuards(JwtAuthGuard, PermissionGuard)
  // @Permissions('system:logs:cleanup')
  @ApiQuery({ name: 'days', required: false, description: '保留天数', type: Number })
  async cleanupLogs(@Query('days') days?: string) {
    const deleted = await this.logService.cleanupOldLogs(days ? parseInt(days, 10) : 30);
    return {
      success: true,
      message: `成功清理 ${deleted} 条过期日志`,
    };
  }
}
