import { Controller, Get, Query, Param, Delete, UseGuards, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { UploadFileEntity } from '../entities/file.entity';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { ResultDto } from '../../../common/dtos/result.dto';
import { OperationLog } from '../../../common/decorators/operation-log.decorator';
import { OperationType } from '../../../common/enums/operation-type.enum';

@ApiTags('后台文件管理')
@Controller('admin/file')
@UseGuards(JwtAuthGuard)
export class AdminFileController {
  constructor(
    @InjectRepository(UploadFileEntity)
    private readonly fileRepository: Repository<UploadFileEntity>,
  ) {}

  /**
   * 查询文件列表
   */
  @Get('list')
  @ApiOperation({ summary: '查询文件列表' })
  @ApiBearerAuth()
  async getFileList(
    @Query('pageNum') pageNum = 1,
    @Query('pageSize') pageSize = 10,
    @Query('fileName') fileName?: string,
    @Query('type') type?: string,
    @Query('startTime') startTime?: string,
    @Query('endTime') endTime?: string,
  ): Promise<ResultDto<{ recordList: any[]; total: number }>> {
    try {
      console.log('查询文件列表，参数:', { pageNum, pageSize, fileName, type, startTime, endTime });

      // 构建查询条件
      const whereConditions: any = {};

      // 根据文件名查询（模糊匹配）
      if (fileName) {
        whereConditions.url = Like(`%${fileName}%`);
      }

      // 根据文件类型查询
      if (type) {
        whereConditions.path = Like(`%${type}%`);
      }

      // 时间范围查询
      if (startTime && endTime) {
        whereConditions.createTime = {
          $gte: new Date(startTime),
          $lte: new Date(endTime),
        };
      } else if (startTime) {
        whereConditions.createTime = {
          $gte: new Date(startTime),
        };
      } else if (endTime) {
        whereConditions.createTime = {
          $lte: new Date(endTime),
        };
      }

      // 分页查询
      const [files, total] = await this.fileRepository.findAndCount({
        where: whereConditions,
        order: { createTime: 'DESC' },
        skip: (pageNum - 1) * pageSize,
        take: pageSize,
      });

      // 处理文件数据，提取文件名和类型
      const recordList = files.map((file) => {
        // 从URL中提取文件名
        const urlParts = file.url.split('/');
        const fileName = urlParts[urlParts.length - 1];

        // 从路径中提取文件类型
        const pathParts = file.path.split('/');
        const fileType = pathParts[1] || 'unknown'; // 第二部分通常是类型（如image, file等）

        return {
          ...file,
          fileName,
          fileType,
          originalUrl: file.url, // 保留原始URL
        };
      });

      console.log(`查询到文件列表: ${recordList.length}条，总数: ${total}`);

      return ResultDto.success({
        recordList,
        total,
      });
    } catch (error) {
      console.error('查询文件列表失败:', error);
      return ResultDto.fail('查询文件列表失败: ' + error.message);
    }
  }

  /**
   * 删除文件
   */
  @Delete(':id')
  @ApiOperation({ summary: '删除文件' })
  @ApiBearerAuth()
  @OperationLog(OperationType.DELETE)
  async deleteFile(@Param('id') id: number): Promise<ResultDto<null>> {
    try {
      console.log(`删除文件，ID: ${id}`);

      // 查找文件
      const file = await this.fileRepository.findOne({ where: { id } });
      if (!file) {
        return ResultDto.fail(`文件不存在，ID: ${id}`);
      }

      // 删除文件记录
      await this.fileRepository.delete(id);

      // 注意：此处仅删除数据库记录，不删除实际文件
      // 如需删除实际文件，需要添加文件系统操作

      return ResultDto.success(null, '删除成功');
    } catch (error) {
      console.error('删除文件失败:', error);
      return ResultDto.fail('删除文件失败: ' + error.message);
    }
  }

  /**
   * 批量删除文件
   */
  @Post('delete')
  @ApiOperation({ summary: '批量删除文件' })
  @ApiBearerAuth()
  @OperationLog(OperationType.DELETE)
  async batchDeleteFiles(@Query('ids') ids: string): Promise<ResultDto<null>> {
    try {
      console.log(`批量删除文件，IDs: ${ids}`);

      if (!ids) {
        return ResultDto.fail('未指定要删除的文件ID');
      }

      // 解析ID列表
      const idArray = ids.split(',').map((id) => parseInt(id.trim()));
      if (idArray.length === 0) {
        return ResultDto.fail('无效的ID列表');
      }

      // 批量删除文件记录
      await this.fileRepository.delete(idArray);

      // 注意：此处仅删除数据库记录，不删除实际文件
      // 如需删除实际文件，需要添加文件系统操作

      return ResultDto.success(null, `成功删除${idArray.length}个文件`);
    } catch (error) {
      console.error('批量删除文件失败:', error);
      return ResultDto.fail('批量删除文件失败: ' + error.message);
    }
  }
}
