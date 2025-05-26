<template>
  <div class="article-card">
    <NuxtLink :to="`/article/${article.id}`" class="article-link">
      <div v-if="article.cover" class="article-cover">
        <img :src="article.cover" :alt="article.title">
      </div>
      <div class="article-content">
        <h2 class="article-title">{{ article.title }}</h2>
        <p class="article-summary">{{ article.summary }}</p>
        <div class="article-meta">
          <div class="meta-item">
            <CalendarIcon class="meta-icon" />
            <span class="meta-text">{{ article.createTime }}</span>
          </div>
          <div class="meta-item">
            <CategoryIcon class="meta-icon" />
            <span class="meta-text">{{ article.categoryName }}</span>
          </div>
          <div class="meta-item">
            <EyeIcon class="meta-icon" />
            <span class="meta-text">{{ article.viewCount }} 阅读</span>
          </div>
        </div>
        <div v-if="article.tagNames && article.tagNames.length > 0" class="article-tags">
          <span 
            v-for="(tag, index) in article.tagNames" 
            :key="index" 
            class="tag"
          >
            # {{ tag }}
          </span>
        </div>
      </div>
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
import CalendarIcon from '~/assets/icons/calendar.svg';
import CategoryIcon from '~/assets/icons/category.svg';
import EyeIcon from '~/assets/icons/eye.svg';

defineProps<{
  article: {
    id: number;
    title: string;
    summary: string;
    cover?: string;
    createTime: string;
    categoryName: string;
    viewCount: number;
    tagNames?: string[];
  }
}>();
</script>

<style lang="scss" scoped>
.article-card {
  background-color: var(--card-bg);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s, box-shadow 0.3s;
  margin-bottom: 1.5rem;
}

.article-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.12);
}

.article-link {
  display: flex;
  flex-direction: column;
  text-decoration: none;
  color: var(--text-color);
}

.article-cover {
  height: 200px;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s;
  }
}

.article-card:hover .article-cover img {
  transform: scale(1.05);
}

.article-content {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
}

.article-title {
  font-size: 1.3rem;
  margin-bottom: 0.8rem;
  color: var(--heading-color);
  line-height: 1.4;
}

.article-summary {
  color: var(--text-color);
  opacity: 0.8;
  margin-bottom: 1rem;
  line-height: 1.6;
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
  color: var(--text-color);
  opacity: 0.7;
  margin-bottom: 1rem;
}

.meta-item {
  display: flex;
  align-items: center;
}

.meta-icon {
  width: 14px;
  height: 14px;
  margin-right: 5px;
}

.article-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  
  .tag {
    display: inline-block;
    padding: 0.2rem 0.5rem;
    font-size: 0.75rem;
    color: var(--color-pink);
    background-color: rgba(237, 110, 160, 0.1);
    border-radius: 4px;
    transition: background-color 0.2s;
    
    &:hover {
      background-color: rgba(237, 110, 160, 0.2);
    }
  }
}

@media (max-width: 768px) {
  .article-meta {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style> 