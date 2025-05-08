import { Provider } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionGuard } from '../guards/permission.guard';
import { RoleService } from '../../modules/user/services/role.service';
import { MenuService } from '../../modules/user/services/menu.service';

export const GuardsProvider: Provider[] = [
  {
    provide: PermissionGuard,
    useFactory: (reflector: Reflector, roleService: RoleService, menuService: MenuService) => {
      return new PermissionGuard(reflector, roleService, menuService);
    },
    inject: [Reflector, RoleService, MenuService],
  },
];
