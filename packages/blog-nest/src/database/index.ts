import { DataSource } from 'typeorm';
import { Logger } from '@nestjs/common';
import { Menu } from '../modules/user/entities/menu.entity';
import { Role } from '../modules/user/entities/role.entity';
import { RoleMenu } from '../modules/user/entities/role-menu.entity';
import { User } from '../modules/user/entities/user.entity';
import { UserRole } from '../modules/user/entities/user-role.entity';
import { SiteConfig } from '../modules/blog/entities/site-config.entity';
import { Task } from '../modules/admin/task/entities/task.entity';
import { initMenus } from './menu';
import { initRoles } from './role';
import { initRoleMenus } from './role-menu';
import { initUsers } from './user';
import { initSiteConfig } from './site-config';
import { insertTasks } from './task';

/**
 * 初始化数据库数据
 */
export async function initDatabase(dataSource: DataSource): Promise<void> {
  const logger = new Logger('DatabaseInit');
  logger.log('开始初始化数据库数据...');

  try {
    // 确保数据库连接可用
    if (!dataSource.isInitialized) {
      logger.log('数据源未初始化，正在初始化数据源...');
      await dataSource.initialize();
    }

    logger.log('数据源已就绪，开始初始化数据...');

    // 按照依赖顺序初始化数据
    logger.log('1. 开始初始化菜单数据...');
    await initMenus(dataSource.getRepository(Menu));

    logger.log('2. 开始初始化角色数据...');
    await initRoles(dataSource.getRepository(Role));

    // 在初始化角色菜单关系前验证菜单和角色数据
    const menuCount = await dataSource.getRepository(Menu).count();
    const roleCount = await dataSource.getRepository(Role).count();
    logger.log(`验证数据: 菜单数量 ${menuCount}, 角色数量 ${roleCount}`);

    logger.log('3. 开始初始化角色菜单关系数据...');
    await initRoleMenus(dataSource.getRepository(RoleMenu));

    logger.log('4. 开始初始化用户数据...');
    await initUsers(
      dataSource.getRepository(User),
      dataSource.getRepository(Role),
      dataSource.getRepository(UserRole),
    );

    logger.log('5. 开始初始化站点配置数据...');
    await initSiteConfig(dataSource.getRepository(SiteConfig));

    logger.log('6. 开始初始化定时任务数据...');
    await insertTasks(dataSource);

    // 验证最终结果
    const userCount = await dataSource.getRepository(User).count();
    const userRoleCount = await dataSource.getRepository(UserRole).count();
    const roleMenuCount = await dataSource.getRepository(RoleMenu).count();
    const siteConfigCount = await dataSource.getRepository(SiteConfig).count();
    const taskCount = await dataSource.getRepository(Task).count();

    logger.log(
      `数据库初始化完成! 统计: 菜单(${menuCount}), 角色(${roleCount}), 用户(${userCount}), 用户角色关系(${userRoleCount}), 角色菜单关系(${roleMenuCount}), 站点配置(${siteConfigCount}), 定时任务(${taskCount})`,
    );
  } catch (error) {
    logger.error('数据库初始化失败: ' + error.message);
    logger.error('错误详情:', error.stack);
    throw error;
  }
}
