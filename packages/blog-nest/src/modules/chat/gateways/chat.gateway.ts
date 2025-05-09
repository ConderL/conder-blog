import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { ChatService } from '../services/chat.service';
import { IPUtil } from '../../../common/utils/ip.util';
import { ConfigService } from '@nestjs/config';
import { ChatMessageDto } from '../dto/chat-message.dto';
import { IpService } from '../../../services/ip.service';
import { NicknameGenerator } from '../../../common/utils/nickname.util';
import { BaiduTextCensorService } from '../../tools/services/baidu-text-censor.service';

/**
 * 聊天WebSocket网关
 * 负责处理WebSocket连接和消息传递
 */
@WebSocketGateway({
  cors: {
    origin: '*', // 允许所有来源访问，生产环境应该限制
    credentials: true,
  },
  namespace: 'chat',
  transports: ['websocket', 'polling'],
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(ChatGateway.name);
  private clients: Socket[] = [];
  private onlineCount = 0;

  // IP和socket的映射
  private ipSocketMap = new Map<string, Socket>();

  @WebSocketServer()
  server: Server;

  constructor(
    private readonly chatService: ChatService,
    private readonly configService: ConfigService,
    private readonly ipService: IpService,
    private readonly baiduTextCensorService: BaiduTextCensorService,
  ) {}

  /**
   * 初始化WebSocket服务
   */
  afterInit(/* server: Server */) {
    this.logger.log('聊天WebSocket服务已初始化');
  }

  /**
   * 处理客户端连接
   */
  async handleConnection(client: Socket) {
    const ip = IPUtil.getSocketIp(client);
    this.logger.log(`客户端连接: ${client.id}, IP: ${ip}`);
    this.clients.push(client);
    this.ipSocketMap.set(ip, client);
    this.onlineCount++;

    // 检查客户端数据中是否有用户信息
    const userId = client.handshake?.query?.userId as string;
    const userAvatar = client.handshake?.query?.avatar as string;

    // 尝试获取IP归属地
    let ipSource = '未知';
    try {
      ipSource = await this.ipService.getIpLocation(ip);
    } catch (error) {
      this.logger.error(`获取IP地理位置失败: ${error.message}`);
    }

    // 生成随机昵称作为备选
    const randomNickname = NicknameGenerator.getNickname(ip);

    // 确定最终使用的昵称，已登录用户优先使用查询参数中的昵称
    const nickname = (client.handshake?.query?.nickname as string) || randomNickname;
    this.logger.log(`为客户端 ${client.id}, IP: ${ip} 分配昵称: ${nickname}`);

    // 默认头像
    const defaultAvatar = 'https://img.conder.top/config/default_avatar.jpg';
    const avatar = userAvatar || defaultAvatar;

    // 为当前socket设置数据，保证数据一致性
    client.data = {
      ...client.data,
      ip: ip,
      nickname: nickname,
      ipSource: ipSource,
      connectTime: new Date(),
      userId: userId ? parseInt(userId) : undefined,
      avatar: avatar,
    };

    // 发送IP和昵称给客户端
    client.emit('init', {
      ip,
      nickname: nickname,
      avatarUrl: avatar,
    });

    // 发送欢迎消息
    const welcomeMessage = {
      nickname: '系统',
      avatar: 'https://img.conder.top/config/system-avatar.png',
      content: '欢迎加入聊天室！',
      ipAddress: '127.0.0.1',
    };

    client.emit('message', welcomeMessage);

    // 广播在线人数
    const onlineCount = await this.chatService.getOnlineCount(this.clients);
    this.server.emit('online', { count: onlineCount });

    // 发送历史消息
    const history = await this.chatService.getHistory(50);
    client.emit('history', history.reverse()); // 按时间正序发送
  }

  /**
   * 处理客户端断开连接
   */
  async handleDisconnect(client: Socket) {
    this.logger.log(`客户端断开连接: ${client.id}`);
    // 从客户端列表中移除
    this.clients = this.clients.filter((c) => c.id !== client.id);

    // 如果有存储IP，也从映射中移除
    if (client.data && client.data.ip) {
      this.ipSocketMap.delete(client.data.ip);
    }

    // 广播更新后的在线人数
    const onlineCount = await this.chatService.getOnlineCount(this.clients);
    this.server.emit('online', { count: onlineCount });
  }

  /**
   * 处理聊天消息
   */
  @SubscribeMessage('chat-message')
  async handleChatMessage(@MessageBody() data: ChatMessageDto, @ConnectedSocket() client: Socket) {
    this.logger.log('收到消息:', data);
    if (!data || !data.content || data.content.trim() === '') {
      this.logger.warn('收到空消息');
      return { success: false, message: '消息内容不能为空' };
    }

    try {
      // 检查昵称是否与Socket中存储的一致，如果不一致则更新Socket中的昵称
      if (data.nickname && client.data?.nickname !== data.nickname) {
        this.logger.log(`更新用户昵称: ${client.data?.nickname} -> ${data.nickname}`);
        client.data.nickname = data.nickname;
      }

      // 更新用户头像
      if (data.avatar && client.data?.avatar !== data.avatar) {
        this.logger.log(`更新用户头像: ${client.data?.avatar} -> ${data.avatar}`);
        client.data.avatar = data.avatar;
      }

      // 使用百度文本审核服务替代本地敏感词过滤
      const censorResult = await this.baiduTextCensorService.textCensor(data.content);

      this.logger.log('百度文本审核结果:', censorResult);

      // 使用过滤后的文本（无论是否安全）
      const messageContent = censorResult.filteredText || data.content;

      // 检查消息是否包含敏感词
      const hasSensitiveContent = !censorResult.isSafe;

      // 获取客户端IP
      const clientIp = data.ipAddress || client.handshake.address;

      // 保存消息
      const message = await this.chatService.saveMessage({
        nickname: data.nickname,
        avatar: data.avatar,
        content: messageContent,
        ipAddress: clientIp,
        userId: data.userId,
        ipSource: data.ipSource,
        createTime: new Date(),
      });

      // 创建消息对象，包含所有前端需要的字段
      const messageObj = {
        id: message.id,
        nickname: data.nickname,
        avatar: data.avatar,
        content: messageContent,
        ipAddress: clientIp,
        userId: data.userId,
        ipSource: data.ipSource,
        time: message.createTime,
        senderId: client.id, // Socket ID用于前端识别自己的消息
      };

      // 广播消息给所有客户端
      this.server.emit('chat-message', messageObj);

      // 同时返回消息给发送者，标记为自己发送的
      return {
        success: true,
        message: messageObj,
        isSelf: true, // 标记为自己发送的消息
        // 如果有敏感内容，添加提示信息
        notice: hasSensitiveContent ? '您的消息包含敏感内容，已自动过滤' : undefined,
      };
    } catch (error) {
      this.logger.error(`处理聊天消息时发生错误: ${error.message}`, error.stack);
      return { success: false, message: '发送消息失败，请稍后再试' };
    }
  }

  /**
   * 获取在线人数
   */
  @SubscribeMessage('getOnlineCount')
  async handleGetOnlineCount() {
    const count = await this.chatService.getOnlineCount(this.clients);
    return { count };
  }

  /**
   * 获取历史消息
   */
  @SubscribeMessage('getHistory')
  async handleGetHistory(@MessageBody() data: { limit?: number }) {
    const limit = data?.limit || 50;
    const history = await this.chatService.getHistory(limit);
    return history.reverse(); // 按时间正序返回
  }

  /**
   * 处理消息撤回
   */
  @SubscribeMessage('recall')
  async handleRecallMessage(@ConnectedSocket() client: Socket, @MessageBody() messageId: number) {
    try {
      const ip = client.data.ip || IPUtil.getSocketIp(client);
      this.logger.log(`撤回消息: ID=${messageId}, IP=${ip}`);

      // 查找消息
      const message = await this.chatService.findById(messageId);

      // 检查是否是发送者本人
      if (
        !message ||
        (message.ipAddress !== ip && (!message.userId || message.userId !== client.data.userId))
      ) {
        client.emit('error', { message: '无权撤回此消息' });
        return { success: false, error: '无权撤回此消息' };
      }

      // 删除消息
      await this.chatService.removeMessage(messageId);

      // 通知所有客户端
      this.server.emit('recall', messageId);

      return { success: true };
    } catch (error) {
      this.logger.error(`撤回消息失败: ${error.message}`);
      client.emit('error', { message: '撤回消息失败' });
      return { success: false, error: error.message };
    }
  }

  /**
   * 处理心跳请求
   */
  @SubscribeMessage('heartbeat')
  handleHeartbeat(@ConnectedSocket() client: Socket) {
    this.logger.debug(`收到来自客户端 ${client.id} 的心跳请求`);

    // 更新客户端最后活动时间
    if (client.data) {
      client.data.lastActiveTime = new Date();
    }

    // 返回一个简单的响应，避免复杂对象可能导致的错误
    return {
      timestamp: Date.now(),
      clientId: client.id,
    };
  }

  /**
   * 获取当前所有客户端连接
   * @returns 客户端连接列表
   */
  getClients(): Socket[] {
    return this.clients;
  }

  /**
   * 获取当前在线人数
   * @returns 在线人数
   */
  getOnlineCount(): number {
    return this.clients.length;
  }

  /**
   * 断开指定客户端连接
   * @param socketId 客户端ID
   * @returns 是否成功断开连接
   */
  disconnectClient(socketId: string): boolean {
    try {
      // 查找对应的客户端
      const client = this.clients.find((c) => c.id === socketId);
      if (!client) {
        return false;
      }

      // 断开连接
      client.disconnect(true);
      return true;
    } catch (error) {
      this.logger.error(`断开客户端连接失败: ${error.message}`);
      return false;
    }
  }
}
