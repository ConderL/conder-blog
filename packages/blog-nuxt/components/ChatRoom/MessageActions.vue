<template>
  <div class="message-actions">
    <UButton
      v-for="action in actions"
      :key="action.key"
      class="action-btn"
      :class="action.class"
      @click="handleAction(action.key)"
    >
      <UIcon v-if="action.icon" :name="action.icon" class="action-icon" />
      <span>{{ action.label }}</span>
    </UButton>
  </div>
</template>

<script setup lang="ts">
interface Action {
  key: string;
  label: string;
  icon?: string;
  class?: string;
}

interface Props {
  actions: Action[];
}

interface Emits {
  (e: 'action', key: string): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();

const handleAction = (key: string) => {
  emit('action', key);
};
</script>

<style lang="scss" scoped>
.message-actions {
  display: flex;
  flex-direction: row-reverse;
  gap: 8px;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--grey-3);
  
  .action-btn {
    
    .action-icon {
      font-size: 14px;
    }
  }
}
</style>

