<template>
  <div class="article-page">
    <!-- 文章头部信息 -->
    <div v-if="data.article" class="page-header">
      <div class="page-title">
        <h1 class="article-title">{{ data.article.articleTitle }}</h1>
        <div class="article-meta">
          <div class="first-meta">
            <span>
              <UIcon name="icon:calendar" class="meta-icon" />
              <span class="text">发表于 </span>{{ data.formattedCreateTime }}
            </span>
            <span v-if="data.formattedUpdateTime" class="item">
              <UIcon name="icon:update" class="meta-icon" />
              <span class="text">更新于 </span>{{ data.formattedUpdateTime }}
            </span>
            <span class="item">
              <UIcon name="icon:eye" class="meta-icon" />
              <span class="text">阅读量 </span>{{ data.article.viewCount || 0 }}
            </span>
          </div>
          <div class="second-meta">
            <span>
              <UIcon name="icon:article" class="meta-icon" />
              <span class="text">字数统计 </span>{{ data.wordNumFormatted }} 字
            </span>
            <span class="item">
              <UIcon name="icon:clock" class="meta-icon" />
              <span class="text">阅读时长 </span>{{ data.readTime || 0 }} 分钟
            </span>
            <span v-if="data.article.category?.categoryName" class="item">
              <UIcon name="icon:category" class="meta-icon" />
              {{ data.article.category?.categoryName }}
            </span>
          </div>
        </div>
      </div>
      <img v-if="data.article.articleCover" class="page-cover" :src="data.article.articleCover" alt="" />
      <Waves></Waves>
    </div>
    <div class="bg">
      <div v-if="data.article" class="main-container">
        <div v-auto-animate="{duration: 300}" class="flex w-full">
          <div key="main" class="bg-white rounded-lg">
            <div class="article-container">
              <!-- 仅MdPreview组件需要客户端渲染 -->
              <ClientOnly>
                <MdPreview
                  v-if="data.articleLoaded"
                  editor-id="preview-only"
                  :model-value="data.article.articleContent"
                  class="md-preview-custom"
                />
              </ClientOnly>
              
              <div class="article-post">
                <div class="tag-share">
                  <NuxtLink
                    v-for="tag in data.article.tagVOList || data.article.tags"
                    :key="tag.id"
                    :to="`/tag/${tag.id}`"
                    class="article-tag"
                  >
                    <UIcon name="icon:tag" class="tag-icon" />
                    {{ tag.tagName }}
                  </NuxtLink>
                  
                  <!-- 分享按钮 - 客户端专用 -->
                  <ClientOnly>
                    <div class="share-info">
                      <ShareButtons
                        :url="articleUrl"
                        :title="data.article.articleTitle"
                      />  
                    </div>
                  </ClientOnly>
                </div>
                
                <div class="reward">
                  <button class="btn" :class="data.isLiked ? 'like-btn-active' : 'like-btn'" @click="like">
                    <UIcon name="icon:like" class="btn-icon" />
                    点赞
                    <span>{{ data.article.likeCount || 0 }}</span>
                  </button>
                  
                  <ClientOnly v-if="data.isReward">
                    <div class="reward-container">
                      <button class="btn reward-btn" @click="showReward = !showReward">
                        <UIcon name="icon:qr_code" class="btn-icon" />
                        打赏
                      </button>
                      
                      <div v-if="showReward" class="reward-popup">
                        <div class="reward-all">
                          <span>
                            <img
                              class="reward-img"
                              :src="data.weiXinCode"
                              alt="微信打赏"
                            />
                            <div class="reward-desc">微信</div>
                          </span>
                          <span style="margin-left: 0.3rem">
                            <img
                              class="reward-img"
                              :src="data.aliCode"
                              alt="支付宝打赏"
                            />
                            <div class="reward-desc">支付宝</div>
                          </span>
                        </div>
                      </div>
                    </div>
                    <p class="tea">请我喝[茶]~(￣▽￣)~*</p>
                  </ClientOnly>
                </div>
                
                <div class="copyright">
                  <ul>
                    <li class="author">
                      <UIcon name="icon:user" class="copyright-icon" />
                      <strong>本文作者： </strong>{{ data.siteAuthor }}
                    </li>
                    <li class="link">
                      <UIcon name="icon:article_link" class="copyright-icon" />
                      <strong>本文链接：</strong>
                      <a :href="articleUrl">
                        {{ articleUrl }}
                      </a>
                    </li>
                    <li class="license">
                      <UIcon name="icon:copy" class="copyright-icon" />
                      <strong>版权声明： </strong>本站所有文章除特别声明外，均采用
                      <a
                        href="https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh"
                        target="_blank"
                      >CC BY-NC-SA 4.0</a>
                      许可协议。转载请注明文章出处！
                    </li>
                  </ul>
                </div>
                
                <!-- 上下文 -->
                <div class="post-nav">
                  <div v-if="data.article.lastArticle?.id" class="item">
                    <NuxtLink
                      :to="`/article/${data.article.lastArticle.id}`"
                      class="post-cover"
                      :style="articleCover(data.article.lastArticle.articleCover)"
                    >
                      <span class="post-last-next">上一篇</span>
                      <h3 class="post-title">
                        {{ data.article.lastArticle.articleTitle }}
                      </h3>
                    </NuxtLink>
                  </div>
                  <div v-if="data.article.nextArticle?.id" class="item">
                    <NuxtLink
                      :to="`/article/${data.article.nextArticle.id}`"
                      class="post-cover"
                      :style="articleCover(data.article.nextArticle.articleCover)"
                    >
                      <span class="post-last-next">下一篇</span>
                      <h3 class="post-title">
                        {{ data.article.nextArticle.articleTitle }}
                      </h3>
                    </NuxtLink>
                  </div>
                </div>
                
                <!-- 评论区 -->
                <CommentList :comment-type="data.commentType" />
              </div>
            </div>
          </div>
          
          <div v-if="!data.sideFlag" :class="data.sideFlag ? '!w-0' : ''">
            <!-- 仅在侧边栏打开时显示 -->
            <div key="sidebar" class="ml-4 w-[300px] right-container">
              <div key="catalog" class="side-card">
                <UIcon name="icon:category" class="side-icon" />
                目录
                <!-- 仅目录组件需要客户端渲染 -->
                <ClientOnly>
                  <MdCatalog
                    v-if="data.articleLoaded && isMounted"
                    editor-id="preview-only"
                    :scroll-element="scrollElement"
                  />
                </ClientOnly>
              </div>
              
              <!-- 推荐文章 -->
              <div v-if="data.recommendedArticles.length > 0" key="recommended" class="side-card">
                <UIcon name="icon:top" class="side-icon" />
                推荐文章
                <div class="recommend-list">
                  <NuxtLink 
                    v-for="rec in data.recommendedArticles" 
                    :key="rec.id" 
                    :to="`/article/${rec.id}`" 
                    class="recommend-item"
                  >
                    <span class="recommend-title">{{ rec.articleTitle }}</span>
                  </NuxtLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, reactive } from 'vue';
