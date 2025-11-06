/**
 * 流式响应处理 Hook
 * 用于处理 Dify、MCP 等服务的流式响应
 */

import { reactive, readonly } from 'vue';

interface StreamResponseCallbacks {
  onContent?: (content: string, fullContent: string) => void;
  onMetadata?: (metadata: any) => void;
  onConversationId?: (conversationId: string) => void;
  onEvent?: (event: string, data: any) => void;
  onError?: (error: Error) => void;
  onComplete?: () => void;
}

interface StreamResponseState {
  fullContent: string;
  conversationId: string | null;
  metadata: any | null;
  isStreaming: boolean;
}

export const useStreamResponse = () => {
  const state = reactive<StreamResponseState>({
    fullContent: '',
    conversationId: null,
    metadata: null,
    isStreaming: false,
  });

  /**
   * 处理 Dify 流式响应
   * Dify 流式响应格式：
   * - event: 'message' 时，answer 字段可能是增量内容（delta）或完整内容
   * - 根据 Dify 文档，流式模式下 answer 通常是增量内容，需要累积
   */
  const handleDifyStream = (callbacks: StreamResponseCallbacks = {}) => {
    // 重置状态
    state.fullContent = '';
    state.conversationId = null;
    state.metadata = null;
    state.isStreaming = true;

    return (data: any) => {
      try {
        // 处理不同的事件类型
        if (data.event === 'message') {
          // Dify流式响应中，answer字段通常是增量内容（delta）
          // 需要累积到完整内容中
          if (data.answer !== undefined && data.answer !== null) {
            const answerStr = String(data.answer);
            
            // 累积内容：将新的增量内容追加到完整内容中
            // 注意：Dify 的流式响应中，answer 通常是增量片段
            state.fullContent += answerStr;
            
            // 触发内容更新回调
            // delta: 本次增量内容，fullContent: 累积后的完整内容
            if (callbacks.onContent) {
              callbacks.onContent(answerStr, state.fullContent);
            }
          }

          // 处理会话ID
          if (data.conversation_id) {
            state.conversationId = data.conversation_id;
            if (callbacks.onConversationId) {
              callbacks.onConversationId(data.conversation_id);
            }
          }

          // 处理元数据（流式响应中可能部分更新）
          if (data.metadata) {
            // 合并元数据，而不是直接替换
            state.metadata = {
              ...state.metadata,
              ...data.metadata,
            };
            if (callbacks.onMetadata) {
              callbacks.onMetadata(state.metadata);
            }
          }
          
          // 检查data中是否直接包含番剧数据（Dify工作流返回）
          if (data.animes && Array.isArray(data.animes)) {
            if (callbacks.onMetadata) {
              callbacks.onMetadata({
                ...state.metadata,
                animes: data.animes,
              });
            }
          }

          // 触发事件回调
          if (callbacks.onEvent) {
            callbacks.onEvent('message', data);
          }
        } else if (data.event === 'message_end') {
          // 消息结束
          state.isStreaming = false;
          
          // 最终元数据更新
          if (data.metadata) {
            state.metadata = {
              ...state.metadata,
              ...data.metadata,
            };
            if (callbacks.onMetadata) {
              callbacks.onMetadata(state.metadata);
            }
          }

          if (data.conversation_id) {
            state.conversationId = data.conversation_id;
            if (callbacks.onConversationId) {
              callbacks.onConversationId(data.conversation_id);
            }
          }

          if (callbacks.onEvent) {
            callbacks.onEvent('message_end', data);
          }

          if (callbacks.onComplete) {
            callbacks.onComplete();
          }
        } else if (data.event === 'error') {
          // 错误事件
          state.isStreaming = false;
          const error = new Error(data.message || '流式响应错误');
          if (callbacks.onError) {
            callbacks.onError(error);
          }
        } else {
          // 其他事件类型（如 message_file、agent_thought 等）
          if (callbacks.onEvent) {
            callbacks.onEvent(data.event || 'unknown', data);
          }
        }
      } catch (error: any) {
        state.isStreaming = false;
        console.error('流式响应处理错误:', error);
        if (callbacks.onError) {
          callbacks.onError(error);
        }
      }
    };
  };

  /**
   * 处理 MCP 流式响应（后续扩展）
   */
  const handleMCPStream = (callbacks: StreamResponseCallbacks = {}) => {
    // 重置状态
    state.fullContent = '';
    state.conversationId = null;
    state.metadata = null;
    state.isStreaming = true;

    return (data: any) => {
      // TODO: 实现 MCP 流式响应处理逻辑
      // MCP 的响应格式可能不同，需要根据实际情况调整
      try {
        // 示例：假设MCP也是增量更新
        if (data.content) {
          state.fullContent += data.content;
          if (callbacks.onContent) {
            callbacks.onContent(data.content, state.fullContent);
          }
        }

        // 处理MCP特定的元数据
        if (data.mcp_metadata) {
          state.metadata = data.mcp_metadata;
          if (callbacks.onMetadata) {
            callbacks.onMetadata(data.mcp_metadata);
          }
        }

        if (callbacks.onEvent) {
          callbacks.onEvent(data.type || 'mcp_message', data);
        }
      } catch (error: any) {
        state.isStreaming = false;
        if (callbacks.onError) {
          callbacks.onError(error);
        }
      }
    };
  };

  /**
   * 重置流式响应状态
   */
  const reset = () => {
    state.fullContent = '';
    state.conversationId = null;
    state.metadata = null;
    state.isStreaming = false;
  };

  /**
   * 获取当前完整内容
   */
  const getFullContent = () => state.fullContent;

  /**
   * 获取会话ID
   */
  const getConversationId = () => state.conversationId;

  /**
   * 获取元数据
   */
  const getMetadata = () => state.metadata;

  /**
   * 是否正在流式传输
   */
  const isStreaming = () => state.isStreaming;

  return {
    handleDifyStream,
    handleMCPStream,
    reset,
    getFullContent,
    getConversationId,
    getMetadata,
    isStreaming,
    state: readonly(state),
  };
};

