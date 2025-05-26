<template>
  <div class="container">
    <h1>图标库测试</h1>
    
    <div class="icon-section">
      <h2>单个图标测试</h2>
      <UIcon name="icon:heng" class="test-icon" />
      <UIcon name="icon:home" class="test-icon" />
      <UIcon name="icon:article" class="test-icon" />
    </div>
    
    <div class="icon-section">
      <h2>所有本地图标</h2>
      <div class="icon-grid">
        <div v-for="iconName in iconNames" :key="iconName" class="icon-item">
          <UIcon :name="`icon:${iconName}`" class="icon" />
          <p>{{ iconName }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// 定义所有可用的图标名称
const iconNames = [
  'emoji', 'chevron-right', 'chevron-left', 'user', 'web', 'zhaoxiang',
  'update', 'upload', 'top', 'trumpet', 'up', 'talk', 'sun', 'tag',
  'qr_code', 'right-arrow', 'search', 'qizhi', 'qq', 'plane', 'message',
  'moon', 'logout', 'laba', 'like', 'heng', 'history', 'home', 'github-dark',
  'github', 'heart', 'friend', 'fun', 'gitee', 'eye', 'flower', 'down',
  'edit', 'comment', 'comments', 'copy', 'delete', 'category', 'clock',
  'close', 'bilibili', 'calendar', 'author', 'badge', 'article_link',
  'article_share', 'arrow-down', 'arrow-up', 'article', 'angle-right',
  'archives', 'album', 'angle-left'
];

// 页面元数据
definePageMeta({
  title: '图标测试'
});
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.icon-section {
  margin-bottom: 3rem;
}

.test-icon {
  width: 48px;
  height: 48px;
  margin-right: 1rem;
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 1rem;
}

.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  border: 1px solid #eee;
  border-radius: 8px;
  transition: all 0.2s;
}

.icon-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.icon {
  width: 32px;
  height: 32px;
  margin-bottom: 0.5rem;
}
</style> 