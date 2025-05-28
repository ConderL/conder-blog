import { Controller, Get, Logger, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { PhotoService } from '../services/photo.service';
import { AlbumService } from '../services/album.service';
import { Result } from '../../../common/result';
import { Public } from '../../../common/decorators/public.decorator';
/**
 * 前台照片控制器
 * 用于博客前台展示照片
 */
@ApiTags('前台照片')
@Controller('photo')
export class PhotoController {
  private logger = new Logger(PhotoController.name);

  constructor(
    private readonly photoService: PhotoService,
    private readonly albumService: AlbumService,
  ) {}

  /**
   * 获取相册照片列表
   */
  @ApiOperation({
    summary: '获取相册照片列表',
    description: '获取指定相册的照片列表',
  })
  @ApiQuery({ name: 'albumId', required: true, description: '相册ID' })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    schema: {
      example: {
        code: 200,
        message: '操作成功',
        data: {
          albumName: '风景',
          photoVOList: [
            {
              id: 1,
              photoUrl: 'https://example.com/photo.jpg',
            },
          ],
        },
      },
    },
  })
  @Public()
  @Get('list')
  async findAll(@Query('albumId') albumId: number) {
    try {
      if (!albumId) {
        return Result.fail('缺少相册ID参数');
      }

      this.logger.log(`获取前台相册照片列表: albumId=${albumId}`);

      // 查询相册信息，仅处理公开状态的相册（status=1）
      const album = await this.albumService.findById(+albumId);
      if (!album) {
        return Result.fail('相册不存在');
      }

      if (album.status !== 1) {
        return Result.fail('该相册不存在或已被设为私密');
      }

      // 查询照片列表，不分页，按创建时间倒序获取所有照片
      const { records } = await this.photoService.findAll(1, 1000, +albumId);

      this.logger.log(
        `获取前台相册照片列表成功，相册:${album.albumName}，共${records.length}张照片`,
      );

      // 将数据格式化为前端期望的格式（只返回id和photoUrl）
      const photoVOList = records.map((photo) => {
        const { id, photoUrl } = photo;
        return { id, photoUrl };
      });

      // 返回照片列表和相册名
      return Result.ok({
        albumName: album.albumName,
        photoVOList,
      });
    } catch (error) {
      this.logger.error(`获取相册照片列表失败: ${error.message}`);
      return Result.fail('获取相册照片列表失败');
    }
  }
}
