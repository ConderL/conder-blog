<template>
  <div class="pagination-container">
    <div class="pagination">
      <!-- 上一页 -->
      <button
        class="pagination-btn prev"
        :disabled="modelValue <= 1"
        @click="changePage(modelValue - 1)"
      >
        <svg-icon icon-class="arrow-left"></svg-icon>
      </button>
      
      <!-- 页码 -->
      <button
        v-for="page in pageNumbers"
        :key="page"
        class="pagination-btn page"
        :class="{ active: page === modelValue }"
        @click="changePage(page)"
      >
        {{ page }}
      </button>
      
      <!-- 下一页 -->
      <button
        class="pagination-btn next"
        :disabled="modelValue >= total"
        @click="changePage(modelValue + 1)"
      >
        <svg-icon icon-class="arrow-right"></svg-icon>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    required: true
  },
  maxVisible: {
    type: Number,
    default: 5
  }
});

const emit = defineEmits(['update:modelValue']);

const changePage = (page: number) => {
  if (page === props.modelValue) return;
  emit('update:modelValue', page);
};

const pageNumbers = computed(() => {
  const current = props.modelValue;
  const total = props.total;
  const max = props.maxVisible;
  
  if (total <= max) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  
  // 计算显示的页码
  let start = Math.max(current - Math.floor(max / 2), 1);
  let end = start + max - 1;
  
  if (end > total) {
    end = total;
    start = Math.max(end - max + 1, 1);
  }
  
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
});
</script>

<style lang="scss" scoped>
.pagination-container {
  display: flex;
  justify-content: center;
  margin: 2rem 0;
}

.pagination {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.pagination-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 2.5rem;
  height: 2.5rem;
  padding: 0 0.75rem;
  border: 1px solid var(--border-color);
  background-color: var(--bg-color);
  color: var(--text-color);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: var(--hover-color);
    border-color: var(--primary-color);
  }
  
  &.active {
    background-color: var(--primary-color);
    border-color: var(--primary-color);
    color: #fff;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    
    &:hover {
      background-color: var(--bg-color);
      border-color: var(--border-color);
    }
  }
}

@media (max-width: 768px) {
  .pagination-btn {
    min-width: 2rem;
    height: 2rem;
    padding: 0 0.5rem;
  }
}
</style> 