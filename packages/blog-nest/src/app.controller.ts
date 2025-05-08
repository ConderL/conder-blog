import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('系统')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiOperation({ summary: '健康检查', description: '用于系统健康状态监控' })
  @Get('health')
  healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'blog-nest',
    };
  }

  @ApiOperation({ summary: '测试异常日志', description: '用于测试异常日志记录功能' })
  @Get('test-error')
  testError(): any {
    // 故意制造一个错误
    const obj = null;
    return obj.nonExistentProperty; // 这会引发 TypeError
  }

  @ApiOperation({ summary: '测试自定义异常', description: '用于测试自定义异常日志记录功能' })
  @Get('test-custom-error')
  testCustomError(): any {
    throw new Error('这是一个自定义测试异常');
  }
}
