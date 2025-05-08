import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Delete,
  UseGuards,
  Query,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CategoryService } from '../services/category.service';
import { CategoryDto } from '../dto/category.dto';
import { OperationLog } from '../../../common/decorators/operation-log.decorator';
import { OperationType } from '../../../common/enums/operation-type.enum';

/**
 * 分类管理接口
 */
@ApiTags('管理员分类管理')
@Controller('admin/category')
@Roles('admin')
@ApiBearerAuth()
export class AdminCategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  /**
   * 获取分类列表
   */
  @Get('list')
  @ApiOperation({ summary: '获取分类列表' })
  async getCategoryList(@Query('name') name?: string) {
    return this.categoryService.findAll();
  }

  /**
   * 获取分类详情
   */
  @Get(':id')
  @ApiOperation({ summary: '获取分类详情' })
  async getCategoryDetail(@Param('id', ParseIntPipe) id: number) {
    return this.categoryService.findById(id);
  }

  /**
   * 创建分类
   */
  @Post()
  @ApiOperation({ summary: '创建分类' })
  @OperationLog(OperationType.CREATE)
  async createCategory(@Body() categoryDto: CategoryDto) {
    return this.categoryService.create(categoryDto);
  }

  /**
   * 更新分类
   */
  @Put(':id')
  @ApiOperation({ summary: '更新分类' })
  @OperationLog(OperationType.UPDATE)
  async updateCategory(@Param('id', ParseIntPipe) id: number, @Body() categoryDto: CategoryDto) {
    return this.categoryService.update(id, categoryDto);
  }

  /**
   * 删除分类
   */
  @Delete(':id')
  @ApiOperation({ summary: '删除分类' })
  @OperationLog(OperationType.DELETE)
  async deleteCategory(@Param('id', ParseIntPipe) id: number) {
    return this.categoryService.remove(id);
  }
}
