import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  UseGuards,
  Request,
  Req,
  UploadedFile,
  UseInterceptors,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { UserService } from './user.service';
import { MenuService } from './services/menu.service';
import { User } from './entities/user.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import { ResultDto } from '../../common/dtos/result.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { OperationLog } from '../../common/decorators/operation-log.decorator';
import { OperationType } from '../../common/enums/operation-type.enum';
import { BindEmailDto } from './dto/bind-email.dto';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Logger } from '@nestjs/common';
import { RedisService } from '../../redis/redis.service';

@ApiTags('用户管理')
@Controller('user')
export class UserController {
  private readonly logger = new Logger(UserController.name);
  private readonly EMAIL_CODE_PREFIX = 'email_code:';

  constructor(
    private readonly userService: UserService,
    private readonly menuService: MenuService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly redisService: RedisService,
  ) {}

  /**
   * 将数据库菜单格式转换为前端路由格式
   */
  private formatMenuTree(menu: any): any {
    // 添加调试日志
    console.log(`格式化菜单: ${menu.menuName} (ID=${menu.id}), is_hidden=${menu.hidden}`);

    // 基本菜单项结构
    const routerItem: any = {
      name: menu.menuName,
      path: menu.parentId === 0 ? `/${menu.path}` : menu.path,
      component: menu.parentId === 0 ? 'Layout' : menu.component,
      meta: {
        title: menu.menuName,
        icon: menu.icon,
        // 直接使用数据库原始值确定是否隐藏
        hidden: menu.hidden === true,
      },
    };

    // 如果有子菜单
    if (menu.children && menu.children.length > 0) {
      routerItem.alwaysShow = true;
      routerItem.redirect = 'noRedirect';
      routerItem.children = menu.children.map((child) => this.formatMenuTree(child));
    }

    return routerItem;
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getProfile(@Request() req) {
    return this.userService.findById(req.user.id);
  }

  @Post('register')
  @ApiOperation({ summary: '用户注册' })
  @Public()
  async register(@Body() createUserDto: Partial<User>): Promise<User> {
    return this.userService.create(createUserDto);
  }

  /**
   * 前台用户上传头像
   * @param file 头像文件
   * @param req 请求对象
   */
  @Post('avatar')
  @ApiOperation({ summary: '上传用户头像' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: '头像文件',
        },
      },
    },
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB限制
      },
      storage: memoryStorage(),
    }),
  )
  async uploadAvatar(@UploadedFile() file: Express.Multer.File, @Request() req) {
    console.log('收到用户头像上传请求，用户ID:', req.user.id);

    if (!file) {
      return ResultDto.fail('请选择要上传的头像');
    }

    // 检查文件格式
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return ResultDto.fail('只允许上传jpg, png, gif, webp, avif格式的图片');
    }

    try {
      // 上传头像并更新用户信息
      const avatarUrl = await this.userService.updateUserAvatar(req.user.id, file);
      return ResultDto.success(avatarUrl, '头像上传成功');
    } catch (error) {
      console.error('上传头像失败:', error);
      return ResultDto.fail('上传头像失败: ' + error.message);
    }
  }

  @Get('getUserInfo')
  @ApiOperation({ summary: '获取当前登录用户信息' })
  @ApiBearerAuth()
  async getUserInfo(@Request() req): Promise<ResultDto<any>> {
    try {
      const userId = req.user.id;
      console.log('获取用户信息，用户ID:', userId);

      // 获取用户基本信息
      const user = await this.userService.findById(userId);
      if (!user) {
        console.error('用户不存在，ID:', userId);
        return ResultDto.fail('用户不存在');
      }

      // 获取用户角色
      const roleList = await this.userService.getUserRoles(userId);
      console.log('获取到角色:', roleList);

      // 获取用户权限
      const permissionList = await this.userService.getUserPermissions(userId);
      console.log('获取到权限数量:', permissionList.length);

      // 获取用户点赞信息
      const articleLikeSet = await this.userService.getUserArticleLikes(userId);
      const commentLikeSet = await this.userService.getUserCommentLikes(userId);
      const talkLikeSet = await this.userService.getUserTalkLikes(userId);
      console.log(
        '获取到点赞信息，文章点赞数:',
        articleLikeSet.length,
        '评论点赞数:',
        commentLikeSet.length,
        '说说点赞数:',
        talkLikeSet.length,
      );

      // 如果用户没有角色或权限，直接返回空数组，不再添加默认值
      const userInfo = {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        avatar: user.avatar || '',
        roleList: roleList.map((role) => role.roleLabel || role.id),
        email: user.email,
        webSite: user.webSite || '',
        intro: user.intro || '',
        permissionList,
        articleLikeSet,
        commentLikeSet,
        talkLikeSet,
      };

      console.log('返回用户信息:', JSON.stringify(userInfo).substring(0, 100) + '...');
      return ResultDto.success(userInfo);
    } catch (error) {
      console.error('获取用户信息失败:', error);
      return ResultDto.fail('获取用户信息失败: ' + error.message);
    }
  }

  @Get('getUserMenu')
  @ApiOperation({ summary: '获取当前登录用户菜单' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getUserMenu(@Req() req: any): Promise<ResultDto<any>> {
    try {
      console.log('获取用户菜单 - 用户ID:', req.user.id);

      // 从数据库获取用户菜单
      const menus = await this.userService.getUserMenuTree(req.user.id);

      if (!menus || menus.length === 0) {
        return ResultDto.fail('没有找到菜单数据');
      }

      // 转换菜单数据为前端路由格式
      const menuData = menus.map((menu) => this.formatMenuTree(menu));

      return ResultDto.success(menuData);
    } catch (error) {
      console.error('获取菜单出错:', error);
      return ResultDto.fail('获取菜单失败: ' + error.message);
    }
  }

  /**
   * 更新当前登录用户信息
   * @param user 用户信息
   * @param req 请求对象
   */
  @Put('info')
  @ApiOperation({ summary: '更新当前登录用户信息' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async updateUserInfo(@Body() user: Partial<User>, @Request() req): Promise<ResultDto<any>> {
    try {
      // 从JWT令牌中获取用户ID
      const userId = req.user.id;
      console.log(`更新用户信息，用户ID: ${userId}，数据:`, user);

      // 不允许更新敏感字段
      delete user.password;
      delete user.username;
      delete user.id;

      // 更新用户信息
      const updatedUser = await this.userService.update(userId, user);

      return ResultDto.success(updatedUser, '用户信息更新成功');
    } catch (error) {
      console.error('更新用户信息失败:', error);
      return ResultDto.fail(`更新用户信息失败: ${error.message}`);
    }
  }

  /**
   * 查看用户角色选项
   */
  @Get('role')
  @ApiOperation({ summary: '查看用户角色选项' })
  @ApiBearerAuth()
  async listUserRoleDTO(): Promise<ResultDto<any>> {
    try {
      const roleOptions = await this.userService.getUserRoleOptions();
      return ResultDto.success(roleOptions);
    } catch (error) {
      console.error('获取角色选项失败:', error);
      return ResultDto.fail('获取角色选项失败');
    }
  }

  /**
   * 获取用户角色ID列表
   */
  @Get('role/:userId')
  @ApiOperation({ summary: '获取用户角色ID列表' })
  @ApiBearerAuth()
  async getUserRoleIds(@Param('userId') userId: number): Promise<ResultDto<number[]>> {
    try {
      const roleIds = await this.userService.getUserRoleIds(userId);
      return ResultDto.success(roleIds);
    } catch (error) {
      console.error('获取用户角色ID列表失败:', error);
      return ResultDto.fail('获取用户角色ID列表失败');
    }
  }

  /**
   * 分配用户角色
   */
  @Post('role')
  @ApiOperation({ summary: '分配用户角色' })
  @ApiBearerAuth()
  @OperationLog(OperationType.GRANT)
  async assignUserRoles(
    @Body() data: { userId: number; roleIds: number[] },
  ): Promise<ResultDto<null>> {
    try {
      await this.userService.assignUserRoles(data.userId, data.roleIds);
      return ResultDto.success(null, '分配角色成功');
    } catch (error) {
      console.error('分配用户角色失败:', error);
      return ResultDto.fail('分配用户角色失败: ' + error.message);
    }
  }

  /**
   * 绑定邮箱
   * @param bindEmailDto 绑定邮箱DTO
   * @param req 请求对象
   */
  @Put('email')
  @ApiOperation({ summary: '绑定邮箱' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @OperationLog(OperationType.UPDATE)
  async bindEmail(@Body() bindEmailDto: BindEmailDto, @Request() req): Promise<ResultDto<any>> {
    try {
      // 从JWT令牌中获取用户ID
      const userId = req.user.id;
      this.logger.log(`绑定邮箱请求，用户ID: ${userId}，邮箱: ${bindEmailDto.email}`);

      // 验证邮箱验证码
      const isCodeValid = await this.validateEmailCode(bindEmailDto.email, bindEmailDto.code);
      if (!isCodeValid) {
        this.logger.warn(`验证码错误或已过期: ${bindEmailDto.email}, ${bindEmailDto.code}`);
        return ResultDto.fail('验证码错误或已过期');
      }

      // 调用用户服务绑定邮箱
      const result = await this.userService.bindEmail(userId, bindEmailDto.email);

      if (result.success) {
        return ResultDto.success(null, result.message);
      } else {
        return ResultDto.fail(result.message);
      }
    } catch (error) {
      this.logger.error(`绑定邮箱失败: ${error.message}`, error.stack);
      return ResultDto.fail(`绑定邮箱失败: ${error.message}`);
    }
  }

  /**
   * 校验邮箱验证码
   * @param email 邮箱
   * @param code 验证码
   * @returns 验证结果
   */
  private async validateEmailCode(email: string, code: string): Promise<boolean> {
    this.logger.log(`开始校验邮箱验证码: 邮箱=${email}, 验证码=${code}`);

    try {
      // 已知的键名格式
      const knownKeyFormats = [
        `email_code:blog:${email}`,
        `email_code:ConderView:${email}`,
        `email_code:ConderBlog:${email}`,
      ];

      const redisClient = this.redisService.getClient();

      // 直接尝试已知的键名格式
      for (const key of knownKeyFormats) {
        const cachedCode = await redisClient.get(key);

        if (!cachedCode) continue;

        // 处理Redis返回的值可能包含引号的情况
        let normalizedCachedCode = cachedCode;
        if (cachedCode.startsWith('"') && cachedCode.endsWith('"')) {
          normalizedCachedCode = cachedCode.slice(1, -1);
        }

        // 确保进行字符串比较
        if (normalizedCachedCode.toString() === code.toString()) {
          // 验证成功后删除缓存
          await redisClient.del(key);
          return true;
        }
      }

      return false;
    } catch (error) {
      this.logger.error(`验证码验证失败: ${error.message}`);
      return false;
    }
  }
}

@ApiTags('后台用户管理')
@Controller('admin/user')
@UseGuards(JwtAuthGuard)
export class AdminUserController {
  constructor(
    private readonly userService: UserService,
    private readonly menuService: MenuService,
  ) {}

  /**
   * 查询用户列表
   */
  @Get('list')
  @ApiOperation({ summary: '查询用户列表' })
  @ApiBearerAuth()
  async getUserList(@Req() req: any): Promise<ResultDto<{ recordList: any[]; total: number }>> {
    try {
      // 从请求中获取查询参数
      const pageNum = parseInt(req.query.pageNum, 10) || 1;
      const pageSize = parseInt(req.query.pageSize, 10) || 10;
      const { username, nickname, email, loginType, isDisable } = req.query;

      console.log('查询用户列表，参数:', {
        pageNum,
        pageSize,
        username,
        nickname,
        email,
        loginType,
        isDisable,
      });

      // 查询用户列表
      const result = await this.userService.getUserList(
        pageNum,
        pageSize,
        username,
        nickname,
        email,
        loginType !== undefined ? parseInt(loginType, 10) : undefined,
        isDisable !== undefined ? parseInt(isDisable, 10) : undefined,
      );

      return ResultDto.success(result);
    } catch (error) {
      console.error('查询用户列表失败:', error);
      return ResultDto.fail('查询用户列表失败: ' + error.message);
    }
  }

  /**
   * 修改用户状态
   */
  @Put('changeStatus')
  @ApiOperation({ summary: '修改用户状态' })
  @ApiBearerAuth()
  @OperationLog(OperationType.UPDATE)
  async changeUserStatus(
    @Body() data: { userId: number; isDisable: number },
  ): Promise<ResultDto<null>> {
    try {
      await this.userService.changeUserStatus(data.userId, data.isDisable);
      return ResultDto.success(null, '用户状态更新成功');
    } catch (error) {
      console.error('修改用户状态失败:', error);
      return ResultDto.fail('修改用户状态失败: ' + error.message);
    }
  }

  /**
   * 查看用户角色选项
   */
  @Get('role')
  @ApiOperation({ summary: '查看用户角色选项' })
  @ApiBearerAuth()
  async listUserRoleDTO(): Promise<ResultDto<any>> {
    try {
      const roleOptions = await this.userService.getUserRoleOptions();
      return ResultDto.success(roleOptions);
    } catch (error) {
      console.error('获取角色选项失败:', error);
      return ResultDto.fail('获取角色选项失败');
    }
  }

  /**
   * 获取用户角色ID列表
   */
  @Get('role/:userId')
  @ApiOperation({ summary: '获取用户角色ID列表' })
  @ApiBearerAuth()
  async getUserRoleIds(@Param('userId') userId: number): Promise<ResultDto<number[]>> {
    try {
      const roleIds = await this.userService.getUserRoleIds(userId);
      return ResultDto.success(roleIds);
    } catch (error) {
      console.error('获取用户角色ID列表失败:', error);
      return ResultDto.fail('获取用户角色ID列表失败');
    }
  }

  /**
   * 分配用户角色
   */
  @Post('role')
  @ApiOperation({ summary: '分配用户角色' })
  @ApiBearerAuth()
  @OperationLog(OperationType.GRANT)
  async assignUserRoles(
    @Body() data: { userId: number; roleIds: number[] },
  ): Promise<ResultDto<null>> {
    try {
      await this.userService.assignUserRoles(data.userId, data.roleIds);
      return ResultDto.success(null, '分配角色成功');
    } catch (error) {
      console.error('分配用户角色失败:', error);
      return ResultDto.fail('分配用户角色失败: ' + error.message);
    }
  }

  @Get('getUserInfo')
  @ApiOperation({ summary: '获取当前登录用户信息' })
  @ApiBearerAuth()
  async getUserInfo(@Request() req): Promise<ResultDto<any>> {
    try {
      const userId = req.user.id;
      console.log('获取管理员用户信息，用户ID:', userId);

      // 获取用户基本信息
      const user = await this.userService.findById(userId);
      if (!user) {
        console.error('用户不存在，ID:', userId);
        return ResultDto.fail('用户不存在');
      }

      // 获取用户角色
      const roleList = await this.userService.getUserRoles(userId);
      console.log('获取到角色:', roleList);

      // 获取用户权限
      const permissionList = await this.userService.getUserPermissions(userId);
      console.log('获取到权限数量:', permissionList.length);

      // 获取用户点赞信息
      const articleLikeSet = await this.userService.getUserArticleLikes(userId);
      const commentLikeSet = await this.userService.getUserCommentLikes(userId);
      const talkLikeSet = await this.userService.getUserTalkLikes(userId);
      console.log(
        '获取到点赞信息，文章点赞数:',
        articleLikeSet.length,
        '评论点赞数:',
        commentLikeSet.length,
        '说说点赞数:',
        talkLikeSet.length,
      );

      // 如果用户没有角色或权限，直接返回空数组，不再添加默认值
      const userInfo = {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        avatar: user.avatar || '',
        roleList: roleList.map((role) => role.roleLabel || role.id),
        permissionList,
        articleLikeSet,
        commentLikeSet,
        talkLikeSet,
      };

      console.log('返回管理员用户信息:', JSON.stringify(userInfo).substring(0, 100) + '...');
      return ResultDto.success(userInfo);
    } catch (error) {
      console.error('获取管理员用户信息失败:', error);
      return ResultDto.fail('获取用户信息失败: ' + error.message);
    }
  }

  @Get('getUserMenu')
  @ApiOperation({ summary: '获取当前登录用户菜单' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getUserMenu(@Req() req: any): Promise<ResultDto<any>> {
    try {
      console.log('管理员获取用户菜单 - 用户ID:', req.user.id);

      // 从数据库获取用户菜单
      const menus = await this.userService.getUserMenuTree(req.user.id);

      if (!menus || menus.length === 0) {
        return ResultDto.fail('没有找到菜单数据');
      }

      // 转换菜单数据为前端路由格式
      const menuData = menus.map((menu) => this.formatMenuTree(menu));

      // 打印菜单名称，用于调试
      console.log(
        '菜单数据示例:',
        menuData.length > 0 ? `第一个菜单名称: ${menuData[0].name}` : '无菜单数据',
      );

      return ResultDto.success(menuData);
    } catch (error) {
      console.error('获取菜单出错:', error);
      return ResultDto.fail('获取菜单失败: ' + error.message);
    }
  }

  /**
   * 将数据库菜单格式转换为前端路由格式
   */
  private formatMenuTree(menu: any): any {
    // 添加调试日志
    console.log(`格式化菜单: ${menu.menuName} (ID=${menu.id}), is_hidden=${menu.hidden}`);

    // 基本菜单项结构
    const routerItem: any = {
      name: menu.menuName,
      path: menu.parentId === 0 ? `/${menu.path}` : menu.path,
      component: menu.parentId === 0 ? 'Layout' : menu.component,
      meta: {
        title: menu.menuName,
        icon: menu.icon,
        // 直接使用数据库原始值确定是否隐藏
        hidden: menu.hidden === true,
      },
    };

    // 如果有子菜单
    if (menu.children && menu.children.length > 0) {
      routerItem.alwaysShow = true;
      routerItem.redirect = 'noRedirect';
      routerItem.children = menu.children.map((child) => this.formatMenuTree(child));
    }

    return routerItem;
  }
}
