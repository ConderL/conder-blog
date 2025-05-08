import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CategoryService } from '../services/category.service';
import { Category } from '../entities/category.entity';
import { ResultDto } from '../../../common/dtos/result.dto';
import { Public } from '../../../common/decorators/public.decorator';
import { OperationLog } from '../../../common/decorators/operation-log.decorator';
import { OperationType } from '../../../common/enums/operation-type.enum';
import { VisitLog } from '../../../common/decorators/visit-log.decorator';
import { ArticleService } from '../services/article.service';

// 前台新版分类接口
@ApiTags('分类')
@Controller('category')
export class CategorieController {
  constructor(
    private readonly categoryService: CategoryService,
    private readonly articleService: ArticleService,
  ) {}

  @Get('article')
  @ApiOperation({ summary: '根据分类ID查询文章列表' })
  @Public()
  async findArticlesByCategoryId(
    @Query('categoryId') categoryId: string,
    @Query('current') current: string = '1',
    @Query('size') size: string = '10',
  ): Promise<any> {
    if (!categoryId) {
      return {
        flag: false,
        code: 400,
        msg: '分类ID不能为空',
        data: null,
      };
    }

    const category = await this.categoryService.findById(+categoryId);
    const result = await this.articleService.findAll(
      +current,
      +size,
      undefined,
      +categoryId, // 这里使用分类ID
      undefined,
      1, // 状态为已发布
      0, // 未删除
    );

    // 格式化文章数据，确保包含所需字段
    const articles = result.recordList.map((article) => ({
      id: article.id,
      articleCover: article.articleCover,
      articleTitle: article.articleTitle,
      category: {
        id: article.category?.id,
        categoryName: article.category?.categoryName,
      },
      tagVOList: article.tags.map((tag) => ({
        id: tag.id,
        tagName: tag.tagName,
      })),
      createTime: article.createTime,
    }));

    return {
      flag: true,
      code: 200,
      msg: '操作成功',
      data: {
        articleConditionVOList: articles,
        name: category.categoryName,
      },
    };
  }
}

// 前台分类接口
@ApiTags('分类')
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @ApiOperation({ summary: '创建分类' })
  @UseGuards(JwtAuthGuard)
  async create(@Body() category: Partial<Category>): Promise<ResultDto<Category>> {
    const result = await this.categoryService.create(category);
    return ResultDto.success(result);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新分类' })
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: number,
    @Body() category: Partial<Category>,
  ): Promise<ResultDto<Category>> {
    const result = await this.categoryService.update(id, category);
    return ResultDto.success(result);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除分类' })
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: number): Promise<ResultDto<null>> {
    await this.categoryService.remove(id);
    return ResultDto.success(null);
  }

  @Get()
  @ApiOperation({ summary: '获取所有分类' })
  @Public()
  @VisitLog('文章分类')
  async findAll(): Promise<any> {
    const result = await this.categoryService.findAll();
    return {
      flag: true,
      code: 200,
      msg: '操作成功',
      data: result,
    };
  }

  @Get('tree')
  @ApiOperation({ summary: '获取分类树' })
  @Public()
  async findTree(): Promise<ResultDto<Category[]>> {
    const result = await this.categoryService.findTree();
    return ResultDto.success(result);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取指定分类' })
  @Public()
  async findOne(@Param('id') id: number): Promise<ResultDto<Category>> {
    const result = await this.categoryService.findById(id);
    return ResultDto.success(result);
  }
}

// 后台分类管理接口
@ApiTags('后台分类管理')
@Controller('admin/category')
@UseGuards(JwtAuthGuard)
export class AdminCategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get('list')
  @ApiOperation({ summary: '查看后台分类列表' })
  async listCategoryBackVO(
    @Query() query: any,
  ): Promise<ResultDto<{ recordList: Category[]; count: number }>> {
    const { current = 1, size = 10, keyword } = query;
    const result = await this.categoryService.findByPage(+current, +size, keyword);
    return ResultDto.success(result);
  }

  @Post('add')
  @ApiOperation({ summary: '添加分类' })
  @OperationLog(OperationType.CREATE)
  async addCategory(@Body() category: Partial<Category>): Promise<ResultDto<Category>> {
    const result = await this.categoryService.create(category);
    return ResultDto.success(result);
  }

  @Delete('delete')
  @ApiOperation({ summary: '删除分类' })
  @OperationLog(OperationType.DELETE)
  async deleteCategory(@Body() categoryIdList: number[]): Promise<ResultDto<null>> {
    await this.categoryService.removeMultiple(categoryIdList);
    return ResultDto.success(null, '删除成功');
  }

  @Put('update')
  @ApiOperation({ summary: '修改分类' })
  @OperationLog(OperationType.UPDATE)
  async updateCategory(@Body() category: Partial<Category>): Promise<ResultDto<Category>> {
    const result = await this.categoryService.update(category.id, category);
    return ResultDto.success(result);
  }

  @Get('option')
  @ApiOperation({ summary: '查看分类选项' })
  async listCategoryOption(): Promise<ResultDto<Category[]>> {
    const result = await this.categoryService.findAll();
    return ResultDto.success(result);
  }
}
