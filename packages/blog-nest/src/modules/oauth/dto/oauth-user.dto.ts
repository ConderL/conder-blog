import { ApiProperty } from '@nestjs/swagger';

/**
 * 第三方登录用户DTO
 */
export class OauthUserDto {
  @ApiProperty({ description: '来源ID' })
  sourceId: string;

  @ApiProperty({ description: '用户名' })
  username: string;

  @ApiProperty({ description: '用户昵称' })
  nickname: string;

  @ApiProperty({ description: '用户头像' })
  avatar: string;

  @ApiProperty({ description: '用户邮箱', required: false })
  email?: string;

  @ApiProperty({ description: '登录方式 (1邮箱 2QQ 3Gitee 4Github)' })
  loginType: number;

  @ApiProperty({ description: '访问令牌' })
  accessToken: string;
}

/**
 * 第三方登录结果DTO
 */
export class OauthResultDto {
  @ApiProperty({ description: '是否成功' })
  success: boolean;

  @ApiProperty({ description: '用户ID' })
  userId?: number;

  @ApiProperty({ description: '用户名' })
  username?: string;

  @ApiProperty({ description: '用户昵称' })
  nickname?: string;

  @ApiProperty({ description: '用户头像' })
  avatar?: string;

  @ApiProperty({ description: '登录令牌' })
  token?: string;

  @ApiProperty({ description: '错误信息' })
  message?: string;
}
