import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * 上传文件实体
 */
@Entity({ name: 't_upload_file' })
export class UploadFileEntity {
  /**
   * 主键id
   */
  @PrimaryGeneratedColumn({
    type: 'int',
    name: 'id',
    comment: '主键id',
  })
  id: number;

  /**
   * 文件MD5
   */
  @Column({
    type: 'varchar',
    name: 'file_md5',
    unique: true,
    comment: '文件MD5',
    length: 32,
  })
  fileMd5: string;

  /**
   * 文件访问地址
   */
  @Column({
    type: 'varchar',
    name: 'url',
    comment: '文件访问地址',
    length: 255,
  })
  url: string;

  /**
   * 文件存储路径
   */
  @Column({
    type: 'varchar',
    name: 'path',
    comment: '文件存储路径',
    length: 255,
  })
  path: string;

  /**
   * 文件大小（字节）
   */
  @Column({
    type: 'int',
    name: 'file_size',
    comment: '文件大小（字节）',
    default: 0,
  })
  fileSize: number;

  /**
   * 创建时间
   */
  @CreateDateColumn({
    type: 'datetime',
    name: 'create_time',
    comment: '创建时间',
  })
  createTime: Date;
}
