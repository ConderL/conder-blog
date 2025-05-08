import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
  @ApiProperty({ description: 'JWT token' })
  token: string;

  @ApiProperty({ description: '用户信息' })
  user: {
    id: number;
    username: string;
    nickname?: string;
    avatar?: string;
  };
}
