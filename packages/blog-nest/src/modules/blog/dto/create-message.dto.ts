import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateMessageDto {
  @ApiProperty({ description: '昵称' })
  @IsNotEmpty({ message: '昵称不能为空' })
  @IsString({ message: '昵称必须是字符串类型' })
  @MaxLength(50, { message: '昵称长度不能超过50个字符' })
  nickname: string;

  @ApiProperty({ description: '头像' })
  @IsNotEmpty({ message: '头像不能为空' })
  @IsString({ message: '头像必须是字符串类型' })
  @MaxLength(255, { message: '头像长度不能超过255个字符' })
  avatar: string;

  @ApiProperty({ description: '留言内容' })
  @IsNotEmpty({ message: '留言内容不能为空' })
  @IsString({ message: '留言内容必须是字符串类型' })
  @MaxLength(255, { message: '留言内容长度不能超过255个字符' })
  messageContent: string;
}
