import { Controller, Get, Query, Redirect, HttpStatus, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { OauthService } from '../services/oauth.service';
import { ConfigService } from '@nestjs/config';
import { OauthResultDto } from '../dto/oauth-user.dto';
import { Public } from '../../../common/decorators/public.decorator';
import { Logger } from '@nestjs/common';
@ApiTags('第三方登录')
@Controller('oauth')
export class OauthController {
  private readonly logger = new Logger(OauthController.name);

  constructor(
    private readonly oauthService: OauthService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * 获取GitHub登录地址
   */
  @Get('github')
  @ApiOperation({ summary: '获取GitHub登录地址' })
  @ApiResponse({ status: HttpStatus.OK, description: '获取GitHub登录地址成功' })
  @Redirect()
  @Public()
  getGithubAuthUrl() {
    const url = this.oauthService.getGithubAuthUrl();
    return { url, statusCode: HttpStatus.FOUND };
  }

  /**
   * 处理GitHub回调
   * @param code 授权码
   */
  @Get('github/callback')
  @ApiOperation({ summary: '处理GitHub回调' })
  @ApiQuery({ name: 'code', description: '授权码', required: true })
  @ApiResponse({ status: HttpStatus.OK, description: 'GitHub登录成功', type: OauthResultDto })
  @Public()
  async handleGithubCallback(@Query('code') code: string, @Res() res: Response) {
    try {
      // 获取用户信息
      const result = await this.oauthService.handleGithubCallback(code);

      this.logger.fatal(`GitHub登录成功: ${JSON.stringify(result)}`);

      // 重定向到前端页面，带上用户信息
      const frontendUrl = this.configService.get('app.frontendUrl');
      let redirectUrl = '';

      if (result.success) {
        redirectUrl = `${frontendUrl}/oauth/login/github?success=true&source=github&token=${encodeURIComponent(result.token)}`;
      } else {
        redirectUrl = `${frontendUrl}/oauth/login/github?success=false&source=github&message=${encodeURIComponent(result.message)}`;
      }

      return res.redirect(redirectUrl);
    } catch (error) {
      // 登录失败，重定向到前端页面，带上错误信息
      const frontendUrl = this.configService.get('app.frontendUrl');
      const redirectUrl = `${frontendUrl}/oauth/login/github?success=false&source=github&message=${encodeURIComponent(error.message)}`;

      return res.redirect(redirectUrl);
    }
  }

  /**
   * 获取Gitee登录地址
   */
  @Get('gitee')
  @ApiOperation({ summary: '获取Gitee登录地址' })
  @ApiResponse({ status: HttpStatus.OK, description: '获取Gitee登录地址成功' })
  @Redirect()
  @Public()
  getGiteeAuthUrl() {
    const url = this.oauthService.getGiteeAuthUrl();
    return { url, statusCode: HttpStatus.FOUND };
  }

  /**
   * 处理Gitee回调
   * @param code 授权码
   */
  @Get('gitee/callback')
  @ApiOperation({ summary: '处理Gitee回调' })
  @ApiQuery({ name: 'code', description: '授权码', required: true })
  @ApiResponse({ status: HttpStatus.OK, description: 'Gitee登录成功', type: OauthResultDto })
  @Public()
  async handleGiteeCallback(@Query('code') code: string, @Res() res: Response) {
    try {
      // 获取用户信息
      const result = await this.oauthService.handleGiteeCallback(code);

      // 重定向到前端页面，带上用户信息
      const frontendUrl = this.configService.get('app.frontendUrl');
      let redirectUrl = '';

      if (result.success) {
        redirectUrl = `${frontendUrl}/oauth/login/gitee?success=true&source=gitee&token=${encodeURIComponent(result.token)}`;
      } else {
        redirectUrl = `${frontendUrl}/oauth/login/gitee?success=false&source=gitee&message=${encodeURIComponent(result.message)}`;
      }

      return res.redirect(redirectUrl);
    } catch (error) {
      // 登录失败，重定向到前端页面，带上错误信息
      const frontendUrl = this.configService.get('app.frontendUrl');
      const redirectUrl = `${frontendUrl}/oauth/login/gitee?success=false&source=gitee&message=${encodeURIComponent(error.message)}`;

      return res.redirect(redirectUrl);
    }
  }

  /**
   * 获取QQ登录地址
   */
  @Get('qq')
  @ApiOperation({ summary: '获取QQ登录地址' })
  @ApiResponse({ status: HttpStatus.OK, description: '获取QQ登录地址成功' })
  @Redirect()
  @Public()
  getQQAuthUrl() {
    const url = this.oauthService.getQQAuthUrl();
    return { url, statusCode: HttpStatus.FOUND };
  }

  /**
   * 处理QQ回调
   * @param code 授权码
   */
  @Get('qq/callback')
  @ApiOperation({ summary: '处理QQ回调' })
  @ApiQuery({ name: 'code', description: '授权码', required: true })
  @ApiResponse({ status: HttpStatus.OK, description: 'QQ登录成功', type: OauthResultDto })
  @Public()
  async handleQQCallback(@Query('code') code: string, @Res() res: Response) {
    try {
      // 获取用户信息
      const result = await this.oauthService.handleQQCallback(code);

      // 重定向到前端页面，带上用户信息
      const frontendUrl = this.configService.get('app.frontendUrl', 'http://localhost:3000');
      let redirectUrl = '';

      if (result.success) {
        redirectUrl = `${frontendUrl}/oauth/login/qq?success=true&source=qq&token=${encodeURIComponent(result.token)}&userId=${result.userId}&username=${encodeURIComponent(result.username)}&nickname=${encodeURIComponent(result.nickname)}&avatar=${encodeURIComponent(result.avatar)}`;
      } else {
        redirectUrl = `${frontendUrl}/oauth/login/qq?success=false&source=qq&message=${encodeURIComponent(result.message)}`;
      }

      return res.redirect(redirectUrl);
    } catch (error) {
      // 登录失败，重定向到前端页面，带上错误信息
      const frontendUrl = this.configService.get('app.frontendUrl', 'http://localhost:3000');
      const redirectUrl = `${frontendUrl}/oauth/login/qq?success=false&source=qq&message=${encodeURIComponent(error.message)}`;

      return res.redirect(redirectUrl);
    }
  }
}
