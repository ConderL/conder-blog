import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ description: '用户名/邮箱', example: '912277676@qq.com' })
  @IsNotEmpty({ message: '用户名不能为空' })
  @IsEmail({}, { message: '邮箱格式不正确' })
  username: string;

  @ApiProperty({ description: '新密码', example: '123456' })
  @IsNotEmpty({ message: '密码不能为空' })
  @IsString({ message: '密码必须是字符串' })
  @Length(6, 20, { message: '密码长度必须在6-20之间' })
  password: string;

  @ApiProperty({ description: '验证码', example: '878687' })
  @IsNotEmpty({ message: '验证码不能为空' })
  @IsString({ message: '验证码必须是字符串' })
  code: string;

  // 可选的平台类型
  type?: string;
}
