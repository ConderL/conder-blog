import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { LoginDto } from './dto/login.dto';
import { ResultDto } from '../../common/dtos/result.dto';
import * as bcrypt from 'bcrypt';
import { CaptchaService } from '../captcha/captcha.service';
import { EmailLoginDto, SendEmailCodeDto } from './dto/email-login.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { QueueService } from '../queue/services/queue/queue.service';
import { randomBytes } from 'crypto';
import { RegisterDto } from './dto/register.dto';

/**
 * 解密密码
 * 注意：这是一个示例函数，实际上并没有真正的解密操作，
 * 密码验证应该使用哈希比较而不是解密
 */
function decryptPassword(encryptedPassword: string): string {
  // 简单示例：返回原密码，实际中不应该这样做
  return encryptedPassword;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  // 邮箱验证码缓存前缀
  private readonly EMAIL_CODE_PREFIX = 'email_code:';
  // 验证码过期时间（分钟）
  private readonly EMAIL_CODE_EXPIRE_TIME = 5;

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly captchaService: CaptchaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly queueService: QueueService,
  ) {}

  /**
   * 验证用户
   * @param username 用户名
   * @param encryptedPassword 加密后的密码
   * @returns 用户信息
   */
  async validateUser(username: string, encryptedPassword: string): Promise<any> {
    this.logger.log(`验证用户: ${username}`);
    try {
      // 查询用户
      const user = await this.userService.findByUsername(username);

      if (!user) {
        this.logger.warn(`用户不存在: ${username}`);
        throw new NotFoundException('用户不存在');
      }

      // 验证密码
      let isMatch = false;
      if (user.password === encryptedPassword) {
        // 明文密码匹配
        isMatch = true;
      } else {
        // 尝试使用bcrypt比较
        try {
          this.logger.log(`尝试使用bcrypt比较: ${decryptPassword(encryptedPassword)}`);
          this.logger.log(`用户密码: ${user.password}`);
          isMatch = await bcrypt.compare(decryptPassword(encryptedPassword), user.password);
        } catch (e) {
          this.logger.warn(`密码比较失败，尝试直接比较: ${e.message}`);
          // 直接比较（不安全，仅作为备选）
          isMatch = decryptPassword(encryptedPassword) === user.password;
        }
      }

      if (!isMatch) {
        this.logger.warn(`密码不正确: ${username}`);
        throw new InternalServerErrorException('密码不正确');
      }

      // 检查账号是否禁用
      if (user.isDisable !== undefined && user.isDisable !== null && user.isDisable === 1) {
        this.logger.warn(`账号已被禁用: ${username}`);
        throw new InternalServerErrorException('账号已被禁用');
      }

      // 返回用户信息
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    } catch (error) {
      this.logger.error(`验证用户失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 用户登录
   */
  async login(loginDto: LoginDto): Promise<ResultDto<any>> {
    this.logger.log(`用户登录请求: ${loginDto.username}`);
    try {
      // 验证验证码
      const isCaptchaValid = await this.captchaService.validateCaptcha(
        loginDto.captchaUUID,
        loginDto.code,
        loginDto.type,
      );

      if (!isCaptchaValid) {
        this.logger.warn(`验证码错误: ${loginDto.code}`);
        throw new InternalServerErrorException('验证码错误');
      }

      // 验证用户
      const user = await this.validateUser(loginDto.username, loginDto.password);
      this.logger.log(`用户验证成功: ${user.username}`);

      // 生成JWT令牌
      const payload = { username: user.username, sub: user.id };
      const token = this.jwtService.sign(payload);
      this.logger.log(`生成JWT令牌: ${token.substring(0, 20)}...，长度: ${token.length}`);

      // 获取用户角色
      const roleList = await this.userService.getUserRoles(user.id);
      this.logger.log(`获取到用户角色: ${JSON.stringify(roleList)}`);

      // 组装用户信息
      const userInfo = {
        id: user.id,
        username: user.username,
        nickname: user.nickname || user.username,
        avatar: user.avatar || '',
        roleList: roleList,
        token: token,
      };

      this.logger.log(`用户登录成功: ${user.username}`);
      return ResultDto.success(userInfo);
    } catch (error) {
      this.logger.error(`用户登录失败: ${error.message}`);
      return ResultDto.fail(error.message);
    }
  }

  /**
   * 获取用户信息
   */
  async getProfile(userId: number): Promise<ResultDto<any>> {
    this.logger.log(`获取用户信息: ${userId}`);
    try {
      const user = await this.userService.findById(userId);
      if (!user) {
        this.logger.warn(`用户不存在: ${userId}`);
        throw new NotFoundException('用户不存在');
      }

      // 获取用户角色
      const roleList = await this.userService.getUserRoles(user.id);
      this.logger.log(`获取到用户角色: ${JSON.stringify(roleList)}`);

      // 组装用户信息
      const userInfo = {
        id: user.id,
        username: user.username,
        nickname: user.nickname || user.username,
        avatar: user.avatar || '',
        roleList: roleList,
      };

      this.logger.log(`获取用户信息成功: ${userId}`);
      return ResultDto.success(userInfo);
    } catch (error) {
      this.logger.error(`获取用户信息失败: ${error.message}`);
      return ResultDto.fail(error.message, error.status || 400);
    }
  }

  /**
   * 管理员登录
   */
  async adminLogin(loginDto: LoginDto): Promise<ResultDto<any>> {
    this.logger.log(`管理员登录请求: ${loginDto.username}`);
    try {
      // 验证验证码
      const isCaptchaValid = await this.captchaService.validateCaptcha(
        loginDto.captchaUUID,
        loginDto.code,
        loginDto.type,
      );

      if (!isCaptchaValid) {
        this.logger.warn(`验证码错误: ${loginDto.code}`);
        throw new InternalServerErrorException('验证码错误');
      }

      // 验证用户
      const user = await this.validateUser(loginDto.username, loginDto.password);
      this.logger.log(`用户验证成功: ${user.username}`);

      // 获取用户角色
      const roleList = await this.userService.getUserRoles(user.id);
      this.logger.log(`获取到用户角色: ${JSON.stringify(roleList.map((r) => r.roleLabel))}`);

      // 如果roleList为空，且用户名为admin，则默认添加管理员角色
      if (roleList.length === 0 && user.username === 'admin') {
        this.logger.log('用户没有角色，但用户名为admin，添加默认管理员角色');
        // 这里我们只模拟返回一个管理员角色，实际不写入数据库
        roleList.push({
          id: '1',
          roleName: '管理员',
          roleLabel: 'admin',
          remark: '系统管理员',
          isDisable: 0,
          createTime: new Date(),
          updateTime: new Date(),
        } as any);
      }

      // 获取用户权限列表
      const permissionList = await this.userService.getUserPermissions(user.id);
      this.logger.log(`获取到用户权限: ${JSON.stringify(permissionList)}`);

      // 如果permissionList为空，且用户名为admin，则添加所有权限
      if ((permissionList.length === 0 || !permissionList) && user.username === 'admin') {
        this.logger.log('用户没有权限，但用户名为admin，添加所有权限');
        // 添加常用权限
        const allPermissions = [
          'system:user:list',
          'system:user:add',
          'system:user:update',
          'system:user:delete',
          'system:user:status',
          'system:role:list',
          'system:role:add',
          'system:role:update',
          'system:role:delete',
          'system:role:status',
          'system:menu:list',
          'system:menu:add',
          'system:menu:update',
          'system:menu:delete',
          'monitor:online:list',
          'monitor:online:kick',
          'article:list',
          'article:add',
          'article:update',
          'article:delete',
          'article:status',
          'category:list',
          'category:add',
          'category:update',
          'category:delete',
          'tag:list',
          'tag:add',
          'tag:update',
          'tag:delete',
        ];
        allPermissions.forEach((p) => permissionList.push(p));
      }

      // 获取用户菜单树
      const menuList = await this.userService.getUserMenuTree(user.id);
      this.logger.log(`获取到用户菜单树，根节点数量: ${menuList.length}`);

      // 生成JWT令牌
      const payload = { username: user.username, sub: user.id };
      const token = this.jwtService.sign(payload);
      this.logger.log(`生成JWT令牌: ${token.substring(0, 20)}...，长度: ${token.length}`);

      // 组装用户信息
      const userInfo = {
        id: user.id,
        username: user.username,
        nickname: user.nickname || user.username,
        avatar: user.avatar || '',
        roleList: roleList.map((role) => role.roleLabel || role.id),
        permissionList: permissionList,
        menuList: menuList,
        token: token,
      };

      this.logger.log(`管理员登录成功: ${user.username}`);
      return ResultDto.success(userInfo); // 返回完整的用户信息，包括token
    } catch (error) {
      this.logger.error(`管理员登录失败: ${error.message}`);
      return ResultDto.fail(error.message);
    }
  }

  /**
   * 登出
   */
  async logout(token?: string): Promise<ResultDto<null>> {
    this.logger.log('用户登出');

    try {
      // 获取当前请求的令牌（如果未提供）
      if (!token && this.jwtService) {
        // 这里可以从请求对象中获取令牌，但需要注入Request
        // 如果在控制器中已经提取了令牌，可以作为参数传入
      }

      if (token) {
        // 将令牌加入黑名单
        // 计算令牌的过期时间
        try {
          const decoded = this.jwtService.decode(token) as { exp: number };
          if (decoded && decoded.exp) {
            const expiration = decoded.exp * 1000 - Date.now(); // 毫秒
            if (expiration > 0) {
              // 使用缓存管理器将令牌加入黑名单，直到过期
              const blacklistKey = `token:blacklist:${token}`;
              await this.cacheManager.set(blacklistKey, true, expiration);
              this.logger.log(`令牌已加入黑名单，过期时间: ${new Date(decoded.exp * 1000)}`);
            }
          }
        } catch (error) {
          this.logger.warn(`解析令牌失败: ${error.message}`);
        }
      }

      return ResultDto.success(null, '退出成功');
    } catch (error) {
      this.logger.error(`登出失败: ${error.message}`);
      return ResultDto.fail('登出失败');
    }
  }

  /**
   * 管理员登出
   */
  async adminLogout(token?: string): Promise<ResultDto<null>> {
    this.logger.log('管理员登出');

    try {
      // 和普通登出逻辑相同，将令牌加入黑名单
      if (token) {
        try {
          const decoded = this.jwtService.decode(token) as { exp: number };
          if (decoded && decoded.exp) {
            const expiration = decoded.exp * 1000 - Date.now(); // 毫秒
            if (expiration > 0) {
              // 使用缓存管理器将令牌加入黑名单，直到过期
              const blacklistKey = `token:blacklist:${token}`;
              await this.cacheManager.set(blacklistKey, true, expiration);
              this.logger.log(`管理员令牌已加入黑名单，过期时间: ${new Date(decoded.exp * 1000)}`);
            }
          }
        } catch (error) {
          this.logger.warn(`解析令牌失败: ${error.message}`);
        }
      }

      return ResultDto.success(null, '管理员登出成功');
    } catch (error) {
      this.logger.error(`管理员登出失败: ${error.message}`);
      return ResultDto.fail('管理员登出失败');
    }
  }

  /**
   * 发送邮箱验证码
   * @param sendEmailCodeDto 发送邮箱验证码DTO
   */
  async sendEmailCode(sendEmailCodeDto: SendEmailCodeDto): Promise<ResultDto<any>> {
    const { email } = sendEmailCodeDto;
    this.logger.log(`发送邮箱验证码: ${email}`);

    try {
      // 生成6位随机验证码
      const code = Math.floor(100000 + Math.random() * 900000).toString();

      // 缓存验证码
      const key = `${this.EMAIL_CODE_PREFIX}${email}`;
      await this.cacheManager.set(key, code, this.EMAIL_CODE_EXPIRE_TIME * 60 * 1000);

      // 将发送验证码的任务添加到队列
      await this.queueService.addToEmailQueue('sendVerificationCode', {
        to: email,
        code,
      });

      this.logger.log(`验证码发送成功: ${email}, 验证码: ${code}`);
      return ResultDto.success(null, '验证码发送成功');
    } catch (error) {
      this.logger.error(`验证码发送失败: ${error.message}`);
      return ResultDto.fail('验证码发送失败');
    }
  }

  /**
   * 校验邮箱验证码
   * @param email 邮箱
   * @param code 验证码
   * @param type 平台类型
   */
  private async validateEmailCode(email: string, code: string, type: string): Promise<boolean> {
    const key = `${this.EMAIL_CODE_PREFIX}${type}:${email}`;
    const cachedCode = await this.cacheManager.get<string>(key);

    if (!cachedCode || cachedCode !== code) {
      return false;
    }

    // 验证成功后删除缓存
    await this.cacheManager.del(key);
    return true;
  }

  /**
   * 邮箱登录
   * @param emailLoginDto 邮箱登录DTO
   */
  async emailLogin(emailLoginDto: EmailLoginDto): Promise<ResultDto<any>> {
    const { email, code, type } = emailLoginDto;
    this.logger.log(`邮箱登录请求: ${email}`);

    try {
      // 校验验证码
      const isCodeValid = await this.validateEmailCode(email, code, type);
      if (!isCodeValid) {
        this.logger.warn(`邮箱验证码错误: ${email}, ${code}`);
        throw new InternalServerErrorException('验证码错误或已过期');
      }

      // 查找用户
      let user = await this.userService.findByEmail(email);

      // 如果用户不存在，则自动注册
      if (!user) {
        this.logger.log(`用户不存在，自动注册: ${email}`);

        // 生成随机密码
        const randomPassword = randomBytes(16).toString('hex');
        const hashedPassword = await bcrypt.hash(randomPassword, 10);

        // 创建用户
        user = await this.userService.createUser({
          username: email,
          email: email,
          password: hashedPassword,
          nickname: email.split('@')[0],
          loginType: 1, // 邮箱登录
        });
      }

      // 检查用户状态
      if (user.isDisable === 1) {
        this.logger.warn(`账号已被禁用: ${email}`);
        throw new InternalServerErrorException('账号已被禁用');
      }

      // 生成JWT令牌
      const payload = { username: user.username, sub: user.id };
      const token = this.jwtService.sign(payload);

      // 获取用户角色
      const roleList = await this.userService.getUserRoles(user.id);

      // 组装用户信息
      const userInfo = {
        id: user.id,
        username: user.username,
        nickname: user.nickname || user.username,
        avatar: user.avatar || '',
        email: user.email,
        roleList: roleList,
        token: token,
      };

      this.logger.log(`邮箱登录成功: ${email}`);
      return ResultDto.success(userInfo);
    } catch (error) {
      this.logger.error(`邮箱登录失败: ${error.message}`);
      return ResultDto.fail(error.message);
    }
  }

  /**
   * 邮箱注册
   * @param registerDto 注册DTO
   */
  async register(registerDto: RegisterDto): Promise<ResultDto<any>> {
    const { username, password, code, type } = registerDto;
    this.logger.log(`用户注册请求: ${username}`);

    try {
      // 校验验证码
      const isCodeValid = await this.validateEmailCode(username, code, type);
      if (!isCodeValid) {
        this.logger.warn(`验证码错误: ${username}, ${code}`);
        throw new BadRequestException('验证码错误或已过期');
      }

      // 检查用户名是否已注册
      const existingUser = await this.userService.findByUsername(username);
      if (existingUser) {
        this.logger.warn(`用户名已注册: ${username}`);
        throw new BadRequestException('该用户名已注册');
      }

      // 加密密码
      const hashedPassword = await bcrypt.hash(password, 10);

      // 创建用户
      const user = await this.userService.createUser({
        username: username,
        email: username, // 邮箱与用户名相同
        password: hashedPassword,
        nickname: username.split('@')[0], // 使用邮箱前缀作为昵称
        loginType: 1, // 邮箱登录
      });

      // 分配角色 - 角色ID为3
      await this.userService.assignUserRoles(user.id, [3]);

      // 生成JWT令牌
      const payload = { username: user.username, sub: user.id };
      const token = this.jwtService.sign(payload);

      // 获取用户角色
      const roleList = await this.userService.getUserRoles(user.id);

      // 组装用户信息
      const userInfo = {
        id: user.id,
        username: user.username,
        nickname: user.nickname || user.username,
        avatar: user.avatar || '',
        email: user.email,
        roleList: roleList,
        token: token,
      };

      this.logger.log(`用户注册成功: ${username}`);
      return ResultDto.success(userInfo, '注册成功');
    } catch (error) {
      this.logger.error(`用户注册失败: ${error.message}`);
      return ResultDto.fail(error.message);
    }
  }
}
