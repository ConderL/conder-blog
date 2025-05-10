import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { OauthService } from '../services/oauth.service';
import { ResultDto } from '../../../common/dtos/result.dto';
import { Public } from '../../../common/decorators/public.decorator';
import { Logger } from '@nestjs/common';
import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

class OauthLoginDto {
  @ApiProperty({ description: '授权令牌', required: true })
  @IsNotEmpty({ message: '令牌不能为空' })
  @IsString({ message: '令牌必须是字符串' })
  token: string;
}

@ApiTags('第三方登录认证')
@Controller('oauth/login')
export class OauthLoginController {
  private readonly logger = new Logger(OauthLoginController.name);

  constructor(private readonly oauthService: OauthService) {}

  @Post('qq')
  @ApiOperation({ summary: 'QQ登录' })
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: OauthLoginDto })
  async qqLogin(@Body() loginDto: OauthLoginDto): Promise<ResultDto<any>> {
    this.logger.log(`收到QQ登录请求，token长度: ${loginDto.token?.length || 0}`);

    if (!loginDto.token) {
      this.logger.error('QQ登录失败: 缺少token参数');
      return ResultDto.fail('QQ登录失败: 缺少token参数');
    }

    try {
      // 验证QQ登录Token
      const result = await this.oauthService.verifyOauthToken(loginDto.token, 2); // 2是QQ登录类型
      this.logger.log(`QQ登录成功: ${JSON.stringify(result)}`);
      // 前端期望的数据是token字符串，我们需要确保返回格式兼容
      if (typeof result === 'string') {
        return ResultDto.success(result, '登录成功');
      }
      // 如果返回的是对象，则提取token属性
      return ResultDto.success(result.token, '登录成功');
    } catch (error) {
      this.logger.error(`QQ登录失败: ${error.message}`);
      return ResultDto.fail(`QQ登录失败: ${error.message}`);
    }
  }

  @Post('gitee')
  @ApiOperation({ summary: 'Gitee登录' })
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: OauthLoginDto })
  async giteeLogin(@Body() loginDto: OauthLoginDto): Promise<ResultDto<any>> {
    this.logger.log(`收到Gitee登录请求，完整token: ${loginDto.token}`);
    this.logger.log(`请求体内容: ${JSON.stringify(loginDto)}`);

    if (!loginDto.token) {
      this.logger.error('Gitee登录失败: 缺少token参数');
      return ResultDto.fail('Gitee登录失败: 缺少token参数');
    }

    try {
      // 验证Gitee登录Token
      const result = await this.oauthService.verifyOauthToken(loginDto.token, 3); // 3是Gitee登录类型
      this.logger.log(`Gitee登录成功: ${JSON.stringify(result)}`);
      // 前端期望的数据是token字符串，我们需要确保返回格式兼容
      if (typeof result === 'string') {
        return ResultDto.success(result, '登录成功');
      }
      // 如果返回的是对象，则提取token属性
      return ResultDto.success(result.token, '登录成功');
    } catch (error) {
      this.logger.error(`Gitee登录失败: ${error.message}`, error.stack);
      return ResultDto.fail(`Gitee登录失败: ${error.message}`);
    }
  }

  @Post('github')
  @ApiOperation({ summary: 'GitHub登录' })
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: OauthLoginDto })
  async githubLogin(@Body() loginDto: OauthLoginDto): Promise<ResultDto<any>> {
    this.logger.log(`收到GitHub登录请求，token长度: ${loginDto.token?.length || 0}`);

    if (!loginDto.token) {
      this.logger.error('GitHub登录失败: 缺少token参数');
      return ResultDto.fail('GitHub登录失败: 缺少token参数');
    }

    try {
      // 验证GitHub登录Token
      const result = await this.oauthService.verifyOauthToken(loginDto.token, 4); // 4是GitHub登录类型
      this.logger.log(`GitHub登录成功: ${JSON.stringify(result)}`);
      // 前端期望的数据是token字符串，我们需要确保返回格式兼容
      if (typeof result === 'string') {
        return ResultDto.success(result, '登录成功');
      }
      // 如果返回的是对象，则提取token属性
      return ResultDto.success(result.token, '登录成功');
    } catch (error) {
      this.logger.error(`GitHub登录失败: ${error.message}`);
      return ResultDto.fail(`GitHub登录失败: ${error.message}`);
    }
  }
}
