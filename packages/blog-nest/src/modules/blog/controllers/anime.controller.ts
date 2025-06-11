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
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AnimeService } from '../services/anime.service';
import { CreateAnimeDto, QueryAnimeDto, UpdateAnimeDto, UpdateAnimeInfoDto } from '../dto/anime.dto';
import { Anime } from '../entities/anime.entity';
import { Public } from '../../../common/decorators/public.decorator';
import { Result } from '../../../common/result';

@ApiTags('番剧管理')
@Controller('anime')
export class AnimeController {
  private logger = new Logger(AnimeController.name);

  constructor(private readonly animeService: AnimeService) {}

  @ApiOperation({ summary: '创建番剧' })
  @ApiResponse({ status: 201, description: '创建成功', type: Anime })
  @Post()
  async create(@Body() createAnimeDto: CreateAnimeDto) {
    try {
      const anime = await this.animeService.create(createAnimeDto);
      return Result.ok(anime);
    } catch (error) {
      this.logger.error(`创建番剧失败: ${error.message}`);
      return Result.fail('创建番剧失败');
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
      const anime = await this.animeService.update(id, updateAnimeDto);
      return Result.ok(anime);
    } catch (error) {
      this.logger.error(`更新番剧失败: ${error.message}`);
      return Result.fail('更新番剧失败');
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
} 