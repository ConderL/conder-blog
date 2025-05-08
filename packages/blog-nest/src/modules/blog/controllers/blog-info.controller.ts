import { Controller, Get, Post, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BlogInfoService } from '../services/blog-info.service';
import { VisitLogInterceptor } from '../../../common/interceptors/visit-log.interceptor';
import { ResultDto } from '../../../common/dtos/result.dto';
import { VisitLog } from '../../../common/decorators/visit-log.decorator';
import { Public } from '../../../common/decorators/public.decorator';

/**
 * 博客信息控制器
 * 提供博客基本信息、访客统计等接口
 */
@ApiTags('博客信息')
@Controller()
export class BlogInfoController {
  constructor(private readonly blogInfoService: BlogInfoService) {}

  /**
   * 记录访客信息
   * 前端访问网站时调用此接口记录访问信息
   */
  @Post('report')
  @ApiOperation({ summary: '记录访客信息' })
  @ApiResponse({ status: 200, description: '记录成功', type: ResultDto })
  @Public()
  async report(): Promise<ResultDto<null>> {
    await this.blogInfoService.report();
    return ResultDto.success(null, '记录成功');
  }

  /**
   * 获取博客首页信息
   * 包括文章、分类、标签数量及网站配置
   */
  @Get()
  @ApiOperation({ summary: '获取博客首页信息' })
  @ApiResponse({ status: 200, description: '获取成功', type: ResultDto })
  @UseInterceptors(VisitLogInterceptor)
  @VisitLog('首页')
  @Public()
  async getBlogInfo(): Promise<ResultDto<any>> {
    const data = await this.blogInfoService.getBlogInfo();
    return ResultDto.success(data);
  }

  /**
   * 获取博客后台统计信息
   * 包括访问量、内容数量等统计数据
   */
  @Get('admin')
  @ApiOperation({ summary: '获取博客后台统计信息' })
  @ApiResponse({ status: 200, description: '获取成功', type: ResultDto })
  async getBlogBackInfo(): Promise<ResultDto<any>> {
    const data = await this.blogInfoService.getBlogBackInfo();
    return ResultDto.success(data);
  }

  /**
   * 获取关于我页面内容
   */
  @Get('about')
  @ApiOperation({ summary: '获取关于我页面内容' })
  @ApiResponse({ status: 200, description: '获取成功', type: ResultDto })
  @UseInterceptors(VisitLogInterceptor)
  @VisitLog('关于我')
  @Public()
  async getAbout(): Promise<ResultDto<any>> {
    const data = await this.blogInfoService.getAbout();
    return ResultDto.success(data);
  }
}
