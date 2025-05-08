import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Length, Matches } from 'class-validator';

/**
 * 绑定邮箱DTO
 */
export class BindEmailDto {
  @ApiProperty({ description: '邮箱', example: 'example@example.com' })
  @IsNotEmpty({ message: '邮箱不能为空' })
  @IsEmail({}, { message: '邮箱格式不正确' })
  email: string;

  @ApiProperty({ description: '验证码', example: '123456' })
  @IsNotEmpty({ message: '验证码不能为空' })
  @IsString({ message: '验证码必须是字符串' })
  @Length(6, 6, { message: '验证码必须是6位数字' })
  @Matches(/^[0-9]{6}$/, { message: '验证码必须是6位数字' })
  code: string;
}
