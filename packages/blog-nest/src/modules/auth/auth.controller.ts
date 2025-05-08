import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
  Get,
  Query,
  Req,
  Put,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UserService } from '../user/user.service';
import { ResultDto } from '../../common/dtos/result.dto';
import { Logger } from '@nestjs/common';
import { EmailLoginDto } from './dto/email-login.dto';
import { RegisterDto } from './dto/register.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@ApiTags('认证')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Post('login')
  @ApiOperation({ summary: '用户登录' })
  @Public()
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto, @Req() req) {
    return this.authService.login(loginDto, req);
  }

  @Get('logout')
  @ApiOperation({ summary: '用户登出' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  async logout(@Request() req) {
    const token = req.headers.authorization?.split(' ')[1];
    return this.authService.logout(token);
  }

  @Post('email/login')
  @ApiOperation({ summary: '邮箱登录' })
  @Public()
  @HttpCode(HttpStatus.OK)
  async emailLogin(@Body() emailLoginDto: EmailLoginDto) {
    return this.authService.emailLogin(emailLoginDto);
  }

  @Get('email/code')
  @ApiOperation({ summary: '发送邮箱验证码' })
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiQuery({ name: 'email', required: true, description: '邮箱地址' })
  async sendEmailCode(@Query('email') email: string) {
    return this.authService.sendEmailCode({ email });
  }

  @Get('profile')
  @ApiOperation({ summary: '获取当前用户信息' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getProfile(@Request() req) {
    return this.authService.getProfile(req.user.id);
  }

  @Post('register')
  @ApiOperation({ summary: '用户注册' })
  @Public()
  @HttpCode(HttpStatus.OK)
  async register(@Body() registerDto: RegisterDto) {
    this.logger.log(`收到注册请求: ${JSON.stringify(registerDto)}`);
    return this.authService.register(registerDto);
  }

  @Put('user/password')
  @Public()
  @ApiOperation({ summary: '修改密码' })
  @HttpCode(HttpStatus.OK)
  async changePassword(@Body() changePasswordDto: ChangePasswordDto): Promise<ResultDto<any>> {
    return this.authService.changePassword(changePasswordDto);
  }
}

@ApiTags('管理员认证')
@Controller('admin/auth')
export class AdminAuthController {
  private readonly logger = new Logger(AdminAuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: '管理员登录' })
  @Public()
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<ResultDto<any>> {
    this.logger.log(`管理员登录请求: ${loginDto.username}`);
    const result = await this.authService.adminLogin(loginDto);

    // 确保返回的token是一个字符串
    if (result.flag && typeof result.data === 'string') {
      this.logger.log(`管理员登录成功: ${loginDto.username}, token长度: ${result.data.length}`);
    } else {
      this.logger.warn(`管理员登录失败或token格式不正确: ${result.msg}`);
    }

    return result;
  }

  @Post('admin/logout')
  @ApiOperation({ summary: '管理员退出登录' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  async logout(@Request() req) {
    const token = req.headers.authorization?.split(' ')[1];
    return this.authService.adminLogout(token);
  }
}
