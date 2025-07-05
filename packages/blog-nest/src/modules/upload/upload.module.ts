import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UploadService } from './services/upload/upload.service';
import { ImageProcessorService } from './services/image-processor/image-processor.service';
import { UploadController } from './controllers/upload/upload.controller';
import { FilesController } from './controllers/files.controller';
import { AdminFileController } from './controllers/admin-file.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { UploadFileEntity } from './entities/file.entity';

@Module({
  imports: [
    ConfigModule,
    MulterModule.register({
      storage: memoryStorage(),
      limits: {
        fileSize: 20 * 1024 * 1024,
      },
    }),
    TypeOrmModule.forFeature([UploadFileEntity]),
  ],
  controllers: [UploadController, FilesController, AdminFileController],
  providers: [UploadService, ImageProcessorService],
  exports: [UploadService, ImageProcessorService],
})
export class UploadModule implements OnModuleInit {
  constructor(private configService: ConfigService) { }

  async onModuleInit() {
    try {
      // 初始化上传目录
      const localPath = this.configService.get('upload.local.path', 'public/uploads');
      console.log('开始初始化上传目录结构');
      console.log('上传根目录路径:', path.resolve(localPath));

      await this.ensureDir(localPath);
      console.log('上传根目录初始化完成:', localPath);

      // 确保各类型目录都存在
      for (const type of ['image', 'file', 'avatar', 'article', 'site']) {
        const typePath = path.join(localPath, type);
        await this.ensureDir(typePath);
        console.log(`${type}上传目录初始化完成:`, typePath);

        // 创建当天日期目录
        const todayDir = path.join(typePath, new Date().toISOString().split('T')[0]);
        await this.ensureDir(todayDir);
        console.log(`${type}当天日期目录初始化完成:`, todayDir);
      }
    } catch (error) {
      console.error('初始化上传目录结构失败:', error);
    }
  }

  private async ensureDir(dir: string): Promise<void> {
    try {
      console.log('检查目录是否存在:', dir);
      // 检查目录是否存在
      try {
        await fs.promises.access(dir, fs.constants.F_OK);
        console.log('目录已存在:', dir);
      } catch (e) {
        // 目录不存在，创建目录（递归创建）
        console.log('目录不存在，创建目录:', dir);
        await fs.promises.mkdir(dir, { recursive: true });
        console.log('目录创建成功:', dir);
      }
    } catch (error) {
      console.error('创建目录失败:', dir, error);
      throw new Error(`创建目录失败: ${error.message}`);
    }
  }
}
