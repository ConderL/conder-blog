import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    description: '用户名/邮箱',
    example: 'test@example.com',
  })
  @IsEmail({}, { message: '请输入正确的邮箱地址' })
  @IsOptional()
  username?: string;

  @ApiProperty({
    description: '邮箱',
    example: 'test@example.com',
  })
  @IsEmail({}, { message: '请输入正确的邮箱地址' })
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: '密码',
    example: 'password123',
  })
  @IsString({ message: '密码格式不正确' })
  @IsNotEmpty({ message: '密码不能为空' })
  @MaxLength(20, { message: '密码长度不能超过20个字符' })
  password: string;

  @ApiProperty({
    description: '验证码',
    example: '123456',
  })
  @IsString({ message: '验证码格式不正确' })
  @IsNotEmpty({ message: '验证码不能为空' })
  code: string;

  @ApiProperty({
    description: '平台类型，blog或admin',
    example: 'blog',
    default: 'blog',
  })
  @IsString({ message: '平台类型格式不正确' })
  @IsOptional()
  type?: string = 'blog';
}
