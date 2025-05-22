<template>
  <div class="article-page">
    <!-- 文章头部信息 -->
    <div v-if="data.article" class="page-header">
      <div class="page-title">
        <h1 class="article-title">{{ data.article.articleTitle }}</h1>
        <div class="article-meta">
          <div class="first-meta">
            <span>
              <CalendarIcon class="meta-icon" />
              <span class="text">发表于 </span>{{ data.formattedCreateTime }}
            </span>
            <span v-if="data.formattedUpdateTime" class="item">
              <UpdateIcon class="meta-icon" />
              <span class="text">更新于 </span>{{ data.formattedUpdateTime }}
            </span>
            <span class="item">
              <EyeIcon class="meta-icon" />
              <span class="text">阅读量 </span>{{ data.article.viewCount || 0 }}
            </span>
          </div>
          <div class="second-meta">
            <span>
              <ArticleIcon class="meta-icon" />
              <span class="text">字数统计 </span>{{ data.wordNumFormatted }} 字
            </span>
            <span class="item">
              <ClockIcon class="meta-icon" />
              <span class="text">阅读时长 </span>{{ data.readTime || 0 }} 分钟
            </span>
            <span v-if="data.article.category?.categoryName" class="item">
              <CategoryIcon class="meta-icon" />
              {{ data.article.category?.categoryName }}
            </span>
          </div>
        </div>
      </div>
      <img v-if="data.article.articleCover" class="page-cover" :src="data.article.articleCover" alt="" />
    </div>
    
    <div class="bg">
      <div v-if="data.article" class="main-container">
        <div class="left-container" :class="{ 'w-full': data.sideFlag }">
          <div class="article-container">
            <!-- 使用Nuxt的ClientOnly组件包裹需要客户端渲染的内容 -->
            <ClientOnly>
              <MdPreview
                editorId="preview-only"
                :modelValue="data.article.articleContent"
                class="md-preview-custom"
              />
            </ClientOnly>
            
            <div class="article-post">
              <div class="tag-share">
                <NuxtLink
                  v-for="tag in data.article.tagVOList"
                  :key="tag.id"
                  :to="`/tag/${tag.id}`"
                  class="article-tag"
                >
                  <TagIcon class="tag-icon" />
                  {{ tag.tagName }}
                </NuxtLink>
                
                <!-- 分享按钮 - 客户端专用 -->
                <ClientOnly>
                  <div class="share-info">
                    <ShareButtons
                      :url="data.articleUrl"
                      :title="data.article.articleTitle"
                    />
                  </div>
                </ClientOnly>
              </div>
              
              <div class="reward">
                <button class="btn" :class="data.isLiked ? 'like-btn-active' : 'like-btn'" @click="like">
                  <HeartIcon class="btn-icon" />
                  点赞
                  <span>{{ data.article.likeCount || 0 }}</span>
                </button>
                
                <template v-if="data.isReward">
                  <UPopover>
                    <template #trigger>
                      <button class="btn reward-btn">
                        <QrCodeIcon class="btn-icon" />
                        打赏
                      </button>
                    </template>
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
                  </UPopover>
                  <p class="tea">请我喝[茶]~(￣▽￣)~*</p>
                </template>
              </div>
              
              <div class="copyright">
                <ul>
                  <li class="author">
                    <UserIcon class="copyright-icon" />
                    <strong>本文作者： </strong>{{ data.siteAuthor }}
                  </li>
                  <li class="link">
                    <ArticleLinkIcon class="copyright-icon" />
                    <strong>本文链接：</strong>
                    <a :href="data.articleUrl">
                      {{ data.articleUrl }}
                    </a>
                  </li>
                  <li class="license">
                    <CopyIcon class="copyright-icon" />
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
              <CommentList :comment-type="1" />
            </div>
          </div>
        </div>
        
        <div class="right-container" :class="{ 'hidden': data.sideFlag }">
          <div class="side-card">
            <CategoryIcon class="side-icon" />
            目录
            <ClientOnly>
              <MdCatalog
                v-if="isMounted"
                editorId="preview-only"
                :scrollElement="scrollElement"
              />
            </ClientOnly>
          </div>
          
          <!-- 推荐文章 -->
          <div v-if="data.recommendedArticles.length > 0" class="side-card">
            <TopIcon class="side-icon" />
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
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { getArticle, likeArticle, unlikeArticle } from '~/api/article';
import { MdCatalog, MdPreview } from 'md-editor-v3';
import 'md-editor-v3/lib/preview.css';
import { ClickDebouncer } from '~/utils/debounce';
import CalendarIcon from '~/assets/icons/calendar.svg';
import UpdateIcon from '~/assets/icons/update.svg';
import EyeIcon from '~/assets/icons/eye.svg';
import ArticleIcon from '~/assets/icons/article.svg';
import ClockIcon from '~/assets/icons/clock.svg';
import CategoryIcon from '~/assets/icons/category.svg';
import TagIcon from '~/assets/icons/tag.svg';
import HeartIcon from '~/assets/icons/heart.svg';
import QrCodeIcon from '~/assets/icons/qr_code.svg';
import UserIcon from '~/assets/icons/user.svg';
import ArticleLinkIcon from '~/assets/icons/article_link.svg';
import CopyIcon from '~/assets/icons/copy.svg';
import TopIcon from '~/assets/icons/top.svg';

