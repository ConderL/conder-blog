import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Logger,
  UseInterceptors,
  UploadedFile,
  Request,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { AnimeService } from '../services/anime.service';
import { CreateAnimeDto, QueryAnimeDto, UpdateAnimeDto, UpdateAnimeInfoDto } from '../dto/anime.dto';
import { Anime } from '../entities/anime.entity';
import { Public } from '../../../common/decorators/public.decorator';
import { Result } from '../../../common/result';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UploadService } from '../../../modules/upload/services/upload/upload.service';
import { UserService } from '../../user/user.service';

/**
 * B站番剧ID DTO
 */
class BilibiliAnimeDto {
  @ApiProperty({ description: 'B站番剧ID' })
  @IsNotEmpty({ message: 'B站番剧ID不能为空' })
  @IsString()
  animeId: string;
}

/**
 * B站番剧导入DTO，包含自定义封面和追番状态
 */
class ImportBilibiliAnimeDto extends BilibiliAnimeDto {
  @ApiProperty({ description: '自定义封面URL', required: false })
  @IsOptional()
  @IsString()
  customCover?: string;

  @ApiProperty({ description: '追番状态', required: false, default: 1, enum: [1, 2, 3] })
  @IsOptional()
  watchStatus?: number = 1;
}

/**
 * 腾讯视频番剧导入DTO
 */
class ImportTencentAnimeDto {
  @ApiProperty({ description: '腾讯视频番剧ID' })
  @IsNotEmpty({ message: '腾讯视频番剧ID不能为空' })
  @IsString()
  animeId: string;

  @ApiProperty({ description: '自定义封面URL', required: false })
  @IsOptional()
  @IsString()
  customCover?: string;

  @ApiProperty({ description: '追番状态', required: false, default: 1, enum: [1, 2, 3] })
  @IsOptional()
  watchStatus?: number = 1;

  @ApiProperty({ description: '番剧状态', required: false, default: 1, enum: [1, 2] })
  @IsOptional()
  animeStatus?: number = 1;

  @ApiProperty({ description: '评分', required: false })
  @IsOptional()
  rating?: number;

  @ApiProperty({ description: '总集数', required: false })
  @IsOptional()
  totalEpisodes?: number;
}

@ApiTags('番剧管理')
@Controller('anime')
export class AnimeController {
  private logger = new Logger(AnimeController.name);

  constructor(
    private readonly animeService: AnimeService,
    private readonly uploadService: UploadService,
    private readonly userService: UserService
  ) { }

