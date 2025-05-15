<template>
  <div class="article-card">
    <NuxtLink :to="`/article/${article.id}`" class="article-link">
      <div class="article-cover">
        <img :src="article.cover" :alt="article.title">
      </div>
      <div class="article-content">
        <h2 class="article-title">{{ article.title }}</h2>
        <p class="article-summary">{{ article.summary }}</p>
        <div class="article-meta">
          <div class="meta-item">
            <span class="meta-icon">📅</span>
            <span class="meta-text">{{ article.publishTime }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-icon">📂</span>
            <span class="meta-text">{{ article.category }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-icon">👁️</span>
            <span class="meta-text">{{ article.views }} 阅读</span>
          </div>
        </div>
      </div>
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  article: {
    id: string;
    title: string;
    summary: string;
    cover?: string;
    publishTime: string;
    category: string;
    views: number;
  }
}>();
</script>

<style scoped>
.article-card {
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
  height: 100%;
}

.article-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
}

.article-link {
  display: flex;
  flex-direction: column;
  height: 100%;
  text-decoration: none;
  color: inherit;
}

.article-cover {
  height: 200px;
  overflow: hidden;
}

.article-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.article-card:hover .article-cover img {
  transform: scale(1.05);
}

.article-content {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.article-title {
  font-size: 1.3rem;
  margin-bottom: 0.8rem;
  color: #333;
  line-height: 1.4;
}

.article-summary {
  color: #666;
  margin-bottom: 1rem;
  line-height: 1.6;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  font-size: 0.85rem;
  color: #888;
}

.meta-item {
  display: flex;
  align-items: center;
}

.meta-icon {
  margin-right: 0.3rem;
}

@media (max-width: 768px) {
  .article-meta {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style> 