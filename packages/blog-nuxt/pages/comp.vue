<template>
  <div class="p-4">
    <h2 class="text-xl font-bold mb-4">图标组件示例</h2>
    
    <div class="space-y-6">
      <div>
        <h3 class="text-lg font-medium mb-2">1. 使用UIcon组件 - 方式一：i-icon-xxx格式</h3>
        <div class="flex gap-4 items-center">
          <UIcon name="i-icon-heng" class="size-8 icon" />
          <UIcon name="i-icon-home" class="size-8 icon" />
          <UIcon name="i-icon-user" class="size-8 icon" />
        </div>
      </div>
      
      <div>
        <h3 class="text-lg font-medium mb-2">2. 使用UIcon组件 - 方式二：icon:xxx格式</h3>
        <div class="flex gap-4 items-center">
          <UIcon name="icon:heng" class="size-8 icon" />
          <UIcon name="icon:home" class="size-8 icon" />
          <UIcon name="icon:user" class="size-8 icon" />
        </div>
      </div>
      
      <div>
        <h3 class="text-lg font-medium mb-2">3. 直接使用CSS类名</h3>
        <div class="flex gap-4 items-center">
          <div class="i-icon-heng size-8"></div>
          <div class="i-icon-home size-8"></div>
          <div class="i-icon-user size-8"></div>
        </div>
      </div>
      
      <div>
        <h3 class="text-lg font-medium mb-2">4. 尝试不同方式使用UButton的icon属性</h3>
        <div class="flex flex-wrap gap-4 items-center">
          <!-- 方法1：直接使用完整图标名 -->
          <UButton icon="i-icon-home" variant="ghost" label="方法1：完整图标名" />
          
          <!-- 方法2：使用app.config.ts中的别名 -->
          <UButton icon="home" variant="ghost" label="方法2：别名" />
          
          <!-- 方法3：使用leading-icon插槽 -->
          <UButton variant="ghost" label="方法3：插槽">
            <template #leading-icon>
              <UIcon name="icon:article" class="icon" />
            </template>
          </UButton>
          
          <!-- 方法4：使用自定义前缀 -->
          <UButton icon="icon:home" variant="ghost" label="方法4：自定义前缀" />
          
          <!-- 方法5：使用动态绑定 -->
          <UButton :icon="$ui?.icons?.home || 'i-icon-home'" variant="ghost" label="方法5：动态绑定" />
        </div>
      </div>
    </div>
  </div>
</template>
