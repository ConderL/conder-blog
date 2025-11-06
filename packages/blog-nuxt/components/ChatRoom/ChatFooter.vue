<template>
  <div class="chat-footer">
    <textarea
      v-model="localContent"
      class="chat-input"
      :placeholder="placeholder"
      @keydown="handleKeyCode"
      @input="handleInput"
    ></textarea>
    <Emoji
      @add-emoji="handleEmoji"
      @choose-type="handleType"
    ></Emoji>
    <UIcon
      name="icon:plane"
      class="send-btn text-xl cursor-pointer"
      @click="handleSend"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

interface Props {
  content: string;
  placeholder?: string;
}

interface Emits {
  (e: 'update:content', value: string): void;
  (e: 'send'): void;
  (e: 'emoji', key: string): void;
  (e: 'type', key: number): void;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '开始聊天吧'
});

const emit = defineEmits<Emits>();

const localContent = ref(props.content);

watch(() => props.content, (newVal) => {
  localContent.value = newVal;
});

const handleInput = () => {
  emit('update:content', localContent.value);
};

const handleKeyCode = (e: KeyboardEvent) => {
  if (e.ctrlKey && e.keyCode === 13) {
    localContent.value = localContent.value + '\n';
  } else if (e.keyCode === 13) {
    e.preventDefault();
    handleSend();
  }
};

const handleSend = () => {
  emit('send');
};

const handleEmoji = (key: string) => {
  localContent.value += key;
  emit('update:content', localContent.value);
  emit('emoji', key);
};

const handleType = (key: number) => {
  emit('type', key);
};
</script>

<style lang="scss" scoped>
.chat-footer {
  position: absolute;
  bottom: 0;
  display: flex;
  align-items: center;
  width: 100%;
  padding: 8px 16px;
  background: var(--grey-2);
  border-radius: 0 0 1rem 1rem;

  .chat-input {
    width: 100%;
    height: 30px;
    padding: 0.2rem 0 0 0.3rem;
    margin-right: 0.5rem;
    font-size: 13px;
    color: var(--text-color);
    background-color: var(--grey-1);
    outline: none;
    resize: none;
  }

  .send-btn {
    color: var(--color-blue);
    margin-left: 0.5rem;
  }
}
</style>

