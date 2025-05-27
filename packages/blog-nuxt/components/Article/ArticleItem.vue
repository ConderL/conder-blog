<template>
  <div v-if="articleList.length > 0" ref="listRef" class="article-container">
    <div
      v-for="article of articleList"
      :key="article.id"
      v-animate="['slideUpBigIn']"
      class="article-item"
    >
      <!-- 文章缩略图 -->
      <div class="article-cover">
        <NuxtLink :to="`/article/${article.id}`">
          <img class="cover" :src="article.articleCover" />
        </NuxtLink>
      </div>
      <!-- 文章信息 -->
      <div class="article-info">
        <div class="article-meta">
          <!-- 置顶 -->
          <span v-if="article.isTop == 1" class="top">
            <UIcon name="icon:top" class="icon-small" />置顶</span
          >
          <!-- 发表时间 -->
          <span class="meta-item ml-3.75">
            <UIcon name="icon:calendar" class="icon-medium" />
            {{ formatArticleDate(article.createTime) }}
          </span>
          <!-- 文章标签 -->
          <NuxtLink
            v-for="tag in article.tagVOList"
            :key="tag.id"
            class="meta-item ml-3.75"
            :to="`/tag/${tag.id}`"
          >
            <UIcon name="icon:tag" class="icon-medium" />{{ tag.tagName }}
          </NuxtLink>
        </div>
        <!-- 文章标题 -->
        <h3 class="article-title">
          <NuxtLink :to="`/article/${article.id}`">
            {{ article.articleTitle }}
          </NuxtLink>
        </h3>
        <!-- 文章内容 -->
        <div class="article-content">{{ article.articleDesc }}</div>
        <!-- 文章分类 -->
        <div class="article-category">
          <UIcon name="icon:qizhi" class="icon-medium" />
          <NuxtLink :to="`/category/${article.category.id}`">{{
            article.category.categoryName
          }}</NuxtLink>
        </div>
        <!-- 阅读按钮 -->
        <NuxtLink class="article-btn" :to="`/article/${article.id}`"
          >more...</NuxtLink
        >
      </div>
    </div>
    <!-- 分页器 -->
    <div v-if="count > 10" class="pagination-container">
      <Pagination 
        :current="queryParams.current"
        :total="count"
        :per-page="queryParams.size"
        @update:current="changePage"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from "vue";
import type { PageQuery } from "../../model";
import { formatDate } from "../../utils/date";
import { useAutoAnimate } from "~/composables/useAutoAnimate";

// 默认导出
defineExpose({
  name: "ArticleItem",
});

const { article: articleApi } = useApi();
const queryParams = reactive<PageQuery>({
  current: 1,
  size: 10,
});

const { data } = await articleApi.getList(queryParams);

const articleList = computed(() => unref(data).recordList);
const count = computed(() => unref(data).count);

// 使用AutoAnimate为列表添加动画
const { parent: listRef } = useAutoAnimate({
  duration: 300,
  easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
});

// 安全的日期格式化
const formatArticleDate = (date: string | Date | null | undefined) => {
  if (!date) return "";
  // 尝试格式化，如果失败则返回默认值
  try {
    return formatDate(date);
  } catch (error) {
    console.warn("文章日期格式化失败:", date);
    return "未知日期";
  }
};

const changePage = (page: number) => {
  queryParams.current = page;
};

</script>

<style lang="scss" scoped>
.article-container {
  width: 100%;
}

.article-item {
  display: flex;
  height: 14rem;
  margin: 1.25rem 0.5rem 0;
  border-radius: 0.5rem;
  box-shadow: 0 0.625rem 1.875rem -0.9375rem var(--box-bg-shadow);
  transition: all 0.2s ease-in-out 0s;

  &:hover {
    box-shadow: 0 0 1.5rem var(--box-bg-shadow);

    .cover {
      transform: scale(1.05) rotate(1deg);
    }
  }

  &:nth-child(even) {
    flex-direction: row-reverse;

    .article-cover {
      margin-right: auto;
      margin-left: 1.5rem;
      -webkit-clip-path: polygon(0 0, 100% 0, 100% 100%, 8% 100%);
      clip-path: polygon(0 0, 100% 0, 100% 100%, 8% 100%);
      border-radius: 0 0.625rem 0.625rem 0;
    }

    .article-info {
      padding: 1rem 0 3rem 1.5rem;

      .article-meta {
        justify-content: flex-start;
      }
    }

    .article-btn {
      left: 0;
      right: auto;
      border-radius: 0 1rem;
      background-image: linear-gradient(
        to right,
        var(--color-orange) 0,
        var(--color-pink) 100%
      );

      &:hover {
        transform: translateZ(2rem);
      }
    }

    .article-category {
      right: 0.5rem;
      justify-content: flex-start;
    }
  }
}

