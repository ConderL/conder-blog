import { User } from '../modules/user/entities/user.entity';
import { Role } from '../modules/user/entities/role.entity';
import { UserRole } from '../modules/user/entities/user-role.entity';
import { Repository } from 'typeorm';
import { Logger } from '@nestjs/common';

/**
 * 初始化用户数据
 */
export async function initUsers(
  userRepository: Repository<User>,
  roleRepository: Repository<Role>,
  userRoleRepository: Repository<UserRole>,
): Promise<void> {
  const logger = new Logger('UserInit');

  try {
    // 检查用户表是否为空
    const userCount = await userRepository.count();
    if (userCount > 0) {
      logger.log('用户数据已存在，无需初始化');
    } else {
      logger.log('开始初始化用户数据...');

      // 创建管理员用户
      const adminUser = userRepository.create({
        id: 1,
        username: 'admin',
        nickname: '管理员',
        password: `$2a$10$NCVrAeuE986SgNz.UUkwneY/.hMRdL8vYbu/EBPee74NIMhb30O5u`, // 默认密码
        email: 'admin@example.com',
        loginType: 1, // 邮箱登录
        isDisable: 0, // 启用
        createTime: new Date(),
        avatar: 'http://img.conder.top/config/avatar.jpg',
      });

      // 创建普通用户
      const normalUser = userRepository.create({
        id: 2,
        username: 'user',
        nickname: '普通用户',
        password: `$2a$10$YhZbiLbDnk5MR.ZIVX9weeSBW4rwEafJcTMDdTPUiucmcWI03PPsy`,
        email: 'user@example.com',
        loginType: 1, // 邮箱登录
        isDisable: 0, // 启用
        createTime: new Date(),
        avatar: 'http://img.conder.top/config/default_avatar.jpg',
      });

      // 保存管理员用户
      const savedAdmin = await userRepository.save(adminUser);
      logger.log(`管理员用户创建成功，ID: ${savedAdmin.id}`);

      // 保存普通用户
      const savedNormalUser = await userRepository.save(normalUser);
      logger.log(`普通用户创建成功，ID: ${savedNormalUser.id}`);
    }

    // 检查用户角色关联表是否为空
    const userRoleCount = await userRoleRepository.count();
    if (userRoleCount > 0) {
      logger.log('用户角色关联数据已存在，无需初始化');
      return;
    }

    logger.log('开始初始化用户角色关联数据...');

    // 使用直接SQL插入指定ID的记录
    try {
      // 插入ID为54的管理员用户-角色关联 (用户ID=1, 角色ID=1)
      await userRoleRepository.query(
        `INSERT INTO t_user_role (id, user_id, role_id) VALUES (?, ?, ?)`,
        [54, 1, 1],
      );
      logger.log('成功创建管理员用户角色关联记录(ID=54, userId=1, roleId=1)');

      // 插入普通用户角色关联 (用户ID=2, 角色ID=2)
      await userRoleRepository.query(
        `INSERT INTO t_user_role (id, user_id, role_id) VALUES (?, ?, ?)`,
        [55, 2, 2],
      );
      logger.log('成功创建普通用户角色关联记录(ID=55, userId=2, roleId=2)');

      // 插入ID为50的用户角色关联 (用户ID=3, 角色ID=3)
      await userRoleRepository.query(
        `INSERT INTO t_user_role (id, user_id, role_id) VALUES (?, ?, ?)`,
        [50, 3, 3],
      );
      logger.log('成功创建用户角色关联记录(ID=50, userId=3, roleId=3)');

      // 验证插入结果
      const allUserRoles = await userRoleRepository.find();
      logger.log(`用户角色关联表现有 ${allUserRoles.length} 条记录`);
      logger.log(`用户角色关联记录: ${JSON.stringify(allUserRoles)}`);
    } catch (error) {
      logger.error(`初始化用户角色关联失败: ${error.message}`);
      logger.error('错误堆栈:', error.stack);
    }

    logger.log('用户角色关联初始化完成');
  } catch (error) {
    logger.error('初始化用户数据失败: ' + error.message);
    logger.error('错误堆栈:', error.stack);
    throw error;
  }
}
