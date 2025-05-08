import { Controller, Get, Param, Res, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';

@ApiTags('文件访问')
@Controller('uploads')
export class FilesController {
  constructor(private configService: ConfigService) {}

  @Get(':type/:date/:filename')
  @ApiOperation({ summary: '获取上传文件' })
  @ApiParam({ name: 'type', description: '文件类型', example: 'image' })
  @ApiParam({ name: 'date', description: '日期', example: '2025-04-18' })
  @ApiParam({ name: 'filename', description: '文件名', example: '1744968262755-d491e6ef.jpg' })
  getFile(
    @Param('type') type: string,
    @Param('date') date: string,
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    // 获取配置的上传路径
    const uploadsPath = this.configService.get('upload.local.path', 'public/uploads');

    // 构建完整的文件路径
    const filePath = path.join(uploadsPath, type, date, filename);
    console.log('获取文件路径:', filePath);

    try {
      // 检查文件是否存在
      if (!fs.existsSync(filePath)) {
        console.error('文件不存在:', filePath);
        return res.status(404).json({
          flag: false,
          code: 404,
          msg: `文件不存在: ${type}/${date}/${filename}`,
          data: null,
        });
      }

      // 设置适当的Content-Type
      if (filename.endsWith('.jpg') || filename.endsWith('.jpeg')) {
        res.setHeader('Content-Type', 'image/jpeg');
      } else if (filename.endsWith('.png')) {
        res.setHeader('Content-Type', 'image/png');
      } else if (filename.endsWith('.gif')) {
        res.setHeader('Content-Type', 'image/gif');
      } else if (filename.endsWith('.webp')) {
        res.setHeader('Content-Type', 'image/webp');
      } else {
        res.setHeader('Content-Type', 'application/octet-stream');
      }

      // 设置缓存控制
      res.setHeader('Cache-Control', 'public, max-age=2592000'); // 30天

      // 直接使用Express的sendFile方法返回文件
      return res.sendFile(path.resolve(filePath));
    } catch (error) {
      console.error('获取文件失败:', error);
      return res.status(500).json({
        flag: false,
        code: 500,
        msg: `获取文件失败: ${error.message}`,
        data: null,
      });
    }
  }
}
