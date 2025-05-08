import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaiduTextCensorService } from '../../tools/services/baidu-text-censor.service';
import { Comment } from '../entities/comment.entity';
import { Message } from '../entities/message.entity';
import { SiteConfig } from '../entities/site-config.entity';

/**
 * 内容审核服务
 * 处理评论和留言的内容审核
 */
@Injectable()
export class ContentCensorService {
  private readonly logger = new Logger(ContentCensorService.name);
  // 上次检查百度服务状态的时间
  private lastCheckTime: number = 0;
  // 检查间隔时间 (5分钟)
  private readonly CHECK_INTERVAL: number = 5 * 60 * 1000;

  constructor(
    private readonly baiduTextCensorService: BaiduTextCensorService,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(SiteConfig)
    private readonly siteConfigRepository: Repository<SiteConfig>,
  ) {}

  /**
   * 检查百度审核服务状态，如果服务不可用则切换到手动审核模式
   * @returns 是否切换了审核模式
   */
  async checkBaiduServiceStatus(): Promise<boolean> {
    const now = Date.now();
    // 避免频繁检查
    if (now - this.lastCheckTime < this.CHECK_INTERVAL) {
      return false;
    }

    this.lastCheckTime = now;

    try {
      // 获取站点配置
      const [siteConfig] = await this.siteConfigRepository.find();

      // 如果未开启百度审核，不需要检查
      if (!siteConfig || siteConfig.baiduCheck !== 1) {
        return false;
      }

      // 检查百度审核服务是否可用
      const isServiceAvailable = this.baiduTextCensorService.isServiceAvailable();

      if (!isServiceAvailable) {
        this.logger.warn('百度审核服务不可用，自动切换到手动审核模式');

        // 关闭百度审核，开启手动审核
        await this.siteConfigRepository.update(siteConfig.id, {
          baiduCheck: 0,
          commentCheck: 1,
          messageCheck: 1,
          updateTime: new Date(),
        });

        this.logger.log('已自动切换到手动审核模式');
        return true;
      }

      return false;
    } catch (error) {
      this.logger.error(`检查百度审核服务状态失败: ${error.message}`, error.stack);
      return false;
    }
  }

  /**
   * 审核评论内容
   * @param commentId 评论ID
   * @returns 审核结果
   */
  async censorComment(commentId: number): Promise<boolean> {
    try {
      // 先检查百度审核服务状态
      await this.checkBaiduServiceStatus();

      // 获取站点配置
      const [siteConfig] = await this.siteConfigRepository.find();

      // 如果未开启百度审核，直接返回
      if (!siteConfig || siteConfig.baiduCheck !== 1) {
        this.logger.log(`百度文本审核未开启，跳过评论审核: commentId=${commentId}`);
        return false;
      }

      // 获取评论详情
      const comment = await this.commentRepository.findOne({ where: { id: commentId } });
      if (!comment) {
        this.logger.warn(`未找到评论: commentId=${commentId}`);
        return false;
      }

      // 审核评论内容
      const censorResult = await this.baiduTextCensorService.textCensor(comment.content);
      this.logger.log(`评论审核结果: commentId=${commentId}, isSafe=${censorResult.isSafe}`);

      // 更新评论内容和审核状态
      await this.commentRepository.update(commentId, {
        content: censorResult.filteredText, // 使用过滤后的内容
        isCheck: censorResult.isSafe ? 1 : 0, // 安全则通过审核，否则标记为未通过
        updateTime: new Date(),
      });

      // 再次检查百度审核服务状态，确保服务仍然可用
      await this.checkBaiduServiceStatus();

      return censorResult.isSafe;
    } catch (error) {
      this.logger.error(`审核评论内容失败: commentId=${commentId}, error=${error.message}`);
      // 如果审核失败，检查并可能切换审核模式
      await this.checkBaiduServiceStatus();
      return false;
    }
  }

  /**
   * 审核留言内容
   * @param messageId 留言ID
   * @returns 审核结果
   */
  async censorMessage(messageId: number): Promise<boolean> {
    try {
      // 先检查百度审核服务状态
      await this.checkBaiduServiceStatus();

      // 获取站点配置
      const [siteConfig] = await this.siteConfigRepository.find();

      // 如果未开启百度审核，直接返回
      if (!siteConfig || siteConfig.baiduCheck !== 1) {
        this.logger.log(`百度文本审核未开启，跳过留言审核: messageId=${messageId}`);
        return false;
      }

      // 获取留言详情
      const message = await this.messageRepository.findOne({ where: { id: messageId } });
      if (!message) {
        this.logger.warn(`未找到留言: messageId=${messageId}`);
        return false;
      }

      // 审核留言内容
      const censorResult = await this.baiduTextCensorService.textCensor(message.messageContent);
      this.logger.log(`留言审核结果: messageId=${messageId}, isSafe=${censorResult.isSafe}`);

      // 更新留言内容和审核状态
      await this.messageRepository.update(messageId, {
        messageContent: censorResult.filteredText, // 使用过滤后的内容
        isCheck: censorResult.isSafe ? 1 : 0, // 安全则通过审核，否则标记为未通过
        updateTime: new Date(),
      });

      // 再次检查百度审核服务状态，确保服务仍然可用
      await this.checkBaiduServiceStatus();

      return censorResult.isSafe;
    } catch (error) {
      this.logger.error(`审核留言内容失败: messageId=${messageId}, error=${error.message}`);
      // 如果审核失败，检查并可能切换审核模式
      await this.checkBaiduServiceStatus();
      return false;
    }
  }

