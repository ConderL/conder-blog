import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Query,
  Param,
  Logger,
  UseInterceptors,
  UploadedFile,
  Put,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';
import { AlbumService } from '../services/album.service';
import { Result } from '../../../common/result';
import { Auth } from '../../../decorators/auth.decorator';
import { Album } from '../entities/album.entity';
import { UploadService } from '../../upload/services/upload/upload.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { OperationLog } from '../../../common/decorators/operation-log.decorator';
import { OperationType } from '../../../common/enums/operation-type.enum';

/**
 * 管理端相册控制器
 * 用于管理员管理相册
 */
@ApiTags('管理端相册管理')
@Controller('admin/album')
@Auth()
export class AdminAlbumController {
  private logger = new Logger(AdminAlbumController.name);

  constructor(
    private readonly albumService: AlbumService,
    private readonly uploadService: UploadService,
  ) {}

  /**
   * 获取相册列表（后台）
   */
  @ApiOperation({
    summary: '获取相册列表',
    description: '获取所有相册列表，支持按状态筛选',
  })
  @ApiQuery({ name: 'current', required: false, description: '当前页码，默认为1' })
  @ApiQuery({ name: 'size', required: false, description: '每页数量，默认为10' })
  @ApiQuery({ name: 'status', required: false, description: '状态（1-公开，2-私密）' })
  @ApiResponse({
    status: 200,
    description: '返回相册列表及分页信息',
    schema: {
      example: {
        code: 200,
        message: '操作成功',
        data: {
          recordList: [
            {
              id: 1,
              albumName: '相册名称',
              albumCover: '封面URL',
              albumDesc: '相册描述',
              status: 1,
              createTime: '2023-01-01 00:00:00',
              updateTime: '2023-01-01 00:00:00',
            },
          ],
          count: 1,
          total: 10,
          current: 1,
          size: 10,
        },
      },
    },
  })
  @Get('list')
  async findAll(
    @Query('current') current = 1,
    @Query('size') size = 10,
    @Query('status') status?: number,
  ) {
    try {
      this.logger.log(`获取相册列表: current=${current}, size=${size}, status=${status}`);

      // 转换参数类型
      const params = {
        current: +current,
        size: +size,
        status: status !== undefined ? (Number.isNaN(+status) ? undefined : +status) : undefined,
      };

      const { records, count } = await this.albumService.findAll(
        params.current,
        params.size,
        params.status,
      );

      return Result.ok({
        recordList: records,
        count: records.length,
        total: count,
        current: params.current,
        size: params.size,
      });
    } catch (error) {
      this.logger.error(`获取相册列表失败: ${error.message}`);
      return Result.fail('获取相册列表失败');
    }
  }

  /**
   * 添加相册
   */
  @ApiOperation({ summary: '添加相册', description: '创建一个新的相册' })
  @ApiResponse({
    status: 200,
    description: '添加成功',
    schema: {
      example: {
        code: 200,
        message: '添加成功',
        data: {
          id: 1,
          albumName: '相册名称',
          albumCover: '封面URL',
          albumDesc: '相册描述',
          status: 1,
          createTime: '2023-01-01 00:00:00',
          updateTime: '2023-01-01 00:00:00',
        },
      },
    },
  })
  @Post('add')
  @OperationLog(OperationType.CREATE)
  async create(@Body() albumData: Partial<Album>) {
    try {
      this.logger.log(`添加相册: ${JSON.stringify(albumData)}`);
      const result = await this.albumService.create(albumData);
      return Result.ok(result, '添加成功');
    } catch (error) {
      this.logger.error(`添加相册失败: ${error.message}`);
      return Result.fail('添加相册失败');
    }
  }

  /**
   * 删除相册
   */
  @ApiOperation({ summary: '删除相册', description: '根据ID删除相册' })
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
  @Delete('delete/:id')
  @OperationLog(OperationType.DELETE)
  async remove(@Param('id') id: string) {
    try {
      this.logger.log(`删除相册: id=${id}`);
      await this.albumService.remove(+id);
      return Result.ok(null, '删除成功');
    } catch (error) {
      this.logger.error(`删除相册失败: ${error.message}`);
      return Result.fail('删除相册失败');
    }
  }

  /**
   * 更新相册
   */
  @ApiOperation({ summary: '更新相册', description: '更新相册信息' })
  @ApiResponse({
    status: 200,
    description: '更新成功',
    schema: {
      example: {
        code: 200,
        message: '更新成功',
        data: {
          id: 1,
          albumName: '相册名称',
          albumCover: '封面URL',
          albumDesc: '相册描述',
          status: 1,
          createTime: '2023-01-01 00:00:00',
          updateTime: '2023-01-01 00:00:00',
        },
      },
    },
  })
  @Put('update')
  @OperationLog(OperationType.UPDATE)
  async update(@Body() album: Partial<Album>) {
    try {
      const { id, ...updateData } = album;
      if (!id) {
        return Result.fail('缺少相册ID');
      }
      this.logger.log(`更新相册: id=${id}`);
      const result = await this.albumService.update(id, updateData);
      return Result.ok(result, '更新成功');
    } catch (error) {
      this.logger.error(`更新相册失败: ${error.message}`);
      return Result.fail('更新相册失败');
    }
  }

  /**
   * 获取相册详情
   */
  @ApiOperation({ summary: '获取相册详情', description: '根据ID获取相册详情' })
  @ApiResponse({
    status: 200,
    description: '操作成功',
    schema: {
      example: {
        code: 200,
        message: '操作成功',
        data: {
          id: 1,
          albumName: '相册名称',
          albumCover: '封面URL',
          albumDesc: '相册描述',
          status: 1,
          createTime: '2023-01-01 00:00:00',
          updateTime: '2023-01-01 00:00:00',
        },
      },
    },
  })
  @Get('detail/:id')
  async findOne(@Param('id') id: string) {
    try {
      this.logger.log(`获取相册详情: id=${id}`);
      const album = await this.albumService.findById(+id);
      return Result.ok(album);
    } catch (error) {
      this.logger.error(`获取相册详情失败: ${error.message}`);
      return Result.fail('获取相册详情失败');
    }
  }

  /**
   * 上传相册图片
   */
  @ApiOperation({ summary: '上传相册图片', description: '上传相册图片文件' })
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
  @ApiResponse({
    status: 200,
    description: '上传成功',
    schema: {
      example: {
        code: 200,
        message: '上传成功',
        data: 'https://example.com/uploads/album/2023/06/image.jpg',
      },
    },
  })
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  @OperationLog(OperationType.UPLOAD)
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    try {
      if (!file) {
        return Result.fail('未检测到上传文件', null);
      }

      this.logger.log(`上传相册图片: ${file.originalname}, 大小: ${file.size} 字节`);

      // 检查文件类型
      const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif'];
      if (!allowedMimeTypes.includes(file.mimetype)) {
        return Result.fail('仅支持上传 JPG、PNG、GIF、WebP 和 AVIF 格式的图片', null);
      }

      // 使用上传服务上传文件
      const result = await this.uploadService.uploadFile(file, 'album');

      return Result.ok(result.url, '上传成功');
    } catch (error) {
      this.logger.error(`上传相册图片失败: ${error.message}`);
      return Result.fail(`上传相册图片失败: ${error.message}`);
    }
  }
}
