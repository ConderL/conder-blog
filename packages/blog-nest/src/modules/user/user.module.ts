import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { UserService } from './user.service';
import { UserController, AdminUserController } from './user.controller';
import { User } from './entities/user.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Role } from './entities/role.entity';
import { UserRole } from './entities/user-role.entity';
import { Menu } from './entities/menu.entity';
import { RoleMenu } from './entities/role-menu.entity';
import { RoleService } from './services/role.service';
import { MenuService } from './services/menu.service';
import { RoleController } from './controllers/role.controller';
import { MenuController } from './controllers/menu.controller';
import { AdminMenuController } from './controllers/admin-menu.controller';
import { AdminRoleController } from './controllers/admin-role.controller';
import { UploadModule } from '../upload/upload.module';
import { SiteConfigService } from '../blog/services/site-config.service';
import { SiteConfig } from '../blog/entities/site-config.entity';
import { RedisModule } from '../../redis/redis.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, UserRole, Menu, RoleMenu, SiteConfig]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '24h' },
      }),
      inject: [ConfigService],
    }),
    UploadModule,
    RedisModule,
  ],
  controllers: [
    UserController,
    RoleController,
    MenuController,
    AdminUserController,
    AdminMenuController,
    AdminRoleController,
  ],
  providers: [UserService, RoleService, MenuService, SiteConfigService],
  exports: [UserService, RoleService, MenuService, SiteConfigService],
})
export class UserModule {}
