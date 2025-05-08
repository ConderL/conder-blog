import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * 分类数据传输对象
 */
export class CategoryDto {
  /**
   * 分类名称
   */
  @IsNotEmpty({ message: '分类名称不能为空' })
  @IsString()
  categoryName: string;

  /**
   * 分类图标
   */
  @IsOptional()
  @IsString()
  categoryIcon?: string;

  /**
   * 分类描述
   */
  @IsOptional()
  @IsString()
  categoryDescription?: string;

  /**
   * 排序
   */
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  orderNum?: number;
}
