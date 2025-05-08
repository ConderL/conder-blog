import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, ValidateIf } from 'class-validator';
import { PlatformType } from 'src/modules/captcha/dto/captcha.dto';

export class LoginDto {
  @ApiProperty({
    description: '用户名',
    example: 'admin',
    required: false,
  })
  @IsString({ message: '用户名必须是字符串' })
  @ValidateIf((o) => !o.email)
  @IsNotEmpty({ message: '用户名不能为空' })
  username?: string;

  @ApiProperty({
    description: '邮箱',
    example: 'user@example.com',
    required: false,
  })
  @IsEmail({}, { message: '请输入正确的邮箱地址' })
  @ValidateIf((o) => !o.username)
  @IsNotEmpty({ message: '邮箱不能为空' })
  email?: string;

  @ApiProperty({
    description: '密码',
    example: '123456',
  })
  @IsNotEmpty({ message: '密码不能为空' })
  @IsString({ message: '密码必须是字符串' })
  password: string;

  @ApiProperty({
    description: '验证码',
    example: 'abcd',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '验证码必须是字符串' })
  code?: string;

  @ApiProperty({
    description: '验证码UUID',
    example: 'a1b2c3d4e5f6',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '验证码UUID必须是字符串' })
  captchaUUID?: string;

  @ApiProperty({
    description: '平台类型',
    example: 'ConderAdmin',
    enum: PlatformType,
  })
  @IsNotEmpty({ message: '平台类型不能为空' })
  @IsEnum(PlatformType, { message: '平台类型无效' })
  type: PlatformType;
}
