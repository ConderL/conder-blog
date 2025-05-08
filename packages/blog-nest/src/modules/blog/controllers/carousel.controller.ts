import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Put,
  UseInterceptors,
  UploadedFile,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';
import { Public } from '../../../common/decorators/public.decorator';
import { CarouselService } from '../services/carousel.service';
import { CreateCarouselDto, UpdateCarouselDto, CarouselQuery } from '../dto/carousel.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { Carousel } from '../entities/carousel.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from '../../../modules/upload/services/upload/upload.service';
import { memoryStorage } from 'multer';
import { OperationLog } from '../../../common/decorators/operation-log.decorator';
import { OperationType } from '../../../common/enums/operation-type.enum';

/**
 * 轮播图前台控制器
 */
@ApiTags('轮播图')
@Controller('carousel')
export class CarouselController {
  constructor(private readonly carouselService: CarouselService) {}
  @Public()
  @Get('list')
  @ApiOperation({ summary: '获取前台展示的轮播图列表' })
  @ApiResponse({ status: 200, description: '成功', type: [Carousel] })
  async getFrontList() {
    return {
      code: 200,
      message: '获取成功',
      data: await this.carouselService.findFrontList(),
    };
  }
}

/**
 * 轮播图后台管理控制器
 */
@ApiTags('管理员-轮播图管理')
@Controller('admin/carousel')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AdminCarouselController {
  constructor(
    private readonly carouselService: CarouselService,
    private readonly uploadService: UploadService,
  ) {}

  @Post('add')
  @ApiOperation({ summary: '创建轮播图' })
  @ApiBody({ type: CreateCarouselDto })
  @ApiResponse({ status: 201, description: '创建成功', type: Carousel })
  @OperationLog(OperationType.CREATE)
  async create(@Body() createCarouselDto: CreateCarouselDto) {
    return {
      code: 201,
      message: '创建成功',
      data: await this.carouselService.create(createCarouselDto),
    };
  }

  @Get()
  @Public()
  @ApiOperation({ summary: '获取轮播图列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findAll(@Query() query: CarouselQuery) {
    return {
      code: 200,
      message: '获取成功',
      data: await this.carouselService.findAll(query),
    };
  }

  @Get('list')
  @Public()
  @ApiOperation({ summary: '获取轮播图列表(适配前端)' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findList(
    @Query('current') current: string,
    @Query('size') size: string,
    @Query('status') status: string,
  ) {
    const query: CarouselQuery = {
      page: current ? parseInt(current) : 1,
      pageSize: size ? parseInt(size) : 10,
    };

    if (status && status !== 'undefined' && status !== 'null') {
      query.status = parseInt(status);
    }

    return {
      code: 200,
      message: '获取成功',
      data: await this.carouselService.findAll(query),
    };
  }

  @Post('upload')
  @ApiOperation({ summary: '上传轮播图图片' })
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
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB限制
      },
      storage: memoryStorage(), // 使用内存存储
    }),
  )
  @OperationLog(OperationType.UPLOAD)
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      return {
        code: 400,
        message: '请选择要上传的图片',
        data: null,
      };
    }

    // 检查文件格式
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return {
        code: 400,
        message: '只允许上传jpg, png, gif, webp格式的图片',
        data: null,
      };
    }

    try {
      const result = await this.uploadService.uploadFile(file, 'carousel');
      return {
        code: 200,
        message: '上传成功',
        data: result.url,
      };
    } catch (error) {
      return {
        code: 500,
        message: '上传失败: ' + error.message,
        data: null,
      };
    }
  }

  @Get(':id')
  @ApiOperation({ summary: '获取轮播图详情' })
  @ApiParam({ name: 'id', description: '轮播图ID' })
  @ApiResponse({ status: 200, description: '获取成功', type: Carousel })
  async findOne(@Param('id') id: string) {
    return {
      code: 200,
      message: '获取成功',
      data: await this.carouselService.findOne(+id),
    };
  }

  @Put('update')
  @ApiOperation({ summary: '更新轮播图(适配前端)' })
  @ApiBody({ type: UpdateCarouselDto })
  @ApiResponse({ status: 200, description: '更新成功', type: Carousel })
  @OperationLog(OperationType.UPDATE)
  async updateCarousel(
    @Body(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: false,
        transformOptions: { enableImplicitConversion: true },
      }),
    )
    updateCarouselDto: UpdateCarouselDto,
  ) {
    console.log('进入更新方法 updateCarousel');
    console.log('请求体:', JSON.stringify(updateCarouselDto));

    try {
      const result = await this.carouselService.update(updateCarouselDto.id, updateCarouselDto);
      console.log('更新成功:', JSON.stringify(result));
      return {
        code: 200,
        message: '更新成功',
        data: result,
      };
    } catch (error) {
      console.error('更新失败:', error);
      return {
        code: 500,
        message: '更新失败: ' + error.message,
        data: null,
      };
    }
  }

  @Put(':id')
  @ApiOperation({ summary: '更新轮播图' })
  @ApiParam({ name: 'id', description: '轮播图ID' })
  @ApiBody({ type: UpdateCarouselDto })
  @ApiResponse({ status: 200, description: '更新成功', type: Carousel })
  @OperationLog(OperationType.UPDATE)
  async update(@Param('id') id: string, @Body() updateCarouselDto: UpdateCarouselDto) {
    return {
      code: 200,
      message: '更新成功',
      data: await this.carouselService.update(+id, updateCarouselDto),
    };
  }

  @Delete('delete')
  @ApiOperation({ summary: '删除轮播图' })
  @ApiParam({ name: 'id', description: '轮播图ID' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @OperationLog(OperationType.DELETE)
  async remove(@Body() ids: number[]) {
    await this.carouselService.remove(ids);
    return {
      code: 200,
      message: '删除成功',
    };
  }

  @Patch(':id/status')
  @ApiOperation({ summary: '更新轮播图显示状态' })
  @ApiParam({ name: 'id', description: '轮播图ID' })
  @ApiBody({ schema: { properties: { status: { type: 'number' } } } })
  @ApiResponse({ status: 200, description: '更新成功', type: Carousel })
  @OperationLog(OperationType.UPDATE)
  async updateStatus(@Param('id') id: string, @Body('status') status: number) {
    return {
      code: 200,
      message: '更新成功',
      data: await this.carouselService.updateStatus(+id, status),
    };
  }
}
