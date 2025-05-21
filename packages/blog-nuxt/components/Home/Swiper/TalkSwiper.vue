<template>
	<ClientOnly>
	<NuxtLink to="/talk" class="talk-swiper" v-if="talkList.length > 0">
		<svg-icon icon-class="laba" size="1.25rem"></svg-icon>
			<swiper
				class="swiper-container"
				:direction="'vertical'"
				:speed="2000"
				:modules="modules"
				:loop="true"
				:slides-per-view="1"
				:autoplay="{ delay: 3000, disableOnInteraction: false }"
			>
				<swiper-slide v-for="(talk, index) in talkList" :key="index">
					<div class="slide-content" v-html="talk"></div>
				</swiper-slide>
			</swiper>
		<svg-icon icon-class="right-arrow" class="arrow"></svg-icon>
	</NuxtLink>
		
		<template #fallback>
			<div class="talk-swiper-loading">加载中...</div>
		</template>
	</ClientOnly>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Autoplay } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { useApi } from '../../../composables/useApi';

// 导入Swiper样式
import 'swiper/css';
import 'swiper/css/autoplay';

// 获取API
const api = useApi();
const talkList = ref<string[]>([]);
// 自动播放
const modules = [Autoplay];

// 获取首页说说数据
const fetchTalkHomeList = async () => {
  try {
    // 使用API获取说说数据
    console.log('正在获取说说数据...');
    const response = await api.talk.getHomeList();
    console.log('获取到的说说数据:', response);
    
    if (response && response.data) {
      talkList.value = response.data;
    } else if (response && Array.isArray(response)) {
      // 如果API直接返回数组
      talkList.value = response;
    } else {
      // 使用默认数据
      talkList.value = [
        "欢迎来到我的博客，这里是一个分享技术和生活的地方。",
        "Nuxt.js的服务端渲染能力让博客获得更好的SEO效果。",
        "有什么问题可以在留言板给我留言，我会及时回复的！"
      ];
    }
  } catch (error) {
    console.error('获取说说数据失败:', error);
    // 使用默认数据作为备用
    talkList.value = [
  "欢迎来到我的博客，这里是一个分享技术和生活的地方。",
  "Nuxt.js的服务端渲染能力让博客获得更好的SEO效果。",
  "有什么问题可以在留言板给我留言，我会及时回复的！"
    ];
  }
};

onMounted(() => {
  fetchTalkHomeList();
});
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

.arrow {
	animation: 1.5s passing infinite;
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