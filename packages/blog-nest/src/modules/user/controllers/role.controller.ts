import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RoleService } from '../services/role.service';
import { Role } from '../entities/role.entity';
import { ResultDto } from '../../../common/dtos/result.dto';

@ApiTags('角色管理')
@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  @ApiOperation({ summary: '创建角色' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async create(@Body() role: Partial<Role>): Promise<ResultDto<Role>> {
    const newRole = await this.roleService.create(role);
    return ResultDto.success(newRole);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新角色' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async update(@Param('id') id: number, @Body() role: Partial<Role>): Promise<ResultDto<Role>> {
    const updatedRole = await this.roleService.update(id, role);
    return ResultDto.success(updatedRole);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除角色' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async remove(@Param('id') id: number): Promise<ResultDto<null>> {
    await this.roleService.remove(id);
    return ResultDto.success(null);
  }

  @Get()
  @ApiOperation({ summary: '获取角色列表' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async findAll(): Promise<ResultDto<Role[]>> {
    const roles = await this.roleService.findAll();
    return ResultDto.success(roles);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取角色详情' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async findOne(@Param('id') id: number): Promise<ResultDto<Role>> {
    const role = await this.roleService.findById(id);
    return ResultDto.success(role);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: '获取用户角色' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async findUserRoles(@Param('userId') userId: number): Promise<ResultDto<Role[]>> {
    const roles = await this.roleService.findByUserId(userId);
    return ResultDto.success(roles);
  }

  @Post(':roleId/menus')
  @ApiOperation({ summary: '分配菜单权限' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async assignMenus(
    @Param('roleId') roleId: number,
    @Body() data: { menuIds: number[] },
  ): Promise<ResultDto<null>> {
    await this.roleService.assignRoleMenus(roleId, data.menuIds);
    return ResultDto.success(null);
  }

  @Post('user/:userId')
  @ApiOperation({ summary: '分配用户角色' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async assignUserRoles(
    @Param('userId') userId: number,
    @Body() data: { roleIds: number[] },
  ): Promise<ResultDto<null>> {
    await this.roleService.assignUserRoles(userId, data.roleIds);
    return ResultDto.success(null);
  }

  /**
   * 获取角色列表供下拉选择
   */
  @Get('options')
  @ApiOperation({ summary: '获取角色选项列表' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getRoleOptions(): Promise<ResultDto<any>> {
    const roles = await this.roleService.findAll();
    const options = roles.map((role) => ({
      id: role.id,
      roleName: role.roleName,
      roleLabel: role.roleLabel,
    }));
    return ResultDto.success(options);
  }
}