  @ApiOperation({ summary: '创建番剧' })
  @ApiResponse({ status: 201, description: '创建成功', type: Anime })
  @Post()
  async create(@Body() createAnimeDto: CreateAnimeDto) {
    try {
      this.logger.log(`创建番剧: ${JSON.stringify(createAnimeDto)}`);

      // 对爱奇艺和优酷平台特殊处理
      if ((createAnimeDto.platform === 3 || createAnimeDto.platform === 4) && (!createAnimeDto.animeId || createAnimeDto.animeId.trim() === '')) {
        // 为爱奇艺和优酷平台生成一个唯一ID
        createAnimeDto.animeId = `${createAnimeDto.platform}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        this.logger.log(`为平台${createAnimeDto.platform}生成唯一ID: ${createAnimeDto.animeId}`);
      }

      const anime = await this.animeService.create(createAnimeDto);
      return {
        code: 200,
        message: '创建成功',
        data: anime,
      };
    } catch (error) {
      this.logger.error(`创建番剧失败: ${error.message}`);
      return {
        code: 500,
        message: '创建番剧失败: ' + error.message,
        data: null,
      };
    }
  }

  @ApiOperation({ summary: '获取番剧列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @Get('list')
  @Public()
  async findAll(@Query() queryAnimeDto: QueryAnimeDto) {
    try {
      this.logger.log('获取番剧列表');
      const result = await this.animeService.findAll(queryAnimeDto);
      return Result.ok(result);
    } catch (error) {
      this.logger.error(`获取番剧列表失败: ${error.message}`);
      return Result.fail('获取番剧列表失败');
    }
  }

  @ApiOperation({ summary: '获取番剧详情' })
  @ApiResponse({ status: 200, description: '获取成功', type: Anime })
  @Get(':id')
  @Public()
  async findOne(@Param('id', ParseIntPipe) id: number) {
    try {
      const anime = await this.animeService.findOne(id);
      return Result.ok(anime);
    } catch (error) {
      this.logger.error(`获取番剧详情失败: ${error.message}`);
      return Result.fail('获取番剧详情失败');
    }
  }

  @ApiOperation({ summary: '更新番剧' })
  @ApiResponse({ status: 200, description: '更新成功', type: Anime })
  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateAnimeDto: UpdateAnimeDto) {
    try {
      this.logger.log(`更新番剧: id=${id}, data=${JSON.stringify(updateAnimeDto)}`);

      // 处理额外字段
      const updateData: any = { ...updateAnimeDto };

      // 确保评分和总集数是数字类型
      if (updateData.rating !== undefined && updateData.rating !== null) {
        updateData.rating = parseFloat(updateData.rating);
      }

      if (updateData.totalEpisodes !== undefined && updateData.totalEpisodes !== null) {
        updateData.totalEpisodes = parseInt(updateData.totalEpisodes);
      }

      const anime = await this.animeService.update(id, updateData);
      return {
        code: 200,
        message: '更新成功',
        data: anime,
      };
    } catch (error) {
      this.logger.error(`更新番剧失败: ${error.message}`);
      return {
        code: 500,
        message: '更新番剧失败: ' + error.message,
        data: null,
      };
    }
  }

  @ApiOperation({ summary: '删除番剧' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    try {
      await this.animeService.remove(id);
      return Result.ok();
    } catch (error) {
      this.logger.error(`删除番剧失败: ${error.message}`);
      return Result.fail('删除番剧失败');
    }
  }

  @ApiOperation({ summary: '手动更新番剧信息' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @Post('update-info')
  async updateAnimeInfo(@Body() updateAnimeInfoDto: UpdateAnimeInfoDto) {
    try {
      await this.animeService.updateAnimeInfo(updateAnimeInfoDto.id);
      return Result.ok(null, '更新番剧信息成功');
    } catch (error) {
      this.logger.error(`更新番剧信息失败: ${error.message}`);
      return Result.fail('更新番剧信息失败');
    }
  }

  @ApiOperation({ summary: '手动执行番剧信息更新任务' })
  @ApiResponse({ status: 200, description: '任务已添加' })
  @Post('run-update-task')
  async runUpdateTask() {
    try {
      this.animeService.addCronJob('updateAnimeInfo', 5);
      return Result.ok(null, '番剧信息更新任务已添加，将在5秒后执行');
    } catch (error) {
      this.logger.error(`执行更新任务失败: ${error.message}`);
      return Result.fail('执行更新任务失败');
    }
  }

  @ApiOperation({ summary: '直接从B站API获取数据并保存到数据库' })
  @ApiResponse({ status: 200, description: '获取并保存成功' })
  @Post('fetch-bilibili')
  async fetchBilibiliAnime(@Body() importDto: ImportBilibiliAnimeDto) {
    try {
      const anime = await this.animeService.fetchAndSaveBilibiliAnime(
        importDto.animeId,
        importDto.customCover
      );
      return Result.ok(anime, '获取并保存B站番剧信息成功');
    } catch (error) {
      this.logger.error(`获取并保存B站番剧信息失败: ${error.message}`);
      return Result.fail(error.message || '获取并保存B站番剧信息失败');
    }
  }

  @ApiOperation({ summary: '从B站导入番剧' })
  @ApiResponse({ status: 200, description: '导入成功' })
  @Post('import-from-bilibili')
  async importFromBilibili(@Body() importDto: ImportBilibiliAnimeDto) {
    try {
      this.logger.log(`从B站导入番剧: ${JSON.stringify(importDto)}`);

      // 调用 fetchAndSaveBilibiliAnime 获取并保存番剧信息
      const anime = await this.animeService.fetchAndSaveBilibiliAnime(
        importDto.animeId,
        importDto.customCover
      );

      // 更新追番状态
      if (importDto.watchStatus && importDto.watchStatus !== anime.watchStatus) {
        this.logger.log(`更新追番状态: 从 ${anime.watchStatus} 到 ${importDto.watchStatus}`);

        // 创建完整的更新对象
        const updateDto: UpdateAnimeDto = {
          id: anime.id,
          animeName: anime.animeName,
          platform: anime.platform,
          animeId: anime.animeId,
          watchStatus: importDto.watchStatus,
          cover: anime.cover
        };

        await this.animeService.update(anime.id, updateDto);
      }

      return {
        code: 200,
        message: '从B站导入番剧成功',
        data: anime,
      };
    } catch (error) {
      this.logger.error(`从B站导入番剧失败: ${error.message}`);
      return {
        code: 500,
        message: error.message || '从B站导入番剧失败',
        data: null,
      };
    }
  }

  @ApiOperation({ summary: '上传番剧封面' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: '封面图片文件',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: '上传成功' })
  @Post('upload-cover')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 2 * 1024 * 1024, // 2MB限制
      },
      storage: memoryStorage(), // 使用内存存储
    }),
  )
  async uploadCover(@UploadedFile() file: Express.Multer.File) {
    try {
      if (!file) {
        return {
          code: 400,
          message: '请选择要上传的封面图片',
          data: null,
        };
      }

      // 检查文件格式
      const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif'];
      if (!allowedMimeTypes.includes(file.mimetype)) {
        return {
          code: 400,
          message: '只允许上传jpg, png, gif, webp, avif格式的图片',
          data: null,
        };
      }

      const result = await this.uploadService.uploadFile(file, 'anime');
      return {
        code: 200,
        message: '上传成功',
        data: result.url,
      };
    } catch (error) {
      this.logger.error(`上传番剧封面失败: ${error.message}`);
      return {
        code: 500,
        message: '上传番剧封面失败: ' + error.message,
        data: null,
      };
    }
  }

  @ApiOperation({ summary: '导入腾讯视频番剧' })
  @ApiResponse({ status: 200, description: '导入成功' })
  @Post('import-from-tencent')
  async importFromTencent(@Body() importDto: ImportTencentAnimeDto) {
    try {
      this.logger.log(`导入腾讯视频番剧: ${JSON.stringify(importDto)}`);

      // 创建番剧对象
      const createDto: CreateAnimeDto = {
        animeName: importDto.animeId, // 临时使用ID作为名称，将在获取信息时更新
        platform: 2, // 腾讯视频
        animeId: importDto.animeId,
        animeStatus: importDto.animeStatus || 1,
        watchStatus: importDto.watchStatus || 1,
        cover: importDto.customCover
      };

      // 创建番剧
      const anime = await this.animeService.create(createDto);

      // 如果提供了评分和总集数，更新这些信息
      if (importDto.rating || importDto.totalEpisodes) {
        const updateDto: UpdateAnimeDto = {
          id: anime.id,
          animeName: anime.animeName,
          platform: anime.platform,
          animeId: anime.animeId,
          animeStatus: importDto.animeStatus || anime.animeStatus,
          watchStatus: anime.watchStatus,
          cover: anime.cover
        };

        if (importDto.rating) {
          updateDto['rating'] = importDto.rating;
        }

        if (importDto.totalEpisodes) {
          updateDto['totalEpisodes'] = importDto.totalEpisodes;
        }

        await this.animeService.update(anime.id, updateDto);
      }

      return {
        code: 200,
        message: '导入腾讯视频番剧成功',
        data: anime,
      };
    } catch (error) {
      this.logger.error(`导入腾讯视频番剧失败: ${error.message}`);
      return {
        code: 500,
        message: error.message || '导入腾讯视频番剧失败',
        data: null,
      };
    }
  }

  @ApiOperation({ summary: '追番' })
  @ApiResponse({ status: 200, description: '操作成功' })
  @Post(':id/collect')
  async collectAnime(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ) {
    try {
      const userId = req.user.id;
      this.logger.log(`用户${userId}追番: ${id}`);

      // 首先检查番剧是否存在
      await this.animeService.findOne(id);

      // 添加用户追番
      const result = await this.userService.addAnimeCollection(userId, id);

      if (result) {
        return Result.ok(null, '追番成功');
      } else {
        return Result.fail('追番失败');
      }
    } catch (error) {
      this.logger.error(`追番失败: ${error.message}`);
      return Result.fail('追番失败: ' + error.message);
    }
  }

  @ApiOperation({ summary: '取消追番' })
  @ApiResponse({ status: 200, description: '操作成功' })
  @Post(':id/uncollect')
  async uncollectAnime(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ) {
    try {
      const userId = req.user.id;
      this.logger.log(`用户${userId}取消追番: ${id}`);

      // 取消用户追番
      const result = await this.userService.cancelAnimeCollection(userId, id);

      if (result) {
        return Result.ok(null, '取消追番成功');
      } else {
        return Result.fail('取消追番失败');
      }
    } catch (error) {
      this.logger.error(`取消追番失败: ${error.message}`);
      return Result.fail('取消追番失败: ' + error.message);
    }
  }

  @ApiOperation({ summary: '检查是否已追番' })
  @ApiResponse({ status: 200, description: '操作成功' })
  @Get(':id/collected')
  async isAnimeCollected(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ) {
    try {
      const userId = req.user.id;
      const isCollected = await this.userService.isAnimeCollected(userId, id);

      return Result.ok({ isCollected });
    } catch (error) {
      this.logger.error(`检查是否已追番失败: ${error.message}`);
      return Result.fail('检查是否已追番失败: ' + error.message);
    }
  }
} 