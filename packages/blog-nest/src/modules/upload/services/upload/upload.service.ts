import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as dayjs from 'dayjs';
import * as crypto from 'crypto';
import * as https from 'https';
import * as url from 'url';
// 取消注释，启用阿里云OSS SDK
// import * as OSS from 'ali-oss';
// 注：这里引入ali-oss需要先安装依赖：npm install ali-oss @types/ali-oss --save
// 此处先注释，需要时取消注释
// import OSS from 'ali-oss';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { resolve, join, extname } from 'path';
import { customAlphabet } from 'nanoid';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UploadFileEntity } from '../../entities/file.entity';
// 导入ali-oss
import * as AliOSS from 'ali-oss';

/**
 * 文件上传服务
 */
@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly strategy: string;
  private readonly localPath: string;
  private readonly localUrl: string;
  private readonly ossCdnUrl: string;
  private readonly DATE_FORMAT = 'YYYY/MM'; // 只保留年月
  // OSS配置
  private readonly ossConfig: {
    accessKeyId: string;
    accessKeySecret: string;
    region: string;
    bucketName: string;
    endpoint: string;
  };

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(UploadFileEntity)
    private readonly fileRepository: Repository<UploadFileEntity>,
  ) {
    // 获取上传配置
    this.strategy = this.configService.get<string>('upload.strategy');
    this.localPath = this.configService.get<string>('upload.local.path');
    this.localUrl = this.configService.get<string>('upload.local.url');
    this.ossCdnUrl = this.configService.get<string>('upload.oss.cdnUrl');

    // 获取OSS配置
    this.ossConfig = {
      accessKeyId: this.configService.get<string>('upload.oss.accessKeyId'),
      accessKeySecret: this.configService.get<string>('upload.oss.accessKeySecret'),
      region: this.configService.get<string>('upload.oss.region'),
      bucketName: this.configService.get<string>('upload.oss.bucketName'),
      endpoint: this.configService.get<string>('upload.oss.endpoint'),
    };

    this.logger.log(`当前上传策略: ${this.strategy}`);
    this.logger.log(`CDN URL: ${this.ossCdnUrl || '未配置'}`);
  }

  // 计算文件MD5
  private calculateMd5(buffer: Buffer): string {
    return crypto.createHash('md5').update(buffer).digest('hex');
  }

  /**
   * 获取上传路径
   * @returns 上传根目录路径
   */
  getUploadPath(): string {
    return this.configService.get('upload.local.path', 'public/uploads/');
  }

  /**
   * 上传文件
   * @param file 文件对象
   * @param type 文件类型（image, file, avatar）
   * @param useDate 是否包含日期目录
   * @returns 上传结果
   */
  async uploadFile(
    file: Express.Multer.File,
    type = 'image',
    useDate = true,
  ): Promise<{ url: string; path: string }> {
    try {
      // 计算文件MD5
      const fileMd5 = this.calculateMd5(file.buffer);
      this.logger.log(`文件MD5值: ${fileMd5}`);

      // 检查是否已存在相同文件
      const existingFile = await this.fileRepository.findOne({ where: { fileMd5 } });
      if (existingFile) {
        this.logger.log(`找到重复文件，直接返回: ${existingFile.url}`);
        return {
          url: existingFile.url,
          path: existingFile.path,
        };
      }

      this.logger.log(`文件上传策略: ${this.strategy}`);

      // 根据不同策略上传文件
      let result;
      if (this.strategy === 'oss') {
        // 校验OSS配置是否完整
        if (!this.validateOssConfig()) {
          this.logger.warn('OSS配置不完整，将使用本地存储');
          result = await this.uploadToLocal(file, type, useDate);
        } else {
          result = await this.uploadToOSS(file, type, useDate);
        }
      } else {
        // 默认使用本地存储
        result = await this.uploadToLocal(file, type, useDate);
      }

      // 保存文件信息到数据库
      try {
        const saveResult = await this.fileRepository.save({
          fileMd5,
          url: result.url,
          path: result.path,
          fileSize: file.size || 0, // 保存文件大小
        });
        this.logger.log(`文件记录保存成功: ${JSON.stringify(saveResult)}`);
      } catch (dbError) {
        this.logger.error(`保存文件记录失败: ${dbError.message}`, dbError.stack);
        // 继续返回上传结果，即使数据库记录失败
      }

      return result;
    } catch (error) {
      this.logger.error(`上传处理失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 本地上传
   * @param file 文件对象
   * @param type 文件类型
   * @param useDate 是否包含日期目录
   * @returns 上传结果
   */
  private async uploadToLocal(
    file: Express.Multer.File,
    type: string,
    useDate = true,
  ): Promise<{ url: string; path: string }> {
    try {
      this.logger.log('开始上传文件到本地服务器');

      // 生成文件名
      const nanoid = customAlphabet('1234567890abcdef', 10);
      const fileName = `${nanoid()}${extname(file.originalname)}`;

      // 构建本地存储路径，轮播图类型不包含日期
      let directory;
      if (type === 'carousel') {
        directory = join(this.localPath, type);
      } else {
        // 其他类型按年月分类
        const dateFolder = useDate ? dayjs().format(this.DATE_FORMAT) : '';
        directory = dateFolder
          ? join(this.localPath, type, dateFolder)
          : join(this.localPath, type);
      }

      // 确保目录存在
      this.ensureDir(directory);

      // 生成文件存储路径
      const filePath = join(directory, fileName);

      // 保存文件
      writeFileSync(resolve(process.cwd(), filePath), file.buffer);

      // 构建访问URL
      const fileUrl = `${this.localUrl}${filePath.replace(/\\/g, '/')}`;

      this.logger.log(`文件上传到本地成功: ${fileUrl}`);

      return {
        url: fileUrl,
        path: filePath,
      };
    } catch (error) {
      this.logger.error(`上传文件到本地失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 上传至阿里云OSS
   * @param file 文件对象
   * @param type 文件类型
   * @param useDate 是否包含日期目录
   * @returns 上传结果
   */
  private async uploadToOSS(
    file: Express.Multer.File,
    type: string,
    useDate = true,
  ): Promise<{ url: string; path: string }> {
    try {
      this.logger.log('开始上传文件到阿里云OSS');

      // 创建OSS客户端
      const client = new AliOSS({
        accessKeyId: this.ossConfig.accessKeyId,
        accessKeySecret: this.ossConfig.accessKeySecret,
        region: this.ossConfig.region,
        bucket: this.ossConfig.bucketName,
        endpoint: this.ossConfig.endpoint,
      });

      // 生成文件名
      const nanoid = customAlphabet('1234567890abcdef', 10);
      const fileName = `${nanoid()}${extname(file.originalname)}`;

      // 构建OSS路径，轮播图类型不包含日期
      let ossPath;
      if (type === 'carousel') {
        ossPath = `${type}/${fileName}`;
      } else {
        // 其他类型按年月分类
        const dateFolder = useDate ? dayjs().format(this.DATE_FORMAT) : '';
        ossPath = dateFolder ? `${type}/${dateFolder}/${fileName}` : `${type}/${fileName}`;
      }

      // 上传文件到OSS
      const result = await client.put(ossPath, file.buffer);
      this.logger.log(`文件上传到OSS成功: ${result.url}`);

      // 使用OSS CDN替换URL
      let fileUrl = result.url;
      if (this.ossCdnUrl) {
        try {
          const ossUrl = new URL(result.url);
          fileUrl = `${this.ossCdnUrl}${ossUrl.pathname}`;
          this.logger.log(`替换为CDN URL: ${fileUrl}`);
        } catch (error) {
          this.logger.error(`URL替换失败: ${error.message}`);

          // 备用方案: 直接硬编码替换域名
          if (result.url.includes('aliyuncs.com')) {
            fileUrl = result.url.replace(/https?:\/\/[^\/]+/, this.ossCdnUrl);
            this.logger.log(`备用方案替换URL: ${fileUrl}`);
          }
        }
      }

      return {
        url: fileUrl,
        path: ossPath,
      };
    } catch (error) {
      this.logger.error(`上传文件到OSS失败: ${error.message}`, error.stack);
      // 如果上传到OSS失败，则尝试上传到本地
      this.logger.warn('OSS上传失败，将使用本地存储');
      return this.uploadToLocal(file, type, useDate);
    }
  }

  /**
   * 使用HTTPS模块上传到OSS
   * 注意：这是一个简化的实现，仅作为临时方案
   * 生产环境应使用官方SDK
   */
  private async uploadToOssWithHttps(
    buffer: Buffer,
    objectName: string,
    ossConfig: any,
  ): Promise<void> {
    const { accessKeyId, accessKeySecret, bucketName, endpoint } = ossConfig;

    // 构建请求URL
    const parsedUrl = url.parse(endpoint);
    const host = `${bucketName}.${parsedUrl.host}`;
    const date = new Date().toUTCString();
    const contentType = 'application/octet-stream';

    // 构建签名
    const stringToSign = `PUT\n\n${contentType}\n${date}\n/${bucketName}/${objectName}`;
    const signature = crypto
      .createHmac('sha1', accessKeySecret)
      .update(stringToSign)
      .digest('base64');

    // 构建请求选项
    const options = {
      hostname: host,
      port: 443,
      path: `/${objectName}`,
      method: 'PUT',
      headers: {
        'Content-Type': contentType,
        'Content-Length': buffer.length,
        Host: host,
        Date: date,
        Authorization: `OSS ${accessKeyId}:${signature}`,
      },
    };

    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve();
          } else {
            reject(new Error(`上传失败，状态码: ${res.statusCode}, 响应: ${data}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.write(buffer);
      req.end();
    });
  }

  /**
   * 上传至腾讯云COS
   * @param file 文件对象
   * @param type 文件类型
   * @returns 上传结果
   */
  private async uploadToCOS(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _file: Express.Multer.File,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _type: string,
  ): Promise<{ url: string; path: string }> {
    // TODO: 集成腾讯云COS SDK
    // 实现上传逻辑
    throw new Error('腾讯云COS上传暂未实现');
  }

  /**
   * 上传至七牛云
   * @param file 文件对象
   * @param type 文件类型
   * @returns 上传结果
   */
  private async uploadToQiniu(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _file: Express.Multer.File,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _type: string,
  ): Promise<{ url: string; path: string }> {
    // TODO: 集成七牛云SDK
    // 实现上传逻辑
    throw new Error('七牛云上传暂未实现');
  }

  /**
   * 确保目录存在
   * @param dir 目录路径
   */
  private ensureDir(dir: string): void {
    const fullPath = resolve(process.cwd(), dir);
    this.logger.log(`检查目录是否存在: ${fullPath}`);

    if (!existsSync(fullPath)) {
      this.logger.log(`目录不存在，开始创建: ${fullPath}`);
      mkdirSync(fullPath, { recursive: true });
      this.logger.log(`目录创建成功: ${fullPath}`);
    } else {
      this.logger.log(`目录已存在: ${fullPath}`);
    }
  }

  /**
   * 验证OSS配置是否完整
   */
  private validateOssConfig(): boolean {
    const { accessKeyId, accessKeySecret, bucketName } = this.ossConfig;
    if (!accessKeyId || !accessKeySecret || !bucketName) {
      return false;
    }
    return true;
  }
}
