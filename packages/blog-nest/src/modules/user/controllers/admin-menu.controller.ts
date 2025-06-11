import { Controller, Get, Post, Body, Put, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../../common/decorators/roles.decorator';
import { MenuService } from '../services/menu.service';
import { Menu } from '../entities/menu.entity';
import { Result } from '../../../common/utils/result';
import { OperationLog } from '../../../common/decorators/operation-log.decorator';
import { OperationType } from '../../../common/constants/operation-type.enum';
import { Like } from 'typeorm';
import { CreateMenuDto, UpdateMenuDto } from '../dto/menu.dto';

/**
 * 菜单管理控制器
 */
@ApiTags('菜单管理')
@Controller('admin/menu')
@Roles('admin')
@ApiBearerAuth()
export class AdminMenuController {
  constructor(private readonly menuService: MenuService) {}

  /**
   * 查看菜单列表
   */
  @ApiOperation({ summary: '查看菜单列表' })
  @Get('list')
  async listMenu(
    @Query('menuName') menuName?: string,
    @Query('status') status?: number,
  ): Promise<Result<Menu[]>> {
    try {
      const condition: any = {};

      if (menuName) {
        condition.menuName = Like(`%${menuName}%`);
      }

      if (status !== undefined && status !== null && !isNaN(status)) {
        condition.isDisable = status;
      }

      let menus = await this.menuService.findAllWithCondition(condition);

      // 构建菜单树
      if (!menuName && status === undefined) {
        menus = this.buildMenuTree(menus, 0);
      }

      return Result.ok(menus);
    } catch (error) {
      return Result.fail(error.message);
    }
  }

  /**
   * 添加菜单
   */
  @ApiOperation({ summary: '添加菜单' })
  @OperationLog(OperationType.INSERT)
  @Post('add')
  async addMenu(@Body() menuDto: CreateMenuDto): Promise<Result<null>> {
    try {
      // 将DTO转换为实体
      const menu: Partial<Menu> = menuDto;
      await this.menuService.create(menu);
      return Result.ok(null, '添加成功');
    } catch (error) {
      return Result.fail(error.message);
    }
  }

  /**
   * 修改菜单
   */
  @ApiOperation({ summary: '修改菜单' })
  @OperationLog(OperationType.UPDATE)
  @Put('update')
  async updateMenu(@Body() menuDto: UpdateMenuDto): Promise<Result<null>> {
    try {
      // 将DTO转换为实体
      const menu: Partial<Menu> = menuDto;
      await this.menuService.update(menu.id, menu);
      return Result.ok(null, '修改成功');
    } catch (error) {
      return Result.fail(error.message);
    }
  }

  /**
   * 删除菜单
   */
  @ApiOperation({ summary: '删除菜单' })
  @OperationLog(OperationType.DELETE)
  @Delete('delete/:menuId')
  async deleteMenu(@Param('menuId') menuId: number): Promise<Result<null>> {
    try {
      await this.menuService.remove(menuId);
      return Result.ok(null, '删除成功');
    } catch (error) {
      return Result.fail(error.message);
    }
  }

  /**
   * 获取菜单下拉树
   */
  @ApiOperation({ summary: '获取菜单下拉树' })
  @Get('getMenuTree')
  async listMenuTree(): Promise<Result<any[]>> {
    try {
      const menus = await this.menuService.findAll();
      const menuTree = this.buildMenuTreeDTO(menus);
      return Result.ok(menuTree);
    } catch (error) {
      return Result.fail(error.message);
    }
  }

  /**
   * 获取菜单选项树
   */
  @ApiOperation({ summary: '获取菜单选项树' })
  @Get('getMenuOptions')
  async listMenuOption(): Promise<Result<any[]>> {
    try {
      const menus = await this.menuService.findAll();
      const menuOptions = this.buildMenuOptions(menus);
      return Result.ok(menuOptions);
    } catch (error) {
      return Result.fail(error.message);
    }
  }

  /**
   * 编辑菜单
   */
  @ApiOperation({ summary: '编辑菜单' })
  @Get('edit/:menuId')
  async editMenu(@Param('menuId') menuId: number): Promise<Result<Menu>> {
    try {
      const menu = await this.menuService.findById(menuId);
      return Result.ok(menu);
    } catch (error) {
      return Result.fail(error.message);
    }
  }

  /**
   * 构建菜单树
   */
  private buildMenuTree(menus: Menu[], parentId: number): Menu[] {
    const result: Menu[] = [];

    menus.forEach((menu) => {
      if (menu.parentId === parentId) {
        const children = this.buildMenuTree(menus, menu.id);
        if (children.length > 0) {
          (menu as any).children = children;
        }
        result.push(menu);
      }
    });

    return result.sort((a, b) => a.orderNum - b.orderNum);
  }

  /**
   * 构建菜单树DTO
   */
  private buildMenuTreeDTO(menus: Menu[]): any[] {
    const result: any[] = [];

    // 找出所有顶级菜单
    const rootMenus = menus.filter((menu) => menu.parentId === 0);

    rootMenus.forEach((menu) => {
      const treeNode = {
        id: menu.id,
        label: menu.menuName,
        children: this.getChildren(menu.id, menus),
      };

      result.push(treeNode);
    });

    return result;
  }

  /**
   * 递归获取子菜单
   */
  private getChildren(parentId: number, menus: Menu[]): any[] {
    const children: any[] = [];

    menus.forEach((menu) => {
      if (menu.parentId === parentId) {
        const childNode = {
          id: menu.id,
          label: menu.menuName,
          children: this.getChildren(menu.id, menus),
        };

        if (childNode.children.length === 0) {
          delete childNode.children;
        }

        children.push(childNode);
      }
    });

    return children.sort((a, b) => a.orderNum - b.orderNum);
  }

  /**
   * 构建菜单选项
   */
  private buildMenuOptions(menus: Menu[]): any[] {
    const result: any[] = [];

    // 找出所有顶级菜单
    const rootMenus = menus.filter((menu) => menu.parentId === 0);

    rootMenus.forEach((menu) => {
      const option = {
        value: menu.id,
        label: menu.menuName,
        children: this.getOptions(menu.id, menus),
      };

      if (option.children.length === 0) {
        delete option.children;
      }

      result.push(option);
    });

    return result;
  }

  /**
   * 递归获取子菜单选项
   */
  private getOptions(parentId: number, menus: Menu[]): any[] {
    const options: any[] = [];

    menus.forEach((menu) => {
      if (menu.parentId === parentId) {
        const option = {
          value: menu.id,
          label: menu.menuName,
          children: this.getOptions(menu.id, menus),
        };

        if (option.children.length === 0) {
          delete option.children;
        }

        options.push(option);
      }
    });

    return options.sort((a, b) => a.orderNum - b.orderNum);
  }
}
