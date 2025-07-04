<template>
	<ClientOnly>
		<swiper
			v-if="articleList.length > 0"
			class="swiper-container"
			:modules="modules"
			:loop="true"
			:slides-per-view="1"
			:navigation="true"
			:mousewheel="true"
			:autoplay="{ delay: 5000, disableOnInteraction: false }"
			:pagination="{ clickable: true }"
		>
			<swiper-slide v-for="article in articleList" :key="article.id">
				<div
					class="slide-content"
					:style="articleCover(article.articleCover)"
				>
					<NuxtLink
						:to="`/article/${article.id}`"
						class="slide-title"
						>{{ article.articleTitle }}</NuxtLink
					>
					<span class="slide-time"
						>发布时间：{{ formatDate(article.createTime) }}</span
					>
				</div>
			</swiper-slide>
		</swiper>
		
		<template #fallback>
			<div class="swiper-loading">加载中...</div>
		</template>
	</ClientOnly>
</template>

<script setup lang="ts">
import { Autoplay, Mousewheel, Navigation, Pagination } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { formatDate } from '~/utils/date';

// 导入Swiper样式
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/autoplay';

// 默认导出
defineExpose({
	name: 'Recommend'
});

// 自定义模块
const modules = [Pagination, Navigation, Mousewheel, Autoplay];

const { article } = useApi();

const { data: articleList } = await article.getArticleRecommend();

const articleCover = computed(
	() => (cover: string) => `background:url(${cover})`
);
</script>

<style lang="scss" scoped>
.swiper-container {
	height: 13.875rem;
	margin: 1rem 0.5rem;
	border-radius: 0.75rem;

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

.swiper-loading {
	height: 13.875rem;
	margin: 1rem 0.5rem;
	border-radius: 0.75rem;
	display: flex;
	justify-content: center;
	align-items: center;
	background-color: var(--grey-2);
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

:deep(.swiper-pagination) .swiper-pagination-bullet {
	display: inline-block;
	width: 0.6875rem;
	height: 0.6875rem;
	margin: 0 0.25rem;
	border-radius: 6.1875rem;
	background: var(--grey-0);
	opacity: 0.8;
	transition: all 0.3s;
}

:deep(.swiper-pagination)
	.swiper-pagination-bullet.swiper-pagination-bullet-active {
	opacity: 1;
	background-color: var(--color-blue);
	width: 1.875rem;
}

:deep(.swiper-button-next),
:deep(.swiper-button-prev) {
	width: 2.75rem;
	transition: all 0.3s;
}

:deep(.swiper-button-next):after,
:deep(.swiper-button-prev):after {
	font-size: 1.5rem !important;
}

:deep(.swiper-button-next):hover,
:deep(.swiper-button-prev):hover {
	background: rgba(255, 255, 255, 0.3);
	border-radius: 100%;
}
</style> 