.article-cover {
  width: 50%;
  margin-right: 1.5rem;
  clip-path: polygon(0 0, 92% 0, 100% 100%, 0 100%);
  border-radius: 0.625rem 0 0 0.625rem;
  overflow: hidden;

  .cover {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: all 0.2s ease-in-out 0s;
  }
}

.article-info {
  position: relative;
  width: 50%;
  padding: 1rem 1.5rem 3rem 0;
  perspective: 62.5rem;

  .article-meta {
    display: flex;
    justify-content: flex-end;
    font-size: 0.8125rem;
    color: var(--grey-5);
  }

  .top {
    color: var(--color-orange);
  }

  .meta-item {
    display: flex;
    align-items: center;
  }

  .ml-3\.75 {
    margin-left: 0.625rem;
  }

  .article-title {
    text-overflow: ellipsis;
    white-space: nowrap;
    margin: 0.625rem 0;
    color: var(--primary-color);
    overflow: hidden;
  }

  .article-content {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
    max-height: 5rem;
    font-size: 0.875em;
    overflow: hidden;
  }
}

.article-category {
  position: absolute;
  display: flex;
  align-items: center;
  bottom: 0.5rem;
  font-size: 0.8125em;
  color: var(--grey-5);
}

.article-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  padding: 0.3rem 1rem;
  border-radius: 1rem 0;
  color: var(--grey-0);
  background-image: linear-gradient(
    to right,
    var(--color-pink) 0,
    var(--color-orange) 100%
  );

  &:hover {
    transform: translateZ(2rem);
  }
}

.tag {
  background-color: var(--color-blue);
  color: var(--grey-0);
  padding: 0.125rem 0.5rem;
  font-size: 0.75rem;
  border-radius: 0.3125rem;
}

.pagination-container {
  margin-top: 1rem;
  text-align: center;
  width: 100%;
}

@media (max-width: 767px) {
  .article-item {
    flex-direction: column;
    height: fit-content;

    .article-cover {
      width: 100%;
      height: 14rem;
      margin: auto;
      clip-path: polygon(0 0, 100% 0, 100% 92%, 0 100%);
      border-radius: 0.625rem 0.625rem 0 0;
    }

    .article-info {
      width: 100%;
      height: 14rem;
      padding: 0 1rem 3rem;
    }

    &:nth-child(even) {
      flex-direction: column;

      .article-cover {
        width: 100%;
        margin: auto;
        clip-path: polygon(0 0, 100% 0, 100% 100%, 0 92%);
        border-radius: 0.625rem 0.625rem 0 0;
      }

      .article-info {
        padding: 0 1rem 3rem;
      }
    }
  }
}

@media (max-width: 650px) {
  .article-item {
    flex-direction: column;
    height: fit-content;

    .article-cover {
      width: 100%;
      height: 14rem;
      margin: auto;
      clip-path: polygon(0 0, 100% 0, 100% 92%, 0 100%);
      border-radius: 0.625rem 0.625rem 0 0;
    }

    .article-info {
      width: 100%;
      height: 14rem;
      padding: 0 1rem 3rem;
    }

    &:nth-child(even) {
      flex-direction: column;

      .article-cover {
        width: 100%;
        margin: auto;
        clip-path: polygon(0 0, 100% 0, 100% 100%, 0 92%);
        border-radius: 0.625rem 0.625rem 0 0;
      }

      .article-info {
        padding: 0 1rem 3rem;
      }
    }
  }
}

.icon-small {
  width: 0.85rem;
  height: 0.85rem;
  margin-right: 0.15rem;
}

.icon-medium {
  width: 0.9rem;
  height: 0.9rem;
  margin-right: 0.15rem;
}
</style> 