import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Logger,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { SiteConfigService } from '../services/site-config.service';
import { SiteConfig } from '../entities/site-config.entity';
import { Result } from '../../../common/result';
import { Auth } from '../../../decorators/auth.decorator';
import { IsOptional, IsString, IsBoolean, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UploadService } from '../../../modules/upload/services/upload/upload.service';
import { OperationLog } from '../../../common/decorators/operation-log.decorator';
import { OperationType } from '../../../common/enums/operation-type.enum';

/**
 * 更新网站配置DTO
 */
class UpdateSiteConfigDto implements Partial<SiteConfig> {
  @IsOptional()
  @IsString()
  userAvatar?: string;

  @IsOptional()
  @IsString()
  touristAvatar?: string;

  @IsOptional()
  @IsString()
  siteName?: string;

  @IsOptional()
  @IsString()
  siteAddress?: string;

  @IsOptional()
  @IsString()
  siteIntro?: string;

  @IsOptional()
  @IsString()
  siteNotice?: string;

  @IsOptional()
  @IsString()
  createSiteTime?: string;

  @IsOptional()
  @IsString()
  recordNumber?: string;

  @IsOptional()
  @IsString()
  authorAvatar?: string;

  @IsOptional()
  @IsString()
  siteAuthor?: string;

  @IsOptional()
  @IsString()
  articleCover?: string;

  @IsOptional()
  @IsString()
  aboutMe?: string;

  @IsOptional()
  @IsString()
  github?: string;

  @IsOptional()
  @IsString()
  gitee?: string;

  @IsOptional()
  @IsString()
  bilibili?: string;

  @IsOptional()
  @IsString()
  qq?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  commentCheck?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  messageCheck?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  baiduCheck?: number;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isReward?: boolean;

  @IsOptional()
  @IsString()
  weiXinCode?: string;

  @IsOptional()
  @IsString()
  aliCode?: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  emailNotice?: boolean;

  @IsOptional()
  @IsString()
  socialList?: string;

  @IsOptional()
  @IsString()
  loginList?: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isMusic?: boolean;

  @IsOptional()
  @IsString()
  musicId?: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isChat?: boolean;

  @IsOptional()
  @IsString()
  websocketUrl?: string;

  @IsOptional()
  @IsString()
  archiveWallpaper?: string;

  @IsOptional()
  @IsString()
  categoryWallpaper?: string;

  @IsOptional()
  @IsString()
  tagWallpaper?: string;

  @IsOptional()
  @IsString()
  talkWallpaper?: string;

  @IsOptional()
  @IsString()
  albumWallpaper?: string;

  @IsOptional()
  @IsString()
  animeWallpaper?: string;

  @IsOptional()
  @IsString()
  friendWallpaper?: string;

  @IsOptional()
  @IsString()
  messageWallpaper?: string;

  @IsOptional()
  @IsString()
  aboutWallpaper?: string;
}

/**
 * 管理端网站配置控制器
 */
@ApiTags('管理端网站配置')
@Controller('admin/site')
@Auth()
export class AdminSiteConfigController {
  private readonly logger = new Logger(AdminSiteConfigController.name);

  constructor(
    private readonly siteConfigService: SiteConfigService,
    private readonly uploadService: UploadService,
  ) {}