import { MdCatalog, MdPreview } from 'md-editor-v3';
import { getArticle, likeArticle, unlikeArticle } from '~/api/article';
import 'md-editor-v3/lib/preview.css';
import { ClickDebouncer } from '~/utils/debounce';

// 在store初始化之前获取侧边栏状态
const initialSideFlag = ref(false);

// 使用store
const user = useUserStore();
const app = useAppStore();
const blog = useBlogStore();

// 获取路由信息
const route = useRoute();
const config = useRuntimeConfig();
let articleId = Number(route.params.id);
const articleUrl = computed(() => `${config.public.siteUrl || window.location.origin}/article/${articleId}`);

// 客户端状态
const isMounted = ref(false);
const scrollElement = ref(null);
const likeDebouncer = new ClickDebouncer(800);
const showReward = ref(false);

// 文章数据
const data = reactive({
  articleLoaded: false,
  wordNum: 0,
  wordNumFormatted: '0',
  readTime: 0,
  commentType: 1,
  recommendedArticles: [],
  article: {
    id: 0,
    articleCover: "",
    articleTitle: "",
    articleContent: "",
    articleType: 0,
    viewCount: 0,
    likeCount: 0,
    category: {},
    tagVOList: [],
    createTime: "",
    lastArticle: {},
    nextArticle: {},
    updateTime: "",
  },
  formattedCreateTime: '',
  formattedUpdateTime: '',
  isLiked: false,
  sideFlag: initialSideFlag.value, // 使用独立的ref作为初始值
  weiXinCode: '',
  aliCode: '',
  isReward: false,
  siteAuthor: ''
});

