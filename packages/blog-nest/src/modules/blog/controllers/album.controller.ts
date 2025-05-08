import { Controller, Get, Logger, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { AlbumService } from '../services/album.service';
import { Result } from '../../../common/result';

/**
 * 相册数据传输对象
 */
class AlbumDto {
  id: number;
  albumName: string;
  albumCover: string;
  albumDesc: string;
}

/**
 * 前台相册控制器
 * 用于博客前台展示相册
 */
@ApiTags('前台相册')
@Controller('album')
export class AlbumController {
  private logger = new Logger(AlbumController.name);

  constructor(private readonly albumService: AlbumService) {}

  /**
   * 获取公开相册列表
   */
  @ApiOperation({
    summary: '获取公开相册列表',
    description: '获取所有公开状态的相册列表',
  })
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
            albumName: '风景',
            albumCover: 'https://example.com/cover.jpg',
            albumDesc: '美丽的风景照片',
          },
        ],
      },
    },
  })
  @Get('list')
  async findAll() {
    try {
      this.logger.log('获取前台公开相册列表');

      // 查询相册列表，仅获取公开状态的相册（status=1）
      const { records, count } = await this.albumService.findAll(1, 100, 1);

      this.logger.log(`获取前台公开相册列表成功，共${records.length}条记录`);

      // 将数据格式化为前端期望的格式（只返回前端需要的字段）
      const formattedAlbums = records.map((album) => {
        const { id, albumName, albumCover, albumDesc } = album;
        return { id, albumName, albumCover, albumDesc };
      });

      // 返回相册列表
      return Result.ok(formattedAlbums);
    } catch (error) {
      this.logger.error(`获取相册列表失败: ${error.message}`);
      return Result.fail('获取相册列表失败');
    }
  }
}
