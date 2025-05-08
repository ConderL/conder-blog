import { RoleMenu } from '../modules/user/entities/role-menu.entity';
import { Repository } from 'typeorm';
import { Logger } from '@nestjs/common';

/**
 * 初始化角色菜单关系数据
 */
export async function initRoleMenus(roleMenuRepository: Repository<RoleMenu>): Promise<void> {
  const logger = new Logger('RoleMenuInit');

  try {
    // 检查角色菜单关系表是否为空
    const count = await roleMenuRepository.count();
    if (count > 0) {
      logger.log('角色菜单关系数据已存在，无需初始化');
      return;
    }

    logger.log('开始初始化角色菜单关系数据...');

    // 角色菜单关系数据 (按照角色分组)
    const roleMenuData = {
      // 管理员角色 (roleId: 1) 的菜单权限 - 拥有所有权限
      1: new Array(133).fill(null).map((_, i) => i + 1),

      // 普通用户角色 (roleId: 2) 的菜单权限
      2: [
        1, 3, 4, 11, 12, 13, 14, 21, 22, 23, 26, 27, 34, 35, 36, 37, 38, 46, 51, 52, 53, 57, 61, 65,
        73, 88, 93, 95, 96, 97, 98, 99, 102, 103, 104, 108, 111, 123,
      ],
    };

    // 批量创建和保存
    const entities = [];
    let totalRelations = 0;

    // 确保使用数字类型的roleId
    for (const roleId in roleMenuData) {
      const numericRoleId = parseInt(roleId);
      const menuIds = roleMenuData[roleId];

      logger.log(`为角色ID ${numericRoleId} 创建 ${menuIds.length} 个菜单权限`);

      for (const menuId of menuIds) {
        const roleMenu = new RoleMenu();
        roleMenu.roleId = numericRoleId;
        roleMenu.menuId = menuId;
        entities.push(roleMenu);
        totalRelations++;
      }
    }

    // 分批保存，防止数据过多导致超时
    const batchSize = 100;
    for (let i = 0; i < entities.length; i += batchSize) {
      const batch = entities.slice(i, i + batchSize);
      await roleMenuRepository.save(batch);
      logger.log(`已保存 ${i + batch.length}/${entities.length} 条角色菜单关系数据`);
    }

    logger.log(`成功初始化了 ${totalRelations} 条角色菜单关系数据`);
  } catch (error) {
    logger.error('初始化角色菜单关系数据失败: ' + error.message);
    throw error;
  }
}
