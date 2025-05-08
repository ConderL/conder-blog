import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { VisitLogService } from '../services/visit-log.service';
import { VisitLog } from '../entities/visit-log.entity';
import { ResultDto } from '../../../common/dtos/result.dto';

/**
 * 访问日志控制器
 * 提供访问日志相关的API接口
 */
@ApiTags('访问统计')
@Controller('visit-logs')
export class VisitLogController {
  constructor(private readonly visitLogService: VisitLogService) {}

  /**
   * 记录访问日志
   * @param visitLog 访问日志信息
   */
  @Post()
  @ApiOperation({ summary: '记录访问日志' })
  async create(@Body() visitLog: Partial<VisitLog>): Promise<ResultDto<VisitLog>> {
    const newLog = await this.visitLogService.create(visitLog as VisitLog);
    return ResultDto.success(newLog);
  }

  /**
   * 获取访问日志列表
   * @param page 页码
   * @param limit 每页数量
   */
  @Get()
  @ApiOperation({ summary: '获取访问日志列表' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @UseGuards(JwtAuthGuard)
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ): Promise<ResultDto<{ items: VisitLog[]; total: number }>> {
    const [logs, total] = await this.visitLogService.findAll(page, limit);
    return ResultDto.success({
      items: logs,
      total,
    });
  }

  /**
   * 获取今日访问量
   */
  @Get('today')
  @ApiOperation({ summary: '获取今日访问量' })
  async getTodayVisits(): Promise<ResultDto<number>> {
    const count = await this.visitLogService.countTodayVisits();
    return ResultDto.success(count);
  }

  /**
   * 获取总访问量
   */
  @Get('total')
  @ApiOperation({ summary: '获取总访问量' })
  async getTotalVisits(): Promise<ResultDto<number>> {
    const count = await this.visitLogService.countTotalVisits();
    return ResultDto.success(count);
  }

  /**
   * 获取近7天的访问统计
   */
  @Get('weekly')
  @ApiOperation({ summary: '获取近7天的访问统计' })
  async getWeeklyVisits(): Promise<ResultDto<{ date: string; count: number }[]>> {
    const stats = await this.visitLogService.getWeeklyVisitStats();
    return ResultDto.success(stats);
  }

  /**
   * 获取操作系统统计
   */
  @Get('os-stats')
  @ApiOperation({ summary: '获取操作系统统计' })
  @UseGuards(JwtAuthGuard)
  async getOsStats(): Promise<ResultDto<any[]>> {
    const stats = await this.visitLogService.getOsStats();
    return ResultDto.success(stats);
  }

  /**
   * 获取浏览器统计
   */
  @Get('browser-stats')
  @ApiOperation({ summary: '获取浏览器统计' })
  @UseGuards(JwtAuthGuard)
  async getBrowserStats(): Promise<ResultDto<any[]>> {
    const stats = await this.visitLogService.getBrowserStats();
    return ResultDto.success(stats);
  }
}
