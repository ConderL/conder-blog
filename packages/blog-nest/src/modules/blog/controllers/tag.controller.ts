import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { TagService } from '../services/tag.service';
import { Tag } from '../entities/tag.entity';
import { ResultDto } from '../../../common/dtos/result.dto';
import { Public } from '../../../common/decorators/public.decorator';
import { OperationLog } from '../../../common/decorators/operation-log.decorator';
import { OperationType } from '../../../common/enums/operation-type.enum';
import { VisitLog } from '../../../common/decorators/visit-log.decorator';
import { ArticleService } from '../services/article.service';

// 前台标签接口
@ApiTags('标签')
@Controller('tag')
export class TagController {
  constructor(
    private readonly tagService: TagService,
    private readonly articleService: ArticleService,
  ) {}

  @Get('list')
  @ApiOperation({ summary: '获取所有标签' })
  @Public()
  @VisitLog('文章标签')
  async findAll(): Promise<any> {
    const result = await this.tagService.findAll();
    return {
      flag: true,
      code: 200,
      msg: '操作成功',
      data: result,
    };
  }

  @Get('article')
  @ApiOperation({ summary: '根据标签ID查询文章列表' })
  @Public()
  async findArticlesByTagId(
    @Query('tagId') tagId: string,
    @Query('current') current: string = '1',
    @Query('size') size: string = '10',
  ): Promise<any> {
    if (!tagId) {
      return {
        flag: false,
        code: 400,
        msg: '标签ID不能为空',
        data: null,
      };
    }

    const tag = await this.tagService.findById(+tagId);
    const result = await this.articleService.findAll(
      +current,
      +size,
      undefined,
      undefined,
      +tagId,
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
        name: tag.tagName,
      },
    };
  }
}

// 后台标签管理接口
@ApiTags('后台标签管理')
@Controller('admin/tag')
@UseGuards(JwtAuthGuard)
export class AdminTagController {
  constructor(private readonly tagService: TagService) {}

  @Get('list')
  @ApiOperation({ summary: '查看后台标签列表' })
  async listTagBackVO(
    @Query() query: any,
  ): Promise<ResultDto<{ recordList: Tag[]; count: number }>> {
    const { current = 1, size = 10, keyword } = query;
    const result = await this.tagService.findByPage(+current, +size, keyword);
    return ResultDto.success(result);
  }

  @Post('add')
  @ApiOperation({ summary: '添加标签' })
  @OperationLog(OperationType.CREATE)
  async addTag(@Body() tag: Partial<Tag>): Promise<ResultDto<Tag>> {
    const result = await this.tagService.create(tag);
    return ResultDto.success(result);
  }

  @Delete('delete')
  @ApiOperation({ summary: '删除标签' })
  @OperationLog(OperationType.DELETE)
  async deleteTag(@Body() tagIdList: number[]): Promise<ResultDto<null>> {
    await this.tagService.removeMultiple(tagIdList);
    return ResultDto.success(null, '删除成功');
  }

  @Put('update')
  @ApiOperation({ summary: '修改标签' })
  @OperationLog(OperationType.UPDATE)
  async updateTag(@Body() tag: Partial<Tag>): Promise<ResultDto<Tag>> {
    const result = await this.tagService.update(tag.id, tag);
    return ResultDto.success(result);
  }

  @Get('option')
  @ApiOperation({ summary: '查看标签选项' })
  async listTagOption(): Promise<ResultDto<Tag[]>> {
    const result = await this.tagService.findAll();
    return ResultDto.success(result);
  }
}
