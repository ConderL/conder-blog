<template>
  <div class="article-page">
    <!-- 文章头部信息 -->
    <div class="article-header" :style="{ backgroundImage: `url(${article.cover})` }">
      <div class="article-header-overlay"></div>
      <div class="article-header-content container">
        <h1 class="article-title">{{ article.title }}</h1>
        <div class="article-meta">
          <div class="meta-item">
            <span class="meta-icon">📅</span>
            <span class="meta-text">发布于 {{ article.publishTime }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-icon">👁️</span>
            <span class="meta-text">阅读量 {{ article.views }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-icon">📂</span>
            <span class="meta-text">{{ article.category }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="container">
      <div class="article-wrapper">
        <div class="article-main">
          <!-- 文章内容 -->
          <div class="article-content markdown-body" v-html="article.content"></div>
          
          <!-- 文章标签 -->
          <div class="article-tags">
            <NuxtLink v-for="tag in article.tags" :key="tag" :to="`/tag/${tag}`" class="article-tag">
              <span class="tag-icon">#</span>
              {{ tag }}
            </NuxtLink>
          </div>
          
          <!-- 文章版权信息 -->
          <div class="article-copyright">
            <div class="copyright-item">
              <span class="copyright-label">本文作者：</span>
              <span class="copyright-value">博主</span>
            </div>
            <div class="copyright-item">
              <span class="copyright-label">本文链接：</span>
              <span class="copyright-value">{{ articleUrl }}</span>
            </div>
            <div class="copyright-item">
              <span class="copyright-label">版权声明：</span>
              <span class="copyright-value">
                本站所有文章除特别声明外，均采用
                <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh" target="_blank">
                  CC BY-NC-SA 4.0
                </a>
                许可协议。转载请注明文章出处！
              </span>
            </div>
          </div>
          
          <!-- 文章导航 -->
          <div class="article-navigation">
            <div v-if="article.prevArticle" class="nav-prev">
              <NuxtLink :to="`/article/${article.prevArticle.id}`" class="nav-link">
                <div class="nav-label">上一篇</div>
                <div class="nav-title">{{ article.prevArticle.title }}</div>
              </NuxtLink>
            </div>
            <div v-if="article.nextArticle" class="nav-next">
              <NuxtLink :to="`/article/${article.nextArticle.id}`" class="nav-link">
                <div class="nav-label">下一篇</div>
                <div class="nav-title">{{ article.nextArticle.title }}</div>
              </NuxtLink>
            </div>
          </div>
          
          <!-- 文章评论 -->
          <div class="article-comments">
            <h3 class="comments-title">评论 ({{ comments.length }})</h3>
            
            <!-- 评论表单 -->
            <div class="comment-form">
              <div class="form-avatar">
                <img src="https://picsum.photos/50/50?random=100" alt="头像" />
              </div>
              <div class="form-content">
                <textarea 
                  class="form-textarea" 
                  placeholder="请输入评论内容..." 
                  v-model="commentContent"
                ></textarea>
                <div class="form-actions">
                  <button class="form-button" @click="submitComment">发表评论</button>
                </div>
              </div>
            </div>
            
            <!-- 评论列表 -->
            <div class="comments-list">
              <div v-for="(comment, index) in comments" :key="index" class="comment-item">
                <div class="comment-avatar">
                  <img :src="`https://picsum.photos/50/50?random=${index + 101}`" alt="用户头像" />
                </div>
                <div class="comment-content">
                  <div class="comment-user">{{ comment.username }}</div>
                  <div class="comment-text">{{ comment.content }}</div>
                  <div class="comment-footer">
                    <span class="comment-time">{{ comment.time }}</span>
                    <button class="comment-reply">回复</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="article-sidebar">
          <!-- 目录 -->
          <div class="sidebar-widget toc-widget">
            <h3 class="widget-title">目录</h3>
            <div class="toc-list">
              <div class="toc-item">
                <a href="#section1" class="toc-link">第一章</a>
              </div>
              <div class="toc-item toc-level-2">
                <a href="#section1-1" class="toc-link">1.1 小节</a>
              </div>
              <div class="toc-item toc-level-2">
                <a href="#section1-2" class="toc-link">1.2 小节</a>
              </div>
              <div class="toc-item">
                <a href="#section2" class="toc-link">第二章</a>
              </div>
            </div>
          </div>
          
          <!-- 推荐文章 -->
          <div class="sidebar-widget recommend-widget">
            <h3 class="widget-title">推荐文章</h3>
            <div class="recommend-list">
              <NuxtLink v-for="i in 5" :key="i" :to="`/article/${i+10}`" class="recommend-item">
                <span class="recommend-title">推荐文章标题 {{ i }}</span>
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

// 使用Nuxt的方式获取路由参数
const route = useRoute();
const articleId = route.params.id as string;

// 评论内容
const commentContent = ref('');

// 提交评论方法
const submitComment = () => {
  if (commentContent.value.trim()) {
    comments.value.unshift({
      username: '游客',
      content: commentContent.value,
      time: new Date().toLocaleString()
    });
    commentContent.value = '';
  }
};

// 文章URL
const articleUrl = computed(() => {
  return `${window.location.origin}/article/${articleId}`;
});

// 模拟评论数据
const comments = ref([
  {
    username: '用户1',
    content: '这篇文章写得很好，学习了很多新知识！',
    time: '2023-01-05 14:23'
  },
  {
    username: '用户2',
    content: '写得真不错，希望能有更多这样的文章。',
    time: '2023-01-04 18:45'
  },
  {
    username: '用户3',
    content: '请问第二部分提到的技术有相关的学习资料推荐吗？',
    time: '2023-01-03 09:12'
  }
]);

// 模拟数据，实际应该从API获取
const article = ref({
  id: articleId,
  title: '使用Nuxt.js实现服务端渲染提高SEO效果',
  content: `
    <h2 id="section1">第一章：Nuxt.js简介</h2>
    <p>Nuxt.js是一个基于Vue.js的服务端渲染应用框架，它可以帮助你以极少的配置构建一个服务端渲染的Vue应用。</p>
    <p>在传统的单页应用(SPA)中，所有的渲染都是在客户端完成的，这会导致一些SEO问题，因为搜索引擎爬虫可能无法正确地解析JavaScript生成的内容。</p>
    
    <h3 id="section1-1">1.1 Nuxt.js的优势</h3>
    <p>使用Nuxt.js可以享受以下优势：</p>
    <ul>
      <li>自动代码分割</li>
      <li>服务端渲染</li>
      <li>强大的路由系统</li>
      <li>静态文件生成</li>
      <li>模块化结构</li>
    </ul>
    
    <h3 id="section1-2">1.2 Nuxt.js的工作原理</h3>
    <p>Nuxt.js在服务器端执行你的Vue组件，并将结果HTML发送给浏览器。这样可以确保用户在第一时间看到完整的页面内容，而不是等待JavaScript加载和执行后才能看到。</p>
    
    <h2 id="section2">第二章：Nuxt.js与SEO</h2>
    <p>服务端渲染(SSR)可以显著提高网站的SEO效果，因为搜索引擎可以直接爬取完整的HTML内容，而不需要执行JavaScript。</p>
    <p>此外，Nuxt.js还提供了便捷的元数据管理功能，可以轻松地为每个页面设置不同的标题、描述和关键词等SEO信息。</p>
  `,
  cover: 'https://picsum.photos/1920/1080?random=20',
  publishTime: '2023-01-02',
  category: '前端技术',
  views: 980,
  tags: ['Vue', 'Nuxt', 'SSR', 'SEO'],
  prevArticle: {
    id: (parseInt(articleId) - 1).toString(),
    title: '前一篇文章标题'
  },
  nextArticle: {
    id: (parseInt(articleId) + 1).toString(),
    title: '后一篇文章标题'
  }
});

// SEO优化
useHead({
  title: computed(() => `${article.value.title} - 博客网站`),
  meta: [
    { 
      name: 'description', 
      content: computed(() => article.value.content.replace(/<[^>]*>/g, '').slice(0, 150))
    },
    { 
      name: 'keywords', 
      content: computed(() => article.value.tags.join(','))
    }
  ]
});
</script>

<style scoped>
.article-page {
  background-color: #f8f9fa;
}

.article-header {
  position: relative;
  height: 400px;
  background-size: cover;
  background-position: center;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2rem;
}

.article-header-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 1;
}

.article-header-content {
  position: relative;
  z-index: 2;
  text-align: center;
}

.article-title {
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.article-meta {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  font-size: 0.95rem;
}

.meta-item {
  display: flex;
  align-items: center;
}

.meta-icon {
  margin-right: 0.5rem;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.article-wrapper {
  display: flex;
  gap: 2rem;
  margin-bottom: 3rem;
}

.article-main {
  flex: 3;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.article-sidebar {
  flex: 1;
}

/* 文章内容样式 */
.article-content {
  line-height: 1.8;
  margin-bottom: 2rem;
}

.article-content h2 {
  font-size: 1.8rem;
  margin: 2rem 0 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #eee;
}

.article-content h3 {
  font-size: 1.4rem;
  margin: 1.5rem 0 1rem;
}

.article-content p {
  margin-bottom: 1rem;
}

.article-content ul {
  padding-left: 2rem;
  margin-bottom: 1rem;
}

.article-content li {
  margin-bottom: 0.5rem;
}

/* 文章标签 */
.article-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 2rem;
}

.article-tag {
  display: inline-flex;
  align-items: center;
  padding: 0.3rem 0.8rem;
  background-color: #f0f0f0;
  border-radius: 20px;
  color: #333;
  text-decoration: none;
  font-size: 0.9rem;
  transition: background-color 0.3s;
}

.article-tag:hover {
  background-color: #e0e0e0;
}

.tag-icon {
  color: #0070f3;
  margin-right: 0.3rem;
}

/* 文章版权 */
.article-copyright {
  margin-bottom: 2rem;
  padding: 1rem;
  background-color: #f8f9fa;
  border-left: 4px solid #0070f3;
  font-size: 0.9rem;
}

.copyright-item {
  margin-bottom: 0.5rem;
}

.copyright-label {
  font-weight: bold;
  margin-right: 0.5rem;
}

/* 文章导航 */
.article-navigation {
  display: flex;
  margin-bottom: 2rem;
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
  padding: 1rem 0;
}

.nav-prev, .nav-next {
  flex: 1;
}

.nav-next {
  text-align: right;
}

.nav-link {
  text-decoration: none;
  color: #333;
  display: block;
  padding: 0.5rem;
  transition: background-color 0.3s;
  border-radius: 4px;
}

.nav-link:hover {
  background-color: #f0f0f0;
}

.nav-label {
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 0.25rem;
}

.nav-title {
  font-weight: bold;
}

/* 评论区 */
.article-comments {
  margin-top: 2rem;
}

.comments-title {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #eee;
}

.comment-form {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.form-avatar img {
  width: 50px;
  height: 50px;
  border-radius: 50%;
}

.form-content {
  flex: 1;
}

.form-textarea {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  min-height: 100px;
  resize: vertical;
  margin-bottom: 0.5rem;
}

.form-actions {
  text-align: right;
}

.form-button {
  background-color: #0070f3;
  color: #fff;
  border: none;
  padding: 0.5rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.form-button:hover {
  background-color: #0051af;
}

.comments-list {
  margin-top: 2rem;
}

.comment-item {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #eee;
}

.comment-avatar img {
  width: 50px;
  height: 50px;
  border-radius: 50%;
}

.comment-content {
  flex: 1;
}

.comment-user {
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.comment-text {
  margin-bottom: 0.5rem;
  line-height: 1.6;
}

.comment-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
  color: #666;
}

.comment-reply {
  background: none;
  border: none;
  color: #0070f3;
  cursor: pointer;
  font-size: 0.85rem;
}

/* 侧边栏 */
.sidebar-widget {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.widget-title {
  font-size: 1.2rem;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #eee;
  position: relative;
}

.widget-title:before {
  content: '';
  position: absolute;
  left: 0;
  bottom: -1px;
  width: 50px;
  height: 2px;
  background-color: #0070f3;
}

.toc-list {
  font-size: 0.95rem;
}

.toc-item {
  margin-bottom: 0.5rem;
}

.toc-level-2 {
  padding-left: 1.5rem;
}

.toc-link {
  color: #333;
  text-decoration: none;
  display: block;
  padding: 0.3rem 0;
  transition: color 0.3s;
}

.toc-link:hover {
  color: #0070f3;
}

.recommend-list {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.recommend-item {
  display: block;
  color: #333;
  text-decoration: none;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.recommend-item:hover {
  background-color: #f0f0f0;
}

.recommend-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
}

@media (max-width: 768px) {
  .article-wrapper {
    flex-direction: column;
  }
  
  .article-title {
    font-size: 1.8rem;
  }
  
  .article-meta {
    flex-direction: column;
    gap: 0.5rem;
    align-items: center;
  }
}
</style> 