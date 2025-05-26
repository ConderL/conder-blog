<template>
	<div class="archives-page">
		<div class="page-header">
			<h1 class="page-title">归档</h1>
			<img class="page-cover" :src="blog.blogInfo?.siteConfig?.archiveWallpaper || ''" alt="">
			<!-- 波浪 -->
			<Waves></Waves>
		</div>
		<div class="bg">
			<div class="page-container">
				<div class="archive-title">文章总览 - {{ count }}</div>
				<div class="archive-list">
					<div v-for="archive in archivesList" :key="archive.id" class="archive-item">
						<NuxtLink class="article-cover" :to="`/article/${archive.id}`">
							<img :src="archive.articleCover" class="cover">
						</NuxtLink>
						<div class="article-info">
							<div class="article-time">
								<UIcon name="icon:calendar" class="mr-1.5" />
								<time>{{ formatDate(archive.createTime) }}</time>
							</div>
							<NuxtLink class="article-title" :to="`/article/${archive.id}`">
								{{ archive.articleTitle }}
							</NuxtLink>
						</div>
					</div>
				</div>
				<Pagination v-if="count > 5" v-model:current="queryParams.current" :per-page="queryParams.size" :total="count">
				</Pagination>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { formatDate } from '~/utils/date';
import { useBlogStore } from "~/stores/blog";

// 定义所有需要的接口，避免导入错误
interface Archives {
	id: number;
	articleTitle: string;
	articleCover: string;
	createTime: string;
}

// 定义页面元数据，使导航栏能正确识别当前页面
definePageMeta({
	title: '归档'
});

const blog = useBlogStore();

const queryParams = reactive({
	current: 1,
	size: 5,
});

const { archives } = useApi();
const { recordList: archivesList, count } = await archives.getList(queryParams);


// SEO优化
useHead({
	title: '文章归档 - 博客网站',
	meta: [
		{ name: 'description', content: '博客文章归档，按时间顺序展示所有文章' },
		{ name: 'keywords', content: '归档,博客,文章,时间线' }
	]
});
</script>

<style lang="scss" scoped>
.archives-page {
	width: 100%;
}

.archive-title {
	position: relative;
	margin-left: 10px;
	padding-bottom: 20px;
	padding-left: 20px;
	font-size: 1.5rem;

	&::before {
		position: absolute;
		top: 16px;
		left: -8px;
		z-index: 1;
		width: 18px;
		height: 18px;
		border: 5px solid var(--color-blue);
		border-radius: 10px;
		content: '';
		line-height: 10px;
	}

	&::after {
		position: absolute;
		bottom: 0;
		left: 0;
		z-index: 0;
		width: 2px;
		height: 1.5em;
		background: #aadafa;
		content: '';
	}
}

.archive-title:hover:before {
	border-color: var(--color-orange);
}

.archive-list {
	margin-left: 10px;
	padding-left: 20px;
	border-left: 2px solid #aadafa;
}

.archive-item {
	position: relative;
	display: flex;
	align-items: center;
	margin: 0 0 20px 10px;

}

.archive-item:hover:before {
	border-color: var(--color-orange);
}

.archive-item::before {
	position: absolute;
	left: -36px;
	width: 10px;
	height: 10px;
	border: 3px solid var(--color-blue);
	border-radius: 6px;
	background: var(--grey-0);
	content: '';
}

.article-cover {
	width: 120px;
	height: 120px;
	overflow: hidden;
	border-radius: 12px;

	.cover {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: filter 375ms ease-in 0.2s, transform 0.6s;
	}
}

.cover:hover {
	transform: scale(1.1);
}

.article-info {
	display: flex;
	flex-direction: column;
	flex: 1;
	margin: 0 1rem;

	.article-time {
		font-size: 14px;
	}

	.article-title {
		font-size: 0.9rem;
		margin: 2px 0;
	}
}

.article-title:hover {
	color: var(--primary-color);
	transform: translateX(10px);

}
</style> 