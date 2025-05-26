<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">图标测试页面</h1>
    
    <div class="grid grid-cols-2 gap-4">
      <div class="border p-4 rounded">
        <h2 class="text-lg font-semibold mb-2">方法1: 使用UIcon组件</h2>
        <div class="flex gap-2 items-center">
          <UIcon name="icon:i-icon-heng" class="size-8 icon" />
          <UIcon name="icon:i-icon-home" class="size-8 icon" />
          <UIcon name="icon:i-icon-user" class="size-8 icon" />
        </div>
      </div>
      
      <div class="border p-4 rounded">
        <h2 class="text-lg font-semibold mb-2">方法2: 直接使用类名</h2>
        <div class="flex gap-2 items-center">
          <div class="i-icon-heng size-8"></div>
          <div class="i-icon-home size-8"></div>
          <div class="i-icon-user size-8"></div>
        </div>
      </div>
      
      <div class="border p-4 rounded">
        <h2 class="text-lg font-semibold mb-2">方法3: 使用Icon组件</h2>
        <div class="flex gap-2 items-center">
          <Icon name="icon:heng" class="size-8" />
          <Icon name="icon:home" class="size-8" />
          <Icon name="icon:user" class="size-8" />
        </div>
      </div>
      
      <div class="border p-4 rounded">
        <h2 class="text-lg font-semibold mb-2">方法4: 使用app.config.ts中定义的图标</h2>
        <div class="flex gap-2 items-center">
          <UButton icon="home" variant="ghost" />
          <UButton icon="user" variant="ghost" />
          <UButton icon="article" variant="ghost" />
        </div>
      </div>
    </div>
  </div>
</template> 