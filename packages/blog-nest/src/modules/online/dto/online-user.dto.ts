import { ApiProperty } from '@nestjs/swagger';

/**
 * 在线用户DTO
 */
export class OnlineUserDto {
  @ApiProperty({ description: '会话ID' })
  tokenId: string;

  @ApiProperty({ description: '用户ID' })
  userId: number;

  @ApiProperty({ description: '用户名' })
  username: string;

  @ApiProperty({ description: '昵称' })
  nickname: string;

  @ApiProperty({ description: '头像' })
  avatar: string;

  @ApiProperty({ description: '登录IP' })
  ipAddress: string;

  @ApiProperty({ description: 'IP来源' })
  ipSource: string;

  @ApiProperty({ description: '浏览器' })
  browser: string;

  @ApiProperty({ description: '操作系统' })
  os: string;

  @ApiProperty({ description: '登录时间' })
  loginTime: Date;

  @ApiProperty({ description: '最后访问时间' })
  lastAccessTime: Date;
}
