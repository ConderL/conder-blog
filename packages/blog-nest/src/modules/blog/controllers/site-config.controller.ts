import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { SiteConfigService } from '../services/site-config.service';
import { SiteConfig } from '../entities/site-config.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from '../../../modules/upload/services/upload/upload.service';
import { ResultDto } from '../../../common/dtos/result.dto';
import { memoryStorage } from 'multer';

@ApiTags('站点配置')
@Controller('site-config')
export class SiteConfigController {
  constructor(private readonly siteConfigService: SiteConfigService) {}

  @Post()
  @ApiOperation({ summary: '创建配置' })
  @UseGuards(JwtAuthGuard)
  async create(@Body() siteConfig: Partial<SiteConfig>): Promise<SiteConfig> {
    return this.siteConfigService.create(siteConfig);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新配置' })
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: number,
    @Body() siteConfig: Partial<SiteConfig>,
  ): Promise<SiteConfig> {
    return this.siteConfigService.update(id, siteConfig);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除配置' })
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: number): Promise<void> {
    return this.siteConfigService.remove(id);
  }

  @Get()
  @ApiOperation({ summary: '获取所有配置' })
  @UseGuards(JwtAuthGuard)
  async findAll(): Promise<SiteConfig[]> {
    return this.siteConfigService.findAll();
  }

  @Get('frontend')
  @ApiOperation({ summary: '获取前端可见的配置' })
  async findFrontendConfigs(): Promise<SiteConfig[]> {
    return this.siteConfigService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '获取配置详情' })
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: number): Promise<SiteConfig> {
    return this.siteConfigService.findById(id);
  }

  @Post('batch')
  @ApiOperation({ summary: '批量更新配置' })
  @UseGuards(JwtAuthGuard)
  async updateBatch(@Body() configs: { name: string; value: string }[]): Promise<void> {
    const configList = await this.siteConfigService.findAll();
    if (configList.length === 0) {
      return;
    }

    const configId = configList[0].id;

    const updateData: Partial<SiteConfig> = {};
    configs.forEach((config) => {
      const key = config.name.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      updateData[key] = config.value;
    });

    await this.siteConfigService.update(configId, updateData);
  }
}

@ApiTags('站点配置')
@Controller('admin/site-image')
@UseGuards(JwtAuthGuard)
export class AdminSiteConfigController {
  constructor(
    private readonly siteConfigService: SiteConfigService,
    private readonly uploadService: UploadService,
  ) {}

  @Post('upload')
  @ApiOperation({ summary: '上传站点图片' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: '图片文件',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB限制
      },
      storage: memoryStorage(), // 明确使用内存存储
    }),
  )
  async uploadSiteImage(@UploadedFile() file: Express.Multer.File) {
    console.log('收到站点图片上传请求，file对象信息:', file ? '存在' : '不存在');
    if (file) {
      console.log(
        '文件信息 - 名称:',
        file.originalname,
        '大小:',
        file.size,
        '类型:',
        file.mimetype,
        'buffer存在:',
        !!file.buffer,
        'buffer大小:',
        file.buffer?.length,
      );
    }

    if (!file) {
      return ResultDto.error('请选择要上传的图片');
    }

    // 检查文件格式
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return ResultDto.error('只允许上传jpg, png, gif, webp格式的图片');
    }

    try {
      // 确保Buffer对象存在
      if (!file.buffer || file.buffer.length === 0) {
        console.error('文件buffer为空或不存在');
        return ResultDto.error('上传文件无效，请重新选择文件');
      }

      // 强制转换为UTF-8编码的文件名
      const originalFilename = Buffer.from(file.originalname, 'binary').toString('utf8');
      console.log('转换后的文件名:', originalFilename);

      // 创建新的文件对象，确保所有属性正确
      const cleanFile = {
        ...file,
        originalname: originalFilename,
      };

      const result = await this.uploadService.uploadFile(cleanFile, 'site');
      return ResultDto.success(result.url);
    } catch (error) {
      console.error('上传处理失败:', error);
      return ResultDto.error('上传失败: ' + error.message);
    }
  }
}
