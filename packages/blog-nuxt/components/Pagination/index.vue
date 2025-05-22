<template>
  <div class="pagination-wrapper">
    <UPagination
      class="pagination"
      v-model="currentPage"
      :total="total"
      :page-count="pageCount"
      :ui="{
        wrapper: 'flex justify-center items-center gap-1',
        base: 'flex items-center'
      }"
      @update:model-value="handlePageChange"
    >
      <template #prev>
        <button class="hover:bg-gradient-pink-orange">
          <AngleLeftIcon class="pagination-icon" />
        </button>
      </template>
      <template #next>
        <button class="hover:bg-gradient-pink-orange">
          <AngleRightIcon class="pagination-icon" />
        </button>
      </template>
    </UPagination>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import AngleLeftIcon from '~/assets/icons/angle-left.svg';
import AngleRightIcon from '~/assets/icons/angle-right.svg';

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
  pageCount: {
    type: Number,
    default: 10,
  },
});

const currentPage = computed<number>({
  get: () => props.current,
  set: (value) => {
    // This will be handled by handlePageChange
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
}

:deep(.pagination button) {
  min-width: 2rem !important;
  height: 2rem !important;
  margin: 0 2px !important;
  border-radius: 0.25rem !important;
  color: var(--grey-5);
  transition: all 0.3s ease-in-out 0s;
}
</style> 