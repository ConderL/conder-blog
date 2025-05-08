import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Comment } from '../entities/comment.entity';
import { SiteConfig } from '../entities/site-config.entity';
import { ContentCensorService } from './content-censor.service';
import { LocalTextFilterService } from '../../tools/services/local-text-filter.service';

/**
 * 评论服务
 * 提供评论的增删改查功能
 */
@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @InjectRepository(SiteConfig)
    private siteConfigRepository: Repository<SiteConfig>,
    private contentCensorService: ContentCensorService,
    private localTextFilterService: LocalTextFilterService,
  ) {}

  /**
   * 创建评论
   * @param comment 评论数据
   * @returns 创建后的评论
   */
  async create(comment: Partial<Comment>): Promise<Comment> {
    try {
      console.log('创建评论:', comment);

      // 检查百度审核服务状态，可能会自动切换到手动审核模式
      await this.contentCensorService.checkBaiduServiceStatus();

      // 获取站点配置，读取评论审核开关和百度审核开关
      const [siteConfig] = await this.siteConfigRepository.find();

      let isCheckValue = 1; // 默认为已审核

      // 如果未开启百度审核，先进行本地敏感词过滤
      if (!siteConfig?.baiduCheck || siteConfig.baiduCheck === 0) {
        if (comment.content) {
          const filterResult = this.localTextFilterService.filter(comment.content);
          comment.content = filterResult.filteredText;
          console.log(`评论内容本地敏感词过滤结果: isSafe=${filterResult.isSafe}, 内容已过滤`);
        }

        // 检查是否开启了手动审核
        if (siteConfig?.commentCheck === 1) {
          console.log('评论手动审核已开启，评论将设置为待审核状态');
          isCheckValue = 0;
        }
      } else {
        // 如果开启了百度审核，需要设置为未审核(0)，等待后续百度审核流程
        console.log('百度文本审核已开启，评论将设置为待审核状态');
        isCheckValue = 0;
      }

      console.log(
        `评论审核状态设置: ${isCheckValue === 0 ? '待审核' : '已审核'}, 百度审核=${siteConfig?.baiduCheck ? '开启' : '关闭'}, 手动审核=${siteConfig?.commentCheck ? '开启' : '关闭'}`,
      );

      // 创建新评论，设置审核状态
      const newComment = this.commentRepository.create({
        ...comment,
        isCheck: isCheckValue,
      });

      const savedComment = await this.commentRepository.save(newComment);
      console.log('评论创建成功, ID:', savedComment.id);

      // 如果开启了百度审核，立即进行内容审核
      if (siteConfig?.baiduCheck === 1) {
        try {
          console.log('开始对评论进行百度文本审核');
          // 异步执行审核，不阻塞评论创建流程
          this.contentCensorService.censorComment(savedComment.id).then((isSafe) => {
            console.log(`评论百度审核完成: commentId=${savedComment.id}, isSafe=${isSafe}`);
          });
        } catch (censorError) {
          console.error('评论百度审核异常:', censorError);
          // 审核异常不影响评论创建
        }
      }

      return savedComment;
    } catch (error) {
      console.error('创建评论失败:', error);
      throw error;
    }
  }

  /**
   * 查找评论
   * @param id 评论ID
   * @returns 评论详情
   */
  async findById(id: number): Promise<Comment> {
    return this.commentRepository.findOne({
      where: { id },
      relations: ['user', 'article'],
    });
  }

  /**
   * 查询评论列表
   * @param page 页码
   * @param limit 每页条数
   * @param typeId 类型ID (如文章ID)
   * @param commentType 评论类型 (1-文章评论,2-友链评论,3-说说评论)
   * @param showAll 是否显示所有评论(包括未审核的)，默认为false
   * @returns 评论列表和总数
   */
  async findAll(
    page: number,
    limit: number,
    typeId?: number | null,
    commentType?: number | null,
    showAll: boolean = false,
  ): Promise<[Comment[], number]> {
    try {
      console.log(
        `查询评论列表: page=${page}, limit=${limit}, typeId=${typeId}, commentType=${commentType}, showAll=${showAll}`,
      );

      const query = this.commentRepository
        .createQueryBuilder('comment')
        .leftJoinAndSelect('comment.user', 'user')
        .leftJoinAndSelect('comment.article', 'article')
        .where('(comment.parentId IS NULL OR comment.parentId = 0)'); // 只查询顶级评论

      // 如果不显示所有评论，则只显示已审核的评论
      if (!showAll) {
        query.andWhere('comment.isCheck = :isCheck', { isCheck: 1 });
      }

      // 根据类型ID筛选
      if (typeId !== null && typeId !== undefined) {
        query.andWhere('comment.typeId = :typeId', { typeId });
      }

      // 根据评论类型筛选
      if (commentType !== null && commentType !== undefined) {
        query.andWhere('comment.commentType = :commentType', { commentType });
      }

      // 使用id字段排序，避免可能的日期问题
      const result = await query
        .orderBy('comment.id', 'DESC')
        .skip((page - 1) * limit)
        .take(limit)
        .getManyAndCount();

      console.log(`查询评论列表结果: 总数=${result[1]}, 当前页数量=${result[0].length}`);
      return result;
    } catch (error) {
      console.error('查询评论列表失败:', error);
      throw error;
    }
  }

  /**
   * 获取文章评论列表(含子评论)
   * @param articleId 文章ID
   * @param showAll 是否显示所有评论(包括未审核的)，默认为false
   */
  async findByArticleId(articleId: number, showAll: boolean = false): Promise<Comment[]> {
    try {
      console.log(`获取文章评论列表, 文章ID: ${articleId}, showAll: ${showAll}`);

      // 构建查询条件
      const whereCondition: any = {
        typeId: articleId,
        commentType: 1, // 文章评论类型
        parentId: 0, // 只查询顶级评论
      };

      // 如果不显示所有评论，则只显示已审核的评论
      if (!showAll) {
        whereCondition.isCheck = 1;
      }

      // 查询所有与该文章相关的评论
      const comments = await this.commentRepository.find({
        where: whereCondition,
        relations: ['user'],
        order: {
          id: 'DESC' as any, // 使用ID排序更可靠
        },
      });

      console.log(`文章顶级评论数量: ${comments.length}`);

      // 为每个顶级评论查询子评论
      for (const comment of comments) {
        // 构建子评论查询条件
        const replyWhereCondition: any = {
          parentId: comment.id,
        };

        // 如果不显示所有评论，则只显示已审核的子评论
        if (!showAll) {
          replyWhereCondition.isCheck = 1;
        }

        // 查询直接回复这个评论的子评论
        const replies = await this.commentRepository.find({
          where: replyWhereCondition,
          relations: ['user'],
          order: {
            id: 'DESC' as any,
          },
          take: 3, // 默认只取3条子评论，其他的通过单独API获取
        });

        // 设置replyCount (所有子评论，包括未审核的)
        const replyCount = await this.commentRepository.count({
          where: {
            parentId: comment.id,
            ...(showAll ? {} : { isCheck: 1 }), // 如果不显示所有评论，则只计算已审核的子评论数量
          },
        });

        // 初始化子评论数组
        comment.children = replies;

        // 设置回复数量
        comment['replyCount'] = replyCount;
      }

      return comments;
    } catch (error) {
      console.error('获取文章评论列表失败:', error);
      throw error;
    }
  }

  /**
   * 更新评论
   * @param id 评论ID
   * @param updateData 更新数据
   * @returns 更新后的评论
   */
  async update(id: number, updateData: Partial<Comment>): Promise<Comment> {
    await this.commentRepository.update(id, updateData);
    return this.findById(id);
  }

  /**
   * 删除评论
   * @param id 评论ID
   */
  async remove(ids: number[]): Promise<void> {
    if (!ids || ids.length === 0) {
      return;
    }
    const comments = await this.commentRepository.findBy({ id: In(ids) });
    if (comments.length > 0) {
      await this.commentRepository.remove(comments);
    }
  }

  /**
   * 获取评论树
   * @param articleId 文章ID
   * @returns 评论树
   */
  async findTree(articleId: number): Promise<Comment[]> {
    try {
      // 获取所有根评论（无父评论）
      const rootComments = await this.commentRepository.find({
        where: {
          typeId: articleId,
          parentId: 0,
          commentType: 1, // 文章评论
        },
        order: { id: 'DESC' } as any, // 使用ID排序更可靠
        relations: ['user', 'article'],
      });

      return rootComments;
    } catch (error) {
      console.error('获取评论树失败:', error);
      throw error;
    }
  }

  /**
   * 后台查询评论列表 - 支持更多筛选条件
   */
  async findAllForAdmin(
    page: number,
    limit: number,
    articleId?: number,
    keyword?: string,
    isCheck?: number,
  ): Promise<[Comment[], number]> {
    try {
      const queryBuilder = this.commentRepository
        .createQueryBuilder('comment')
        .leftJoinAndSelect('comment.user', 'user')
        .leftJoinAndSelect('comment.article', 'article')
        .where('1 = 1'); // 默认条件，允许添加更多筛选

      // 按文章ID筛选
      if (articleId) {
        queryBuilder.andWhere('comment.type_id = :articleId', { articleId });
      }

      // 按评论内容关键词筛选
      if (keyword) {
        queryBuilder.andWhere('comment.comment_content LIKE :keyword', { keyword: `%${keyword}%` });
      }

      // 按审核状态筛选
      if (isCheck !== undefined && isCheck !== null) {
        queryBuilder.andWhere('comment.is_check = :isCheck', { isCheck });
      }

      // 返回结果，按id倒序排列
      return queryBuilder
        .orderBy('comment.id', 'DESC')
        .skip((page - 1) * limit)
        .take(limit)
        .getManyAndCount();
    } catch (error) {
      console.error('后台查询评论列表失败:', error);
      throw error;
    }
  }

  /**
   * 获取最新评论
   * @param limit 要获取的评论数量，默认为1
   * @returns 最新评论列表
   */
  async getRecentComments(limit: number = 1): Promise<Comment[]> {
    try {
      console.log(`获取最新${limit}条评论`);

      // 查询最新的已审核评论
      const comments = await this.commentRepository
        .createQueryBuilder('comment')
        .leftJoinAndSelect('comment.user', 'user')
        .leftJoinAndSelect('comment.article', 'article', 'comment.commentType = 1') // 只有文章评论才关联文章
        .where('comment.isCheck = :isCheck', { isCheck: 1 }) // 只获取已审核的评论
        .orderBy('comment.id', 'DESC') // 按ID倒序，获取最新评论
        .take(limit)
        .getMany();

      console.log(`获取最新评论成功，返回${comments.length}条评论`);
      return comments;
    } catch (error) {
      console.error('获取最新评论失败:', error);
      throw error;
    }
  }

  /**
   * 获取评论的回复列表
   * @param commentId 评论ID
   * @param page 页码
   * @param limit 每页条数
   * @param showAll 是否显示所有回复(包括未审核的)，默认为false
   * @returns 回复列表
   */
  async getReplies(
    commentId: number,
    page: number,
    limit: number,
    showAll: boolean = false,
  ): Promise<Comment[]> {
    console.log(
      `获取评论回复, 评论ID: ${commentId}, page: ${page}, limit: ${limit}, showAll: ${showAll}`,
    );
    try {
      // 构建查询条件
      const whereCondition: any = {
        parentId: commentId,
      };

      // 如果不显示所有回复，则只显示已审核的回复
      if (!showAll) {
        whereCondition.isCheck = 1;
      }

      // 查询该评论的所有回复
      const replies = await this.commentRepository.find({
        where: whereCondition,
        relations: ['user'],
        order: {
          id: 'ASC' as any, // 按ID升序排列
        },
        skip: (page - 1) * limit,
        take: limit,
      });

      console.log(`评论回复数量: ${replies.length}`);
      console.log(`查询字段: ${Object.keys(replies[0] || {}).join(', ')}`);
      return replies;
    } catch (error) {
      console.error('获取评论回复失败:', error);
      throw error;
    }
  }

  /**
   * 获取评论的回复数量
   * @param commentId 评论ID
   * @returns 回复数量
   */
  async getReplyCount(commentId: number): Promise<number> {
    try {
      // 统计回复该评论的子评论数量
      const count = await this.commentRepository.count({
        where: {
          parentId: commentId,
        },
      });

      console.log(`评论ID ${commentId} 的回复数量: ${count}`);
      return count;
    } catch (error) {
      console.error(`获取评论回复数量失败, commentId=${commentId}`, error);
      return 0;
    }
  }

  /**
   * 通过ID查找用户
   * @param userId 用户ID
   * @returns 用户信息
   */
  async findUserById(userId: number): Promise<any> {
    try {
      // 查询任何带有指定用户ID的评论，然后提取用户信息
      const comment = await this.commentRepository.findOne({
        where: { userId },
        relations: ['user'],
      });

      // 如果找到带有用户信息的评论，返回用户信息
      if (comment?.user) {
        return comment.user;
      }

      return null;
    } catch (error) {
      console.error(`查找用户失败, 用户ID: ${userId}`, error);
      return null;
    }
  }

  /**
   * 点赞评论
   * @param commentId 评论ID
   * @returns 更新后的评论信息，包含最新点赞数
   */
  async likeComment(commentId: number): Promise<Comment> {
    try {
      console.log(`点赞评论, ID: ${commentId}`);

      // 获取当前评论
      const comment = await this.findById(commentId);
      if (!comment) {
        throw new Error(`评论不存在, ID: ${commentId}`);
      }

      // 更新点赞数量 (+1)
      comment.likeCount = (comment.likeCount || 0) + 1;

      // 保存更新
      await this.commentRepository.update(commentId, { likeCount: comment.likeCount });

      console.log(`评论点赞成功, ID: ${commentId}, 当前点赞数: ${comment.likeCount}`);
      return comment;
    } catch (error) {
      console.error(`点赞评论失败, 评论ID: ${commentId}`, error);
      throw error;
    }
  }

  /**
   * 获取指定内容的评论数量
   * @param typeId 内容ID
   * @param commentType 评论类型 (1-文章评论,2-友链评论,3-说说评论)
   * @returns 评论总数
   */
  async countCommentsByTypeAndId(typeId: number, commentType: number): Promise<number> {
    try {
      console.log(`获取内容评论数量, typeId=${typeId}, commentType=${commentType}`);

      // 统计评论数量（包括顶级评论和子评论）
      const count = await this.commentRepository.count({
        where: {
          typeId,
          commentType,
          isCheck: 1, // 只统计已审核通过的评论
        },
      });

      console.log(`内容ID=${typeId}, 类型=${commentType} 的评论数量: ${count}`);
      return count;
    } catch (error) {
      console.error(`获取内容评论数量失败, typeId=${typeId}, commentType=${commentType}`, error);
      return 0;
    }
  }
}
