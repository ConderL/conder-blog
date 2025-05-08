import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Query,
  Logger,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';
import { PhotoService } from '../services/photo.service';
import { AlbumService } from '../services/album.service';
import { UploadService } from '../../upload/services/upload/upload.service';
import { Result } from '../../../common/result';
import { Auth } from '../../../decorators/auth.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { IsArray, IsNumber, IsNotEmpty, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { OperationLog } from '../../../common/decorators/operation-log.decorator';
import { OperationType } from '../../../common/enums/operation-type.enum';

/**
 * 照片URL列表保存DTO
 */
class SavePhotoDto {
  /**
   * 相册ID
   */
  @IsNumber()
  @IsNotEmpty({ message: '相册ID不能为空' })
  @Type(() => Number)
  albumId: number;

  /**
   * 照片URL列表
   */
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ message: '照片URL列表不能为空' })
  photoUrlList: string[];
}

/**
 * 管理端相册照片控制器
 * 用于管理员管理相册照片
 */
@ApiTags('管理端相册照片管理')
@Controller('admin/photo')
@Auth()
export class AdminPhotoController {
  private logger = new Logger(AdminPhotoController.name);

  constructor(
    private readonly photoService: PhotoService,
    private readonly albumService: AlbumService,
    private readonly uploadService: UploadService,
  ) {}

  /**
   * 获取相册照片列表
   */
  @ApiOperation({
    summary: '获取相册照片列表',
    description: '获取指定相册的照片列表',
  })
  @ApiQuery({ name: 'current', required: false, description: '当前页码，默认为1' })
  @ApiQuery({ name: 'size', required: false, description: '每页数量，默认为18' })
  @ApiQuery({ name: 'albumId', required: true, description: '相册ID' })
  @ApiResponse({
    status: 200,
    description: '返回照片列表及分页信息',
    schema: {
      example: {
        code: 200,
        message: '操作成功',
        data: {
          recordList: [
            {
              id: 1,
              albumId: 1,
              photoUrl: 'https://example.com/photo.jpg',
              photoName: '照片名称',
              photoDesc: '照片描述',
              createTime: '2023-01-01 00:00:00',
              updateTime: '2023-01-01 00:00:00',
            },
          ],
          count: 1,
          total: 10,
          current: 1,
          size: 18,
        },
      },
    },
  })
  @Get('list')
  async findAll(
    @Query('current') current = 1,
    @Query('size') size = 18,
    @Query('albumId') albumId: number,
  ) {
    try {
      if (!albumId) {
        return Result.fail('缺少相册ID参数', 400);
      }

      this.logger.log(`获取相册照片列表: current=${current}, size=${size}, albumId=${albumId}`);

      // 转换参数类型
      const params = {
        current: +current,
        size: +size,
        albumId: +albumId,
      };

      // 检查相册是否存在
      const album = await this.albumService.findById(params.albumId);
      if (!album) {
        return Result.fail('相册不存在', 404);
      }

      const { records, count } = await this.photoService.findAll(
        params.current,
        params.size,
        params.albumId,
      );

      return Result.ok({
        recordList: records,
        albumInfo: {
          albumId: album.id,
          albumName: album.albumName,
          albumCover: album.albumCover,
          albumDesc: album.albumDesc,
        },
        count: records.length,
        total: count,
        current: params.current,
        size: params.size,
      });
    } catch (error) {
      this.logger.error(`获取相册照片列表失败: ${error.message}`);
      return Result.fail('获取相册照片列表失败');
    }
  }

  /**
   * 上传照片
   */
  @ApiOperation({ summary: '上传照片', description: '上传照片并返回URL' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: '照片文件',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '上传成功',
    schema: {
      example: {
        code: 200,
        message: '上传成功',
        data: 'https://example.com/uploads/album/2023/06/photo.jpg',
      },
    },
  })
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  @OperationLog(OperationType.UPLOAD)
  async uploadPhoto(@UploadedFile() file: Express.Multer.File) {
    try {
      if (!file) {
        return Result.fail('未检测到上传文件', 400);
      }

      this.logger.log(`上传照片: 文件名=${file.originalname}, 大小=${file.size}字节`);

      // 检查文件类型
      const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedMimeTypes.includes(file.mimetype)) {
        return Result.fail('仅支持上传 JPG、PNG、GIF 和 WebP 格式的图片', 400);
      }

      // 使用上传服务上传文件
      const result = await this.uploadService.uploadFile(file, 'album');

      // 直接返回上传后的URL
      return Result.ok(result.url, '上传成功');
    } catch (error) {
      this.logger.error(`上传照片失败: ${error.message}`);
      return Result.fail(`上传照片失败: ${error.message}`);
    }
  }

  /**
   * 批量添加照片
   */
  @ApiOperation({ summary: '批量添加照片', description: '批量添加照片到指定相册' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        albumId: {
          type: 'number',
          description: '相册ID',
        },
        photoUrlList: {
          type: 'array',
          items: {
            type: 'string',
          },
          description: '照片URL列表',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '添加成功',
    schema: {
      example: {
        code: 200,
        message: '添加成功',
        data: [
          {
            id: 1,
            albumId: 1,
            photoUrl: 'https://example.com/photo1.jpg',
            photoName: '照片1',
            photoDesc: '',
            createTime: '2023-01-01 00:00:00',
            updateTime: '2023-01-01 00:00:00',
          },
        ],
      },
    },
  })
  @Post('add')
  @OperationLog(OperationType.CREATE)
  async addPhotos(@Body() photoDto: SavePhotoDto) {
    try {
      // DTO 验证已经由全局验证管道处理
      this.logger.log(
        `批量添加照片到相册: albumId=${photoDto.albumId}, 数量=${photoDto.photoUrlList.length}`,
      );

      // 检查相册是否存在
      const album = await this.albumService.findById(photoDto.albumId);
      if (!album) {
        return Result.fail('相册不存在', 404);
      }

      // 为每个URL创建照片记录
      const photoDataList = photoDto.photoUrlList.map((url) => {
        // 从URL中获取文件名
        const fileName = url.substring(url.lastIndexOf('/') + 1);

        return {
          albumId: photoDto.albumId,
          photoUrl: url,
          photoName: fileName,
        };
      });

      const photos = await this.photoService.createBatch(photoDataList);

      return Result.ok(photos, '添加成功');
    } catch (error) {
      this.logger.error(`批量添加照片失败: ${error.message}`);
      return Result.fail(`批量添加照片失败: ${error.message}`);
    }
  }

  /**
   * 删除照片
   */
  @ApiOperation({ summary: '删除照片', description: '根据ID删除照片' })
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
  @Delete('delete')
  @OperationLog(OperationType.DELETE)
  async remove(@Body() photoIds: number[]) {
    try {
      if (!photoIds || photoIds.length === 0) {
        return Result.fail('缺少照片ID参数', 400);
      }

      this.logger.log(`删除照片: id=${photoIds.join(',')}`);
      await this.photoService.remove(photoIds);
      return Result.ok(null, '删除成功');
    } catch (error) {
      this.logger.error(`删除照片失败: ${error.message}`);
      return Result.fail('删除照片失败');
    }
  }
}
