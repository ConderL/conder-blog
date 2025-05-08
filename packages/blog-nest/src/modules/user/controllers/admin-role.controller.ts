import { Controller, Get, Post, Body, Put, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RoleService } from '../services/role.service';
import { Role } from '../entities/role.entity';
import { Result } from '../../../common/utils/result';
import { OperationLog } from '../../../common/decorators/operation-log.decorator';
import { OperationType } from '../../../common/constants/operation-type.enum';
import { Like } from 'typeorm';

/**
 * 角色管理控制器
 */
@ApiTags('角色管理')
@Controller('admin/role')
@Roles('admin')
@ApiBearerAuth()
export class AdminRoleController {
  constructor(private readonly roleService: RoleService) {}

  /**
   * 查看角色列表
   */
  @ApiOperation({ summary: '查看角色列表' })
  @Get('list')
  async listRoles(
    @Query('current') current = 1,
    @Query('size') size = 10,
    @Query('roleName') roleName?: string,
    @Query('status') status?: number,
  ): Promise<Result<any>> {
    try {
      // 构建查询条件
      const skip = (current - 1) * size;
      const take = size;

      const condition: any = {};

      if (roleName) {
        condition.roleName = Like(`%${roleName}%`);
      }

      if (status !== undefined) {
        condition.isDisable = status === 1 ? 1 : 0;
      }

      // 查询角色列表和总数
      const [roles, total] = await this.roleService.findRolesWithPagination(condition, skip, take);

      return Result.ok({
        recordList: roles,
        current,
        size,
        count: total,
      });
    } catch (error) {
      return Result.fail(error.message);
    }
  }

  /**
   * 添加角色
   */
  @ApiOperation({ summary: '添加角色' })
  @OperationLog(OperationType.INSERT)
  @Post('add')
  async addRole(@Body() role: Partial<Role>): Promise<Result<null>> {
    try {
      // 设置创建时间
      role.createTime = new Date();
      await this.roleService.create(role);
      return Result.ok(null, '添加成功');
    } catch (error) {
      return Result.fail(error.message);
    }
  }

  /**
   * 修改角色
   */
  @ApiOperation({ summary: '修改角色' })
  @OperationLog(OperationType.UPDATE)
  @Put('update')
  async updateRole(@Body() roleData: any): Promise<Result<null>> {
    try {
      // 从请求数据中提取角色基本信息和菜单ID列表
      const { id, roleName, roleDesc, isDisable, menuIdList, ...otherProps } = roleData;

      // 角色基本信息
      const role: Partial<Role> = {
        id,
        roleName,
        roleDesc,
        isDisable,
        updateTime: new Date(),
      };

      // 更新角色基本信息
      await this.roleService.update(role.id, role);

      // 如果提供了菜单ID列表，单独更新角色菜单关联
      if (menuIdList && Array.isArray(menuIdList)) {
        await this.roleService.assignRoleMenus(role.id, menuIdList);
      }

      return Result.ok(null, '修改成功');
    } catch (error) {
      return Result.fail(error.message);
    }
  }

  /**
   * 删除角色
   */
  @ApiOperation({ summary: '删除角色' })
  @OperationLog(OperationType.DELETE)
  @Delete('delete')
  async deleteRole(@Body() roleIdList: number[]): Promise<Result<null>> {
    try {
      if (roleIdList.length === 0) {
        return Result.fail('请选择要删除的角色');
      }

      for (const roleId of roleIdList) {
        await this.roleService.remove(roleId);
      }

      return Result.ok(null, '删除成功');
    } catch (error) {
      return Result.fail(error.message);
    }
  }

  /**
   * 角色状态修改
   */
  @ApiOperation({ summary: '角色状态修改' })
  @OperationLog(OperationType.UPDATE)
  @Put('changeStatus')
  async changeStatus(@Body() data: { roleId: number; status: number }): Promise<Result<null>> {
    try {
      await this.roleService.update(data.roleId, {
        isDisable: data.status,
        updateTime: new Date(),
      });
      return Result.ok(null, '状态修改成功');
    } catch (error) {
      return Result.fail(error.message);
    }
  }

  /**
   * 查看角色的菜单权限
   */
  @ApiOperation({ summary: '查看角色的菜单权限' })
  @Get('menu/:roleId')
  async listRoleMenuTree(@Param('roleId') roleId: number): Promise<Result<number[]>> {
    try {
      const menuIds = await this.roleService.getRoleMenuIds(roleId);
      return Result.ok(menuIds);
    } catch (error) {
      return Result.fail(error.message);
    }
  }

  /**
   * 获取角色菜单列表
   */
  @ApiOperation({ summary: '获取角色菜单列表' })
  @Get('roleMenuIds/:roleId')
  async getRoleMenuIds(@Param('roleId') roleId: number): Promise<Result<number[]>> {
    try {
      const menuIds = await this.roleService.getRoleMenuIds(roleId);
      return Result.ok(menuIds);
    } catch (error) {
      return Result.fail(error.message);
    }
  }

  /**
   * 分配角色菜单权限
   */
  @ApiOperation({ summary: '分配角色菜单权限' })
  @OperationLog(OperationType.GRANT)
  @Post('assignMenu')
  async assignMenus(@Body() data: { roleId: number; menuIds: number[] }): Promise<Result<null>> {
    try {
      await this.roleService.assignRoleMenus(data.roleId, data.menuIds);
      return Result.ok(null, '分配成功');
    } catch (error) {
      return Result.fail(error.message);
    }
  }
}