  /**
   * 批量审核未审核的评论
   * @returns 处理结果
   */
  async batchCensorPendingComments(): Promise<{ total: number; passed: number }> {
    try {
      // 先检查百度审核服务状态
      const modeChanged = await this.checkBaiduServiceStatus();
      if (modeChanged) {
        this.logger.warn('百度审核服务不可用，已切换到手动审核模式，跳过批量评论审核');
        return { total: 0, passed: 0 };
      }

      // 获取站点配置
      const [siteConfig] = await this.siteConfigRepository.find();

      // 如果未开启百度审核，直接返回
      if (!siteConfig || siteConfig.baiduCheck !== 1) {
        this.logger.log('百度文本审核未开启，跳过批量评论审核');
        return { total: 0, passed: 0 };
      }

      // 获取所有未审核的评论
      const pendingComments = await this.commentRepository.find({ where: { isCheck: 0 } });

      if (pendingComments.length === 0) {
        this.logger.log('没有待审核的评论');
        return { total: 0, passed: 0 };
      }

      this.logger.log(`开始批量审核评论，共 ${pendingComments.length} 条`);

      let passedCount = 0;

      // 逐条审核评论
      for (const comment of pendingComments) {
        // 每处理几条评论检查一次服务状态
        if (passedCount > 0 && passedCount % 10 === 0) {
          const modeChanged = await this.checkBaiduServiceStatus();
          if (modeChanged) {
            this.logger.warn('百度审核服务不可用，已切换到手动审核模式，中断批量评论审核');
            break;
          }
        }

        const isSafe = await this.censorComment(comment.id);
        if (isSafe) {
          passedCount++;
        }
      }

      this.logger.log(`批量审核评论完成，共 ${pendingComments.length} 条，通过 ${passedCount} 条`);

      return {
        total: pendingComments.length,
        passed: passedCount,
      };
    } catch (error) {
      this.logger.error(`批量审核评论失败: ${error.message}`);
      // 如果审核失败，检查并可能切换审核模式
      await this.checkBaiduServiceStatus();
      return { total: 0, passed: 0 };
    }
  }

  /**
   * 批量审核未审核的留言
   * @returns 处理结果
   */
  async batchCensorPendingMessages(): Promise<{ total: number; passed: number }> {
    try {
      // 先检查百度审核服务状态
      const modeChanged = await this.checkBaiduServiceStatus();
      if (modeChanged) {
        this.logger.warn('百度审核服务不可用，已切换到手动审核模式，跳过批量留言审核');
        return { total: 0, passed: 0 };
      }

      // 获取站点配置
      const [siteConfig] = await this.siteConfigRepository.find();

      // 如果未开启百度审核，直接返回
      if (!siteConfig || siteConfig.baiduCheck !== 1) {
        this.logger.log('百度文本审核未开启，跳过批量留言审核');
        return { total: 0, passed: 0 };
      }

      // 获取所有未审核的留言
      const pendingMessages = await this.messageRepository.find({ where: { isCheck: 0 } });

      if (pendingMessages.length === 0) {
        this.logger.log('没有待审核的留言');
        return { total: 0, passed: 0 };
      }

      this.logger.log(`开始批量审核留言，共 ${pendingMessages.length} 条`);

      let passedCount = 0;

      // 逐条审核留言
      for (const message of pendingMessages) {
        // 每处理几条留言检查一次服务状态
        if (passedCount > 0 && passedCount % 10 === 0) {
          const modeChanged = await this.checkBaiduServiceStatus();
          if (modeChanged) {
            this.logger.warn('百度审核服务不可用，已切换到手动审核模式，中断批量留言审核');
            break;
          }
        }

        const isSafe = await this.censorMessage(message.id);
        if (isSafe) {
          passedCount++;
        }
      }

      this.logger.log(`批量审核留言完成，共 ${pendingMessages.length} 条，通过 ${passedCount} 条`);

      return {
        total: pendingMessages.length,
        passed: passedCount,
      };
    } catch (error) {
      this.logger.error(`批量审核留言失败: ${error.message}`);
      // 如果审核失败，检查并可能切换审核模式
      await this.checkBaiduServiceStatus();
      return { total: 0, passed: 0 };
    }
  }
}
