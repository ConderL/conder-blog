import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsIn } from 'class-validator';

export class ReviewMessageDto {
  @ApiProperty({ description: '是否通过审核', enum: [0, 1] })
  @IsNotEmpty({ message: '审核状态不能为空' })
  @IsNumber({}, { message: '审核状态必须是数字类型' })
  @IsIn([0, 1], { message: '审核状态只能是0或1' })
  isCheck: number;
}
