import { Entity, PrimaryColumn } from 'typeorm';

@Entity('t_role_menu')
export class RoleMenu {
  @PrimaryColumn({ name: 'role_id' })
  roleId: number;

  @PrimaryColumn({ name: 'menu_id' })
  menuId: number;
}
