<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">图标测试页面 - 所有图标</h1>
    
    <div class="grid grid-cols-4 gap-4">
      <!-- 测试所有可能的图标名称 -->
      <div v-for="iconName in iconNames" :key="iconName" class="border p-4 rounded flex flex-col items-center">
        <div class="mb-2">
          <UIcon :name="'icon:' + iconName" class="size-8 icon" />
        </div>
        <div class="text-sm text-center">{{ iconName }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
// 从文件名生成图标名列表
const iconNames = [
  'emoji', 'chevron-right', 'chevron-left', 'user', 'web', 'zhaoxiang', 'update', 'upload',
  'top', 'trumpet', 'up', 'talk', 'sun', 'tag', 'qr-code', 'right-arrow', 'search',
  'qizhi', 'qq', 'plane', 'message', 'moon', 'logout', 'laba', 'like', 'heng', 'history', 'home',
  'github-dark', 'github', 'heart', 'friend', 'fun', 'gitee', 'eye', 'flower', 'down', 'edit',
  'comment', 'comments', 'copy', 'delete', 'category', 'clock', 'close', 'bilibili', 'calendar',
  'author', 'badge', 'article-link', 'article-share', 'arrow-down',
  'arrow-up', 'article', 'angle-right', 'archives', 'album', 'angle-left'
];
</script> 