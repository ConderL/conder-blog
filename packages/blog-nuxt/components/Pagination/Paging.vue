<template>
  <div v-show="show" class="view-more-pagination">
    <span class="pagination-page-count">共{{ totalPage }}页</span>
    <span v-if="current !== 1" class="pagination-btn cursor-pointer" @click="prePage">上一页</span>
    <template v-for="(number, i) in visibleNumber">
      <span
v-if="typeof number == 'number'" :key="`num-${i}`" class="pagination-page-number cursor-pointer" :class="current == number ? 'current-page' : ''"
        @click="changePage(number)">{{ number }}</span>
      <span v-else :key="`dot-${i}`" class="pagination-page-do">...</span>
    </template>
    <span v-if="current !== totalPage" class="pagination-btn" @click="nextPage">下一页</span>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

const current = ref(1);
const page = ref(5);
const show = ref(false);
const emit = defineEmits(["get-current-page"]);
const props = defineProps({
  total: {
    type: Number,
    default: 0,
  },
  index: {
    type: Number,
    required: true,
  },
  commentId: {
    type: Number,
    required: true,
  },
});

const totalPage = computed(() => Math.ceil(props.total / page.value));

const visibleNumber = computed(() => {
  if (totalPage.value <= 5) {
    return totalPage.value;
  } else if (current.value <= 4) {
      return [1, 2, 3, 4, 5, "...", totalPage.value];
    } else if (current.value >= totalPage.value - 4) {
      return [1, "...", totalPage.value - 5, totalPage.value - 4, totalPage.value - 3, totalPage.value - 2, totalPage.value - 1, totalPage.value];
    } else {
      return [
        1,
        "...",
        current.value - 2,
        current.value - 1,
        current.value,
        current.value + 1,
        current.value + 2,
        "...",
        totalPage.value,
      ];
    }
});

const prePage = () => {
  current.value -= 1;
  emit("get-current-page", current.value, props.index, props.commentId);
};

const changePage = (number: number) => {
  current.value = number;
  emit("get-current-page", number, props.index, props.commentId);
};

const nextPage = () => {
  current.value += 1;
  emit("get-current-page", current.value, props.index, props.commentId);
};

const setPaging = (flag: boolean) => {
  show.value = flag;
};

// 监听总数变化
watch(
  () => props.total,
  (newVal) => {
    if (newVal > page.value) {
      show.value = true;
    } else {
      show.value = false;
    }
  }
);

defineExpose({ current, setPaging });
</script>

<style lang="scss" scoped>
.view-more-pagination {
  font-size: 13px;
  line-height: 1.5;
  margin-top: 0.5rem;

  .pagination-page-count {
    margin-right: 10px;
  }

  .pagination-btn {

    &:hover {
      color: var(--color-pink);
    }
  }

  .pagination-page-do {
    margin: 0 4px;
  }

  .pagination-page-number {
    margin: 0 4px;

    &:hover {
      color: var(--color-pink);
    }
  }
}

.pagination-page-number.current-page {
  color: var(--color-pink);
}
</style> 