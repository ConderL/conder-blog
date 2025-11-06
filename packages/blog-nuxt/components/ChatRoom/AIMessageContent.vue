<template>
  <div class="ai-message-content">
    <!-- 思考中状态 -->
    <div v-if="!content || content.trim() === ''" class="ai-thinking">
      <span class="thinking-dots">
        <span></span>
        <span></span>
        <span></span>
      </span>
      <span class="thinking-text">AI思考中</span>
    </div>
    <!-- 正常内容 -->
    <div v-else class="ai-message-text" v-html="processedContent"></div>
    <div v-if="metadata" class="ai-message-metadata">
      <div v-if="metadata.usage" class="usage-info">
        <span class="usage-item">Tokens: {{ metadata.usage.total_tokens }}</span>
        <span v-if="metadata.usage.latency" class="usage-item">
          延迟: {{ metadata.usage.latency.toFixed(2) }}s
        </span>
      </div>
    </div>
    <!-- 操作按钮栏 -->
    <MessageActions
      v-if="actions && actions.length > 0"
      :actions="actions"
      @action="handleAction"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import MessageActions from './MessageActions.vue';
import { useMarkdown } from '~/composables/useMarkdown';

interface AIMetadata {
  usage?: {
    total_tokens?: number;
    latency?: number;
    prompt_tokens?: number;
    completion_tokens?: number;
  };
  retriever_resources?: any[];
  annotation_reply?: any;
}

interface Action {
  key: string;
  label: string;
  icon?: string;
  class?: string;
}

interface Props {
  content: string;
  metadata?: AIMetadata;
  actions?: Action[];
}

interface Emits {
  (e: 'action', key: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const { render } = useMarkdown();

const handleAction = (key: string) => {
  emit('action', key);
};

// 使用 markdown-it 渲染 Markdown 内容
const processedContent = computed(() => {
  if (!props.content || props.content.trim() === '') return '';
  return render(props.content);
});
</script>

<style lang="scss" scoped>
.ai-message-content {
  // AI思考中样式
  .ai-thinking {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 0;
    color: var(--grey-6);
    font-size: 0.9em;
    
    .thinking-dots {
      display: inline-flex;
      gap: 4px;
      
      span {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: var(--grey-5);
        animation: thinking 1.4s infinite ease-in-out;
        
        &:nth-child(1) {
          animation-delay: -0.32s;
        }
        
        &:nth-child(2) {
          animation-delay: -0.16s;
        }
        
        &:nth-child(3) {
          animation-delay: 0s;
        }
      }
    }
    
    .thinking-text {
      opacity: 0.8;
    }
  }
  
  @keyframes thinking {
    0%, 80%, 100% {
      transform: scale(0.8);
      opacity: 0.5;
    }
    40% {
      transform: scale(1);
      opacity: 1;
    }
  }
  
  .ai-message-text {
    line-height: 1.6;
    word-wrap: break-word;
    word-break: break-word;
    
    // Markdown 通用样式
    :deep(h1),
    :deep(h2),
    :deep(h3),
    :deep(h4),
    :deep(h5),
    :deep(h6) {
      margin: 16px 0 8px 0;
      font-weight: 600;
      line-height: 1.25;
      
      &:first-child {
        margin-top: 0;
      }
    }
    
    :deep(h1) { font-size: 1.5em; }
    :deep(h2) { font-size: 1.3em; }
    :deep(h3) { font-size: 1.1em; }
    
    :deep(p) {
      margin: 8px 0;
      
      &:first-child {
        margin-top: 0;
      }
      
      &:last-child {
        margin-bottom: 0;
      }
    }
    
    :deep(ul),
    :deep(ol) {
      margin: 8px 0;
      padding-left: 24px;
    }
    
    :deep(li) {
      margin: 4px 0;
    }
    
    :deep(blockquote) {
      margin: 8px 0;
      padding: 8px 16px;
      border-left: 4px solid var(--color-blue);
      background: var(--grey-2);
      color: var(--grey-7);
      border-radius: 4px;
    }
    
    :deep(table) {
      width: 100%;
      border-collapse: collapse;
      margin: 12px 0;
      font-size: 0.95em;
    }
    
    :deep(th),
    :deep(td) {
      padding: 8px 12px;
      border: 1px solid var(--grey-3);
      text-align: left;
    }
    
    :deep(th) {
      background: var(--grey-2);
      font-weight: 600;
    }
    
    :deep(tr:nth-child(even)) {
      background: var(--grey-1);
    }
    
    :deep(hr) {
      margin: 16px 0;
      border: none;
      border-top: 1px solid var(--grey-3);
    }
    
    // 行内代码
    :deep(code:not(pre code)) {
      background: var(--grey-2);
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Courier New', 'Monaco', 'Menlo', monospace;
      font-size: 0.9em;
      color: var(--color-red);
    }
    
    // 代码块
    :deep(pre) {
      margin: 12px 0;
      padding: 12px;
      background: var(--grey-2);
      border-radius: 6px;
      overflow-x: auto;
      font-size: 0.9em;
      line-height: 1.5;
      
      code {
        background: transparent;
        padding: 0;
        color: inherit;
        font-size: inherit;
      }
    }
    
    :deep(a) {
      color: var(--color-blue);
      text-decoration: none;
      border-bottom: 1px solid transparent;
      transition: border-color 0.2s;
      
      &:hover {
        border-bottom-color: var(--color-blue);
      }
    }
    
    :deep(strong) {
      font-weight: 600;
    }
    
    :deep(em) {
      font-style: italic;
    }
    
    :deep(img) {
      max-width: 100%;
      height: auto;
      border-radius: 4px;
      margin: 8px 0;
    }
  }
  
  .ai-message-metadata {
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid var(--grey-3);
    font-size: 11px;
    color: var(--grey-6);
    
    .usage-info {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      
      .usage-item {
        opacity: 0.7;
      }
    }
  }
}
</style>