// 使用store
const user = useUserStore();
const app = useAppStore();
const blog = useBlogStore();

// 获取路由信息
const route = useRoute();
const config = useRuntimeConfig();
const articleId = Number(route.params.id);

// 客户端状态
const isMounted = ref(false);
const scrollElement = ref(null);
const likeDebouncer = new ClickDebouncer(800);

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
  
  let id = data.value.article.id;
  
  // 使用防抖器检查是否可以点赞，防止快速多次点击
  if (!likeDebouncer.canClick(id)) {
    return;
  }
  
  try {
    // 判断当前是否已点赞
    if (user.articleLikeSet.indexOf(id) != -1) {
      // 已点赞，调用取消点赞API
      const { data: response } = await unlikeArticle(id);
      if (response.flag) {
        data.value.article.likeCount = Math.max(0, data.value.article.likeCount - 1);
        user.articleLike(id);
        data.value.isLiked = !data.value.isLiked;
      }
    } else {
      // 未点赞，调用点赞API
      const { data: response } = await likeArticle(id);
      if (response.flag) {
        data.value.article.likeCount += 1;
        user.articleLike(id);
        data.value.isLiked = !data.value.isLiked;
      }
    }
  } catch (error) {
    console.error("点赞操作失败:", error);
  }
};

// 预处理和组合数据 - 服务端数据获取
const { data } = await useAsyncData(`article-${articleId}`, async () => {
  // 1. 获取文章详情
  const articleResponse = await getArticle(articleId);
  const article = articleResponse.data?.flag ? articleResponse.data.data : null;
  
  if (!article) {
    console.error('获取文章详情失败');
    return null;
  }
  
  // 2. 计算字数和阅读时间
  const wordNum = article.articleContent ? deleteHTMLTag(article.articleContent).length : 0;
  const readTime = Math.round(wordNum / 400) || 1;
  
  // 3. 获取推荐文章
  let recommendedArticles = [];
  try {
    const recommendResponse = await $fetch('/api/articles/recommend');
    if (recommendResponse?.flag) {
      recommendedArticles = recommendResponse.data || [];
    }
  } catch (error) {
    console.error('获取推荐文章失败:', error);
  }
  
  // 4. 生成完整的文章URL
  const articleUrl = `${config.public.siteUrl || 'http://localhost:3334'}/article/${articleId}`;
  
  // 5. 从博客配置中获取打赏码等信息
  const siteConfig = blog.blogInfo.siteConfig || {};
  const siteAuthor = siteConfig.siteAuthor || '@ConderL';
  const weiXinCode = siteConfig.weiXinCode || '';
  const aliCode = siteConfig.aliCode || '';
  const isReward = !!siteConfig.isReward;
  
  // 6. 格式化日期
  const formattedCreateTime = article.createTime ? formatDateString(article.createTime) : '';
  const formattedUpdateTime = article.updateTime ? formatDateString(article.updateTime) : '';
  
  // 7. 检查用户是否已点赞此文章
  const isLiked = user.articleLikeSet.indexOf(article.id) !== -1;
  
  // 8. 格式化字数
  const wordNumFormatted = formatNumber(wordNum);
  
  // 9. 获取侧边栏状态
  const sideFlag = app.sideFlag;
  
  // 返回所有预处理好的数据
  return {
    article,
    wordNum,
    wordNumFormatted,
    readTime,
    recommendedArticles,
    articleUrl,
    siteAuthor,
    weiXinCode,
    aliCode,
    isReward,
    formattedCreateTime,
    formattedUpdateTime,
    isLiked,
    sideFlag
  };
});

// SEO优化
useHead({
  title: computed(() => data.value?.article 
    ? `${data.value.article.articleTitle} - ${blog.blogInfo.siteConfig?.siteName || '博客'}`
    : '文章详情'),
  meta: [
    {
      name: 'description',
      content: computed(() => data.value?.article?.articleContent
        ? deleteHTMLTag(data.value.article.articleContent).slice(0, 150) + '...'
        : '查看详细文章内容')
    },
    {
      name: 'keywords',
      content: computed(() => data.value?.article?.tagVOList
        ? data.value.article.tagVOList.map((tag: any) => tag.tagName).join(',')
        : '博客,文章,技术')
    }
  ]
});

// 仅在客户端进行的操作
onMounted(() => {
  scrollElement.value = document.documentElement;
  isMounted.value = true;
  
  // 设置文档标题（如果需要）
  if (data.value?.article?.articleTitle) {
    document.title = `${data.value.article.articleTitle} - ${blog.blogInfo.siteConfig?.siteName || '博客'}`;
  }
});
</script>

<style lang="scss" scoped>
@import "~/assets/styles/mixin.scss";

.article-container {
  border-radius: 0.5rem;
  overflow: hidden;
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
  @include flex;
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
</style>
