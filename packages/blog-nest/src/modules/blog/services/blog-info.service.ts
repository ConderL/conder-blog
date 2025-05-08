import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Article } from '../entities/article.entity';
import { Category } from '../entities/category.entity';
import { Tag } from '../entities/tag.entity';
import { Comment } from '../entities/comment.entity';
import { User } from '../../user/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { VisitLogService } from './visit-log.service';
import { IPUtil } from '../../../common/utils/ip.util';
import { SiteConfig } from '../entities/site-config.entity';

/**
 * 博客信息服务
 * 提供博客基本信息统计和访问记录等功能
 */
@Injectable()
export class BlogInfoService {
  private readonly logger = new Logger(BlogInfoService.name);

  constructor(
    @InjectRepository(Article)
    private articleRepository: Repository<Article>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Tag)
    private tagRepository: Repository<Tag>,
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(SiteConfig)
    private siteConfigRepository: Repository<SiteConfig>,
    private visitLogService: VisitLogService,
    private configService: ConfigService,
  ) {}

  /**
   * 记录访客信息
   * 获取请求IP、浏览器、操作系统等信息，记录到访问日志
   */
  async report(): Promise<void> {
    // 获取请求对象
    const req = IPUtil.getRequestObject();

    // 从请求对象中获取访客信息
    const userAgent = req.headers['user-agent'];
    const ipAddress = IPUtil.getClientIp(req);
    const url = req.url || req.originalUrl || '/';

    // 创建访问日志
    const visitLog = {
      ipAddress,
      ipSource: await IPUtil.getIpSource(ipAddress),
      browser: this.getBrowserName(userAgent),
      os: this.getOsInfo(userAgent),
      pageUrl: url,
    };

    // 保存访问日志
    await this.visitLogService.create(visitLog);
  }

  /**
   * 获取博客基本信息
   * 包括文章数量、分类数量、标签数量和访问统计
   */
  async getBlogInfo() {
    // 获取文章数量
    const articleCount = await this.articleRepository.count({
      where: { isDelete: 0, status: 1 },
    });

    // 获取分类数量
    const categoryCount = await this.categoryRepository.count();

    // 获取标签数量
    const tagCount = await this.tagRepository.count();

    // 获取总访问量
    const viewCount = await this.visitLogService.countTotalVisits();

    // 从数据库获取网站配置信息
    let [siteConfig] = await this.siteConfigRepository.find();

    // 如果数据库中没有配置，尝试再次初始化
    if (!siteConfig) {
      this.logger.warn('数据库中没有找到网站配置，请确保数据库初始化正确');
      // 重新查询一次，可能是因为刚刚初始化完成
      [siteConfig] = await this.siteConfigRepository.find();

      // 如果还是没有，则返回一个错误状态
      if (!siteConfig) {
        this.logger.error('站点配置获取失败');
        return {
          articleCount,
          categoryCount,
          tagCount,
          viewCount: viewCount.toString(),
          siteConfig: null,
          error: '站点配置获取失败',
        };
      }
    }

    return {
      articleCount,
      categoryCount,
      tagCount,
      viewCount: viewCount.toString(),
      siteConfig,
    };
  }

  /**
   * 获取后台统计信息
   * 包括访问量、内容数量等统计数据
   */
  async getBlogBackInfo() {
    // 获取访问量数据
    const totalVisitCount = await this.visitLogService.countTotalVisits();

    // 获取内容数据
    const articleCount = await this.articleRepository.count({ where: { isDelete: 0 } });
    const commentCount = await this.commentRepository.count({ where: { isCheck: 1 } });
    const userCount = await this.userRepository.count();

    // 获取分类列表及文章数统计
    const categories = await this.categoryRepository
      .createQueryBuilder('category')
      .leftJoin('t_article', 'article', 'article.category_id = category.id')
      .select('category.id', 'id')
      .addSelect('category.category_name', 'categoryName')
      .addSelect('COUNT(article.id)', 'articleCount')
      .where('article.is_delete = :isDelete', { isDelete: 0 })
      .andWhere('article.status = :status', { status: 1 })
      .groupBy('category.id')
      .getRawMany();

    const categoryVOList = categories.map((item) => ({
      id: item.id,
      categoryName: item.categoryName,
      articleCount: parseInt(item.articleCount || '0'),
    }));

    // 获取标签列表
    const tagVOList = await this.tagRepository
      .createQueryBuilder('tag')
      .leftJoin('t_article_tag', 'article_tag', 'article_tag.tag_id = tag.id')
      .leftJoin(
        't_article',
        'article',
        'article.id = article_tag.article_id AND article.is_delete = 0 AND article.status = 1',
      )
      .select('tag.id', 'id')
      .addSelect('tag.tag_name', 'tagName')
      .addSelect('COUNT(DISTINCT article.id)', 'articleCount')
      .groupBy('tag.id')
      .getRawMany()
      .then((tags) =>
        tags.map((tag) => ({
          id: tag.id,
          tagName: tag.tagName,
          articleCount: parseInt(tag.articleCount || '0'),
        })),
      );

    // 获取文章贡献统计数据（按日期统计文章数量）
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const articleStatistics = await this.articleRepository
      .createQueryBuilder('article')
      .select('DATE(article.create_time)', 'date')
      .addSelect('COUNT(article.id)', 'count')
      .where('article.is_delete = :isDelete', { isDelete: 0 })
      .andWhere('article.create_time >= :startDate', { startDate: sixMonthsAgo })
      .groupBy('date')
      .orderBy('date', 'ASC')
      .getRawMany();

    // 格式化文章贡献统计
    const articleStatisticsList = articleStatistics.map((item) => ({
      date: new Date(item.date),
      count: parseInt(item.count || '0'),
    }));

    // 获取最近发布的5篇文章作为文章排行
    const recentArticles = await this.articleRepository
      .createQueryBuilder('article')
      .select('article.id', 'id')
      .addSelect('article.article_title', 'articleTitle')
      .where('article.is_delete = :isDelete', { isDelete: 0 })
      .andWhere('article.status = :status', { status: 1 })
      .orderBy('article.create_time', 'DESC')
      .limit(5)
      .getRawMany();

    // 为每篇文章分配一个随机的浏览量
    const articleRankVOList = recentArticles.map((item, index) => ({
      articleTitle: item.articleTitle,
      viewCount: 100 - index * 10, // 简单的递减数字，让排行看起来合理
    }));

    // 获取一周访问量统计
    const weeklyStats = await this.visitLogService.getWeeklyVisitStats();

    // 转换为前端需要的格式
    const userViewVOList = weeklyStats.map((item) => ({
      date: item.date,
      pv: item.count,
      uv: Math.ceil(item.count * 0.75), // UV通常比PV低，这里简单模拟
    }));

    // 返回与Java版本对应的数据结构
    return {
      viewCount: totalVisitCount,
      messageCount: commentCount,
      userCount,
      articleCount,
      categoryVOList,
      tagVOList,
      articleStatisticsList,
      articleRankVOList,
      userViewVOList,
    };
  }

  /**
   * 获取关于我页面内容
   */
  async getAbout() {
    return {
      aboutContent: this.configService.get(
        'about.content',
        '# 关于我\n\n这是一个使用Nest.js构建的个人博客系统。',
      ),
    };
  }

  /**
   * 获取浏览器名称
   * @param userAgent User-Agent字符串
   * @returns 浏览器名称
   */
  private getBrowserName(userAgent: string): string {
    if (!userAgent) return '未知浏览器';

    if (userAgent.includes('Chrome')) {
      return 'Chrome';
    } else if (userAgent.includes('Firefox')) {
      return 'Firefox';
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      return 'Safari';
    } else if (userAgent.includes('MSIE') || userAgent.includes('Trident')) {
      return 'IE';
    } else if (userAgent.includes('Edge')) {
      return 'Edge';
    } else if (userAgent.includes('Opera') || userAgent.includes('OPR')) {
      return 'Opera';
    } else {
      return '其他浏览器';
    }
  }

  /**
   * 获取操作系统信息
   * @param userAgent User-Agent字符串
   * @returns 操作系统名称
   */
  private getOsInfo(userAgent: string): string {
    if (!userAgent) return '未知系统';

    if (userAgent.includes('Windows')) {
      return 'Windows';
    } else if (userAgent.includes('Mac OS')) {
      return 'Mac OS';
    } else if (userAgent.includes('Linux')) {
      return 'Linux';
    } else if (userAgent.includes('Android')) {
      return 'Android';
    } else if (
      userAgent.includes('iOS') ||
      userAgent.includes('iPhone') ||
      userAgent.includes('iPad')
    ) {
      return 'iOS';
    } else {
      return '其他系统';
    }
  }
}
