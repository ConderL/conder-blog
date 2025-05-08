import { IsNotEmpty, IsOptional, IsString, MaxLength, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * 聊天消息数据传输对象
 */
export class ChatMessageDto {
  /**
   * 消息ID
   */
  @IsOptional()
  @IsNumber()
  id?: number;

  /**
   * 昵称
   */
  @IsNotEmpty({ message: '昵称不能为空' })
  @IsString({ message: '昵称必须是字符串' })
  @MaxLength(50, { message: '昵称最大长度为50个字符' })
  nickname: string;

  /**
   * 头像
   */
  @IsNotEmpty({ message: '头像不能为空' })
  @IsString({ message: '头像必须是字符串' })
  @MaxLength(255, { message: '头像URL最大长度为255个字符' })
  avatar: string;

  /**
   * 消息内容
   */
  @IsNotEmpty({ message: '消息内容不能为空' })
  @IsString({ message: '消息内容必须是字符串' })
  @MaxLength(1000, { message: '消息内容最大长度为1000个字符' })
  content: string;

  /**
   * 用户ID
   */
  @IsOptional()
  @IsNumber()
  userId?: number;

  /**
   * IP来源
   */
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'IP来源最大长度为50个字符' })
  ipSource?: string;

  /**
   * IP地址
   */
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'IP地址最大长度为50个字符' })
  ipAddress?: string;
}