// 文章封面背景样式
const articleCover = (cover: string) => {
  return `background-image:url(${cover})`;
};

// 删除HTML标签的工具函数
const deleteHTMLTag = (content: string) => {
  return content
    .replace(/<\/?[^>]*>/g, "")
    .replace(/[|]*\n/, "")
    .replace(/&npsp;/gi, "");
};

// 格式化数字的工具函数
const formatNumber = (value: number) => {
  if (value >= 1000) {
    return (value / 1000).toFixed(1) + "k";
  }
  return value;
};

// 格式化日期工具函数
const formatDateString = (dateString: string | undefined) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}年${month}月${day}日`;
};

// 点赞文章
const like = async () => {
  if (!user.id) {
    app.setLoginFlag(true);
    return;
  }
  
  const id = data.article.id;
  
  // 使用防抖器检查是否可以点赞，防止快速多次点击
  if (!likeDebouncer.canClick(id)) {
    return;
  }
  
  try {
    // 判断当前是否已点赞
    if (user.articleLikeSet.includes(id)) {
      // 已点赞，调用取消点赞API
      const response = await $fetch(`/api/articles/${id}/unlike`, { method: 'POST' });
      if (response.flag) {
        data.article.likeCount = Math.max(0, data.article.likeCount - 1);
        user.articleLike(id);
        data.isLiked = !data.isLiked;
      }
    } else {
      // 未点赞，调用点赞API
      const response = await $fetch(`/api/articles/${id}/like`, { method: 'POST' });
      if (response.flag) {
        data.article.likeCount += 1;
        user.articleLike(id);
        data.isLiked = !data.isLiked;
      }
    }
  } catch (error) {
    console.error("点赞操作失败:", error);
  }
};

// 获取文章数据
const fetchArticleData = async () => {
  try {
    // 1. 获取文章详情
    const articleResponse = await $fetch(`/api/articles/${articleId}`);
    if (!articleResponse.flag) {
      console.error('获取文章详情失败');
      return;
    }
    
    // 将API返回的数据映射到我们的数据结构
    const articleData = articleResponse.data;
    
    // 更新文章基本信息
    data.article = {
      id: articleData.id,
      articleCover: articleData.articleCover,
      articleTitle: articleData.articleTitle,
      articleContent: articleData.articleContent,
      articleType: articleData.articleType,
      viewCount: articleData.viewCount,
      likeCount: articleData.likeCount,
      category: articleData.category,
      tagVOList: articleData.tags, // 注意这里API返回的是tags而不是tagVOList
      createTime: articleData.createTime,
      lastArticle: articleData.lastArticle || {}, // 可能不存在
      nextArticle: articleData.nextArticle || {},
      updateTime: articleData.updateTime,
    };
    
    // 2. 计算字数和阅读时间
    data.wordNum = data.article.articleContent ? deleteHTMLTag(data.article.articleContent).length : 0;
    data.readTime = Math.round(data.wordNum / 400) || 1;
    data.wordNumFormatted = formatNumber(data.wordNum);
    
    // 3. 格式化日期
    data.formattedCreateTime = data.article.createTime ? formatDateString(data.article.createTime) : '';
    data.formattedUpdateTime = data.article.updateTime ? formatDateString(data.article.updateTime) : '';
    
    // 4. 检查用户是否已点赞此文章
    data.isLiked = user.articleLikeSet.includes(data.article.id);
    
    // 5. 从博客配置中获取打赏码等信息
    const siteConfig = blog.blogInfo.siteConfig || {};
    data.siteAuthor = siteConfig.siteAuthor || '@ConderL';
    data.weiXinCode = siteConfig.weiXinCode || '';
    data.aliCode = siteConfig.aliCode || '';
    data.isReward = !!siteConfig.isReward;
    
    // 6. 获取推荐文章
    try {
      const recommendResponse = await $fetch('/api/articles/recommend');
      if (recommendResponse?.flag) {
        data.recommendedArticles = recommendResponse.data || [];
      }
    } catch (error) {
      console.error('获取推荐文章失败:', error);
    }
    
    data.articleLoaded = true;
    
    // 设置文档标题
    if (data.article.articleTitle) {
      document.title = `${data.article.articleTitle} - ${blog.blogInfo.siteConfig?.siteName || '博客'}`;
    }
    
    console.log('文章数据加载完成:', data);
  } catch (error) {
    console.error('获取文章数据失败:', error);
  }
};

// SEO优化
useHead({
  title: computed(() => data.article.articleTitle 
    ? `${data.article.articleTitle} - ${blog.blogInfo.siteConfig?.siteName || '博客'}`
    : '文章详情'),
  meta: [
    {
      name: 'description',
      content: computed(() => data.article.articleContent
        ? deleteHTMLTag(data.article.articleContent).slice(0, 150) + '...'
        : '查看详细文章内容')
    },
    {
      name: 'keywords',
      content: computed(() => {
        const tags = data.article.tagVOList || data.article.tags;
        return tags?.length
          ? tags.map((tag: any) => tag.tagName).join(',')
          : '博客,文章,技术';
      })
    }
  ]
});

// 仅在客户端进行的操作
onMounted(() => {
  scrollElement.value = document.documentElement;
  isMounted.value = true;
  
  // 使用setTimeout确保获取到正确的app.sideFlag
  setTimeout(() => {
    // 更新初始状态
    initialSideFlag.value = app.sideFlag;
    // 同步侧边栏状态
    data.sideFlag = app.sideFlag;
  }, 0);
  
  // 获取文章数据
  fetchArticleData();
  
  // 添加点击外部关闭打赏弹窗的事件监听
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const rewardBtn = document.querySelector('.reward-btn');
    const rewardPopup = document.querySelector('.reward-popup');
    
    if (showReward.value && rewardBtn && rewardPopup && 
        !rewardBtn.contains(target) && !rewardPopup.contains(target)) {
      showReward.value = false;
    }
  });
});

// 监听侧边栏状态变化
watch(() => app.sideFlag, (newValue) => {
  data.sideFlag = newValue;
});

// 监听路由参数变化，重新获取文章数据
watch(() => route.params.id, (newId) => {
  if (newId && Number(newId) !== articleId) {
    // 重新设置文章ID
    articleId = Number(newId);
    // 重置数据
    data.articleLoaded = false;
    // 重新获取文章数据
    fetchArticleData();
  }
});

// 设置路由meta信息
definePageMeta({
  title: '文章'
});
</script>

<style lang="scss" scoped>
@use "~/assets/styles/mixin.scss";

/* 添加主容器样式 */
.main-container {
  display: flex !important;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  position: relative;
  padding-bottom: 1.75rem;
  min-height: 100vh; /* 确保容器有足够的高度让sticky生效 */
}

/* 左侧容器样式 */
.left-container {
  flex: 1 !important;
  width: calc(100% - 300px) !important;
  
  &.w-full {
    width: 100% !important;
  }
}

.article-container {
  border-radius: 0.5rem;
  overflow: visible !important;
  box-shadow: 0 0 1rem var(--box-bg-shadow);
}

.article-post {
  margin: 0 2rem;
  padding-bottom: 1rem;
}

.article-title {
  font-weight: 500;
  font-size: 2.5rem;
  letter-spacing: 0.125rem;
  text-align: center;
  color: var(--header-text-color);
}

.article-meta {
  @include mixin.flex;
  flex-direction: column;
  font-size: 0.875rem;

  .item {
    margin-left: 0.625rem;
  }
}

.tag-share {
  display: flex;
  align-items: center;

  .share-info {
    margin-left: auto;
  }
}

.reward {
  margin: 1.25rem auto;
  padding: 0.625rem 0;
  text-align: center;

  .btn {
    border-radius: 0.3125rem;
    color: var(--grey-0);
    cursor: pointer !important;
    padding: 0 0.9375rem;
    font: inherit;
  }

  .like-btn-active {
    background: var(--primary-color);
  }

  .like-btn {
    background: #999;
  }

  .reward-btn {
    position: relative;
    margin-left: 1rem;
    background: var(--primary-color);
  }

  .tea {
    font-size: 0.8125em;
    color: var(--grey-5);
    margin-top: 0.5rem;
  }
}

.reward-all {
  display: flex;
  align-items: center;
}

.reward-img {
  width: 150px;
  height: 150px;
  display: block;
}

.reward-desc {
  margin: -5px 0;
  color: #858585;
  text-align: center;
}

.reward-popup {
  position: absolute;
  z-index: 100;
  background-color: white;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 10px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin-top: 10px;
  left: 50%;
  transform: translateX(-50%);
}

.reward-container {
  position: relative;
  display: inline-block;
}

.copyright {
  font-size: 0.75em;
  padding: 1rem 2rem;
  margin-bottom: 2.5rem;
  border-radius: 0.625rem;
  background: var(--grey-2);
  color: var(--grey-6);
}

.post-nav {
  display: flex;
  margin-bottom: 2.5rem;
  border-radius: 0.625rem;
  overflow: hidden;

  .item {
    width: 50%;
  }

  .post-cover {
    display: flex;
    flex-direction: column;
    color: var(--header-text-color);
    padding: 1.25rem 2.5rem;
    background-size: cover;
    animation: blur 0.8s ease-in-out forwards;

    &:before {
      content: "";
      position: absolute;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #434343, #000);
      opacity: 0.5;
      transition: all 0.2s ease-in-out 0s;
      z-index: -1;
      top: 0;
      left: 0;
    }
  }

  .post-last-next {
    font-size: 0.8125rem;
  }
}

.post-cover:hover::before {
  opacity: 0.4;
}

@media (max-width: 767px) {
  .article-title {
    font-size: 1.5rem;
  }

  .article-meta .text {
    display: none;
  }

  .article-post {
    margin: 0 0.5rem;
  }

  .post-nav {
    flex-direction: column;
  }

  .post-nav .item {
    width: 100%;
  }

  .reward-img {
    width: 105px;
    height: 105px;
  }
  
  /* 响应式布局调整 */
  .main-container {
    flex-direction: column;
    padding: 0 0.5rem;
  }
  
  .left-container {
    width: 100% !important;
  }
}

/* 右侧侧边栏样式（仅保留卡片样式） */
.right-container {
  .side-card {
    padding: 1rem;
    margin-bottom: 1rem;
    border-radius: 0.5rem;
    background: var(--card-bg-color);
    box-shadow: 0 0 0.5rem var(--box-bg-shadow);
    
    .side-icon {
      margin-right: 0.5rem;
      width: 1rem;
      height: 1rem;
      vertical-align: -0.15em;
    }
    
    .recommend-list {
      margin-top: 0.5rem;
      
      .recommend-item {
        display: block;
        margin: 0.5rem 0;
        padding: 0.25rem 0;
        color: var(--text-color);
        transition: all 0.2s ease;
        border-bottom: 1px dashed var(--grey-3);
        
        &:hover {
          color: var(--primary-color);
        }
        
        .recommend-title {
          display: block;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
    }
  }
}

// 调整UPopover样式
:deep(.u-popover) {
  --popover-background-color: var(--color-white);
  --popover-border-color: var(--color-gray-200);
}
</style>

<style lang="scss">
/* 修复Markdown列表样式问题 */
.md-preview-custom {
  .md-editor-preview {
    ul {
      list-style-type: disc !important;
      padding-left: 2em !important;

      li {
        list-style-type: disc !important;
        display: list-item !important;
        margin: 0.5em 0 !important;
      }

      ul li {
        list-style-type: circle !important;
      }

      ul ul li {
        list-style-type: square !important;
      }
    }

    ol {
      list-style-type: decimal !important;
      padding-left: 2em !important;

      li {
        list-style-type: decimal !important;
        display: list-item !important;
        margin: 0.5em 0 !important;
      }

      ol li {
        list-style-type: lower-alpha !important;
      }

      ol ol li {
        list-style-type: lower-roman !important;
      }
    }
  }
}

/* 统一处理SVG图标的垂直对齐 */
.btn-icon {
  vertical-align: -0.15em;
  overflow: hidden;
  width: 0.9rem;
  height: 0.9rem;
}
</style>
