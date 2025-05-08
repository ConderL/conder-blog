import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiQuery, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { FileService } from '../services/file.service';
import { BlogFile } from '../entities/blog-file.entity';

@ApiTags('文件管理')
@Controller('files')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('upload')
  @ApiOperation({ summary: '上传文件' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Request() req): Promise<BlogFile> {
    return this.fileService.uploadFile(file, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: '获取用户文件列表' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @UseGuards(JwtAuthGuard)
  async findAll(
    @Request() req,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ): Promise<{ items: BlogFile[]; total: number }> {
    return this.fileService.findByUserId(req.user.id, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取文件详情' })
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: number): Promise<BlogFile> {
    return this.fileService.findById(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除文件' })
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: number): Promise<void> {
    return this.fileService.remove(id);
  }
}
