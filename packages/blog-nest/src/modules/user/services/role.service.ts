import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Role } from '../entities/role.entity';
import { UserRole } from '../entities/user-role.entity';
import { RoleMenu } from '../entities/role-menu.entity';

@Injectable()
export class RoleService {
  private readonly logger = new Logger(RoleService.name);

  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
    @InjectRepository(RoleMenu)
    private readonly roleMenuRepository: Repository<RoleMenu>,
  ) {}

  /**
   * 创建角色
   */
  async create(role: Partial<Role>): Promise<Role> {
    // 检查角色名是否已存在
    const existingRole = await this.roleRepository.findOne({ where: { roleName: role.roleName } });
    if (existingRole) {
      throw new Error(`角色名 ${role.roleName} 已存在`);
    }

    const newRole = this.roleRepository.create(role);
    const savedRole = await this.roleRepository.save(newRole);

    // 如果有菜单权限，保存菜单关联
    if (role['menuIds'] && Array.isArray(role['menuIds']) && role['menuIds'].length > 0) {
      await this.assignRoleMenus(savedRole.id, role['menuIds']);
    }

    return savedRole;
  }

  /**
   * 更新角色
   */
  async update(id: number, role: Partial<Role>): Promise<Role> {
    // 检查角色是否存在
    const existingRole = await this.findById(id);
    if (!existingRole) {
      throw new Error(`角色ID ${id} 不存在`);
    }

    // 如果更改了角色名，检查是否与其他角色冲突
    if (role.roleName && role.roleName !== existingRole.roleName) {
      const duplicateRole = await this.roleRepository.findOne({
        where: { roleName: role.roleName },
      });

      if (duplicateRole && duplicateRole.id !== id) {
        throw new Error(`角色名 ${role.roleName} 已存在`);
      }
    }

    // 更新角色
    await this.roleRepository.update(id, role);

    return this.findById(id);
  }

  /**
   * 删除角色
   */
  async remove(id: number): Promise<void> {
    // 检查角色是否存在
    const role = await this.findById(id);
    if (!role) {
      throw new Error(`角色ID ${id} 不存在`);
    }

    // 检查是否是管理员角色
    if (role.roleName === 'admin') {
      throw new Error('不允许删除管理员角色');
    }

    // 检查角色是否已分配给用户
    const userCount = await this.userRoleRepository.count({ where: { roleId: id } });
    if (userCount > 0) {
      throw new Error('该角色已分配给用户，无法删除');
    }

    // 删除角色与用户的关联
    await this.userRoleRepository.delete({ roleId: id });
    // 删除角色与菜单的关联
    await this.roleMenuRepository.delete({ roleId: id });
    // 删除角色
    await this.roleRepository.delete(id);

    this.logger.log(`角色 ${role.roleName}(ID: ${id}) 已删除`);
  }

  /**
   * 获取所有角色
   */
  async findAll(): Promise<Role[]> {
    return this.roleRepository.find({
      order: { createTime: 'DESC' },
    });
  }

  /**
   * 根据ID获取角色
   */
  async findById(id: number): Promise<Role> {
    return this.roleRepository.findOne({ where: { id } });
  }

  /**
   * 根据用户ID获取角色
   */
  async findByUserId(userId: number): Promise<Role[]> {
    const userRoles = await this.userRoleRepository.find({ where: { userId } });
    const roleIds = userRoles.map((ur) => ur.roleId);
    if (roleIds.length === 0) return [];
    return this.roleRepository.find({ where: { id: In(roleIds) } });
  }

  /**
   * 分配角色菜单权限
   */
  async assignRoleMenus(roleId: number, menuIds: number[]): Promise<void> {
    this.logger.log(`为角色ID ${roleId} 分配菜单权限: ${menuIds.join(',')}`);

    // 先删除该角色的所有菜单关联
    await this.roleMenuRepository.delete({ roleId });

    // 没有菜单权限，直接返回
    if (menuIds.length === 0) return;

    // 创建新的角色菜单关联
    const roleMenus = menuIds.map((menuId) => {
      return this.roleMenuRepository.create({ roleId, menuId });
    });

    // 批量保存
    await this.roleMenuRepository.save(roleMenus);

    this.logger.log(`角色ID ${roleId} 的菜单权限已更新`);
  }

  /**
   * 为用户分配角色
   */
  async assignUserRoles(userId: number, roleIds: number[]): Promise<void> {
    this.logger.log(`为用户ID ${userId} 分配角色: ${roleIds.join(',')}`);

    // 先删除用户原有角色
    await this.userRoleRepository.delete({ userId });

    // 添加新角色
    const userRoles = roleIds.map((roleId) => ({
      userId,
      roleId,
    }));

    if (userRoles.length > 0) {
      await this.userRoleRepository.insert(userRoles);
    }

    this.logger.log(`用户ID ${userId} 的角色已更新`);
  }

  /**
   * 分页查询角色列表
   */
  async findRolesWithPagination(
    condition: any,
    skip: number,
    take: number,
  ): Promise<[Role[], number]> {
    return this.roleRepository.findAndCount({
      where: condition,
      order: { createTime: 'DESC' },
      skip,
      take,
    });
  }

  /**
   * 获取角色菜单ID列表
   */
  async getRoleMenuIds(roleId: number): Promise<number[]> {
    // 检查角色是否存在
    const role = await this.findById(roleId);
    if (!role) {
      throw new Error(`角色ID ${roleId} 不存在`);
    }

    const roleMenus = await this.roleMenuRepository.find({ where: { roleId } });
    return roleMenus.map((rm) => rm.menuId);
  }
}
