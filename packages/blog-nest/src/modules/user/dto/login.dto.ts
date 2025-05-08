import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length, IsOptional } from 'class-validator';

export class LoginDto {
  @ApiProperty({ description: '用户名' })
  @IsNotEmpty({ message: '用户名不能为空' })
  @IsString({ message: '用户名必须是字符串' })
  @Length(4, 20, { message: '用户名长度必须在4-20之间' })
  username: string;

  @ApiProperty({ description: '密码' })
  @IsNotEmpty({ message: '密码不能为空' })
  @IsString({ message: '密码必须是字符串' })
  @Length(3, 2048, { message: '密码长度不能少于3位' })
  password: string;

  @ApiProperty({ description: '验证码', required: false })
  @IsOptional()
  @IsString({ message: '验证码必须是字符串' })
  code?: string;

  @ApiProperty({ description: '验证码UUID', required: false })
  @IsOptional()
  @IsString({ message: '验证码UUID必须是字符串' })
  captchaUUID?: string;

  @ApiProperty({ description: '平台类型', required: false })
  @IsOptional()
  @IsString({ message: '平台类型必须是字符串' })
  type?: string;
}
