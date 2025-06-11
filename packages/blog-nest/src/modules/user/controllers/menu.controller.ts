import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { MenuService } from '../services/menu.service';
import { Menu } from '../entities/menu.entity';
import { ResultDto } from '../../../common/dtos/result.dto';

@ApiTags('菜单管理')
@Controller('menus')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Post()
  @ApiOperation({ summary: '创建菜单' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async create(@Body() menu: Partial<Menu>): Promise<ResultDto<Menu>> {
    const newMenu = await this.menuService.create(menu);
    return ResultDto.success(newMenu);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新菜单' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async update(@Param('id') id: number, @Body() menu: Partial<Menu>): Promise<ResultDto<Menu>> {
    const updatedMenu = await this.menuService.update(id, menu);
    return ResultDto.success(updatedMenu);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除菜单' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async remove(@Param('id') id: number): Promise<ResultDto<null>> {
    await this.menuService.remove(id);
    return ResultDto.success(null);
  }

  @Get()
  @ApiOperation({ summary: '获取所有菜单' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async findAll(): Promise<ResultDto<Menu[]>> {
    const menus = await this.menuService.findAll();
    return ResultDto.success(menus);
  }

  @Get('tree')
  @ApiOperation({ summary: '获取菜单树' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async findTree(): Promise<ResultDto<Menu[]>> {
    const menuTree = await this.menuService.findTree();
    return ResultDto.success(menuTree);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取菜单详情' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async findOne(@Param('id') id: number): Promise<ResultDto<Menu>> {
    const menu = await this.menuService.findById(id);
    return ResultDto.success(menu);
  }

  @Post('role-menus')
  @ApiOperation({ summary: '根据角色ID获取菜单树' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async findTreeByRoleIds(@Body() data: { roleIds: number[] }): Promise<ResultDto<Menu[]>> {
    const menuTree = await this.menuService.findTreeByRoleIds(data.roleIds);
    return ResultDto.success(menuTree);
  }

  @Get('getMenuTree')
  @ApiOperation({ summary: '获取菜单树' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getMenuTree(): Promise<ResultDto<any>> {
    const menus = await this.menuService.findTree();
    return ResultDto.success(menus);
  }

  @Get('getMenuOptions')
  @ApiOperation({ summary: '获取菜单下拉选项' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getMenuOptions(): Promise<ResultDto<any>> {
    const menus = await this.menuService.findAll();
    const options = this.formatMenuOptions(menus);
    return ResultDto.success(options);
  }

  /**
   * 将菜单列表格式化为下拉选项格式
   */
  private formatMenuOptions(menus: Menu[]): any[] {
    // 先找出所有顶级菜单
    const rootMenus = menus.filter((menu) => menu.parentId === 0);

    // 格式化顶级菜单及其子菜单
    return rootMenus.map((menu) => {
      const option = {
        value: menu.id,
        label: menu.menuName,
        children: [],
      };

      // 递归添加子菜单
      this.addChildrenOptions(option, menu.id, menus);

      return option;
    });
  }

  /**
   * 递归添加子菜单选项
   */
  private addChildrenOptions(parentOption: any, parentId: number, allMenus: Menu[]): void {
    // 找出所有子菜单
    const childMenus = allMenus.filter((menu) => menu.parentId === parentId);

    childMenus.forEach((childMenu) => {
      const childOption = {
        value: childMenu.id,
        label: childMenu.menuName,
        children: [],
      };

      // 添加到父选项的children数组
      parentOption.children.push(childOption);

      // 递归处理该子菜单的子菜单
      this.addChildrenOptions(childOption, childMenu.id, allMenus);
    });

    // 如果没有子选项，删除children属性
    if (parentOption.children.length === 0) {
      delete parentOption.children;
    }
  }
}
