import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { PlatformType } from 'src/modules/captcha/dto/captcha.dto';

export class EmailLoginDto {
  @ApiProperty({
    description: '邮箱',
    example: 'user@example.com',
  })
  @IsNotEmpty({ message: '邮箱不能为空' })
  @IsEmail({}, { message: '邮箱格式不正确' })
  email: string;

  @ApiProperty({
    description: '验证码',
    example: '123456',
  })
  @IsNotEmpty({ message: '验证码不能为空' })
  @IsString({ message: '验证码必须是字符串' })
  code: string;

  @ApiProperty({
    description: '平台类型',
    example: 'ConderBlog',
    enum: PlatformType,
  })
  @IsNotEmpty({ message: '平台类型不能为空' })
  @IsEnum(PlatformType, { message: '平台类型无效' })
  type: PlatformType;
}

export class SendEmailCodeDto {
  @ApiProperty({
    description: '邮箱',
    example: 'user@example.com',
  })
  @IsNotEmpty({ message: '邮箱不能为空' })
  @IsEmail({}, { message: '邮箱格式不正确' })
  email: string;

  @ApiProperty({
    description: '平台类型',
    example: 'ConderBlog',
    enum: PlatformType,
    required: false,
  })
  @IsEnum(PlatformType, { message: '平台类型无效' })
  @IsOptional()
  type?: PlatformType;
}
