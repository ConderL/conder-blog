<template>
	<NuxtLink to="/talk" class="talk-swiper" v-if="talkList.length > 0">
		<svg-icon icon-class="laba" size="1.25rem"></svg-icon>
		<div class="swiper-container">
			<div v-for="(talk, index) in displayedTalk" :key="index" class="slide-content" v-html="talk"></div>
		</div>
		<svg-icon icon-class="right-arrow" class="arrow"></svg-icon>
	</NuxtLink>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

// 模拟数据，实际应该从API获取
const talkList = ref<string[]>([
  "欢迎来到我的博客，这里是一个分享技术和生活的地方。",
  "Nuxt.js的服务端渲染能力让博客获得更好的SEO效果。",
  "有什么问题可以在留言板给我留言，我会及时回复的！"
]);

const currentIndex = ref(0);
const displayedTalk = ref<string[]>([talkList.value[0]]);

// 轮播效果
const startCarousel = () => {
  setInterval(() => {
    currentIndex.value = (currentIndex.value + 1) % talkList.value.length;
    displayedTalk.value = [talkList.value[currentIndex.value]];
  }, 3000);
};

onMounted(() => {
  // 在实际项目中应该从API获取数据
  // const nuxtApp = useNuxtApp();
  // nuxtApp.$api.talk.getList().then((data) => {
  //   talkList.value = data;
  //   startCarousel();
  // });
  
  // 使用模拟数据
  startCarousel();
});

defineExpose({
  // Add any necessary methods or properties here
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

.swiper-container {
	width: 100%;
	height: 4.375rem;
	line-height: 4.375rem;
	border-radius: 0.75rem;
	overflow: hidden;
}

.slide-content {
	width: 100%;
	height: 100%;
	text-align: center;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
	animation: slideUp 0.5s ease-in-out;
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

@keyframes slideUp {
	0% {
		transform: translateY(100%);
		opacity: 0;
	}

	100% {
		transform: translateY(0);
		opacity: 1;
	}
}
</style> 