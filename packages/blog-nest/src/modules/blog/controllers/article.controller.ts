import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Put,
  UploadedFile,
  UseInterceptors,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { ArticleService } from '../services/article.service';
import { ResultDto } from '../../../common/dtos/result.dto';
import { Article } from '../entities/article.entity';
import { OperationLog } from '../../../common/decorators/operation-log.decorator';
import { OperationType } from '../../../common/enums/operation-type.enum';
import { CreateArticleDto } from '../dtos/create-article.dto';
import { UpdateArticleDto } from '../dtos/update-article.dto';
import { VisitLog } from '../../../common/decorators/visit-log.decorator';
import { Public } from '../../../common/decorators/public.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from '../../../modules/upload/services/upload/upload.service';
import { CategoryService } from '../services/category.service';
import { TagService } from '../services/tag.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../entities/category.entity';
import { Tag } from '../entities/tag.entity';
import { memoryStorage } from 'multer';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { CommentService } from '../services/comment.service';
import { ArticleSearch } from '../dtos/article-search.dto';
import { SiteConfig } from '../entities/site-config.entity';
import { UserService } from '../../user/user.service';

// 前台文章控制器
@ApiTags('文章')
@Controller('articles')
export class ArticleController {
  constructor(
    private readonly articleService: ArticleService,
    private readonly categoryService: CategoryService,
    private readonly tagService: TagService,
    private readonly commentService: CommentService,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
    @InjectRepository(SiteConfig)
    private readonly siteConfigRepository: Repository<SiteConfig>,
    private readonly userService: UserService,
  ) {}

