import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
  HttpStatus,
  Get,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { UploadService } from '../../services/upload/upload.service';
import { memoryStorage } from 'multer';
import * as fs from 'fs';
import * as path from 'path';

@ApiTags('文件上传')
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  /**
   * 上传图片
   * @param file 图片文件
   */
  @Post('image')
  @ApiOperation({ summary: '上传图片' })
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
  @ApiResponse({ status: HttpStatus.OK, description: '上传成功' })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB限制
      },
      storage: memoryStorage(), // 明确使用内存存储
    }),
  )
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    console.log('收到通用图片上传请求，file对象信息:', file ? '存在' : '不存在');
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
      return {
        code: 400,
        message: '请选择要上传的图片',
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

    try {
      // 确保Buffer对象存在
      if (!file.buffer || file.buffer.length === 0) {
        console.error('文件buffer为空或不存在');
        return {
          code: 400,
          message: '上传文件无效，请重新选择文件',
          data: null,
        };
      }

      // 强制转换为UTF-8编码的文件名
      const originalFilename = Buffer.from(file.originalname, 'binary').toString('utf8');
      console.log('转换后的文件名:', originalFilename);

      // 创建新的文件对象，确保所有属性正确
      const cleanFile = {
        ...file,
        originalname: originalFilename,
      };

      const result = await this.uploadService.uploadFile(cleanFile, 'image');
      return {
        code: 200,
        message: '上传成功',
        data: {
          url: result.url,
          name: file.originalname,
          originalName: file.originalname,
          alt: file.originalname,
          href: result.url,
          size: file.size,
          fileSize: file.size,
          type: file.mimetype,
        },
      };
    } catch (error) {
      console.error('上传处理失败:', error);
      return {
        code: 500,
        message: '上传失败: ' + error.message,
        data: null,
      };
    }
  }

  /**
   * 上传文件
   * @param file 文件
   */
  @Post('file')
  @ApiOperation({ summary: '上传文件' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: '文件',
        },
      },
    },
  })
  @ApiResponse({ status: HttpStatus.OK, description: '上传成功' })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB限制
      },
      storage: memoryStorage(),
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    console.log('收到通用文件上传请求，file对象信息:', file ? '存在' : '不存在');
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
      return {
        code: 400,
        message: '请选择要上传的文件',
        data: null,
      };
    }

    try {
      // 确保Buffer对象存在
      if (!file.buffer || file.buffer.length === 0) {
        console.error('文件buffer为空或不存在');
        return {
          code: 400,
          message: '上传文件无效，请重新选择文件',
          data: null,
        };
      }

      // 强制转换为UTF-8编码的文件名
      const originalFilename = Buffer.from(file.originalname, 'binary').toString('utf8');
      console.log('转换后的文件名:', originalFilename);

      // 创建新的文件对象，确保所有属性正确
      const cleanFile = {
        ...file,
        originalname: originalFilename,
      };

      const result = await this.uploadService.uploadFile(cleanFile, 'file');
      return {
        code: 200,
        message: '上传成功',
        data: {
          url: result.url,
          name: file.originalname,
          originalName: file.originalname,
          alt: file.originalname,
          href: result.url,
          size: file.size,
          fileSize: file.size,
          type: file.mimetype,
        },
      };
    } catch (error) {
      return {
        code: 500,
        message: '上传失败: ' + error.message,
        data: null,
      };
    }
  }

  /**
   * 上传头像
   * @param file 头像文件
   */
  @Post('avatar')
  @ApiOperation({ summary: '上传头像' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: '头像文件',
        },
      },
    },
  })
  @ApiResponse({ status: HttpStatus.OK, description: '上传成功' })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB限制
      },
      storage: memoryStorage(),
    }),
  )
  async uploadAvatar(@UploadedFile() file: Express.Multer.File) {
    console.log('收到头像上传请求，file对象信息:', file ? '存在' : '不存在');
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
      return {
        code: 400,
        message: '请选择要上传的头像',
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

    try {
      // 确保Buffer对象存在
      if (!file.buffer || file.buffer.length === 0) {
        console.error('文件buffer为空或不存在');
        return {
          code: 400,
          message: '上传文件无效，请重新选择文件',
          data: null,
        };
      }

      // 强制转换为UTF-8编码的文件名
      const originalFilename = Buffer.from(file.originalname, 'binary').toString('utf8');
      console.log('转换后的文件名:', originalFilename);

      // 创建新的文件对象，确保所有属性正确
      const cleanFile = {
        ...file,
        originalname: originalFilename,
      };

      const result = await this.uploadService.uploadFile(cleanFile, 'avatar');
      return {
        code: 200,
        message: '上传成功',
        data: {
          url: result.url,
          name: file.originalname,
          originalName: file.originalname,
          alt: file.originalname,
          href: result.url,
          size: file.size,
          fileSize: file.size,
          type: file.mimetype,
        },
      };
    } catch (error) {
      return {
        code: 500,
        message: '上传失败: ' + error.message,
        data: null,
      };
    }
  }

  /**
   * 检查文件是否存在
   * @param filePath 文件路径
   */
  @Get('check')
  @ApiOperation({ summary: '检查文件是否存在' })
  @ApiQuery({ name: 'path', description: '文件路径', required: true })
  async checkFile(@Query('path') filePath: string) {
    if (!filePath) {
      return {
        code: 400,
        message: '请提供文件路径',
        data: null,
      };
    }

    try {
      // 获取本地存储配置
      const localPath = this.uploadService.getUploadPath();

      // 处理路径 - 移除URL前缀
      let cleanPath = filePath;
      if (cleanPath.startsWith('http')) {
        // 移除域名部分，只保留路径
        const urlObj = new URL(cleanPath);
        cleanPath = urlObj.pathname;
      }
      // 移除开头的/uploads/
      if (cleanPath.startsWith('/uploads/')) {
        cleanPath = cleanPath.substring('/uploads/'.length);
      }

      // 构建完整的文件系统路径
      const fullPath = path.join(localPath, cleanPath);
      console.log('检查文件路径:', fullPath);

      // 检查文件是否存在
      const exists = fs.existsSync(fullPath);
      console.log('文件存在:', exists);

      if (exists) {
        const stats = fs.statSync(fullPath);
        return {
          code: 200,
          message: '文件存在',
          data: {
            exists: true,
            path: fullPath,
            size: stats.size,
            isFile: stats.isFile(),
            isDirectory: stats.isDirectory(),
            created: stats.birthtime,
            modified: stats.mtime,
          },
        };
      } else {
        return {
          code: 200,
          message: '文件不存在',
          data: {
            exists: false,
            path: fullPath,
          },
        };
      }
    } catch (error) {
      console.error('检查文件失败:', error);
      return {
        code: 500,
        message: '检查文件失败: ' + error.message,
        data: null,
      };
    }
  }
}
