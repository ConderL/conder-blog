import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateIf } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * 番剧平台枚举
 */
export enum AnimePlatform {
  BILIBILI = 1,
  TENCENT = 2,
  IQIYI = 3,
  YOUKU = 4,
}

/**
 * 番剧状态枚举
 */
export enum AnimeStatus {
  ONGOING = 1,
  FINISHED = 2,
}

/**
 * 追番状态枚举
 */
export enum WatchStatus {
  WANT_TO_WATCH = 1,
  WATCHING = 2,
  WATCHED = 3,
}

/**
 * 创建番剧DTO
 */
export class CreateAnimeDto {
  @ApiProperty({ description: '番剧名称' })
  @IsNotEmpty({ message: '番剧名称不能为空' })
  @IsString()
  animeName: string;

  @ApiProperty({ description: '番剧平台', enum: AnimePlatform })
  @IsNotEmpty({ message: '番剧平台不能为空' })
  @IsEnum(AnimePlatform, { message: '番剧平台值无效' })
  @Type(() => Number)
  platform: number;

  @ApiProperty({ description: '番剧ID' })
  @ValidateIf((o) => o.platform === 1 || o.platform === 2)
  @IsNotEmpty({ message: '番剧ID不能为空' })
  @IsString()
  animeId: string;

  @ApiProperty({ description: '番剧状态', enum: AnimeStatus, required: false })
  @IsOptional()
  @IsEnum(AnimeStatus, { message: '番剧状态值无效' })
  @Type(() => Number)
  animeStatus?: number;

  @ApiProperty({ description: '追番状态', enum: WatchStatus })
  @IsNotEmpty({ message: '追番状态不能为空' })
  @IsEnum(WatchStatus, { message: '追番状态值无效' })
  @Type(() => Number)
  watchStatus: number;

  @ApiProperty({ description: '封面图片URL', required: false })
  @IsOptional()
  @IsString()
  cover?: string;

  @ApiProperty({ description: '评分', required: false })
  @IsOptional()
  @Type(() => Number)
  rating?: number;

  @ApiProperty({ description: '总集数', required: false })
  @IsOptional()
  @Type(() => Number)
  totalEpisodes?: number;

  @ApiProperty({ description: '简介', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: '配音演员', required: false })
  @IsOptional()
  @IsString()
  actors?: string;

  @ApiProperty({ description: '地区', required: false })
  @IsOptional()
  @IsString()
  areas?: string;

  @ApiProperty({ description: '发布时间', required: false })
  @IsOptional()
  @IsString()
  publishTime?: string;

  @ApiProperty({ description: '视频链接', required: false })
  @IsOptional()
  @IsString()
  link?: string;

  @ApiProperty({ description: '类型标签', required: false })
  @IsOptional()
  styles?: any;
}

/**
 * 更新番剧DTO
 */
export class UpdateAnimeDto extends CreateAnimeDto {
  @ApiProperty({ description: '番剧ID' })
  @IsNotEmpty({ message: '番剧ID不能为空' })
  @IsNumber()
  @Type(() => Number)
  id: number;

  @ApiProperty({ description: '评分', required: false })
  @IsOptional()
  @Type(() => Number)
  rating?: number;

  @ApiProperty({ description: '总集数', required: false })
  @IsOptional()
  @Type(() => Number)
  totalEpisodes?: number;

  @ApiProperty({ description: '简介', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: '配音演员', required: false })
  @IsOptional()
  @IsString()
  actors?: string;

  @ApiProperty({ description: '地区', required: false })
  @IsOptional()
  @IsString()
  areas?: string;

  @ApiProperty({ description: '发布时间', required: false })
  @IsOptional()
  @IsString()
  publishTime?: string;

  @ApiProperty({ description: '视频链接', required: false })
  @IsOptional()
  @IsString()
  link?: string;

  @ApiProperty({ description: '类型标签', required: false })
  @IsOptional()
  styles?: any;
}

/**
 * 番剧查询DTO
 */
export class QueryAnimeDto {
  @ApiProperty({ description: '番剧名称', required: false })
  @IsOptional()
  @IsString()
  animeName?: string;

  @ApiProperty({ description: '番剧平台', enum: AnimePlatform, required: false })
  @IsOptional()
  @IsEnum(AnimePlatform, { message: '番剧平台值无效' })
  @Type(() => Number)
  platform?: number;

  @ApiProperty({ description: '番剧状态', enum: AnimeStatus, required: false })
  @IsOptional()
  @IsEnum(AnimeStatus, { message: '番剧状态值无效' })
  @Type(() => Number)
  animeStatus?: number;

  @ApiProperty({ description: '追番状态', enum: WatchStatus, required: false })
  @IsOptional()
  @IsEnum(WatchStatus, { message: '追番状态值无效' })
  @Type(() => Number)
  watchStatus?: number;

  @ApiProperty({ description: '排序字段', required: false, enum: ['rating', 'publishTime'] })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiProperty({ description: '页码', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @ApiProperty({ description: '每页数量', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 10;
}

/**
 * 手动更新番剧信息DTO
 */
export class UpdateAnimeInfoDto {
  @ApiProperty({ description: '番剧ID' })
  @IsNotEmpty({ message: '番剧ID不能为空' })
  @IsNumber()
  @Type(() => Number)
  id: number;
} 