<template>
  <div class="article-page">
    <!-- 文章头部信息 -->
    <div class="article-header" :style="{ backgroundImage: `url(${article?.articleCover})` }">
      <div class="article-header-overlay"></div>
      <div class="article-header-content container">
        <h1 class="article-title">{{ article?.articleTitle }}</h1>
        <div class="article-meta">
          <div class="meta-item">
            <span class="meta-icon">📅</span>
            <span class="meta-text">发布于 {{ formatDate(article?.createTime) }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-icon">👁️</span>
            <span class="meta-text">阅读量 {{ article?.viewCount || 0 }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-icon">📂</span>
            <span class="meta-text">{{ article?.categoryName }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="container">
      <div class="article-wrapper">
        <div class="article-main">
          <!-- 文章内容 -->
          <div class="article-content markdown-body" v-html="article?.articleContent"></div>
          
          <!-- 文章标签 -->
          <div class="article-tags">
            <NuxtLink v-for="tag in article?.tagList" :key="tag.id" :to="`/tag/${tag.id}`" class="article-tag">
              <span class="tag-icon">#</span>
              {{ tag.tagName }}
            </NuxtLink>
          </div>
          
          <!-- 文章版权信息 -->
          <div class="article-copyright">
            <div class="copyright-item">
              <span class="copyright-label">本文作者：</span>
              <span class="copyright-value">{{ article?.author || '博主' }}</span>
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
            <div v-if="prevArticle" class="nav-prev">
              <NuxtLink :to="`/article/${prevArticle.id}`" class="nav-link">
                <div class="nav-label">上一篇</div>
                <div class="nav-title">{{ prevArticle.articleTitle }}</div>
              </NuxtLink>
            </div>
            <div v-if="nextArticle" class="nav-next">
              <NuxtLink :to="`/article/${nextArticle.id}`" class="nav-link">
                <div class="nav-label">下一篇</div>
                <div class="nav-title">{{ nextArticle.articleTitle }}</div>
              </NuxtLink>
            </div>
          </div>
          
          <!-- 文章评论 -->
          <div class="article-comments">
            <h3 class="comments-title">评论 ({{ comments?.length || 0 }})</h3>
            
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
              <div v-for="(comment, index) in comments" :key="comment.id || index" class="comment-item">
                <div class="comment-avatar">
                  <img :src="comment.avatar || `https://picsum.photos/50/50?random=${index + 101}`" alt="用户头像" />
                </div>
                <div class="comment-content">
                  <div class="comment-user">{{ comment.username }}</div>
                  <div class="comment-text">{{ comment.content }}</div>
                  <div class="comment-footer">
                    <span class="comment-time">{{ formatDate(comment.createTime) }}</span>
                    <button class="comment-reply" @click="replyToComment(comment)">回复</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="article-sidebar">
          <!-- 目录 -->
          <div class="sidebar-widget toc-widget" v-if="toc && toc.length > 0">
            <h3 class="widget-title">目录</h3>
            <div class="toc-list">
              <div v-for="item in toc" :key="item.id" class="toc-item" :class="{ 'toc-level-2': item.level === 2 }">
                <a :href="`#${item.id}`" class="toc-link">{{ item.text }}</a>
              </div>
            </div>
          </div>
          
          <!-- 推荐文章 -->
          <div class="sidebar-widget recommend-widget">
            <h3 class="widget-title">推荐文章</h3>
            <div class="recommend-list">
              <NuxtLink v-for="rec in recommendedArticles" :key="rec.id" :to="`/article/${rec.id}`" class="recommend-item">
                <span class="recommend-title">{{ rec.articleTitle }}</span>
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useUserStore } from '../../composables/useStores';

// 使用用户store
const userStore = useUserStore();

// 定义Article接口
interface Article {
  id: string;
  articleTitle: string;
  articleContent: string;
  articleCover: string;
  createTime: string;
  viewCount: number;
  categoryName: string;
  author: string;
  tagList: Array<{
    id: string;
    tagName: string;
  }>;
}

// 定义TocItem接口
interface TocItem {
  id: string;
  level: number;
  text: string;
}

// 使用Nuxt的内置函数，这些函数已经在全局作用域中定义
const nuxtApp = useNuxtApp();
const route = useRoute();
const articleId = route.params.id as string;

// 评论内容
const commentContent = ref('');
const comments = ref<any[]>([]);
const toc = ref<any[]>([]);
const recommendedArticles = ref<Article[]>([]);
const prevArticle = ref<Article | null>(null);
const nextArticle = ref<Article | null>(null);
const article = ref<Article | null>(null);

// 文章URL
const articleUrl = computed(() => {
  if (typeof window !== 'undefined') {
    return window.location.href;
  }
  return '';
});

// 格式化日期
const formatDate = (dateString: string | undefined) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// 生成文章目录
function generateToc(html: string): TocItem[] {
  const pattern = /<h([1-6])\s+id="([^"]+)".*?>(.+?)<\/h\1>/g;
  let match;
  const tocItems: TocItem[] = [];
  
  while ((match = pattern.exec(html)) !== null) {
    const level = parseInt(match[1]);
    const id = match[2];
    const text = match[3].replace(/<[^>]*>/g, ''); // 移除HTML标签
    
    tocItems.push({
      id,
      level,
      text
    });
  }
  
  return tocItems;
}

