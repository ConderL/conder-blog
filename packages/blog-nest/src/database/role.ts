import { Role } from '../modules/user/entities/role.entity';
import { Repository } from 'typeorm';
import { Logger } from '@nestjs/common';

/**
 * 初始化角色数据
 */
export async function initRoles(roleRepository: Repository<Role>): Promise<void> {
  const logger = new Logger('RoleInit');

  try {
    // 检查角色表是否为空
    const count = await roleRepository.count();
    if (count > 0) {
      logger.log('角色数据已存在，无需初始化');
      return;
    }

    logger.log('开始初始化角色数据...');

    // 角色数据
    const roleData = [
      {
        id: 1,
        roleName: 'admin',
        roleDesc: '管理员',
        isDisable: 0,
        createTime: new Date('2022-11-03 17:41:57'),
        updateTime: new Date('2024-11-05 17:48:19'),
      },
      {
        id: 2,
        roleName: 'user',
        roleDesc: '普通用户',
        isDisable: 0,
        createTime: new Date('2022-11-03 17:42:17'),
        updateTime: new Date('2023-03-10 23:13:11'),
      },
    ];

    // 创建和保存所有角色
    for (const role of roleData) {
      const newRole = roleRepository.create(role);
      await roleRepository.save(newRole);
    }

    logger.log(`成功初始化了 ${roleData.length} 条角色数据`);
  } catch (error) {
    logger.error('初始化角色数据失败: ' + error.message);
    throw error;
  }
}
