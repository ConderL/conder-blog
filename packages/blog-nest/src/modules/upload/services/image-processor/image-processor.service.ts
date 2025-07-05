import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sharp from 'sharp';
import { extname } from 'path';

/**
 * 图片处理配置接口
 */
interface ImageProcessingOptions {
  // 是否启用AVIF转换
  enableAvif: boolean;
  // AVIF质量 (1-100)
  avifQuality: number;
  // 最大宽度 (像素)
  maxWidth?: number;
  // 最大高度 (像素)
  maxHeight?: number;
  // 是否保留原始格式作为备份
  keepOriginal: boolean;
}

/**
 * 图片处理结果接口
 */
interface ProcessedImageResult {
  // 处理后的图片buffer
  buffer: Buffer;
  // 文件扩展名 (包含点，如 .avif)
  extension: string;
  // 原始文件大小 (字节)
  originalSize: number;
  // 处理后文件大小 (字节)
  processedSize: number;
  // 处理是否成功
  success: boolean;
  // 处理信息
  info?: sharp.OutputInfo;
  // 错误信息
  error?: string;
}

/**
 * 图片处理服务
 * 用于处理上传的图片，包括压缩和格式转换
 */
@Injectable()
export class ImageProcessorService {
  private readonly logger = new Logger(ImageProcessorService.name);
  private readonly defaultOptions: ImageProcessingOptions;

  constructor(private readonly configService: ConfigService) {
    // 从配置中读取默认选项
    this.defaultOptions = {
      enableAvif: this.configService.get<boolean>('upload.imageProcessor.enableAvif', true),
      avifQuality: this.configService.get<number>('upload.imageProcessor.avifQuality', 80),
      maxWidth: this.configService.get<number>('upload.imageProcessor.maxWidth', 1920),
      maxHeight: this.configService.get<number>('upload.imageProcessor.maxHeight', 1080),
      keepOriginal: this.configService.get<boolean>('upload.imageProcessor.keepOriginal', false),
    };

    this.logger.log(`图片处理服务初始化，默认配置: ${JSON.stringify(this.defaultOptions)}`);
  }

  /**
   * 判断文件是否为支持的图片类型
   * @param mimetype 文件MIME类型
   * @returns 是否为支持的图片类型
   */
  isSupportedImageType(mimetype: string): boolean {
    const supportedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/avif',
      'image/svg+xml',
    ];
    return supportedTypes.includes(mimetype);
  }

  /**
   * 处理图片
   * @param buffer 原始图片buffer
   * @param originalName 原始文件名
   * @param mimetype 文件MIME类型
   * @param options 处理选项
   * @returns 处理结果
   */
  async processImage(
    buffer: Buffer,
    originalName: string,
    mimetype: string,
    options?: Partial<ImageProcessingOptions>,
  ): Promise<ProcessedImageResult> {
    // 合并选项
    const processingOptions: ImageProcessingOptions = {
      ...this.defaultOptions,
      ...options,
    };

    // 检查是否为支持的图片类型
    if (!this.isSupportedImageType(mimetype)) {
      this.logger.warn(`不支持的图片类型: ${mimetype}，跳过处理`);
      return {
        buffer,
        extension: extname(originalName),
        originalSize: buffer.length,
        processedSize: buffer.length,
        success: false,
        error: '不支持的图片类型',
      };
    }

    try {
      this.logger.log(`开始处理图片: ${originalName}, 大小: ${buffer.length} 字节`);

      // 如果是SVG，直接返回原始文件
      if (mimetype === 'image/svg+xml') {
        return {
          buffer,
          extension: extname(originalName),
          originalSize: buffer.length,
          processedSize: buffer.length,
          success: true,
        };
      }

      // 如果是GIF，暂时不处理（保留动画）
      if (mimetype === 'image/gif') {
        return {
          buffer,
          extension: extname(originalName),
          originalSize: buffer.length,
          processedSize: buffer.length,
          success: true,
        };
      }

      // 创建Sharp实例
      let image = sharp(buffer);

      // 获取图片元数据
      const metadata = await image.metadata();
      this.logger.log(`图片元数据: ${JSON.stringify(metadata)}`);

      // 调整图片尺寸（如果需要）
      if (processingOptions.maxWidth || processingOptions.maxHeight) {
        const width = metadata.width;
        const height = metadata.height;

        if (width && height) {
          // 只有当图片尺寸超过限制时才调整大小
          if (
            (processingOptions.maxWidth && width > processingOptions.maxWidth) ||
            (processingOptions.maxHeight && height > processingOptions.maxHeight)
          ) {
            image = image.resize({
              width: processingOptions.maxWidth,
              height: processingOptions.maxHeight,
              fit: 'inside', // 保持宽高比
              withoutEnlargement: true, // 不放大小图片
            });
            this.logger.log(`调整图片尺寸至最大: ${processingOptions.maxWidth}x${processingOptions.maxHeight}`);
          }
        }
      }

      // 转换为AVIF格式（如果启用）
      let processedBuffer: Buffer;
      let extension: string;
      let outputInfo: sharp.OutputInfo;

      if (processingOptions.enableAvif) {
        // 转换为AVIF
        processedBuffer = await image
          .avif({
            quality: processingOptions.avifQuality,
            effort: 4, // 压缩效率 (0-9)，越高压缩率越好但越慢
          })
          .toBuffer({ resolveWithObject: true })
          .then((result) => {
            outputInfo = result.info;
            return result.data;
          });
        extension = '.avif';
        this.logger.log(`转换为AVIF格式完成，质量: ${processingOptions.avifQuality}`);
      } else {
        // 保持原格式，但进行优化
        switch (metadata.format) {
          case 'jpeg':
            processedBuffer = await image
              .jpeg({ quality: 85, progressive: true })
              .toBuffer({ resolveWithObject: true })
              .then((result) => {
                outputInfo = result.info;
                return result.data;
              });
            extension = '.jpg';
            break;
          case 'png':
            processedBuffer = await image
              .png({ compressionLevel: 9, progressive: false })
              .toBuffer({ resolveWithObject: true })
              .then((result) => {
                outputInfo = result.info;
                return result.data;
              });
            extension = '.png';
            break;
          case 'webp':
            processedBuffer = await image
              .webp({ quality: 85 })
              .toBuffer({ resolveWithObject: true })
              .then((result) => {
                outputInfo = result.info;
                return result.data;
              });
            extension = '.webp';
            break;
          default:
            // 其他格式保持不变
            processedBuffer = buffer;
            extension = extname(originalName);
            outputInfo = metadata as any;
            break;
        }
        this.logger.log(`优化原格式完成: ${metadata.format}`);
      }

      // 计算压缩比例
      const originalSize = buffer.length;
      const processedSize = processedBuffer.length;
      const compressionRatio = ((originalSize - processedSize) / originalSize) * 100;

      this.logger.log(
        `图片处理完成: 原始大小=${originalSize}字节, 处理后大小=${processedSize}字节, ` +
        `压缩率=${compressionRatio.toFixed(2)}%, 格式=${extension}`
      );

      return {
        buffer: processedBuffer,
        extension,
        originalSize,
        processedSize,
        success: true,
        info: outputInfo,
      };
    } catch (error) {
      this.logger.error(`图片处理失败: ${error.message}`, error.stack);
      return {
        buffer,
        extension: extname(originalName),
        originalSize: buffer.length,
        processedSize: buffer.length,
        success: false,
        error: error.message,
      };
    }
  }
} 