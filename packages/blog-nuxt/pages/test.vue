<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">测试页面</h1>
    
    <div class="space-y-6">
      <!-- 简单按钮 -->
      <div>
        <h2 class="text-xl font-semibold mb-2">按钮测试</h2>
        <UButton>简单按钮</UButton>
        <UButton color="primary">主色按钮</UButton>
      </div>
      
      <!-- 警告组件 -->
      <div>
        <h2 class="text-xl font-semibold mb-2">警告组件</h2>
        <UAlert title="信息提示" color="blue" :icon="false">这是一个信息提示框</UAlert>
      </div>

      <!-- Tailwind 样式测试 -->
      <div>
        <h2 class="text-xl font-semibold mb-2">Tailwind 样式测试</h2>
        <div class="p-4 bg-gray-100 rounded-lg shadow">
          <p class="text-gray-800">这是一个测试 Tailwind CSS 是否正常工作的区域</p>
          <button class="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
            测试按钮
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  title: '测试页面'
});
</script>

<style scoped>
/* 确保没有冲突的样式 */
</style>