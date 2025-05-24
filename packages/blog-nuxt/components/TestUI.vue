<template>
  <div class="p-4 m-4 bg-white rounded-lg shadow-lg">
    <h2 class="text-2xl font-bold text-primary-500 mb-4">Nuxt UI 测试组件</h2>
    
    <!-- 基本按钮 -->
    <div class="space-y-2 mb-4">
      <h3 class="text-lg font-semibold">按钮测试</h3>
      <div class="flex gap-2">
        <UButton>默认按钮</UButton>
        <UButton color="primary">主色按钮</UButton>
        <UButton color="green">绿色按钮</UButton>
        <UButton color="red" variant="solid">红色按钮</UButton>
      </div>
    </div>
    
    <!-- 提示框 -->
    <div class="space-y-2 mb-4">
      <h3 class="text-lg font-semibold">提示框测试</h3>
      <UAlert title="信息提示" color="blue" icon="i-heroicons-information-circle">
        这是一个信息提示框
      </UAlert>
      <UAlert title="成功提示" color="green" icon="i-heroicons-check-circle">
        这是一个成功提示框
      </UAlert>
    </div>
    
    <!-- Tailwind CSS类测试 -->
    <div class="mt-4 grid grid-cols-2 gap-2">
      <div class="p-3 bg-blue-100 text-blue-800 rounded">Tailwind蓝色背景</div>
      <div class="p-3 bg-green-100 text-green-800 rounded">Tailwind绿色背景</div>
      <div class="p-3 bg-yellow-100 text-yellow-800 rounded">Tailwind黄色背景</div>
      <div class="p-3 bg-red-100 text-red-800 rounded">Tailwind红色背景</div>
    </div>
  </div>
</template> 