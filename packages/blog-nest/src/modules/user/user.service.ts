import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { UserRole } from './entities/user-role.entity';
import { Menu } from './entities/menu.entity';
import { RoleMenu } from './entities/role-menu.entity';
import * as bcrypt from 'bcryptjs';
import { UploadService } from '../upload/services/upload/upload.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { SiteConfig } from '../blog/entities/site-config.entity';
import { RedisService } from '../../redis/redis.service';
import { RedisConstant } from '../../common/constants/redis.constant';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
    @InjectRepository(Menu)
    private readonly menuRepository: Repository<Menu>,
    @InjectRepository(RoleMenu)
    private readonly roleMenuRepository: Repository<RoleMenu>,
    @InjectRepository(SiteConfig)
    private readonly siteConfigRepository: Repository<SiteConfig>,
    private readonly uploadService: UploadService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {}

  /**
   * 根据用户名查找用户
   */
  async findByUsername(username: string): Promise<User> {
    return this.userRepository.findOne({
      where: { username },
      select: ['id', 'username', 'password', 'nickname', 'avatar', 'email'],
    });
  }

  /**
   * 根据ID查找用户
   */
  async findById(id: number): Promise<User> {
    return this.userRepository.findOne({
      where: { id },
      select: ['id', 'username', 'nickname', 'avatar', 'email', 'webSite', 'intro'],
    });
  }

  /**
   * 根据邮箱查找用户
   */
  async findByEmail(email: string): Promise<User> {
    return this.userRepository.findOne({
      where: { email },
      select: [
        'id',
        'username',
        'password',
        'nickname',
        'avatar',
        'email',
        'isDisable',
        'loginType',
      ],
    });
  }

  /**
   * 创建用户
   */
  async create(user: Partial<User>): Promise<User> {
    const existingUser = await this.userRepository.findOne({ where: { username: user.username } });
    if (existingUser) {
      throw new Error('用户名已存在');
    }

    if (user.password) {
      user.password = await bcrypt.hash(user.password, 10);
    }
    const newUser = this.userRepository.create(user);
    const savedUser = await this.userRepository.save(newUser);

    // 为新用户添加角色
    await this.addUserRole(savedUser.id);

    return savedUser;
  }

  /**
   * 创建用户（用于邮箱注册）
   */
  async createUser(userData: {
    username: string;
    email: string;
    password: string;
    nickname: string;
    loginType: number;
  }): Promise<User> {
    try {
      // 检查用户名是否存在
      const existingUser = await this.userRepository.findOne({
        where: [{ username: userData.username }, { email: userData.email }],
      });

      if (existingUser) {
        throw new Error('用户名或邮箱已存在');
      }

      // 直接从数据库获取站点配置
      const [siteConfig] = await this.siteConfigRepository.find();

      // 创建新用户
      const newUser = this.userRepository.create({
        username: userData.username,
        email: userData.email,
        password: userData.password, // 已经在AuthService中进行了加密处理
        nickname: userData.nickname,
        loginType: userData.loginType,
        isDisable: 0, // 默认启用
        createTime: new Date(), // 设置创建时间为当前时间
        avatar: siteConfig?.touristAvatar || '', // 设置默认头像
      });

      // 保存用户
      const savedUser = await this.userRepository.save(newUser);

      // 为新用户添加角色
      await this.addUserRole(savedUser.id);

      return this.findById(savedUser.id);
    } catch (error) {
      this.logger.error(`创建用户失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 为用户添加角色并分配权限
   */
  private async addUserRole(userId: number): Promise<void> {
    try {
      // 直接为用户分配普通用户角色(role_id=2)
      const userRole = new UserRole();
      userRole.userId = userId;
      userRole.roleId = 2; // 固定使用ID为2的普通用户角色

      await this.userRoleRepository.save(userRole);
      console.log(`用户 ${userId} 已分配普通用户角色(role_id=2)`);
    } catch (error) {
      console.error('为用户添加角色时出错:', error);
      throw new Error(`分配用户角色失败: ${error.message}`);
    }
  }

  /**
   * 更新用户
   */
  async update(id: number, user: Partial<User>): Promise<User> {
    if (user.password) {
      user.password = await bcrypt.hash(user.password, 10);
    }
    await this.userRepository.update(id, user);
    return this.findById(id);
  }

  /**
   * 获取用户角色列表
   */
  async getUserRoles(userId: number): Promise<Role[]> {
    this.logger.log(`获取用户角色, 用户ID: ${userId}`);

    // 查找用户-角色关联
    const userRoles = await this.userRoleRepository.find({
      where: { userId },
    });

    if (!userRoles || userRoles.length === 0) {
      this.logger.warn(`未找到用户ID ${userId} 的角色关联记录`);

      // 检查数据库中是否有任何用户角色关联
      const totalUserRoles = await this.userRoleRepository.count();
      this.logger.log(`数据库中共有 ${totalUserRoles} 条用户角色关联记录`);

      return [];
    }

    this.logger.log(`找到 ${userRoles.length} 条用户角色关联记录: ${JSON.stringify(userRoles)}`);

    // 获取角色ID
    const roleIds = userRoles.map((ur) => ur.roleId);
    this.logger.log(`用户 ${userId} 的角色IDs: ${roleIds.join(', ')}`);

    // 查询角色信息
    const roles = await this.roleRepository.find({
      where: { id: In(roleIds) },
    });

    this.logger.log(`查询到 ${roles.length} 个角色信息`);
    roles.forEach((role) => {
      this.logger.log(`- 角色: ${role.roleName} (ID: ${role.id})`);
    });

    return roles;
  }

  /**
   * 获取用户权限列表
   */
  async getUserPermissions(userId: number): Promise<string[]> {
    // 首先获取用户角色
    const userRoles = await this.userRoleRepository.find({
      where: { userId },
    });

    if (!userRoles || userRoles.length === 0) {
      return [];
    }

    const roleIds = userRoles.map((ur) => ur.roleId);

    // 查询这些角色所拥有的菜单ID
    const roleMenus = await this.roleMenuRepository.find({
      where: { roleId: In(roleIds) },
    });

    if (!roleMenus || roleMenus.length === 0) {
      return [];
    }

    // 获取菜单ID
    const menuIds = roleMenus.map((rm) => rm.menuId);

    // 查询菜单信息
    const menus = await this.menuRepository.find({
      where: { id: In(menuIds) },
    });

    // 提取权限标识
    const permissions = menus
      .map((menu) => menu.perms)
      .filter((perms) => perms) // 过滤空值
      .flatMap((perms) => perms.split(','))
      .filter((value, index, self) => self.indexOf(value) === index); // 去重

    return permissions;
  }

  /**
   * 获取用户菜单树
   */
  async getUserMenuTree(userId: number): Promise<any[]> {
    this.logger.log(`获取用户菜单树, 用户ID: ${userId}`);

    // 获取用户角色
    const userRoles = await this.userRoleRepository.find({
      where: { userId },
    });

    if (!userRoles || userRoles.length === 0) {
      this.logger.warn(`未找到用户ID ${userId} 的角色关联记录`);
      return [];
    }

    const roleIds = userRoles.map((ur) => ur.roleId);
    this.logger.log(`用户角色IDs: ${roleIds.join(', ')}`);

    // 查询这些角色所拥有的菜单ID
    const roleMenus = await this.roleMenuRepository.find({
      where: { roleId: In(roleIds) },
    });

    if (!roleMenus || roleMenus.length === 0) {
      this.logger.warn(`未找到角色IDs ${roleIds.join(', ')} 的菜单关联记录`);

      // 检查数据库中是否有任何角色菜单关联
      const totalRoleMenus = await this.roleMenuRepository.count();
      this.logger.log(`数据库中共有 ${totalRoleMenus} 条角色菜单关联记录`);

      // 随机取几条角色菜单关联记录作为样本
      if (totalRoleMenus > 0) {
        const sampleRoleMenus = await this.roleMenuRepository.find({ take: 5 });
        this.logger.log(`角色菜单关联样本: ${JSON.stringify(sampleRoleMenus)}`);
      }

      return [];
    }

    // 获取菜单ID
    const menuIds = roleMenus.map((rm) => rm.menuId);
    this.logger.log(`找到 ${menuIds.length} 个菜单ID`);

    // 查询菜单信息 - 只查询类型为M(目录)和C(菜单)的项，排除B(按钮)类型
    // 并且排除hidden=1的菜单项
    const menus = await this.menuRepository.find({
      where: {
        id: In(menuIds),
        type: In(['M', 'C']), // 仅查询目录和菜单类型
      },
      order: { parentId: 'ASC', orderNum: 'ASC' },
    });
    this.logger.log(`查询到 ${menus.length} 个菜单项(仅目录和菜单)`);

    // 构建菜单树
    return this.buildMenuTree(menus);
  }

  /**
   * 构建菜单树
   */
  private buildMenuTree(menus: Menu[]): any[] {
    console.log('UserService.buildMenuTree - 开始构建菜单树，菜单数量:', menus.length);

    const result = [];
    const map = {};

    // 创建映射
    menus.forEach((menu) => {
      // 创建新对象避免修改原始实体，并使用类型断言
      const menuItem: any = {
        ...menu,
        children: [],
        // 确保前端属性名称一致
        hidden: menu.isHidden === 1 ? true : false,
      };

      // 添加前端路由需要的额外属性
      if (menu.type === 'M') {
        // 目录类型
        menuItem.redirect = 'noRedirect';
        menuItem.alwaysShow = true;
      }

      map[menu.id] = menuItem;
    });

    // 构建树结构
    menus.forEach((menu) => {
      if (menu.parentId === 0) {
        // 根菜单
        result.push(map[menu.id]);
      } else {
        // 子菜单
        if (map[menu.parentId]) {
          map[menu.parentId].children.push(map[menu.id]);
        } else {
          console.log(
            `警告: 菜单 ${menu.menuName}(ID=${menu.id}) 的父菜单 ID=${menu.parentId} 不存在`,
          );
        }
      }
    });

    console.log('UserService.buildMenuTree - 完成构建，根菜单数量:', result.length);
    // 打印菜单结构用于调试
    result.forEach((menu) => {
      console.log(`- ${menu.menuName} (ID=${menu.id}, ${menu.children.length}个子菜单)`);
      menu.children.forEach((child) => {
        console.log(`  * ${child.menuName} (ID=${child.id})`);
      });
    });

    return result;
  }

  /**
   * 获取用户角色列表选项
   */
  async getUserRoleOptions(): Promise<any[]> {
    try {
      // 查找所有可用的角色
      const roles = await this.roleRepository.find({
        where: { isDisable: 0 },
        order: { createTime: 'DESC' },
      });

      // 格式化为前端需要的数据格式
      return roles.map((role) => ({
        id: role.id,
        roleName: role.roleName,
        roleLabel: role.roleName, // 使用roleName作为roleLabel
      }));
    } catch (error) {
      console.error('获取角色选项失败:', error);
      throw new Error('获取角色选项失败');
    }
  }

  /**
   * 为用户分配角色
   * @param userId 用户ID
   * @param roleIds 角色ID数组
   */
  async assignUserRoles(userId: number, roleIds: number[]): Promise<void> {
    try {
      // 检查用户是否存在
      const user = await this.findById(userId);
      if (!user) {
        throw new Error(`用户ID ${userId} 不存在`);
      }

      console.log(`为用户ID ${userId} 分配角色: ${roleIds.join(',')}`);

      // 删除用户当前所有角色
      await this.userRoleRepository.delete({ userId });

      // 如果没有角色要分配，直接返回
      if (!roleIds || roleIds.length === 0) {
        return;
      }

      // 添加新的用户角色关联
      const userRoles = roleIds.map((roleId) =>
        this.userRoleRepository.create({
          userId,
          roleId,
        }),
      );

      // 保存用户角色关联
      await this.userRoleRepository.save(userRoles);
      console.log(`用户 ${userId} 的角色已更新`);
    } catch (error) {
      console.error('为用户分配角色失败:', error);
      throw error;
    }
  }

  /**
   * 查询用户拥有的角色ID列表
   * @param userId 用户ID
   */
  async getUserRoleIds(userId: number): Promise<number[]> {
    try {
      // 检查用户是否存在
      const user = await this.findById(userId);
      if (!user) {
        throw new Error(`用户ID ${userId} 不存在`);
      }

      // 查询用户角色关联
      const userRoles = await this.userRoleRepository.find({ where: { userId } });

      // 返回角色ID列表
      return userRoles.map((ur) => Number(ur.roleId));
    } catch (error) {
      console.error('获取用户角色ID列表失败:', error);
      throw error;
    }
  }

  /**
   * 更新用户头像
   * @param userId 用户ID
   * @param file 头像文件
   * @returns 头像URL
   */
  async updateUserAvatar(userId: number, file: Express.Multer.File): Promise<string> {
    console.log(`更新用户头像，用户ID: ${userId}`);

    // 查询用户
    const user = await this.findById(userId);
    if (!user) {
      throw new Error('用户不存在');
    }

    try {
      // 上传头像文件，使用avatar类型
      const result = await this.uploadService.uploadFile(file, 'avatar');

      // 更新用户头像
      await this.userRepository.update(userId, { avatar: result.url });

      console.log(`用户 ${userId} 头像更新成功: ${result.url}`);

      // 返回新头像URL
      return result.url;
    } catch (error) {
      console.error(`更新用户头像失败: ${error.message}`, error);
      throw new Error(`更新头像失败: ${error.message}`);
    }
  }

  /**
   * 修改用户状态（启用/禁用）
   * @param userId 用户ID
   * @param isDisable 是否禁用 (0启用 1禁用)
   */
  async changeUserStatus(userId: number, isDisable: number): Promise<void> {
    try {
      console.log(`修改用户状态，用户ID: ${userId}, 状态: ${isDisable}`);

      // 检查用户是否存在
      const user = await this.findById(userId);
      if (!user) {
        throw new Error(`用户ID ${userId} 不存在`);
      }

      // 如果是管理员用户，不允许禁用
      if (user.username === 'admin' && isDisable === 1) {
        throw new Error('不能禁用系统管理员账号');
      }

      // 更新用户状态
      await this.userRepository.update(userId, { isDisable });
      console.log(`用户 ${userId} 状态已更新为: ${isDisable === 1 ? '禁用' : '启用'}`);
    } catch (error) {
      console.error('修改用户状态失败:', error);
      throw error;
    }
  }

  /**
   * 分页查询用户列表
   * @param pageNum 当前页码
   * @param pageSize 每页大小
   * @param username 用户名（可选）
   * @param nickname 昵称（可选）
   * @param email 邮箱（可选）
   * @param loginType 登录方式（可选）
   * @param isDisable 是否禁用（可选）
   */
  async getUserList(
    pageNum: number = 1,
    pageSize: number = 10,
    username?: string,
    nickname?: string,
    email?: string,
    loginType?: number,
    isDisable?: number,
  ): Promise<{ recordList: any[]; total: number }> {
    try {
      console.log('查询用户列表，参数:', {
        pageNum,
        pageSize,
        username,
        nickname,
        email,
        loginType,
        isDisable,
      });

      // 构建查询条件
      const queryBuilder = this.userRepository.createQueryBuilder('user');

      // 添加WHERE条件
      if (username) {
        queryBuilder.andWhere('user.username LIKE :username', { username: `%${username}%` });
      }
      if (nickname) {
        queryBuilder.andWhere('user.nickname LIKE :nickname', { nickname: `%${nickname}%` });
      }
      if (email) {
        queryBuilder.andWhere('user.email LIKE :email', { email: `%${email}%` });
      }
      if (loginType !== undefined) {
        queryBuilder.andWhere('user.loginType = :loginType', { loginType });
      }
      if (isDisable !== undefined) {
        queryBuilder.andWhere('user.isDisable = :isDisable', { isDisable });
      }

      // 设置排序
      queryBuilder.orderBy('user.createTime', 'DESC');

      // 获取总数
      const total = await queryBuilder.getCount();

      // 分页查询
      const list = await queryBuilder
        .skip((pageNum - 1) * pageSize)
        .take(pageSize)
        .select([
          'user.id',
          'user.username',
          'user.nickname',
          'user.avatar',
          'user.email',
          'user.webSite',
          'user.intro',
          'user.loginType',
          'user.isDisable',
          'user.ipAddress',
          'user.ipSource',
          'user.loginTime',
          'user.createTime',
          'user.updateTime',
        ])
        .getMany();

      console.log(`查询到用户列表: ${list.length}条，总数: ${total}`);

      // 格式化返回结果
      const formattedList = list.map((user) => ({
        ...user,
        avatar: user.avatar || '',
        webSite: user.webSite || '',
        intro: user.intro || '',
        email: user.email || '',
        ipAddress: user.ipAddress || '',
        ipSource: user.ipSource || '',
      }));

      return { recordList: formattedList, total };
    } catch (error) {
      console.error('获取用户列表失败:', error);
      throw new Error('获取用户列表失败: ' + error.message);
    }
  }

  /**
   * 更新用户登录信息
   * @param userId 用户ID
   * @param req 请求对象
   */
  async updateLoginInfo(userId: number, req?: any): Promise<void> {
    if (!userId || !req) return;

    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) return;

      // 提取IP地址
      let ipAddress = req.ip;
      if (req.headers && req.headers['x-forwarded-for']) {
        const forwardedIps = req.headers['x-forwarded-for'].split(',');
        ipAddress = forwardedIps[0].trim();
      }

      // 更新用户登录信息
      user.ipAddress = ipAddress || user.ipAddress;
      user.loginTime = new Date();

      // 获取IP来源
      try {
        const { IPUtil } = await import('../../common/utils/ip.util');
        if (ipAddress) {
          user.ipSource = await IPUtil.getIpSource(ipAddress);
        }
      } catch (error) {
        console.error('获取IP来源失败:', error);
      }

      await this.userRepository.save(user);
    } catch (error) {
      console.error('更新用户登录信息失败:', error);
    }
  }

  /**
   * 根据第三方登录信息查找用户
   * @param sourceId 第三方平台用户标识
   * @param loginType 登录类型 (1邮箱 2QQ 3Gitee 4Github)
   */
  async findUserByOauth(sourceId: string, loginType: number): Promise<User | null> {
    try {
      // 构建查询条件
      let query = {};

      // 根据登录类型和外部ID构建查询条件
      if (loginType === 2) {
        // QQ
        query = { qqOpenId: sourceId, loginType };
      } else if (loginType === 3) {
        // Gitee
        query = { giteeOpenId: sourceId, loginType };
      } else if (loginType === 4) {
        // GitHub
        query = { githubOpenId: sourceId, loginType };
      } else {
        return null;
      }

      // 查询用户
      return await this.userRepository.findOne({ where: query });
    } catch (error) {
      console.error('根据第三方登录信息查找用户失败:', error);
      return null;
    }
  }

  /**
   * 从第三方登录信息创建用户
   * @param oauthInfo 第三方用户信息
   */
  async createUserFromOauth(oauthInfo: {
    username: string;
    nickname: string;
    avatar: string;
    email: string;
    loginType: number;
    sourceId: string;
  }): Promise<User> {
    try {
      // 检查用户名是否已存在，如果存在则添加随机后缀
      let uniqueUsername = oauthInfo.username;
      let isUsernameUnique = false;
      let attemptCount = 0;

      while (!isUsernameUnique && attemptCount < 5) {
        const existingUser = await this.userRepository.findOne({
          where: { username: uniqueUsername },
        });
        if (!existingUser) {
          isUsernameUnique = true;
        } else {
          // 添加随机后缀
          uniqueUsername = `${oauthInfo.username}_${Math.floor(Math.random() * 10000)}`;
          attemptCount++;
        }
      }

      // 创建新用户对象
      const newUser = this.userRepository.create({
        username: uniqueUsername,
        nickname: oauthInfo.nickname,
        avatar: oauthInfo.avatar,
        email: oauthInfo.email || '',
        loginType: oauthInfo.loginType,
        password: await bcrypt.hash(Math.random().toString(36).slice(2, 10), 10), // 随机密码
        isDisable: 0,
        createTime: new Date(),
      });

      // 根据登录类型设置对应的OpenID
      if (oauthInfo.loginType === 2) {
        // QQ
        newUser.qqOpenId = oauthInfo.sourceId;
      } else if (oauthInfo.loginType === 3) {
        // Gitee
        newUser.giteeOpenId = oauthInfo.sourceId;
      } else if (oauthInfo.loginType === 4) {
        // GitHub
        newUser.githubOpenId = oauthInfo.sourceId;
      }

      // 保存用户
      const savedUser = await this.userRepository.save(newUser);

      // 为新用户添加角色
      await this.addUserRole(savedUser.id);

      return this.findById(savedUser.id);
    } catch (error) {
      console.error('创建第三方登录用户失败:', error);
      throw new Error('创建用户失败: ' + error.message);
    }
  }

  /**
   * 更新用户密码
   * @param userId 用户ID
   * @param hashedPassword 已加密的密码
   */
  async updateUserPassword(userId: number, hashedPassword: string): Promise<void> {
    try {
      // 查询用户
      const user = await this.findById(userId);
      if (!user) {
        throw new Error('用户不存在');
      }

      // 更新用户密码
      await this.userRepository.update(userId, { password: hashedPassword });
      this.logger.log(`用户 ${userId} 密码更新成功`);
    } catch (error) {
      this.logger.error(`更新用户密码失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 生成JWT令牌
   * @param user 用户对象
   */
  async generateToken(user: User): Promise<string> {
    const payload = {
      id: user.id,
      username: user.username,
      nickname: user.nickname,
    };

    const secret = this.configService.get('jwt.secret', 'blog_jwt_secret');
    const expiresIn = this.configService.get('jwt.expiresIn', '7d');

    return this.jwtService.sign(payload, {
      secret,
      expiresIn,
    });
  }

  /**
   * 创建默认管理员用户（如果不存在）
   * 在应用启动时调用
   */
  async createDefaultAdminUser(): Promise<void> {
    try {
      const adminUsername = 'admin';

      // 检查管理员用户是否已存在
      const existingAdmin = await this.userRepository.findOne({
        where: { username: adminUsername },
      });

      if (!existingAdmin) {
        this.logger.log('创建默认管理员用户...');

        // 创建管理员用户
        const adminUser = this.userRepository.create({
          username: adminUsername,
          nickname: '管理员',
          password: await bcrypt.hash('admin123', 10), // 默认密码
          email: 'admin@example.com',
          loginType: 1, // 邮箱登录
          isDisable: 0, // 启用
          createTime: new Date(),
          avatar: '',
        });

        const savedAdmin = await this.userRepository.save(adminUser);

        // 检查是否有管理员角色
        let adminRole = await this.roleRepository.findOne({
          where: { roleLabel: 'admin' },
        });

        // 如果没有管理员角色，创建一个
        if (!adminRole) {
          adminRole = this.roleRepository.create({
            roleName: '管理员',
            roleLabel: 'admin',
            roleDesc: '系统管理员，拥有所有权限',
            isDisable: 0,
            createTime: new Date(),
          });

          adminRole = await this.roleRepository.save(adminRole);
        }

        // 为管理员用户分配管理员角色
        const userRole = new UserRole();
        userRole.userId = savedAdmin.id;
        userRole.roleId = adminRole.id;
        await this.userRoleRepository.save(userRole);

        this.logger.log(`默认管理员用户创建成功，ID: ${savedAdmin.id}`);
      } else {
        this.logger.log('管理员用户已存在，无需创建');
      }
    } catch (error) {
      this.logger.error('创建默认管理员用户失败:', error.message);
    }
  }

  /**
   * 获取用户文章点赞集合
   * @param userId 用户ID
   * @returns 文章点赞ID数组
   */
  async getUserArticleLikes(userId: number): Promise<number[]> {
    try {
      const key = `${RedisConstant.USER_ARTICLE_LIKE}${userId}`;
      const likes = await this.redisService.smembers(key);
      return likes.map((id) => parseInt(id));
    } catch (error) {
      this.logger.error(`获取用户文章点赞集合失败: ${error.message}`);
      return [];
    }
  }

  /**
   * 获取用户评论点赞集合
   * @param userId 用户ID
   * @returns 评论点赞ID数组
   */
  async getUserCommentLikes(userId: number): Promise<number[]> {
    try {
      const key = `${RedisConstant.USER_COMMENT_LIKE}${userId}`;
      const likes = await this.redisService.smembers(key);
      return likes.map((id) => parseInt(id));
    } catch (error) {
      this.logger.error(`获取用户评论点赞集合失败: ${error.message}`);
      return [];
    }
  }

  /**
   * 获取用户说说点赞集合
   * @param userId 用户ID
   * @returns 说说点赞ID数组
   */
  async getUserTalkLikes(userId: number): Promise<number[]> {
    try {
      const key = `${RedisConstant.USER_TALK_LIKE}${userId}`;
      const likes = await this.redisService.smembers(key);
      return likes.map((id) => parseInt(id));
    } catch (error) {
      this.logger.error(`获取用户说说点赞集合失败: ${error.message}`);
      return [];
    }
  }

  /**
   * 获取用户追番列表
   * @param userId 用户ID
   * @returns 追番ID数组
   */
  async getUserAnimeList(userId: number): Promise<number[]> {
    try {
      const key = `${RedisConstant.USER_ANIME_COLLECTION}${userId}`;
      const animes = await this.redisService.smembers(key);
      return animes.map((id) => parseInt(id));
    } catch (error) {
      this.logger.error(`获取用户追番列表失败: ${error.message}`);
      return [];
    }
  }

  /**
   * 添加用户追番
   * @param userId 用户ID
   * @param animeId 番剧ID
   * @returns 是否成功
   */
  async addAnimeCollection(userId: number, animeId: number): Promise<boolean> {
    try {
      const key = `${RedisConstant.USER_ANIME_COLLECTION}${userId}`;

      // 添加用户追番记录
      await this.redisService.sadd(key, animeId.toString());
      return true;
    } catch (error) {
      this.logger.error(`添加用户追番失败: ${error.message}`);
      return false;
    }
  }

  /**
   * 取消用户追番
   * @param userId 用户ID
   * @param animeId 番剧ID
   * @returns 是否成功
   */
  async cancelAnimeCollection(userId: number, animeId: number): Promise<boolean> {
    try {
      const key = `${RedisConstant.USER_ANIME_COLLECTION}${userId}`;

      // 移除用户追番记录
      await this.redisService.srem(key, animeId.toString());
      return true;
    } catch (error) {
      this.logger.error(`取消用户追番失败: ${error.message}`);
      return false;
    }
  }

  /**
   * 检查用户是否已追番
   * @param userId 用户ID
   * @param animeId 番剧ID
   * @returns 是否已追番
   */
  async isAnimeCollected(userId: number, animeId: number): Promise<boolean> {
    try {
      const key = `${RedisConstant.USER_ANIME_COLLECTION}${userId}`;
      const isCollected = await this.redisService.sismember(key, animeId.toString());
      return !!isCollected;
    } catch (error) {
      this.logger.error(`检查用户是否已追番失败: ${error.message}`);
      return false;
    }
  }

  /**
   * 添加用户文章点赞
   * @param userId 用户ID
   * @param articleId 文章ID
   * @returns 点赞后的数量
   */
  async addArticleLike(userId: number, articleId: number): Promise<number> {
    const key = `${RedisConstant.USER_ARTICLE_LIKE}${userId}`;

    // 检查用户是否已经点赞过该文章
    const isLiked = await this.redisService.sismember(key, articleId.toString());

    // 如果用户已经点赞过，直接返回当前点赞数
    if (isLiked) {
      const currentLikes = await this.redisService.getHash(
        RedisConstant.ARTICLE_LIKE_COUNT,
        articleId.toString(),
      );
      return currentLikes;
    }

    // 添加用户点赞记录
    await this.redisService.sadd(key, articleId.toString());

    // 增加文章点赞数并返回新的点赞数
    return await this.redisService.hincrby(
      RedisConstant.ARTICLE_LIKE_COUNT,
      articleId.toString(),
      1,
    );
  }

  /**
   * 取消用户文章点赞
   * @param userId 用户ID
   * @param articleId 文章ID
   * @returns 取消点赞后的数量
   */
  async cancelArticleLike(userId: number, articleId: number): Promise<number> {
    const key = `${RedisConstant.USER_ARTICLE_LIKE}${userId}`;

    // 检查用户是否已经点赞过该文章
    const isLiked = await this.redisService.sismember(key, articleId.toString());

    // 如果用户没有点赞过，直接返回当前点赞数
    if (!isLiked) {
      const currentLikes = await this.redisService.getHash(
        RedisConstant.ARTICLE_LIKE_COUNT,
        articleId.toString(),
      );
      return currentLikes;
    }

    // 移除用户点赞记录
    await this.redisService.srem(key, articleId.toString());

    // 获取当前文章点赞数
    const currentLikes = await this.redisService.getHash(
      RedisConstant.ARTICLE_LIKE_COUNT,
      articleId.toString(),
    );

    // 只有当前点赞数大于0时才减少
    if (currentLikes > 0) {
      // 减少文章点赞数并返回新的点赞数
      return await this.redisService.hincrby(
        RedisConstant.ARTICLE_LIKE_COUNT,
        articleId.toString(),
        -1,
      );
    }

    return 0;
  }

  /**
   * 添加用户评论点赞
   * @param userId 用户ID
   * @param commentId 评论ID
   * @returns 点赞后的数量
   */
  async addCommentLike(userId: number, commentId: number): Promise<number> {
    const key = `${RedisConstant.USER_COMMENT_LIKE}${userId}`;

    // 检查用户是否已经点赞过该评论
    const isLiked = await this.redisService.sismember(key, commentId.toString());

    // 如果用户已经点赞过，直接返回当前点赞数
    if (isLiked) {
      const currentLikes = await this.redisService.getHash(
        RedisConstant.COMMENT_LIKE_COUNT,
        commentId.toString(),
      );
      return currentLikes;
    }

    // 添加用户点赞记录
    await this.redisService.sadd(key, commentId.toString());

    // 增加评论点赞数并返回新的点赞数
    return await this.redisService.hincrby(
      RedisConstant.COMMENT_LIKE_COUNT,
      commentId.toString(),
      1,
    );
  }

  /**
   * 取消用户评论点赞
   * @param userId 用户ID
   * @param commentId 评论ID
   * @returns 取消点赞后的数量
   */
  async cancelCommentLike(userId: number, commentId: number): Promise<number> {
    const key = `${RedisConstant.USER_COMMENT_LIKE}${userId}`;

    // 检查用户是否已经点赞过该评论
    const isLiked = await this.redisService.sismember(key, commentId.toString());

    // 如果用户没有点赞过，直接返回当前点赞数
    if (!isLiked) {
      const currentLikes = await this.redisService.getHash(
        RedisConstant.COMMENT_LIKE_COUNT,
        commentId.toString(),
      );
      return currentLikes;
    }

    // 移除用户点赞记录
    await this.redisService.srem(key, commentId.toString());

    // 获取当前评论点赞数
    const currentLikes = await this.redisService.getHash(
      RedisConstant.COMMENT_LIKE_COUNT,
      commentId.toString(),
    );

    // 只有当前点赞数大于0时才减少
    if (currentLikes > 0) {
      // 减少评论点赞数并返回新的点赞数
      return await this.redisService.hincrby(
        RedisConstant.COMMENT_LIKE_COUNT,
        commentId.toString(),
        -1,
      );
    }

    return 0;
  }

  /**
   * 添加用户说说点赞
   * @param userId 用户ID
   * @param talkId 说说ID
   * @returns 点赞后的数量
   */
  async addTalkLike(userId: number, talkId: number): Promise<number> {
    const key = `${RedisConstant.USER_TALK_LIKE}${userId}`;

    // 检查用户是否已经点赞过该说说
    const isLiked = await this.redisService.sismember(key, talkId.toString());

    // 如果用户已经点赞过，直接返回当前点赞数
    if (isLiked) {
      const currentLikes = await this.redisService.getHash(
        RedisConstant.TALK_LIKE_COUNT,
        talkId.toString(),
      );
      return currentLikes;
    }

    // 添加用户点赞记录
    await this.redisService.sadd(key, talkId.toString());

    // 增加说说点赞数并返回新的点赞数
    return await this.redisService.hincrby(RedisConstant.TALK_LIKE_COUNT, talkId.toString(), 1);
  }

  /**
   * 取消用户说说点赞
   * @param userId 用户ID
   * @param talkId 说说ID
   * @returns 取消点赞后的数量
   */
  async cancelTalkLike(userId: number, talkId: number): Promise<number> {
    const key = `${RedisConstant.USER_TALK_LIKE}${userId}`;

    // 检查用户是否已经点赞过该说说
    const isLiked = await this.redisService.sismember(key, talkId.toString());

    // 如果用户没有点赞过，直接返回当前点赞数
    if (!isLiked) {
      const currentLikes = await this.redisService.getHash(
        RedisConstant.TALK_LIKE_COUNT,
        talkId.toString(),
      );
      return currentLikes;
    }

    // 移除用户点赞记录
    await this.redisService.srem(key, talkId.toString());

    // 获取当前说说点赞数
    const currentLikes = await this.redisService.getHash(
      RedisConstant.TALK_LIKE_COUNT,
      talkId.toString(),
    );

    // 只有当前点赞数大于0时才减少
    if (currentLikes > 0) {
      // 减少说说点赞数并返回新的点赞数
      return await this.redisService.hincrby(RedisConstant.TALK_LIKE_COUNT, talkId.toString(), -1);
    }

    return 0;
  }

  /**
   * 绑定邮箱
   * @param userId 用户ID
   * @param email 邮箱
   * @returns 绑定结果
   */
  async bindEmail(userId: number, email: string): Promise<{ success: boolean; message: string }> {
    this.logger.log(`用户 ${userId} 尝试绑定邮箱 ${email}`);

    try {
      // 查找当前用户
      const currentUser = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (!currentUser) {
        this.logger.error(`用户不存在: ${userId}`);
        throw new Error('用户不存在');
      }

      // 检查邮箱是否已被其他账号使用
      const existingUser = await this.userRepository.findOne({
        where: { email },
      });

      // 如果邮箱未被使用，直接绑定
      if (!existingUser) {
        this.logger.log(`邮箱 ${email} 未被使用，直接绑定`);
        await this.userRepository.update(userId, { email });
        return { success: true, message: '绑定成功' };
      }

      // 如果当前用户已经绑定了该邮箱，直接返回成功
      if (existingUser.id === userId) {
        return { success: true, message: '邮箱已经绑定到当前账号' };
      }

      // 如果当前用户是邮箱登录，不允许绑定其他账号已使用的邮箱
      if (currentUser.loginType === 1) {
        this.logger.warn(`邮箱登录用户(${userId})尝试绑定已被使用的邮箱(${email})`);
        return { success: false, message: '该邮箱已被其他账号使用，无法绑定' };
      }

      // 如果是第三方登录用户，则合并两个账号
      if (currentUser.loginType !== 1 && existingUser.loginType === 1) {
        this.logger.log(
          `第三方登录用户(${userId})尝试绑定邮箱账号(${existingUser.id})，开始合并账号`,
        );

        // 执行账号合并
        await this.mergeUsers(existingUser.id, userId);

        return { success: true, message: '绑定成功，已合并相关账号信息' };
      }

      return { success: false, message: '邮箱绑定失败，该邮箱已被其他账号使用' };
    } catch (error) {
      this.logger.error(`绑定邮箱失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 合并用户账号
   * 将源用户(邮箱登录用户)的某些信息合并到目标用户(第三方登录用户)
   * @param sourceUserId 源用户ID(邮箱登录用户)
   * @param targetUserId 目标用户ID(第三方登录用户)
   */
  private async mergeUsers(sourceUserId: number, targetUserId: number): Promise<void> {
    this.logger.log(`开始合并用户账号: 源用户=${sourceUserId}, 目标用户=${targetUserId}`);

    try {
      // 查询源用户和目标用户
      const sourceUser = await this.userRepository.findOne({ where: { id: sourceUserId } });
      const targetUser = await this.userRepository.findOne({ where: { id: targetUserId } });

      if (!sourceUser || !targetUser) {
        throw new Error('源用户或目标用户不存在');
      }

      // 使用事务执行合并操作
      await this.userRepository.manager.transaction(async (manager) => {
        // 1. 从源用户(邮箱账号)保留的字段：password和email
        const updatedTargetUser = {
          email: sourceUser.email,
          password: sourceUser.password, // 使用邮箱账号的密码
        };

        // 2. 更新目标用户
        await manager.update(User, targetUserId, updatedTargetUser);

        // 3. 转移源用户关联的内容到目标用户 - 仅在表存在时执行
        // 获取数据库中实际存在的表
        const tables = await this.getExistingTables(manager);
        this.logger.log(`数据库中存在的相关表: ${tables.join(', ')}`);

        // 检查article_like表是否存在
        if (tables.includes('t_article_like') || tables.includes('article_like')) {
          const tableName = tables.includes('t_article_like') ? 't_article_like' : 'article_like';
          await this.transferUserLikes(
            manager,
            sourceUserId,
            targetUserId,
            tableName,
            'article_id',
          );
        } else {
          this.logger.log('文章点赞表不存在，跳过转移');
        }

        // 检查comment_like表是否存在
        if (tables.includes('t_comment_like') || tables.includes('comment_like')) {
          const tableName = tables.includes('t_comment_like') ? 't_comment_like' : 'comment_like';
          await this.transferUserLikes(
            manager,
            sourceUserId,
            targetUserId,
            tableName,
            'comment_id',
          );
        } else {
          this.logger.log('评论点赞表不存在，跳过转移');
        }

        // 检查talk_like表是否存在
        if (tables.includes('t_talk_like') || tables.includes('talk_like')) {
          const tableName = tables.includes('t_talk_like') ? 't_talk_like' : 'talk_like';
          await this.transferUserLikes(manager, sourceUserId, targetUserId, tableName, 'talk_id');
        } else {
          this.logger.log('说说点赞表不存在，跳过转移');
        }

        // 4. 禁用源用户账号
        await manager.update(User, sourceUserId, {
          isDisable: 1,
          updateTime: new Date(),
        });

        this.logger.log(`用户账号合并完成: 源用户=${sourceUserId}, 目标用户=${targetUserId}`);
      });
    } catch (error) {
      this.logger.error(`合并用户账号失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 获取数据库中实际存在的表
   * @param manager 事务管理器
   * @returns 表名数组
   */
  private async getExistingTables(manager: any): Promise<string[]> {
    try {
      // 获取当前数据库名
      const dbResult = await manager.query('SELECT DATABASE() as dbName');
      const dbName = dbResult[0].dbName;

      // 查询所有表
      const tables = await manager.query(
        `SELECT table_name FROM information_schema.tables WHERE table_schema = ?`,
        [dbName],
      );

      return tables.map((t) => t.table_name);
    } catch (error) {
      this.logger.error(`获取数据库表失败: ${error.message}`);
      return [];
    }
  }

  /**
   * 转移用户点赞记录
   * @param manager 事务管理器
   * @param sourceUserId 源用户ID
   * @param targetUserId 目标用户ID
   * @param tableName 点赞表名称
   * @param idColumnName 关联ID的列名
   */
  private async transferUserLikes(
    manager: any,
    sourceUserId: number,
    targetUserId: number,
    tableName: string,
    idColumnName: string,
  ): Promise<void> {
    try {
      // 查询源用户的点赞记录
      const sourceLikes = await manager.query(`SELECT * FROM ${tableName} WHERE user_id = ?`, [
        sourceUserId,
      ]);

      if (sourceLikes.length === 0) {
        this.logger.log(`源用户没有${tableName}记录，无需转移`);
        return;
      }

      // 查询目标用户的点赞记录，用于后续去重
      const targetLikes = await manager.query(`SELECT * FROM ${tableName} WHERE user_id = ?`, [
        targetUserId,
      ]);

      const targetLikeIds = new Set();
      targetLikes.forEach((like) => targetLikeIds.add(like[idColumnName]));

      // 转移源用户独有的点赞记录
      let transferCount = 0;
      for (const like of sourceLikes) {
        if (!targetLikeIds.has(like[idColumnName])) {
          await manager.query(`UPDATE ${tableName} SET user_id = ? WHERE id = ?`, [
            targetUserId,
            like.id,
          ]);
          transferCount++;
        }
      }

      this.logger.log(`成功转移${transferCount}条用户点赞记录: 表=${tableName}`);
    } catch (error) {
      this.logger.error(`转移用户点赞记录失败: ${error.message}`, error.stack);
      // 不抛出异常，避免因一个表失败而中断整个合并过程
    }
  }

  /**
   * 验证邮箱验证码 - 用于将邮箱与第三方登录账号绑定
   * @param userId 用户ID
   * @param email 邮箱
   * @param code 验证码
   */
  async verifyEmail(userId: number, email: string, code: string): Promise<boolean> {
    this.logger.log(`验证邮箱: userId=${userId}, email=${email}, code=${code}`);

    try {
      // 构建Redis中验证码的key
      const redisKey = `user:bind:email:code:${email}`;

      // 从Redis获取验证码
      const savedCode = await this.redisService.get(redisKey);
      this.logger.log(`Redis验证码: ${savedCode}`);

      // 验证码不存在或不匹配
      if (!savedCode || savedCode !== code) {
        this.logger.log(`验证码不匹配: 输入=${code}, 保存=${savedCode || '无'}`);
        return false;
      }

      // 验证码正确，从Redis删除验证码
      await this.redisService.del(redisKey);

      // 绑定邮箱到用户账号
      await this.bindEmailToUser(userId, email);

      return true;
    } catch (error) {
      this.logger.error(`验证邮箱失败: ${error.message}`, error.stack);
      return false;
    }
  }

  /**
   * 绑定邮箱到用户账号
   * @param userId 用户ID
   * @param email 邮箱
   * @returns 是否绑定成功
   */
  private async bindEmailToUser(userId: number, email: string): Promise<boolean> {
    try {
      // 调用已有的bindEmail方法
      const result = await this.bindEmail(userId, email);
      return result.success;
    } catch (error) {
      this.logger.error(`绑定邮箱到用户账号失败: ${error.message}`, error.stack);
      return false;
    }
  }

  /**
   * 获取用户追番列表详情
   * @param userId 用户ID
   * @returns 追番详情数组
   */
  async getUserAnimeCollectionDetail(userId: number): Promise<any[]> {
    try {
      // 1. 获取用户的追番ID列表
      const animeIds = await this.getUserAnimeList(userId);

      if (!animeIds || animeIds.length === 0) {
        return [];
      }

      // 2. 获取番剧详情
      const entityManager = this.userRepository.manager;

      // 使用IN查询一次性获取所有番剧详情
      const animeDetails = await entityManager.query(`SELECT * FROM t_anime WHERE id IN (?)`, [
        animeIds,
      ]);

      this.logger.log(`获取到${animeDetails.length}条番剧详情`);

      // 处理area关联数据
      for (const anime of animeDetails) {
        if (anime.area_id) {
          try {
            const areaResult = await entityManager.query(
              `SELECT id, name FROM t_anime_area WHERE id = ?`,
              [anime.area_id],
            );

            if (areaResult && areaResult.length > 0) {
              anime.area = {
                id: areaResult[0].id,
                name: areaResult[0].name,
              };
            }
          } catch (error) {
            this.logger.error(`获取番剧${anime.id}的地区信息失败: ${error.message}`);
          }
        }
      }

      // 转换数据库字段为驼峰命名
      const formattedAnimes = animeDetails.map((anime) => {
        return {
          id: anime.id,
          animeName: anime.anime_name,
          platform: anime.platform,
          animeId: anime.anime_id,
          animeStatus: anime.anime_status,
          watchStatus: anime.watch_status,
          cover: anime.cover,
          rating: anime.rating,
          ratingCount: anime.rating_count,
          totalEpisodes: anime.total_episodes,
          currentEpisodes: anime.current_episodes,
          description: anime.description,
          actors: anime.actors,
          areas: anime.areas,
          area: anime.area,
          subtitle: anime.subtitle,
          uname: anime.uname,
          publishTime: anime.publish_time,
          link: anime.link,
          styles: anime.styles ? JSON.parse(anime.styles) : [],
          indexShow: anime.index_show,
          weekday: anime.weekday,
          favorites: anime.favorites,
          views: anime.views,
          seriesFollow: anime.series_follow,
          details: anime.details,
          lastUpdateTime: anime.last_update_time,
          createTime: anime.create_time,
          updateTime: anime.update_time,
        };
      });

      return formattedAnimes;
    } catch (error) {
      this.logger.error(`获取用户追番列表详情失败: ${error.message}`);
      return [];
    }
  }

  /**
   * 分页获取用户追番列表详情
   * @param userId 用户ID
   * @param page 页码
   * @param limit 每页条数
   * @param sortBy 排序字段
   * @returns 分页结果和总数
   */
  async getUserAnimeCollectionPage(
    userId: number,
    page: number = 1,
    limit: number = 10,
    sortBy: string = 'rating',
  ): Promise<any> {
    try {
      // 1. 获取用户的追番ID列表
      const animeIds = await this.getUserAnimeList(userId);

      if (!animeIds || animeIds.length === 0) {
        return { list: [], total: 0 };
      }

      // 计算分页参数
      const offset = (page - 1) * limit;

      // 2. 获取番剧详情
      const entityManager = this.userRepository.manager;

      // 确定排序字段
      let orderField = 'rating';
      if (sortBy === 'publishTime') {
        orderField = 'publish_time';
      }

      // 计算总数
      const countResult = await entityManager.query(
        `SELECT COUNT(*) as total FROM t_anime WHERE id IN (?)`,
        [animeIds],
      );
      const total = parseInt(countResult[0].total);

      // 使用IN查询一次性获取所有番剧详情（带分页和排序）
      const animeDetails = await entityManager.query(
        `SELECT * FROM t_anime WHERE id IN (?) ORDER BY ${orderField} DESC LIMIT ? OFFSET ?`,
        [animeIds, limit, offset],
      );

      this.logger.log(`获取到第${page}页的${animeDetails.length}条番剧详情，总共${total}条`);

      // 处理area关联数据
      for (const anime of animeDetails) {
        if (anime.area_id) {
          try {
            const areaResult = await entityManager.query(
              `SELECT id, name FROM t_anime_area WHERE id = ?`,
              [anime.area_id],
            );

            if (areaResult && areaResult.length > 0) {
              anime.area = {
                id: areaResult[0].id,
                name: areaResult[0].name,
              };
            }
          } catch (error) {
            this.logger.error(`获取番剧${anime.id}的地区信息失败: ${error.message}`);
          }
        }
      }

      // 转换数据库字段为驼峰命名
      const formattedAnimes = animeDetails.map((anime) => {
        let styles = [];
        try {
          if (anime.styles) {
            if (typeof anime.styles === 'string') {
              styles = JSON.parse(anime.styles);
            } else if (Array.isArray(anime.styles)) {
              styles = anime.styles;
            }
          }
        } catch (error) {
          this.logger.warn(`解析番剧${anime.id}的styles字段失败: ${error.message}`);
          styles = typeof anime.styles === 'string' ? [anime.styles] : [];
        }

        return {
          id: anime.id,
          animeName: anime.anime_name,
          platform: anime.platform,
          animeId: anime.anime_id,
          animeStatus: anime.anime_status,
          watchStatus: anime.watch_status,
          cover: anime.cover,
          rating: anime.rating,
          ratingCount: anime.rating_count,
          totalEpisodes: anime.total_episodes,
          currentEpisodes: anime.current_episodes,
          description: anime.description,
          actors: anime.actors,
          areas: anime.areas,
          area: anime.area,
          subtitle: anime.subtitle,
          uname: anime.uname,
          publishTime: anime.publish_time,
          link: anime.link,
          styles: styles,
          indexShow: anime.index_show,
          weekday: anime.weekday,
          favorites: anime.favorites,
          views: anime.views,
          seriesFollow: anime.series_follow,
          details: anime.details,
          lastUpdateTime: anime.last_update_time,
          createTime: anime.create_time,
          updateTime: anime.update_time,
        };
      });

      return { list: formattedAnimes, total };
    } catch (error) {
      this.logger.error(`分页获取用户追番列表详情失败: ${error.message}`);
      return { list: [], total: 0 };
    }
  }
}
