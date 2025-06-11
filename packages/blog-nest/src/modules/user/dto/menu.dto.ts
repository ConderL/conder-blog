import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsNumber, IsInt, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';

/**
 * 创建菜单DTO
 */
export class CreateMenuDto {
  @ApiProperty({ description: '父菜单ID', default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '父菜单ID必须是整数' })
  parentId?: number = 0;

  @ApiProperty({ description: '菜单名称' })
  @IsNotEmpty({ message: '菜单名称不能为空' })
  @IsString({ message: '菜单名称必须是字符串' })
  menuName: string;

  @ApiProperty({ description: '菜单类型 (M目录 C菜单 B按钮)' })
  @IsNotEmpty({ message: '菜单类型不能为空' })
  @IsString({ message: '菜单类型必须是字符串' })
  type: string;

  @ApiProperty({ description: '路由地址', required: false })
  @IsOptional()
  @IsString({ message: '路由地址必须是字符串' })
  path?: string;

  @ApiProperty({ description: '菜单图标', required: false })
  @IsOptional()
  @IsString({ message: '菜单图标必须是字符串' })
  icon?: string;

  @ApiProperty({ description: '组件路径', required: false })
  @IsOptional()
  @IsString({ message: '组件路径必须是字符串' })
  component?: string;

  @ApiProperty({ description: '权限标识', required: false })
  @IsOptional()
  @IsString({ message: '权限标识必须是字符串' })
  perms?: string;

  @ApiProperty({ description: '显示顺序', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '显示顺序必须是整数' })
  @Min(0, { message: '显示顺序不能小于0' })
  orderNum?: number = 1;

  @ApiProperty({ description: '是否隐藏 (0否 1是)', default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '是否隐藏必须是整数' })
  @Min(0, { message: '是否隐藏不能小于0' })
  isHidden?: number = 0;

  @ApiProperty({ description: '是否禁用 (0否 1是)', default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '是否禁用必须是整数' })
  @Min(0, { message: '是否禁用不能小于0' })
  isDisable?: number = 0;
}

/**
 * 更新菜单DTO
 */
export class UpdateMenuDto extends CreateMenuDto {
  @ApiProperty({ description: '菜单ID' })
  @IsNotEmpty({ message: '菜单ID不能为空' })
  @Type(() => Number)
  @IsInt({ message: '菜单ID必须是整数' })
  id: number;
} 