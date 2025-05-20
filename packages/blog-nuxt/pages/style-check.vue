<template>
  <div class="p-8">
    <h1 class="text-2xl font-bold mb-4">分页器样式检查</h1>
    
    <div class="bg-white p-4 rounded-lg shadow mb-8">
      <h2 class="text-xl font-bold mb-4">原始 UPagination</h2>
      <UPagination
        v-model="page"
        :total="50"
        :ui="{ wrapper: 'debug-wrapper' }"
      />
    </div>
    
    <div class="bg-white p-4 rounded-lg shadow mb-8">
      <h2 class="text-xl font-bold mb-4">自定义 Pagination 组件</h2>
      <Pagination
        :current="page"
        :total="5"
        @update:current="page = $event"
      />
    </div>
    
    <div class="bg-white p-4 rounded-lg shadow mb-8 debug-info">
      <h2 class="text-xl font-bold mb-4">调试信息</h2>
      <pre class="text-xs bg-gray-100 p-4 rounded overflow-auto max-h-96">{{ debugInfo }}</pre>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const page = ref(1);
const debugInfo = ref('加载中...');

onMounted(() => {
  setTimeout(() => {
    const paginationElement = document.querySelector('.debug-wrapper');
    if (paginationElement) {
      debugInfo.value = JSON.stringify({
        classes: paginationElement.className,
        children: Array.from(paginationElement.children).map(child => ({
          tag: child.tagName,
          classes: child.className,
          attributes: Array.from(child.attributes).map(attr => ({
            name: attr.name,
            value: attr.value
          }))
        }))
      }, null, 2);
    } else {
      debugInfo.value = '无法找到分页器元素';
    }
  }, 1000);
});
</script>

<style>
.debug-info {
  margin-top: 2rem;
}
</style> 