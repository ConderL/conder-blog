<template>
	<ClientOnly>
	<NuxtLink v-if="talkList.length > 0" to="/talk" class="talk-swiper">
		<UIcon name="icon:laba" class="laba-icon" />
			<swiper
				class="swiper-container"
				:direction="'vertical'"
				:speed="2000"
				:modules="modules"
				:loop="true"
				:slides-per-view="1"
				:autoplay="{ delay: 3000, disableOnInteraction: false }"
			>
				<swiper-slide v-for="(t, index) in talkList" :key="index">
					<div class="slide-content" v-html="t"></div>
				</swiper-slide>
			</swiper>
		<UIcon name="icon:right-arrow" class="arrow" />
	</NuxtLink>
		
		<template #fallback>
			<div class="talk-swiper-loading">加载中...</div>
		</template>
	</ClientOnly>
</template>

<script setup lang="ts">
import { Autoplay } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/vue';

// 导入Swiper样式
import 'swiper/css';
import 'swiper/css/autoplay';

// 默认导出
defineExpose({
  name: 'TalkSwiper'
});

// 自动播放
const modules = [Autoplay];

const { talk } = useApi();

// 使用useFetch获取说说数据
const talkList = await talk.getTalkList();
</script>

<style lang="scss" scoped>
.talk-swiper {
	display: flex;
	justify-content: center;
	align-items: center;
	margin: 0 0.5rem;
	padding: 0.6rem 1rem;
	font-size: 0.9375rem;
	border-radius: 0.5rem;
	box-shadow: 0 0.625rem 1.875rem -0.9375rem var(--box-bg-shadow);
	transition: all 0.2s ease-in-out 0s;

	&:hover {
		box-shadow: 0 0 2rem var(--box-bg-shadow);
	}
}

.talk-swiper-loading {
	display: flex;
	justify-content: center;
	align-items: center;
	margin: 0 0.5rem;
	padding: 0.6rem 1rem;
	font-size: 0.9375rem;
	border-radius: 0.5rem;
	box-shadow: 0 0.625rem 1.875rem -0.9375rem var(--box-bg-shadow);
	height: 4.375rem;
}

.swiper-container {
	width: 100%;
	height: 4.375rem;
	line-height: 4.375rem;
	border-radius: 0.75rem;
}

.slide-content {
	width: 100%;
	height: 100%;
	text-align: center;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
}

.laba-icon {
  width: 1.25rem;
  height: 1.25rem;
  margin-right: 0.5rem;
}

.arrow {
	animation: 1.5s passing infinite;
  width: 1.25rem;
  height: 1.25rem;
}

@keyframes passing {
	0% {
		transform: translateX(-50%);
		opacity: 0;
	}

	50% {
		transform: translateX(0);
		opacity: 1;
	}

	100% {
		transform: translateX(50%);
		opacity: 0;
	}
}
</style> 