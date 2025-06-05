<template>
  <div class="pagination-wrapper">
    <UPagination
      v-model:page="currentPage"
      class="pagination w-full"
      :total="total"
      :items-per-page="perPage"
      :show-controls="true"
      :active-color="'primary'"
      :active-variant="'solid'"
      :color="'primary'"
      :variant="'outline'"
      :sibling-count="1"
      :show-edges="true"
      @update:page="handlePageChange"
    >
      <template #first>
        <UButton class="!bg-transparent text-[var(--grey-5)]">
          <UIcon name="icon:angle-double-left" class="pagination-icon scale-150" />
        </UButton>
      </template>
      <template #prev>
        <UButton class="!bg-transparent text-[var(--grey-5)]">
          <UIcon name="icon:angle-left" class="pagination-icon" />
        </UButton>
      </template>
      <template #ellipsis>
        <span class="pagination-ellipsis">...</span>
      </template>
      <template #next>
        <UButton class="!bg-transparent text-[var(--grey-5)]">
          <UIcon name="icon:angle-right" class="pagination-icon" />
        </UButton>
      </template>
      <template #last>
        <UButton class="!bg-transparent text-[var(--grey-5)]">
          <UIcon name="icon:angle-double-right" class="pagination-icon scale-150" />
        </UButton>
      </template>
    </UPagination>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const emit = defineEmits(["update:current"]);
const props = defineProps({
  current: {
    type: Number,
    default: 1,
  },
  total: {
    type: Number,
    default: 0,
  },
  perPage: {
    type: Number,
    default: 10,
  }
});

// 计算实际的页数 - 根据新API，不再需要计算pageCount，使用items-per-page代替
const currentPage = computed<number>({
  get: () => props.current,
  set: (value) => {
    // 由handlePageChange处理
  },
});

const handlePageChange = (page: number) => {
  emit("update:current", page);
};
</script>

<style lang="scss" scoped>
.pagination-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
  margin: 1.5rem 0;
}

.pagination {
  width: auto;
  display: flex;
  justify-content: center;
}

.pagination-icon {
  width: 0.85rem;
  height: 0.85rem;
  color: currentColor;
}

.pagination-ellipsis {
  font-weight: bold;
  color: var(--grey-5);
}

:deep(.pagination button) {
  min-width: 2rem !important;
  height: 2rem !important;
  margin: 0 2px !important;
  border-radius: 4px !important;
  // color: var(--grey-5);
  transition: all 0.3s ease-in-out;
}

:deep(.pagination button:hover),
:deep(.pagination button.active) {
  color: var(--grey-0) !important;
  background-image: linear-gradient(
    to right,
    var(--color-pink) 0,
    var(--color-orange) 100%
  ) !important;
  box-shadow: 0 0 0.75rem var(--color-pink-a3) !important;
  border: none !important;
}
</style> 