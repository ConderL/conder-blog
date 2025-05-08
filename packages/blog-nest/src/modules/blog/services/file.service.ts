import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlogFile } from '../entities/blog-file.entity';
import { createHash } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FileService {
  constructor(
    @InjectRepository(BlogFile)
    private readonly fileRepository: Repository<BlogFile>,
  ) {}

  /**
   * 上传文件
   */
  async uploadFile(file: Express.Multer.File, userId: number): Promise<BlogFile> {
    // 计算文件MD5
    const md5 = this.calculateMd5(file.buffer);

    // 处理文件名和路径
    const fileName = this.generateFileName(file.originalname);
    const uploadDir = this.getUploadDir();
    const filePath = path.join(uploadDir, fileName);

    // 保存文件到磁盘
    fs.writeFileSync(filePath, file.buffer);

    // 文件URL (可以根据您的实际需求修改)
    const fileUrl = `/uploads/${fileName}`;

    // 创建文件记录
    const blogFile = this.fileRepository.create({
      fileName: file.originalname,
      fileUrl,
      fileSize: file.size,
      fileType: file.mimetype,
      fileMd5: md5,
      userId,
    });

    return this.fileRepository.save(blogFile);
  }

  /**
   * 根据ID获取文件
   */
  async findById(id: number): Promise<BlogFile> {
    return this.fileRepository.findOne({ where: { id } });
  }

  /**
   * 获取用户的文件列表
   */
  async findByUserId(
    userId: number,
    page = 1,
    limit = 10,
  ): Promise<{ items: BlogFile[]; total: number }> {
    const [items, total] = await this.fileRepository.findAndCount({
      where: { userId, isDelete: 0 },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' } as any,
    });
    return { items, total };
  }

  /**
   * 删除文件（标记删除）
   */
  async remove(id: number): Promise<void> {
    await this.fileRepository.update(id, { isDelete: 1 });
  }

  /**
   * 计算文件MD5
   */
  private calculateMd5(buffer: Buffer): string {
    return createHash('md5').update(buffer).digest('hex');
  }

  /**
   * 生成唯一文件名
   */
  private generateFileName(originalName: string): string {
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 10000);
    const ext = path.extname(originalName);
    return `${timestamp}_${random}${ext}`;
  }

  /**
   * 获取上传目录，如果不存在则创建
   */
  private getUploadDir(): string {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    return uploadDir;
  }
}