  /**
   * 获取网站配置列表
   */
  @ApiOperation({ summary: '获取网站配置列表' })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    schema: {
      example: {
        code: 200,
        message: '操作成功',
        data: [
          {
            id: 1,
            siteName: '示例博客',
            siteAddress: 'https://example.com',
            // 其他配置字段...
          },
        ],
      },
    },
  })
  @Get('config')
  async findAll() {
    try {
      this.logger.log('获取网站配置');

      const configs = await this.siteConfigService.findAll();

      return Result.ok(configs[0]);
    } catch (error) {
      this.logger.error(`获取网站配置列表失败: ${error.message}`);
      return Result.fail('获取网站配置列表失败');
    }
  }

  /**
   * 获取网站配置详情
   */
  @ApiOperation({ summary: '获取网站配置详情' })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    schema: {
      example: {
        code: 200,
        message: '操作成功',
        data: {
          id: 1,
          siteName: '示例博客',
          siteAddress: 'https://example.com',
          // 其他配置字段...
        },
      },
    },
  })
  @Get(':id')
  async findOne(@Param('id') id: number) {
    try {
      this.logger.log(`获取网站配置详情: id=${id}`);

      const config = await this.siteConfigService.findById(+id);

      if (!config) {
        return Result.fail('网站配置不存在', 404);
      }

      return Result.ok(config);
    } catch (error) {
      this.logger.error(`获取网站配置详情失败: ${error.message}`);
      return Result.fail('获取网站配置详情失败');
    }
  }

  /**
   * 创建网站配置
   */
  @ApiOperation({ summary: '创建网站配置' })
  @ApiResponse({
    status: 200,
    description: '创建成功',
    schema: {
      example: {
        code: 200,
        message: '创建成功',
        data: {
          id: 1,
          siteName: '示例博客',
          siteAddress: 'https://example.com',
          // 其他配置字段...
        },
      },
    },
  })
  @Post('add')
  @OperationLog(OperationType.CREATE)
  async create(@Body() createSiteConfigDto: UpdateSiteConfigDto) {
    try {
      this.logger.log(`创建网站配置: ${JSON.stringify(createSiteConfigDto)}`);

      const config = await this.siteConfigService.create(createSiteConfigDto);

      return Result.ok(config, '创建成功');
    } catch (error) {
      this.logger.error(`创建网站配置失败: ${error.message}`);
      return Result.fail('创建网站配置失败');
    }
  }

  /**
   * 更新网站配置
   */
  @ApiOperation({ summary: '更新网站配置' })
  @ApiResponse({
    status: 200,
    description: '更新成功',
    schema: {
      example: {
        code: 200,
        message: '更新成功',
        data: {
          id: 1,
          siteName: '示例博客',
          siteAddress: 'https://example.com',
          // 其他配置字段...
        },
      },
    },
  })
  @Put('update')
  @OperationLog(OperationType.UPDATE)
  async update(@Body() updateSiteConfigDto: UpdateSiteConfigDto) {
    try {
      this.logger.log(`更新网站配置`);

      // 获取所有配置
      const configs = await this.siteConfigService.findAll();

      if (configs.length === 0) {
        // 如果不存在配置，则创建一个新配置
        this.logger.log('网站配置不存在，创建新配置');

        // 根据SQL表结构添加必填字段的默认值
        const defaultConfig = {
          userAvatar: updateSiteConfigDto.userAvatar || 'http://example.com/default-avatar.png',
          touristAvatar:
            updateSiteConfigDto.touristAvatar || 'http://example.com/default-avatar.png',
          siteName: updateSiteConfigDto.siteName || '默认网站名称',
          siteAddress: updateSiteConfigDto.siteAddress || 'https://example.com',
          siteIntro: updateSiteConfigDto.siteIntro || '默认网站简介',
          siteNotice: updateSiteConfigDto.siteNotice || '默认网站公告',
          createSiteTime: updateSiteConfigDto.createSiteTime || '2025-01-01',
          recordNumber: updateSiteConfigDto.recordNumber || '备案号',
          authorAvatar:
            updateSiteConfigDto.authorAvatar ||
            updateSiteConfigDto.userAvatar ||
            'http://example.com/default-avatar.png',
          siteAuthor: updateSiteConfigDto.siteAuthor || 'Admin',
          articleCover: updateSiteConfigDto.articleCover || '',
          socialList: updateSiteConfigDto.socialList || '[]',
          loginList: updateSiteConfigDto.loginList || '[]',

          // 使用传递的值或默认值
          ...updateSiteConfigDto,
        };

        const newConfig = await this.siteConfigService.create(defaultConfig);
        return Result.ok(newConfig, '创建成功');
      }

      // 使用第一个配置的ID
      const configId = configs[0].id;

      const updatedConfig = await this.siteConfigService.update(configId, updateSiteConfigDto);

      return Result.ok(updatedConfig, '更新成功');
    } catch (error) {
      this.logger.error(`更新网站配置失败: ${error.message}`);
      return Result.fail('更新网站配置失败: ' + error.message);
    }
  }

  /**
   * 删除网站配置
   */
  @ApiOperation({ summary: '删除网站配置' })
  @ApiResponse({
    status: 200,
    description: '删除成功',
    schema: {
      example: {
        code: 200,
        message: '删除成功',
        data: null,
      },
    },
  })
  @Delete(':id')
  @OperationLog(OperationType.DELETE)
  async remove(@Param('id') id: number) {
    try {
      this.logger.log(`删除网站配置: id=${id}`);

      // 检查配置是否存在
      const config = await this.siteConfigService.findById(+id);
      if (!config) {
        return Result.fail('网站配置不存在', 404);
      }

      await this.siteConfigService.remove(+id);

      return Result.ok(null, '删除成功');
    } catch (error) {
      this.logger.error(`删除网站配置失败: ${error.message}`);
      return Result.fail('删除网站配置失败');
    }
  }

  /**
   * 上传站点配置图片
   */
  @ApiOperation({ summary: '上传站点配置图片' })
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
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB限制
      },
      storage: memoryStorage(), // 使用内存存储
    }),
  )
  @OperationLog(OperationType.UPLOAD)
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    try {
      this.logger.log(`上传站点配置图片: ${file?.originalname || '未知文件'}`);

      if (!file) {
        return Result.fail('请选择要上传的图片');
      }

      // 检查文件格式
      const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif'];
      if (!allowedMimeTypes.includes(file.mimetype)) {
        return Result.fail('只允许上传jpg, png, gif, webp, avif格式的图片');
      }

      // 确保Buffer对象存在
      if (!file.buffer || file.buffer.length === 0) {
        this.logger.error('文件buffer为空或不存在');
        return Result.fail('上传文件无效，请重新选择文件');
      }

      // 强制转换为UTF-8编码的文件名
      const originalFilename = Buffer.from(file.originalname, 'binary').toString('utf8');

      // 创建新的文件对象，确保所有属性正确
      const cleanFile = {
        ...file,
        originalname: originalFilename,
      };

      // 上传到/config路径，不包含日期
      const result = await this.uploadService.uploadFile(cleanFile, 'config', false);

      return Result.ok(result.url, '上传成功');
    } catch (error) {
      this.logger.error(`上传站点配置图片失败: ${error.message}`);
      return Result.fail('上传失败: ' + error.message);
    }
  }

  /**
   * 获取网站配置信息
   */
  @ApiOperation({ summary: '获取网站配置信息' })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    schema: {
      example: {
        code: 200,
        message: '操作成功',
        data: {
          id: 1,
          siteName: '示例博客',
          siteAddress: 'https://example.com',
          // 其他配置字段...
        },
      },
    },
  })
  @Get('info')
  async getInfo() {
    try {
      this.logger.log('获取网站配置信息');

      // 获取所有配置
      const configs = await this.siteConfigService.findAll();

      if (configs.length === 0) {
        return Result.fail('网站配置不存在');
      }

      // 返回第一个配置
      return Result.ok(configs[0]);
    } catch (error) {
      this.logger.error(`获取网站配置信息失败: ${error.message}`);
      return Result.fail('获取网站配置信息失败');
    }
  }
}
