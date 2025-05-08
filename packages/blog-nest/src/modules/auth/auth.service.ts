import {
  Injectable,
  Logger,
  UnauthorizedException,
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
import * as forge from 'node-forge';
import { RegisterDto } from './dto/register.dto';
import { OnlineService } from '../online/online.service';
import { OnlineUserDto } from '../online/dto/online-user.dto';
import { Request } from 'express';
import { IPUtil } from '../../common/utils/ip.util';
import { UAParser } from 'ua-parser-js';
import { SiteConfigService } from '../blog/services/site-config.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ConfigService } from '@nestjs/config';
/**
 * 解密密码
 */
function decryptPassword(encryptedPassword: string, privateKey: string): string {
  try {
    console.log('尝试解密密码，长度:', encryptedPassword.length);

    // 去除可能存在的前缀
    if (encryptedPassword.startsWith('-----BEGIN')) {
      console.log('检测到PEM格式，去除前缀');
      encryptedPassword = encryptedPassword.replace(/^-----BEGIN.*-----/, '').trim();
      encryptedPassword = encryptedPassword.replace(/-----END.*-----$/, '').trim();
    }

    if (!privateKey) {
      throw new Error('RSA私钥未配置');
    }

    try {
      console.log('尝试解析私钥...');
      const privateKeyObj = forge.pki.privateKeyFromPem(privateKey);
      console.log('私钥解析成功');

      try {
        console.log('尝试Base64解码密文...');
        const encryptedBytes = forge.util.decode64(encryptedPassword);
        console.log('Base64解码成功，数据长度:', encryptedBytes.length);

        console.log('尝试RSA解密...');
        const decrypted = privateKeyObj.decrypt(encryptedBytes);
        console.log('RSA解密成功，明文长度:', decrypted.length);

        return decrypted;
      } catch (decodeError) {
        console.error('Base64解码或RSA解密失败:', decodeError);
        throw new Error('密码格式错误，无法解密');
      }
    } catch (keyError) {
      console.error('私钥解析失败:', keyError);
      throw new Error('服务器密钥配置错误');
    }
  } catch (error) {
    console.error('解密密码失败:', error);
    throw new Error('解密密码失败: ' + error.message);
  }
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
    private readonly onlineService: OnlineService,
    private readonly siteConfigService: SiteConfigService,
    private readonly configService: ConfigService,
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
          const privateKey = this.configService.get<string>('rsa.privateKey');
          isMatch = await bcrypt.compare(
            decryptPassword(encryptedPassword, privateKey),
            user.password,
          );
        } catch (e) {
          this.logger.warn(`密码比较失败，尝试直接比较: ${e.message}`);
          // 直接比较（不安全，仅作为备选）
          const privateKey = this.configService.get<string>('rsa.privateKey');
          isMatch = decryptPassword(encryptedPassword, privateKey) === user.password;
        }
      }

      if (!isMatch) {
        this.logger.warn(`密码不正确: ${username}`);
        throw new UnauthorizedException('密码不正确');
      }

      // 检查账号是否禁用
      if (user.isDisable !== undefined && user.isDisable !== null && user.isDisable === 1) {
        this.logger.warn(`账号已被禁用: ${username}`);
        throw new UnauthorizedException('账号已被禁用');
      }

      // 返回用户信息
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...result } = user;
      return result;
    } catch (error) {
      this.logger.error(`验证用户失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 用户登录
   */
  async login(loginDto: LoginDto, req?: Request): Promise<ResultDto<any>> {
    const username = loginDto.username || loginDto.email;
    this.logger.log(`用户登录请求: ${username}`);

    try {
      // 如果有验证码和验证码UUID，则验证验证码
      if (loginDto.code && loginDto.captchaUUID) {
        const isCaptchaValid = await this.captchaService.validateCaptcha(
          loginDto.captchaUUID,
          loginDto.code,
          loginDto.type,
        );

        if (!isCaptchaValid) {
          this.logger.warn(`验证码错误: ${loginDto.code}`);
          throw new BadRequestException('验证码错误');
        }
      }

      // 尝试通过用户名或邮箱验证用户
      let user;
      if (loginDto.username) {
        user = await this.validateUser(loginDto.username, loginDto.password);
      } else if (loginDto.email) {
        // 先通过邮箱查找用户
        const foundUser = await this.userService.findByEmail(loginDto.email);
        if (!foundUser) {
          this.logger.warn(`邮箱不存在: ${loginDto.email}`);
          throw new NotFoundException('邮箱不存在');
        }

        // 验证密码
        user = await this.validateUser(foundUser.username, loginDto.password);
      } else {
        throw new BadRequestException('请提供用户名或邮箱');
      }

      // 登录类型（1为普通登录）
      const loginType = 1;

      // 生成token
      const payload = { id: user.id, username: user.username, nickname: user.nickname };
      const token = this.jwtService.sign(payload);

      // 更新用户登录信息
      await this.userService.updateLoginInfo(user.id, req);

      // 记录在线用户信息
      const userAgent = req?.headers?.['user-agent'] || '';
      const parser = new UAParser(userAgent);
      const browser = parser.getBrowser().name + ' ' + parser.getBrowser().version;
      const os = parser.getOS().name + ' ' + parser.getOS().version;
      const ipAddress = IPUtil.getIp(req);
      const ipSourcePromise = IPUtil.getIpSource(ipAddress);
      // 等待 IP 来源获取完成
      const ipSource = (await ipSourcePromise) || '未知';

      const onlineUser: OnlineUserDto = {
        tokenId: token,
        userId: user.id,
        username: user.username,
        nickname: user.nickname,
        avatar: user.avatar,
        ipAddress,
        ipSource,
        browser,
        os,
        loginTime: new Date(),
        lastAccessTime: new Date(),
      };

      await this.onlineService.addOnlineUser(onlineUser);

      return ResultDto.success(
        {
          token,
          userInfo: {
            id: user.id,
            username: user.username,
            nickname: user.nickname,
            avatar: user.avatar,
            email: user.email,
            webSite: user.webSite,
            intro: user.intro,
            loginType,
          },
        },
        '登录成功',
      );
    } catch (error) {
      this.logger.error(`用户登录失败: ${error.message}`);
      throw error;
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
    const username = loginDto.username || loginDto.email;
    this.logger.log(`管理员登录请求: ${username}`);

    try {
      // 如果有验证码和验证码UUID，则验证验证码
      if (loginDto.code && loginDto.captchaUUID) {
        const isCaptchaValid = await this.captchaService.validateCaptcha(
          loginDto.captchaUUID,
          loginDto.code,
          loginDto.type,
        );

        if (!isCaptchaValid) {
          this.logger.warn(`验证码错误: ${loginDto.code}`);
          throw new BadRequestException('验证码错误');
        }
      }

      // 尝试通过用户名或邮箱验证用户
      let user;
      if (loginDto.username) {
        user = await this.validateUser(loginDto.username, loginDto.password);
      } else if (loginDto.email) {
        // 先通过邮箱查找用户
        const foundUser = await this.userService.findByEmail(loginDto.email);
        if (!foundUser) {
          throw new NotFoundException('用户不存在');
        }
        user = await this.validateUser(foundUser.username, loginDto.password);
      } else {
        throw new BadRequestException('请提供用户名或邮箱');
      }

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
        email: user.email || loginDto.email,
        roleList: roleList.map((role) => role.roleLabel || role.id),
        permissionList: permissionList,
        menuList: menuList,
        token: token,
      };

      this.logger.log(`管理员登录成功: ${user.username}`);
      return ResultDto.success(userInfo); // 返回完整的用户信息，包括token
    } catch (error) {
      this.logger.error(`管理员登录失败: ${error.message}`);
      return ResultDto.fail(error.message, 400);
    }
  }

  /**
   * 用户退出登录
   */
  async logout(token?: string): Promise<ResultDto<null>> {
    try {
      this.logger.log('用户退出登录');

      // 如果提供了token，则移除在线用户记录
      if (token) {
        await this.onlineService.removeOnlineUser(token);
        this.logger.log(`已移除在线用户记录: ${token}`);
      }

      return ResultDto.success(null, '退出成功');
    } catch (error) {
      this.logger.error(`退出登录失败: ${error.message}`);
      throw new InternalServerErrorException('退出失败: ' + error.message);
    }
  }

  /**
   * 管理员退出登录
   */
  async adminLogout(token?: string): Promise<ResultDto<null>> {
    try {
      this.logger.log('管理员退出登录');

      // 如果提供了token，则移除在线用户记录
      if (token) {
        await this.onlineService.removeOnlineUser(token);
        this.logger.log(`已移除在线用户记录: ${token}`);
      }

      return ResultDto.success(null, '退出成功');
    } catch (error) {
      this.logger.error(`管理员退出登录失败: ${error.message}`);
      throw new InternalServerErrorException('退出失败: ' + error.message);
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

      // 同时使用多种类型缓存验证码，确保兼容性
      const types = ['ConderView', 'ConderBlog', 'blog'];
      for (const type of types) {
        const key = `${this.EMAIL_CODE_PREFIX}${type}:${email}`;
        await this.cacheManager.set(key, code, this.EMAIL_CODE_EXPIRE_TIME * 60 * 1000);
        this.logger.log(`验证码已缓存: ${key}, 值: ${code}`);
      }

      // 将发送验证码的任务添加到队列
      await this.queueService.addToEmailQueue('sendVerificationCode', {
        to: email,
        code,
      });

      this.logger.log(`验证码发送成功: ${email}, 验证码: ${code}`);
      return ResultDto.success(null, '验证码发送成功');
    } catch (error) {
      this.logger.error(`验证码发送失败: ${error.message}`);
      return ResultDto.fail('验证码发送失败', 500);
    }
  }

  /**
   * 校验邮箱验证码
   * @param email 邮箱
   * @param code 验证码
   * @param type 平台类型
   */
  private async validateEmailCode(email: string, code: string, type: string): Promise<boolean> {
    this.logger.log(`开始校验邮箱验证码: 邮箱=${email}, 验证码=${code}, 类型=${type}`);

    // 尝试多个可能的键名格式
    const possibleTypes = ['ConderView', 'ConderBlog', type, 'blog'];

    for (const possibleType of possibleTypes) {
      const key = `${this.EMAIL_CODE_PREFIX}${possibleType}:${email}`;
      const cachedCode = await this.cacheManager.get<string>(key);

      this.logger.log(`尝试验证码键: ${key}, 缓存值: ${cachedCode || '不存在'}`);

      if (cachedCode && cachedCode === code) {
        // 验证成功后删除缓存
        await this.cacheManager.del(key);
        this.logger.log(`验证码验证成功，已删除缓存: ${key}`);
        return true;
      }
    }

    this.logger.warn(`验证码错误或已过期: ${email}, 提交验证码: ${code}`);
    return false;
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
      return ResultDto.fail(error.message, error.status || 500);
    }
  }

  /**
   * 邮箱注册
   * @param registerDto 邮箱注册DTO
   */
  async register(registerDto: RegisterDto): Promise<ResultDto<any>> {
    // 兼容处理 - 支持email或username字段
    const { username, email, password, code, type } = registerDto as any;
    const emailToUse = email || username; // 优先使用email字段，如果没有则使用username

    if (!emailToUse) {
      throw new BadRequestException('邮箱不能为空');
    }

    const typeToUse = type || 'blog'; // 使用提供的type或默认为'blog'
    this.logger.log(`用户注册请求: 邮箱=${emailToUse}, 验证码=${code}, 平台类型=${typeToUse}`);

    try {
      // 校验验证码 - 使用validateEmailCode方法确保一致性
      const isCodeValid = await this.validateEmailCode(emailToUse, code, typeToUse);
      if (!isCodeValid) {
        throw new BadRequestException('验证码错误或已过期，请重新获取');
      }

      // 检查邮箱是否已注册
      const existingUser = await this.userService.findByEmail(emailToUse);
      if (existingUser) {
        this.logger.warn(`邮箱已注册: ${emailToUse}`);
        throw new BadRequestException('该邮箱已注册');
      }

      // 加密密码
      const hashedPassword = await bcrypt.hash(password, 10);

      // 提取邮箱用户名作为昵称
      const nickname = emailToUse.split('@')[0];

      // 创建用户 - 现在会自动从站点配置中获取默认头像
      const user = await this.userService.createUser({
        username: emailToUse, // 使用邮箱作为用户名
        email: emailToUse,
        password: hashedPassword,
        nickname: nickname,
        loginType: 1, // 邮箱登录
      });

      // 分配角色 - 普通用户角色ID为2
      try {
        await this.userService.assignUserRoles(user.id, [2]);
      } catch (e) {
        this.logger.warn(`分配用户角色失败，可能角色ID不存在: ${e.message}`);
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
        avatar: user.avatar, // 直接使用用户头像，无需替换
        email: user.email,
        roleList: roleList,
        token: token,
      };

      this.logger.log(`用户注册成功: ${emailToUse}`);
      return ResultDto.success(userInfo, '注册成功');
    } catch (error) {
      this.logger.error(`用户注册失败: ${error.message}`);
      return ResultDto.fail(error.message);
    }
  }

  /**
   * 修改密码
   * @param changePasswordDto 修改密码DTO
   */
  async changePassword(changePasswordDto: ChangePasswordDto): Promise<ResultDto<any>> {
    const { username, password, code, type } = changePasswordDto;
    this.logger.log(`修改密码请求: ${username}`);

    try {
      // 校验验证码
      const isCodeValid = await this.validateEmailCode(username, code, type || 'blog');
      if (!isCodeValid) {
        this.logger.warn(`验证码错误: ${username}, ${code}`);
        throw new BadRequestException('验证码错误或已过期');
      }

      // 查找用户
      const user = await this.userService.findByEmail(username);
      if (!user) {
        this.logger.warn(`用户不存在: ${username}`);
        throw new BadRequestException('用户不存在');
      }

      // 加密密码
      const hashedPassword = await bcrypt.hash(password, 10);

      // 更新密码
      await this.userService.updateUserPassword(user.id, hashedPassword);

      this.logger.log(`密码修改成功: ${username}`);
      return ResultDto.success(null, '密码修改成功');
    } catch (error) {
      this.logger.error(`密码修改失败: ${error.message}`);
      return ResultDto.fail(error.message);
    }
  }
}
