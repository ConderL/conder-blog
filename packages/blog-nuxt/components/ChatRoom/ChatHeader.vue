<template>
  <div class="chat-header">
    <img
      width="32"
      height="32"
      src="/icons/chat.svg"
    />
    <div style="margin-left: 12px">
      <div>{{ title }}</div>
      <div style="font-size: 12px">
        {{ subtitle }}
      </div>
    </div>
    <div style="display: flex; align-items: center; gap: 8px; margin-left: auto;">
      <UIcon
        :name="switchIcon"
        class="switch-btn text-lg cursor-pointer"
        @click="handleSwitch"
        :title="switchTooltip"
        :alt="switchTooltip"
      />
      <UIcon
        name="icon:close"
        class="close text-lg cursor-pointer"
        @click="handleClose"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string;
  subtitle: string;
  switchIcon: string;
  switchTooltip: string;
}

interface Emits {
  (e: 'switch'): void;
  (e: 'close'): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();

const handleSwitch = () => {
  emit('switch');
};

const handleClose = () => {
  emit('close');
};
</script>

<style lang="scss" scoped>
.chat-header {
  display: flex;
  align-items: center;
  padding: 20px 24px;
  border-radius: 1rem 1rem 0 0;
  background-color: var(--grey-0);
}

.switch-btn {
  color: var(--color-pink-300);
  transition: color 0.3s;
  
  &:hover {
    color: var(--color-pink);
  }
}

@media (min-width: 760px) {
  .close,
  .switch-btn {
    display: block;
  }
}

@media (max-width: 760px) {
  .close,
  .switch-btn {
    display: block;
  }
}
</style>