  @Post()
  @ApiOperation({ summary: '创建文章' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @OperationLog(OperationType.CREATE)
  async create(
    @Body() createArticleDto: CreateArticleDto,
    @Body('tagIds') tagIds: number[],
  ): Promise<ResultDto<Article>> {
    // 如果没有提供封面，使用站点配置中的默认封面
    if (!createArticleDto.cover || createArticleDto.cover.trim() === '') {
      const [siteConfig] = await this.siteConfigRepository.find();
      createArticleDto.cover = siteConfig.articleCover;
    }

    const article: Partial<Article> = {
      articleTitle: createArticleDto.title,
      articleContent: createArticleDto.content,
      articleDesc: createArticleDto.description,
      articleCover: createArticleDto.cover,
      categoryId: createArticleDto.categoryId,
      originalUrl: createArticleDto.originalUrl,
      isTop: createArticleDto.isTop ? 1 : 0,
      isDelete: 0,
      status: createArticleDto.isPublish ? 1 : 3, // 1-公开 3-草稿
    };

    const result = await this.articleService.create(article, tagIds);
    return ResultDto.success(result);
  }

  @ApiOperation({ summary: '查询文章列表' })
  @Get('list')
  @Public()
  async findAll(
    @Query() query: any,
    @Request() req,
  ): Promise<ResultDto<{ recordList: Article[]; count: number }>> {
    const { current = 1, size = 10, keyword, categoryId, tagId, status, articleType } = query;

    // 获取用户角色
    const userRole = req.user?.roleId;

    // 构建状态查询条件
    let statusQuery = [1]; // 默认只查询公开文章
    if (userRole === 1) {
      // 如果是管理员
      statusQuery = [1, 2]; // 同时查询公开和私密文章
    }

    const result = await this.articleService.findAll(
      +current,
      +size,
      keyword,
      categoryId ? +categoryId : undefined,
      tagId ? +tagId : undefined,
      status !== undefined ? +status : undefined,
      0, // isDelete=0 表示未删除
      articleType !== undefined ? +articleType : undefined,
      statusQuery, // 传入状态查询条件
    );
    return ResultDto.success(result);
  }

  @ApiOperation({ summary: '获取推荐文章' })
  @Get('recommend')
  @Public()
  async getRecommendArticles(): Promise<ResultDto<Article[]>> {
    try {
      // 设置isRecommend为1，查询推荐文章
      const result = await this.articleService.findRecommendArticles();
      return ResultDto.success(result);
    } catch (error) {
      console.error('获取推荐文章失败:', error);
      return ResultDto.error('获取推荐文章失败');
    }
  }

  @ApiOperation({ summary: '搜索文章' })
  @Get('search')
  @Public()
  async searchArticles(@Query('keyword') keyword: string): Promise<ResultDto<ArticleSearch[]>> {
    try {
      if (!keyword) {
        return ResultDto.success([]);
      }

      // 使用文章服务查找符合关键词的文章
      const { recordList } = await this.articleService.findAll(
        1, // 页码
        20, // 限制结果数量
        keyword, // 搜索关键词
        undefined, // 分类ID，不限制
        undefined, // 标签ID，不限制
        1, // 只搜索已发布的文章
      );

      // 转换为前端需要的格式 (id, articleTitle, articleContent)
      const result = recordList.map((article) => ({
        id: article.id,
        articleTitle: article.articleTitle,
        // 截取部分内容用于预览，移除HTML标签
        articleContent: this.truncateHtml(article.articleContent, 200),
      }));

      return ResultDto.success(result);
    } catch (error) {
      console.error('搜索文章失败:', error);
      return ResultDto.error('搜索文章失败');
    }
  }

  /**
   * 截取HTML内容并移除HTML标签
   * @param html HTML内容
   * @param length 截取长度
   * @returns 处理后的文本
   */
  private truncateHtml(html: string, length: number): string {
    if (!html) return '';

    // 移除HTML标签
    const text = html.replace(/<\/?[^>]+(>|$)/g, '');

    // 截取指定长度
    return text.length > length ? text.substring(0, length) + '...' : text;
  }

  @ApiOperation({ summary: '查询文章详情' })
  @Get(':id')
  @Public()
  @VisitLog('文章详情')
  async findById(@Param('id') id: string): Promise<ResultDto<Article>> {
    const result = await this.articleService.findById(+id);
    return ResultDto.success(result);
  }

  // 添加点赞文章的API
  @Post(':id/like')
  @ApiOperation({ summary: '点赞或取消点赞文章' })
  @ApiBearerAuth()
  async likeArticle(
    @Param('id', ParseIntPipe) id: number,
    @Query('type') type: string, // 添加type查询参数
    @Request() req,
  ): Promise<ResultDto<any>> {
    try {
      const userId = req.user.id;
      let likeCount: number;

      // 根据type参数决定是点赞还是取消点赞
      if (type === 'unlike') {
        // 取消点赞
        likeCount = await this.userService.cancelArticleLike(userId, id);
        return ResultDto.success({ likeCount }, '取消点赞成功');
      } else {
        // 点赞
        likeCount = await this.userService.addArticleLike(userId, id);
        return ResultDto.success({ likeCount }, '点赞成功');
      }
    } catch (error) {
      return ResultDto.fail(`${type === 'unlike' ? '取消点赞' : '点赞'}失败: ${error.message}`);
    }
  }

  // 保留DELETE方法的API，但内部逻辑与POST+type=unlike相同
  @Delete(':id/like')
  @ApiOperation({ summary: '取消点赞文章' })
  @ApiBearerAuth()
  async unlikeArticle(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ): Promise<ResultDto<any>> {
    try {
      const userId = req.user.id;
      const likeCount = await this.userService.cancelArticleLike(userId, id);

      return ResultDto.success({ likeCount }, '取消点赞成功');
    } catch (error) {
      return ResultDto.fail('取消点赞失败: ' + error.message);
    }
  }
}

// 后台文章管理控制器
@ApiTags('后台文章管理')
@Controller('admin/article')
@UseGuards(JwtAuthGuard)
export class AdminArticleController {
  constructor(
    private readonly articleService: ArticleService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly commentService: CommentService,
    private readonly categoryService: CategoryService,
    private readonly tagService: TagService,
    @InjectRepository(Category) private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Tag) private readonly tagRepository: Repository<Tag>,
    private readonly uploadService: UploadService,
    @InjectRepository(SiteConfig)
    private readonly siteConfigRepository: Repository<SiteConfig>,
  ) {}

  @Get('list')
  @ApiOperation({ summary: '查看后台文章列表' })
  async listArticleBackVO(
    @Query() query: any,
  ): Promise<ResultDto<{ recordList: Article[]; count: number }>> {
    const {
      page = 1,
      limit = 10,
      keyword,
      categoryId,
      tagId,
      status,
      isDelete,
      articleType,
    } = query;
    const result = await this.articleService.findAll(
      +page,
      +limit,
      keyword,
      categoryId ? +categoryId : undefined,
      tagId ? +tagId : undefined,
      status !== undefined ? +status : undefined,
      isDelete !== undefined ? +isDelete : 0,
      articleType !== undefined ? +articleType : undefined,
    );

    // 直接返回服务返回的格式
    return ResultDto.success(result as unknown as { recordList: Article[]; count: number });
  }

  @Post('add')
  @ApiOperation({ summary: '添加文章' })
  @OperationLog(OperationType.CREATE)
  async addArticle(@Body() articleData: any): Promise<ResultDto<Article>> {
    try {
      // 从前端接收的数据字段映射到后端DTO格式
      const createArticleDto: CreateArticleDto = {
        title: articleData.articleTitle,
        content: articleData.articleContent,
        description: articleData.articleDesc,
        cover: articleData.articleCover,
        categoryId: null, // 稍后根据categoryName获取
        isTop: articleData.isTop === 1,
        isPublish: articleData.status !== 3, // 如果status不是3(草稿)，则为发布状态
        isOriginal: articleData.articleType === 1,
        originalUrl: articleData.articleType !== 1 ? articleData.originalUrl : undefined,
      };

      // 1. 根据分类名称获取分类ID
      let categoryId = null;
      if (articleData.categoryName) {
        // 由于CategoryService没有直接通过名称查询的方法，我们直接使用Repository
        const existingCategory = await this.categoryRepository.findOne({
          where: { categoryName: articleData.categoryName },
        });

        if (existingCategory) {
          categoryId = existingCategory.id;
        } else {
          // 如果分类不存在，创建新分类
          const newCategory = await this.categoryService.create({
            categoryName: articleData.categoryName,
          });
          categoryId = newCategory.id;
        }
        createArticleDto.categoryId = categoryId;
      }

      // 2. 根据标签名称列表获取标签ID列表
      const tagIds = [];
      if (articleData.tagNameList && articleData.tagNameList.length > 0) {
        // 查询数据库中已存在的标签
        for (const tagName of articleData.tagNameList) {
          // 查找或创建标签
          const tag = await this.tagService.findOrCreate(tagName);
          tagIds.push(tag.id);
        }
      }

      const [siteConfig] = await this.siteConfigRepository.find();

      console.log(siteConfig, 'siteConfig.articleCover');
      console.log(createArticleDto.cover, 'createArticleDto.cover');

      // 将原始数据转换为实体对象，只包含实际存在于数据库中的字段
      const article: Partial<Article> = {
        articleTitle: createArticleDto.title,
        articleContent: createArticleDto.content,
        articleDesc: createArticleDto.description || '',
        articleCover: createArticleDto.cover || siteConfig.articleCover,
        categoryId: categoryId,
        articleType: articleData.articleType,
        isTop: createArticleDto.isTop ? 1 : 0,
        isRecommend: articleData.isRecommend,
        isDelete: 0,
        status: createArticleDto.isPublish ? 1 : 3, // 1-公开 3-草稿
        createTime: new Date(), // 显式设置创建时间
        userId: 1, // 设置默认用户ID，实际应从JWT中获取
      };

      // 创建文章
      const result = await this.articleService.create(article, tagIds);
      return ResultDto.success(result);
    } catch (error) {
      console.error('创建文章失败:', error);
      return ResultDto.error(`创建文章失败: ${error.message}`);
    }
  }

  @Delete('delete')
  @ApiOperation({ summary: '删除文章' })
  @OperationLog(OperationType.DELETE)
  async deleteArticle(@Body() articleIdList: number[]): Promise<ResultDto<null>> {
    await this.articleService.remove(articleIdList);
    return ResultDto.success(null);
  }

  @Put('recycle')
  @ApiOperation({ summary: '回收或恢复文章' })
  @OperationLog(OperationType.UPDATE)
  async updateArticleDelete(
    @Body() body: { idList: number[]; isDelete: number },
  ): Promise<ResultDto<null>> {
    try {
      // 验证文章状态
      const articles = await this.articleService.findByIds(body.idList);
      const invalidArticles = articles.filter((article) => article.status !== 3);

      if (invalidArticles.length > 0) {
        return ResultDto.error('只能回收草稿状态的文章');
      }

      // 批量更新文章删除状态
      await this.articleService.updateIsDelete(body.idList, body.isDelete);
      return ResultDto.success(null, body.isDelete === 1 ? '文章已移至回收站' : '文章已恢复');
    } catch (error) {
      return ResultDto.error('操作失败: ' + error.message);
    }
  }

  @Put('update')
  @ApiOperation({ summary: '修改文章' })
  @OperationLog(OperationType.UPDATE)
  async updateArticle(@Body() updateArticleDto: UpdateArticleDto): Promise<ResultDto<any>> {
    console.log('=========== 接收到更新请求 ===========');
    console.log('文章ID:', updateArticleDto.id);
    console.log('文章标题:', updateArticleDto.articleTitle);
    console.log('文章内容长度:', updateArticleDto.articleContent?.length);
    console.log('文章内容预览:', updateArticleDto.articleContent?.substring(0, 100) + '...');
    console.log('分类ID:', updateArticleDto.categoryId);
    console.log('标签名称列表:', updateArticleDto.tagNameList);

    try {
      // 如果没有提供封面，使用站点配置中的默认封面
      if (!updateArticleDto.articleCover || updateArticleDto.articleCover.trim() === '') {
        const [siteConfig] = await this.siteConfigRepository.find();
        updateArticleDto.articleCover = siteConfig.articleCover;
      }

      // 准备用于更新的文章数据
      const updateData: Partial<Article> = {
        id: updateArticleDto.id,
        articleTitle: updateArticleDto.articleTitle,
        articleContent: updateArticleDto.articleContent,
        articleDesc: updateArticleDto.articleDesc,
        articleCover: updateArticleDto.articleCover,
        categoryId: updateArticleDto.categoryId,
        articleType: updateArticleDto.articleType ?? 1, // 默认原创
        isTop: updateArticleDto.isTop ?? 0,
        isRecommend: updateArticleDto.isRecommend ?? 0,
        status: updateArticleDto.status ?? 1, // 默认公开
        isDelete: updateArticleDto.isDelete ?? 0,
        isComment: updateArticleDto.isComment ?? 1,
        updateTime: new Date(),
      };

      // 处理标签
      let tagIds = [];
      if (updateArticleDto.tagNameList && Array.isArray(updateArticleDto.tagNameList)) {
        // 如果提供了标签名称列表，则查找或创建标签
        const tagPromises = updateArticleDto.tagNameList.map((tagName) =>
          this.tagService.findOrCreate(tagName),
        );
        const tags = await Promise.all(tagPromises);
        tagIds = tags.map((tag) => tag.id);
      } else if (updateArticleDto.tags && Array.isArray(updateArticleDto.tags)) {
        // 如果提供了标签对象数组，直接使用标签ID
        tagIds = updateArticleDto.tags.map((tag) => tag.id);
      }

      console.log('准备更新的标签IDs:', tagIds);
      console.log(
        '准备更新的文章数据:',
        JSON.stringify({
          ...updateData,
          articleContent: '(内容过长已省略)',
        }),
      );

      // 调用服务更新文章
      const updatedArticle = await this.articleService.update(updateData.id, updateData, tagIds);
      console.log('更新结果:', updatedArticle ? '成功' : '失败');

      return ResultDto.success();
    } catch (error) {
      return ResultDto.error('更新失败: ' + error.message);
    }
  }

  @Get('edit/:id')
  @ApiOperation({ summary: '编辑文章' })
  async editArticle(@Param('id') id: string): Promise<ResultDto<any>> {
    const article = await this.articleService.findById(+id);

    // 创建一个新对象以返回自定义结构
    const result = {
      ...article,
      // 添加tagNameList字段，只包含标签名称
      tagNameList: article.tags ? article.tags.map((tag) => tag.tagName) : [],
      categoryName: article.category ? article.category.categoryName : '',
    };

    return ResultDto.success(result);
  }

  @Put('top')
  @ApiOperation({ summary: '置顶文章' })
  @OperationLog(OperationType.UPDATE)
  async updateArticleTop(@Body() body: { id: number; isTop: number }): Promise<ResultDto<null>> {
    await this.articleService.updateIsTop(body.id, body.isTop);
    return ResultDto.success(null);
  }

  @Put('recommend')
  @ApiOperation({ summary: '推荐文章' })
  @OperationLog(OperationType.UPDATE)
  async updateArticleRecommend(
    @Body() body: { id: number; isRecommend: number },
  ): Promise<ResultDto<null>> {
    await this.articleService.updateIsRecommend(body.id, body.isRecommend);
    return ResultDto.success(null);
  }

  @Post('upload')
  @ApiOperation({ summary: '上传文章图片' })
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
      storage: memoryStorage(), // 明确使用内存存储
    }),
  )
  async uploadArticleImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      return ResultDto.error('请选择要上传的图片');
    }

    // 检查文件格式
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return ResultDto.error('只允许上传jpg, png, gif, webp, avif格式的图片');
    }

    try {
      const result = await this.uploadService.uploadFile(file, 'article');
      return ResultDto.success(result.url);
    } catch (error) {
      return ResultDto.error('上传失败: ' + error.message);
    }
  }

  @Get('recycle/list')
  @ApiOperation({ summary: '获取回收站文章列表' })
  async getRecycleList(
    @Query() query: any,
  ): Promise<ResultDto<{ recordList: Article[]; count: number }>> {
    const { page = 1, limit = 10, keyword, categoryId, tagId, articleType } = query;

    const result = await this.articleService.findAll(
      +page,
      +limit,
      keyword,
      categoryId ? +categoryId : undefined,
      tagId ? +tagId : undefined,
      3, // 只查询草稿状态的文章
      1, // 查询已删除的文章
      articleType !== undefined ? +articleType : undefined,
    );

    return ResultDto.success(result);
  }
}

// 归档接口
@ApiTags('归档')
@Controller('archives')
export class ArchivesController {
  constructor(private readonly articleService: ArticleService) {}

  @Get('list')
  @ApiOperation({ summary: '获取归档文章列表' })
  @Public()
  async findArchivesList(
    @Query('current') current: string = '1',
    @Query('size') size: string = '10',
  ): Promise<any> {
    const result = await this.articleService.findAll(
      +current,
      +size,
      undefined,
      undefined,
      undefined,
      1, // 状态为已发布
      0, // 未删除
    );

    // 仅保留需要的字段
    const recordList = result.recordList.map((article) => ({
      id: article.id,
      articleTitle: article.articleTitle,
      articleCover: article.articleCover,
      createTime: article.createTime,
    }));

    return {
      flag: true,
      code: 200,
      msg: '操作成功',
      data: {
        recordList,
        count: result.count,
      },
    };
  }
}
