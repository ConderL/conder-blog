import { Controller, Get, Query, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { SearchService } from '../services/search.service';
import { Article } from '../entities/article.entity';

@ApiTags('搜索')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: '搜索文章' })
  @ApiQuery({ name: 'keyword', required: true })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async searchArticles(
    @Query('keyword') keyword: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ): Promise<{ items: Article[]; total: number }> {
    return this.searchService.searchArticles(keyword, page, limit);
  }

  @Get('hot')
  @ApiOperation({ summary: '热门搜索' })
  @ApiQuery({ name: 'limit', required: false })
  async getHotSearch(@Query('limit') limit = 10): Promise<Article[]> {
    return this.searchService.getHotSearch(limit);
  }

  @Get('tag')
  @ApiOperation({ summary: '标签搜索' })
  @ApiQuery({ name: 'tagId', required: true })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async searchByTag(
    @Query('tagId') tagId: number,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ): Promise<{ items: Article[]; total: number }> {
    return this.searchService.searchByTag(tagId, page, limit);
  }

  @Get('fulltext')
  @ApiOperation({ summary: '全文搜索' })
  @ApiQuery({ name: 'keyword', required: true })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async fullTextSearch(
    @Query('keyword') keyword: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ): Promise<{ items: Article[]; total: number }> {
    return this.searchService.fullTextSearch(keyword, page, limit);
  }

  @Get('tag-cloud')
  @ApiOperation({ summary: '标签云' })
  async getTagCloud(): Promise<{ tagName: string; count: number }[]> {
    return this.searchService.getTagCloud();
  }

  @Get('related')
  @ApiOperation({ summary: '相关文章推荐' })
  @ApiQuery({ name: 'articleId', required: true })
  @ApiQuery({ name: 'limit', required: false })
  async getRelatedArticles(
    @Query('articleId') articleId: number,
    @Query('limit') limit = 5,
  ): Promise<Article[]> {
    return this.searchService.getRelatedArticles(articleId, limit);
  }
}
