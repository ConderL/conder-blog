<template>
  <div class="pagination">
    <button 
      class="pagination-btn prev" 
      :disabled="currentPage <= 1" 
      @click="changePage(currentPage - 1)"
    >
      <svg-icon icon-class="angle-left"></svg-icon>
    </button>
    
    <div class="pagination-numbers">
      <!-- 第一页 -->
      <button v-if="shouldShowFirstPage" class="page-number" :class="{ active: currentPage === 1 }" @click="changePage(1)">1</button>
      
      <!-- 省略号 -->
      <span v-if="showLeftEllipsis" class="ellipsis">...</span>
      
      <!-- 动态页码 -->
      <button 
        v-for="n in pageNumbers" 
        :key="n" 
        class="page-number" 
        :class="{ active: currentPage === n }"
        @click="changePage(n)"
      >
        {{ n }}
      </button>
      
      <!-- 省略号 -->
      <span v-if="showRightEllipsis" class="ellipsis">...</span>
      
      <!-- 最后一页 -->
      <button v-if="shouldShowLastPage" class="page-number" :class="{ active: currentPage === total }" @click="changePage(total)">{{ total }}</button>
    </div>
    
    <button 
      class="pagination-btn next" 
      :disabled="currentPage >= total" 
      @click="changePage(currentPage + 1)"
    >
      <svg-icon icon-class="angle-right"></svg-icon>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const emit = defineEmits(["update:current"]);
const props = defineProps({
  current: {
    type: Number,
    default: 1,
  },
  total: {
    type: Number,
    default: 0,
  }
});

const currentPage = computed<number>({
  get: () => props.current,
  set: value => {
    emit("update:current", value);
  }
});

function changePage(page: number) {
  if (page >= 1 && page <= props.total) {
    currentPage.value = page;
  }
}

// 计算要显示的页码数组
const pageNumbers = computed(() => {
  const current = currentPage.value;
  const count = props.total;
  const pageSlot = 5; // 显示的页码数量
  
  let start = Math.max(current - Math.floor(pageSlot / 2), 2);
  let end = Math.min(start + pageSlot - 1, count - 1);
  
  if (end - start + 1 < pageSlot) {
    start = Math.max(end - pageSlot + 1, 2);
  }
  
  const result = [];
  for (let i = start; i <= end; i++) {
    result.push(i);
  }
  
  return result;
});

// 是否显示第一页
const shouldShowFirstPage = computed(() => props.total > 1);

// 是否显示最后一页
const shouldShowLastPage = computed(() => props.total > 1 && props.total !== 1);

// 是否显示左侧省略号
const showLeftEllipsis = computed(() => {
  return pageNumbers.value.length > 0 && pageNumbers.value[0] > 2;
});

// 是否显示右侧省略号
const showRightEllipsis = computed(() => {
  return pageNumbers.value.length > 0 && pageNumbers.value[pageNumbers.value.length - 1] < props.total - 1;
});
</script>

<style lang="scss" scoped>
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 1.5rem 0;
  
  .pagination-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    border: 1px solid var(--border-color);
    background-color: var(--card-bg);
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover:not(:disabled) {
      color: var(--color-pink);
      border-color: var(--color-pink);
    }
    
    &:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }
  }
  
  .pagination-numbers {
    display: flex;
    align-items: center;
    margin: 0 0.5rem;
    
    .page-number {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 2rem;
      height: 2rem;
      margin: 0 0.25rem;
      border: 1px solid var(--border-color);
      background-color: var(--card-bg);
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s ease;
      
      &:hover {
        color: var(--color-pink);
        border-color: var(--color-pink);
      }
      
      &.active {
        color: #fff;
        background-color: var(--color-pink);
        border-color: var(--color-pink);
      }
    }
    
    .ellipsis {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 2rem;
      height: 2rem;
    }
  }
}
</style> 