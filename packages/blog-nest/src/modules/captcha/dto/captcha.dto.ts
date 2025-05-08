import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

/**
 * 平台类型枚举
 */
export enum PlatformType {
  ADMIN = 'ConderAdmin',
  BLOG = 'ConderView',
}

/**
 * 验证码请求DTO
 */
export class CaptchaRequestDto {
  @ApiProperty({
    description: '平台类型',
    example: 'ConderAdmin',
    enum: PlatformType,
  })
  @IsNotEmpty({ message: '平台类型不能为空' })
  @IsEnum(PlatformType, { message: '平台类型无效' })
  type: PlatformType;
}

/**
 * 验证码响应DTO
 */
export class CaptchaResponseDto {
  @ApiProperty({
    description: '验证码唯一标识',
    example: 'a1b2c3d4e5f6',
  })
  captchaUuid: string;

  @ApiProperty({
    description: '验证码图片（SVG格式）',
    example: '<svg>...</svg>',
  })
  captchaImg: string;
}

/**
 * 验证码验证DTO
 */
export class ValidateCaptchaDto {
  @ApiProperty({
    description: '验证码唯一标识',
    example: 'a1b2c3d4e5f6',
  })
  @IsNotEmpty({ message: '验证码标识不能为空' })
  @IsString({ message: '验证码标识必须是字符串' })
  captchaUuid: string;

  @ApiProperty({
    description: '验证码',
    example: 'abcd',
  })
  @IsNotEmpty({ message: '验证码不能为空' })
  @IsString({ message: '验证码必须是字符串' })
  captchaCode: string;

  @ApiProperty({
    description: '平台类型',
    example: 'ConderAdmin',
    enum: PlatformType,
  })
  @IsNotEmpty({ message: '平台类型不能为空' })
  @IsEnum(PlatformType, { message: '平台类型无效' })
  type: PlatformType;
}
