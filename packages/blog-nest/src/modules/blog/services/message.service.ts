import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Message } from '../entities/message.entity';
// import { CreateMessageDto } from '../dto/create-message.dto';
import { ReviewMessageDto } from '../dto/review-message.dto';
import { SiteConfig } from '../entities/site-config.entity';
import { ContentCensorService } from './content-censor.service';
import { LocalTextFilterService } from '../../tools/services/local-text-filter.service';

/**
 * 留言板服务
 * 提供留言的增删改查功能
 */
@Injectable()
export class MessageService {
  private readonly logger = new Logger(MessageService.name);

  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(SiteConfig)
    private readonly siteConfigRepository: Repository<SiteConfig>,
    private readonly contentCensorService: ContentCensorService,
    private readonly localTextFilterService: LocalTextFilterService,
  ) {}

  /**
   * 查询留言列表
   * @param current 当前页
   * @param size 每页数量
   * @param nickname 昵称(可选)
   * @param isCheck 审核状态(可选)
   * @param showAll 是否显示所有留言(包括未审核的)，默认为false
   * @returns 留言列表及分页信息
   */
  async findAll(
    current: number,
    size: number,
    nickname?: string,
    isCheck?: number,
    showAll: boolean = false,
  ) {
    this.logger.log(`查询留言列表：第${current}页，每页${size}条, showAll=${showAll}`);
    try {
      const queryBuilder = this.messageRepository.createQueryBuilder('message');

      // 默认只显示已审核的留言，除非明确指定审核状态或要求显示所有留言
      if (isCheck !== undefined && !Number.isNaN(isCheck)) {
        queryBuilder.andWhere('message.isCheck = :isCheck', { isCheck });
      } else if (!showAll) {
        // 如果未指定审核状态且不显示所有留言，则只显示已审核的留言
        queryBuilder.andWhere('message.isCheck = :isCheck', { isCheck: 1 });
      }

      if (nickname) {
        queryBuilder.andWhere('message.nickname LIKE :nickname', { nickname: `%${nickname}%` });
      }

      // 按创建时间倒序排列
      queryBuilder.orderBy('message.createTime', 'DESC');

      // 分页
      const total = await queryBuilder.getCount();
      const records = await queryBuilder
        .skip((current - 1) * size)
        .take(size)
        .getMany();

      this.logger.log(`查询留言列表成功，共${total}条记录`);
      return {
        records,
        count: records.length,
        current,
        size,
        total,
      };
    } catch (error) {
      this.logger.error(`查询留言列表失败：${error.message}`);
      throw error;
    }
  }

  /**
   * 创建留言
   * @param createMessageDto 创建留言DTO
   * @returns 创建的留言
   */
  async create(createMessageDto: any) {
    this.logger.log(`创建留言：${JSON.stringify(createMessageDto)}`);
    try {
      // 检查百度审核服务状态，可能会自动切换到手动审核模式
      await this.contentCensorService.checkBaiduServiceStatus();

      // 获取站点配置，读取留言审核开关和百度审核开关
      const [siteConfig] = await this.siteConfigRepository.find();

      let isCheckValue = 1; // 默认为已审核

      // 如果未开启百度审核，先进行本地敏感词过滤
      if (!siteConfig?.baiduCheck || siteConfig.baiduCheck === 0) {
        if (createMessageDto.messageContent) {
          const filterResult = this.localTextFilterService.filter(createMessageDto.messageContent);
          createMessageDto.messageContent = filterResult.filteredText;
          this.logger.log(`留言内容本地敏感词过滤结果: isSafe=${filterResult.isSafe}, 内容已过滤`);
        }

        // 检查是否开启了手动审核
        if (siteConfig?.messageCheck === 1) {
          this.logger.log('留言手动审核已开启，留言将设置为待审核状态');
          isCheckValue = 0;
        }
      } else {
        // 如果开启了百度审核，需要设置为未审核(0)，等待后续百度审核流程
        this.logger.log('百度文本审核已开启，留言将设置为待审核状态');
        isCheckValue = 0;
      }

      this.logger.log(
        `留言审核状态设置: ${isCheckValue === 0 ? '待审核' : '已审核'}, 百度审核=${siteConfig?.baiduCheck ? '开启' : '关闭'}, 手动审核=${siteConfig?.messageCheck ? '开启' : '关闭'}`,
      );

      const message = this.messageRepository.create({
        ...createMessageDto,
        isCheck: isCheckValue,
        createTime: new Date(),
        updateTime: new Date(),
      });
      const savedMessage = await this.messageRepository.save(message);

      // 处理可能返回数组的情况
      const result = Array.isArray(savedMessage) ? savedMessage[0] : savedMessage;

      // 如果开启了百度审核，立即进行内容审核
      if (siteConfig?.baiduCheck === 1) {
        try {
          this.logger.log('开始对留言进行百度文本审核');
          // 异步执行审核，不阻塞留言创建流程
          this.contentCensorService.censorMessage(result.id).then((isSafe) => {
            this.logger.log(`留言百度审核完成: messageId=${result.id}, isSafe=${isSafe}`);
          });
        } catch (censorError) {
          this.logger.error(`留言百度审核异常: ${censorError.message}`, censorError.stack);
          // 审核异常不影响留言创建
        }
      }

      this.logger.log(`创建留言成功，ID：${result.id}`);
      return result;
    } catch (error) {
      this.logger.error(`创建留言失败：${error.message}`);
      throw error;
    }
  }

  /**
   * 审核留言
   * @param id 留言ID
   * @param reviewMessageDto 审核留言DTO
   * @returns 更新结果
   */
  async review(id: number, reviewMessageDto: ReviewMessageDto) {
    this.logger.log(`审核留言，ID：${id}，审核状态：${reviewMessageDto.isCheck}`);
    try {
      const result = await this.messageRepository.update(id, {
        isCheck: reviewMessageDto.isCheck,
        updateTime: new Date(),
      });
      this.logger.log(`审核留言成功，ID：${id}`);
      return result;
    } catch (error) {
      this.logger.error(`审核留言失败：${error.message}`);
      throw error;
    }
  }

  /**
   * 更新留言审核状态
   * @param id 留言ID
   * @param isCheck 审核状态(1-通过,0-不通过)
   * @returns 更新结果
   */
  async updateStatus(id: number, isCheck: number) {
    this.logger.log(`更新留言审核状态，ID：${id}，审核状态：${isCheck}`);
    try {
      const result = await this.messageRepository.update(id, {
        isCheck,
        updateTime: new Date(),
      });
      this.logger.log(`更新留言审核状态成功，ID：${id}`);
      return result;
    } catch (error) {
      this.logger.error(`更新留言审核状态失败：${error.message}`);
      throw error;
    }
  }

  /**
   * 删除留言
   * @param id 留言ID
   * @returns 删除结果
   */
  async remove(ids: number[]) {
    if (!ids || ids.length === 0) {
      return;
    }

    const comments = await this.messageRepository.findBy({ id: In(ids) });
    if (comments.length > 0) {
      await this.messageRepository.remove(comments);
    }
  }

  /**
   * 根据ID查询留言
   * @param id 留言ID
   * @returns 留言信息
   */
  async findById(id: number) {
    this.logger.log(`查询留言，ID：${id}`);
    try {
      const message = await this.messageRepository.findOne({ where: { id } });
      this.logger.log(`查询留言成功，ID：${id}`);
      return message;
    } catch (error) {
      this.logger.error(`查询留言失败：${error.message}`);
      throw error;
    }
  }
}