// 评论回复
const replyToComment = (comment: any) => {
  // 实现评论回复逻辑
  console.log('回复评论:', comment);
};

// 提交评论
const submitComment = async () => {
  if (!commentContent.value.trim()) {
    alert('评论内容不能为空');
    return;
  }
  
  try {
    await nuxtApp.$api.comment.create(articleId, {
      content: commentContent.value
    });
    
    commentContent.value = '';
    alert('评论提交成功');
    
    // 重新获取评论列表
    fetchComments();
  } catch (error) {
    console.error('提交评论失败:', error);
    alert('评论提交失败，请稍后重试');
  }
};

// 获取文章详情
const fetchArticleDetail = async () => {
  try {
    const data = await nuxtApp.$api.article.getDetail(articleId);
    article.value = data;
    
    // 提取目录
    if (article.value?.articleContent) {
      toc.value = generateToc(article.value.articleContent);
    }
  } catch (error) {
    console.error('获取文章详情失败:', error);
  }
};

// 获取文章评论
const fetchComments = async () => {
  try {
    const data = await nuxtApp.$api.comment.getList(articleId);
    comments.value = data || [];
  } catch (error) {
    console.error('获取评论失败:', error);
  }
};

// 获取推荐文章
const fetchRecommendedArticles = async () => {
  try {
    const data = await nuxtApp.$api.article.getRecommended();
    recommendedArticles.value = data || [];
  } catch (error) {
    console.error('获取推荐文章失败:', error);
  }
};

// 获取相关文章（上一篇/下一篇）
const fetchRelatedArticles = async () => {
  try {
    const data = await nuxtApp.$api.article.getRelated(articleId);
    if (data) {
      prevArticle.value = data.prev;
      nextArticle.value = data.next;
    }
  } catch (error) {
    console.error('获取相关文章失败:', error);
  }
};

// SEO优化
useHead({
  title: computed(() => article.value ? `${article.value.articleTitle} - 博客网站` : '文章详情 - 博客网站'),
  meta: [
    {
      name: 'description',
      content: computed(() => article.value?.articleContent
        ? article.value.articleContent.replace(/<[^>]*>/g, '').slice(0, 150) + '...'
        : '查看详细文章内容')
    },
    {
      name: 'keywords',
      content: computed(() => article.value?.tagList
        ? article.value.tagList.map((tag) => tag.tagName).join(',')
        : '博客,文章,技术')
    }
  ]
});

onMounted(async () => {
  // 获取文章详情
  await fetchArticleDetail();
  
  // 获取评论和推荐文章
  await Promise.all([
    fetchComments(),
    fetchRecommendedArticles(),
    fetchRelatedArticles()
  ]);
  
  // 如果没有拿到真实数据，使用模拟数据
  if (!article.value) {
    article.value = {
      id: articleId,
      articleTitle: 'Nuxt 3 服务端渲染与SEO优化实践',
      articleContent: '<h2 id="introduction">引言</h2><p>本文介绍Nuxt 3服务端渲染与SEO优化实践...</p><h2 id="what-is-ssr">什么是服务端渲染</h2><p>服务端渲染是指...</p>',
      articleCover: 'https://picsum.photos/id/1/1200/600',
      createTime: '2023-10-01T10:00:00Z',
      viewCount: 256,
      categoryName: '前端开发',
      author: '博主',
      tagList: [
        { id: '1', tagName: 'Nuxt' },
        { id: '2', tagName: 'SEO' },
        { id: '3', tagName: 'Vue' }
      ]
    };
    
    toc.value = generateToc(article.value.articleContent);
  }
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