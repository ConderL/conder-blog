import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatMessage } from '../entities/chat-message.entity';
import { IPUtil } from '../../../common/utils/ip.util';

/**
 * 聊天服务
 */
@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    @InjectRepository(ChatMessage)
    private chatMessageRepository: Repository<ChatMessage>,
  ) {}

  /**
   * 保存聊天消息
   * @param message 聊天消息
   */
  async saveMessage(message: Partial<ChatMessage>): Promise<ChatMessage> {
    this.logger.log(`保存聊天消息: ${JSON.stringify(message)}`);

    // 获取IP来源
    if (message.ipAddress && !message.ipSource) {
      try {
        message.ipSource = await IPUtil.getIpSource(message.ipAddress);
      } catch (error) {
        this.logger.error(`获取IP来源失败: ${error.message}`);
        message.ipSource = '未知位置';
      }
    }

    const chatMessage = this.chatMessageRepository.create(message);
    return this.chatMessageRepository.save(chatMessage);
  }

  /**
   * 获取历史消息
   * @param limit 获取条数
   */
  async getHistory(limit = 100): Promise<ChatMessage[]> {
    this.logger.log(`获取历史聊天消息, limit: ${limit}`);
    try {
      return await this.chatMessageRepository.find({
        order: { createTime: 'DESC' },
        take: limit,
      });
    } catch (error) {
      this.logger.error(`获取历史聊天消息失败: ${error.message}`);
      return [];
    }
  }

  /**
   * 根据ID查找消息
   * @param id 消息ID
   * @returns 聊天消息实体
   */
  async findById(id: number): Promise<ChatMessage> {
    this.logger.log(`根据ID查找消息: ${id}`);
    try {
      return await this.chatMessageRepository.findOne({ where: { id } });
    } catch (error) {
      this.logger.error(`查找消息失败: ${error.message}`);
      return null;
    }
  }

  /**
   * 删除消息
   * @param id 消息ID
   */
  async removeMessage(id: number): Promise<boolean> {
    this.logger.log(`删除消息: ${id}`);
    try {
      const result = await this.chatMessageRepository.delete(id);
      return result.affected > 0;
    } catch (error) {
      this.logger.error(`删除消息失败: ${error.message}`);
      return false;
    }
  }

  /**
   * 获取在线用户数
   */
  async getOnlineCount(clients: any[]): Promise<number> {
    return clients.length;
  }

  /**
   * 清空历史消息
   */
  async clearHistory(): Promise<void> {
    this.logger.log('清空历史聊天消息');
    await this.chatMessageRepository.createQueryBuilder().delete().execute();
  }
}
