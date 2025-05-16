<template>
	<div class="article-item" v-for="article of articleList" :key="article.id">
		<!-- 文章缩略图 -->
		<div class="article-cover">
			<NuxtLink :to="`/article/${article.id}`">
				<NuxtImg class="cover" :src="article.articleCover" :alt="article.articleTitle" />
			</NuxtLink>
		</div>
		<!-- 文章信息 -->
		<div class="article-info">
			<div class="article-meta">
				<!-- 置顶 -->
				<span class="top" v-if="article.isTop == 1">
					<svg-icon icon-class="top" size="0.85rem" style="margin-right: 0.15rem"></svg-icon>置顶</span>
				<!-- 发表时间 -->
				<span class="meta-item ml-3.75">
					<svg-icon icon-class="calendar" size="0.9rem" style="margin-right: 0.15rem"></svg-icon>{{
					formatDate(article.createTime) }}
				</span>
				<!-- 文章标签 -->
				<NuxtLink class="meta-item ml-3.75" :to="`/tag/${tag.id}`" v-for="tag in article.tagVOList" :key="tag.id">
					<svg-icon icon-class="tag" size="0.9rem" style="margin-right: 0.15rem"></svg-icon>{{ tag.tagName }}
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
				<svg-icon icon-class="qizhi" size="0.85rem" style="margin-right: 0.15rem"></svg-icon>
				<NuxtLink :to="`/category/${article.category.id}`">{{
					article.category.categoryName
					}}</NuxtLink>
			</div>
			<!-- 阅读按钮 -->
			<NuxtLink class="article-btn" :to="`/article/${article.id}`">more...</NuxtLink>
		</div>
	</div>
	<!-- Pagination组件，使用v-model而不是v-model:current-->
	<ClientOnly>
		<Pagination v-if="count > 5" v-model="queryParams.current" :total="Math.ceil(count / 5)"></Pagination>
	</ClientOnly>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch, toRefs } from 'vue';

interface Category {
  id: string;
  categoryName: string;
}

interface Tag {
  id: string;
  tagName: string;
}

interface Article {
  id: string;
  articleTitle: string;
  articleDesc: string;
  articleCover: string;
  createTime: string;
  isTop: number;
  category: Category;
  tagVOList: Tag[];
}

interface PageQuery {
  current: number;
  size: number;
}

// 格式化日期
const formatDate = (date: string) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString();
};

const data = reactive({
  count: 0,
  queryParams: {
    current: 1,
    size: 5,
  } as PageQuery,
  articleList: [] as Article[],
});

const { count, queryParams, articleList } = toRefs(data);

// 监听分页变化
watch(
  () => queryParams.value.current,
  () => {
    fetchArticles();
  }
);

// 获取文章列表
const fetchArticles = async () => {
  try {
    // 模拟API调用，实际项目中应该使用真实API
    // 使用mock数据代替API调用
    articleList.value = [
      {
        id: '1',
        articleTitle: '使用Nuxt实现服务端渲染博客系统',
        articleDesc: 'Nuxt.js是一个基于Vue.js的服务端渲染框架，它可以帮助开发者轻松创建服务端渲染的Vue.js应用。',
        articleCover: 'https://picsum.photos/id/1/800/600',
        createTime: '2023-10-20T10:30:00',
        isTop: 1,
        category: {
          id: '1',
          categoryName: '前端开发'
        },
        tagVOList: [
          {
            id: '1',
            tagName: 'Vue'
          },
          {
            id: '2',
            tagName: 'Nuxt'
          }
        ]
      },
      {
        id: '2',
        articleTitle: 'SEO优化技巧与实践',
        articleDesc: '搜索引擎优化(SEO)对于提高网站的可见性和流量至关重要。本文将分享一些SEO优化的技巧与实践经验。',
        articleCover: 'https://picsum.photos/id/2/800/600',
        createTime: '2023-10-15T14:20:00',
        isTop: 0,
        category: {
          id: '2',
          categoryName: 'SEO'
        },
        tagVOList: [
          {
            id: '3',
            tagName: '优化'
          },
          {
            id: '4',
            tagName: '搜索引擎'
          }
        ]
      }
    ];
    count.value = 10; // 模拟总数
  } catch (error) {
    console.error('获取文章列表失败:', error);
  }
};

onMounted(() => {
  // 使用模拟数据作为示例，实际项目中应该从API获取
  fetchArticles();
});

// 默认导出
defineExpose({
  name: 'ArticleItem'
});
</script>

<style lang="scss" scoped>
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
			background-image: linear-gradient(to right, var(--color-orange) 0, var(--color-pink) 100%);

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

	.ml:not(:first-child) {
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
	background-image: linear-gradient(to right, var(--color-pink) 0, var(--color-orange) 100%);

	&:hover {
		transform: translateZ(2rem);
	}
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
</style> 