<template>
	<div v-if="articleList.length > 0" class="swiper-container">
		<div class="slide-content" 
			 :style="articleCover(articleList[currentIndex].articleCover)">
			<NuxtLink
				:to="`/article/${articleList[currentIndex].id}`"
				class="slide-title"
				>{{ articleList[currentIndex].articleTitle }}</NuxtLink
			>
			<span class="slide-time"
				>发布时间：{{ formatDate(articleList[currentIndex].createTime) }}</span
			>
		</div>
		<div class="pagination">
			<span 
				v-for="(_, i) in articleList" 
				:key="i"
				:class="['dot', i === currentIndex ? 'active' : '']"
				@click="changeSlide(i)"></span>
		</div>
		<div class="navigation">
			<span class="prev" @click="prevSlide">❮</span>
			<span class="next" @click="nextSlide">❯</span>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { getArticleRecommend } from '../../../api/article';
import { formatDate } from '../../../utils/date';
import type { ArticleRecommend } from '../../../api/article/types';

const articleList = ref<ArticleRecommend[]>([]);
const currentIndex = ref(0);
let intervalId: any = null;

const articleCover = computed(
	() => (cover: string) => `background:url(${cover})`
);

// 自动轮播
const startCarousel = () => {
	intervalId = setInterval(() => {
		nextSlide();
	}, 5000);
};

// 切换到下一张
const nextSlide = () => {
	if (articleList.value.length === 0) return;
	currentIndex.value = (currentIndex.value + 1) % articleList.value.length;
};

// 切换到上一张
const prevSlide = () => {
	if (articleList.value.length === 0) return;
	currentIndex.value = currentIndex.value === 0 
		? articleList.value.length - 1 
		: currentIndex.value - 1;
};

// 切换到指定幻灯片
const changeSlide = (index: number) => {
	currentIndex.value = index;
};

// 获取推荐文章数据
const fetchRecommendedArticles = async () => {
	try {
		const { data } = await getArticleRecommend();
		if (data && data.code === 200 && Array.isArray(data.data)) {
			articleList.value = data.data;
			// 获取数据后启动轮播
			if (articleList.value.length > 0) {
				startCarousel();
			}
		}
	} catch (error) {
		console.error('获取推荐文章失败:', error);
	}
};

onMounted(() => {
	fetchRecommendedArticles();
});

onUnmounted(() => {
	if (intervalId !== null) {
		clearInterval(intervalId);
	}
});

defineExpose({
	startCarousel,
	nextSlide,
	prevSlide,
	changeSlide
});
</script>

<style lang="scss" scoped>
.swiper-container {
	position: relative;
	height: 13.875rem;
	margin: 1rem 0.5rem;
	border-radius: 0.75rem;
	overflow: hidden;

	&::before {
		content: "推荐";
		position: absolute;
		z-index: 2;
		color: var(--grey-0);
		background: linear-gradient(
			90deg,
			var(--color-yellow),
			var(--color-orange)
		);
		top: 0;
		letter-spacing: 0.1875rem;
		left: 0.625rem;
		font-size: 0.9375rem;
		width: 4.0625rem;
		display: flex;
		justify-content: center;
		border-radius: 0 0 0.75rem 0.75rem;
	}
}

.slide-content {
	display: flex;
	justify-content: center;
	align-items: center;
	flex-direction: column;
	width: 100%;
	height: 100%;
	padding: 0 3.125rem 1.25rem;
	background-position: center !important;
	background-size: cover !important;
	transition: all 0.5s ease;

	.slide-title {
		font-size: 2rem;
	}

	&::after {
		content: "";
		position: absolute;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.08);
		left: 0;
		top: 0;
	}
}

.slide-title,
.slide-time {
	text-align: center;
	line-height: 1.5;
	margin: 0.125rem 0;
	color: #fff;
	z-index: 1;
}

.pagination {
	position: absolute;
	bottom: 10px;
	left: 50%;
	transform: translateX(-50%);
	z-index: 2;
	display: flex;
	gap: 5px;
	
	.dot {
		display: inline-block;
		width: 0.6875rem;
		height: 0.6875rem;
		margin: 0 0.25rem;
		border-radius: 6.1875rem;
		background: var(--grey-0);
		opacity: 0.8;
		transition: all 0.3s;
		cursor: pointer;
		
		&.active {
			opacity: 1;
			background-color: var(--color-blue);
			width: 1.875rem;
		}
	}
}

.navigation {
	.prev, .next {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		width: 2.75rem;
		height: 2.75rem;
		display: flex;
		justify-content: center;
		align-items: center;
		color: white;
		font-size: 1.5rem;
		cursor: pointer;
		transition: all 0.3s;
		z-index: 2;
		
		&:hover {
			background: rgba(255, 255, 255, 0.3);
			border-radius: 100%;
		}
	}
	
	.prev {
		left: 10px;
	}
	
	.next {
		right: 10px;
	}
}
</style> 