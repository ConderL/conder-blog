<template>
	<div ref="brandRef" class="brand-container">
		<div class="brand">
			<!-- 标题 -->
			<p class="artboard">{{ blog.blogInfo.siteConfig.siteName }}</p>
			<!-- 打字机 -->
			<div class="title">
				{{ obj.output }}
				<span class="easy-typed-cursor">|</span>
			</div>
		</div>
		<!-- 波浪 -->
		<client-only>
			<Waves></Waves>
		</client-only>
		<!-- 向下按钮 -->
		<svg-icon
			class="arrow-down"
			icon-class="down"
			size="32px"
			@click="scrollDown"
		></svg-icon>
	</div>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick, onMounted } from 'vue';
import { useBlogStore } from '../../../composables/useStores';
import Waves from '../../Waves/index.vue';

const blog = useBlogStore();
const obj = reactive({
	output: "",
	isEnd: false,
	speed: 80,
	singleBack: false,
	sleep: 5000,
	type: "rollback",
	backSpeed: 10,
	sentencePause: false,
});

const brandRef = ref<HTMLElement>();
const scrollDown = () => {
	nextTick(() => {
    if (brandRef.value) {
      window.scrollTo({
        behavior: "smooth",
        top: brandRef.value.clientHeight,
      });
    }
	});
};

const fetchData = () => {
	fetch("http://v1.hitokoto.cn")
		.then((res) => {
			return res.json();
		})
		.then(({ hitokoto, from }) => {
			// 动态导入，避免SSR问题
			import('easy-typer-js').then(({ default: EasyTyper }) => {
				new EasyTyper(obj, `${hitokoto} —— ${from}`, fetchData, () => {});
			});
		})
		.catch(() => {
			// 如果API请求失败，使用默认文字
			import('easy-typer-js').then(({ default: EasyTyper }) => {
				new EasyTyper(obj, "让思想在文字中流淌，让灵感在记录中延伸。", fetchData, () => {});
			});
		});
};

onMounted(() => {
	fetchData();
});

// 默认导出
defineExpose({
	name: 'Brand'
});
</script>

<style lang="scss" scoped>
.brand-container {
	display: flex;
	justify-content: center;
	align-items: center;
	flex-direction: column;
	position: relative;
	width: 100%;
	height: 100vh;
	min-height: 10rem;
	color: var(--header-text-color);
	overflow: hidden;
}

.brand {
	display: flex;
	justify-content: center;
	align-items: center;
	flex-direction: column;
	position: relative;
	z-index: 100;
	text-align: center;

	.artboard {
		font-family: "Fredericka the Great", Mulish, -apple-system,
			"PingFang SC", "Microsoft YaHei", sans-serif;
		font-size: 3.5em;
		line-height: 1.2;
		animation: titleScale 1s;
		color: var(--brand-color);
		text-shadow: 0 0 .4em var(--brand-color-shadow);
		letter-spacing: 10px;
		font-weight: 500;
		margin-bottom: 10px;
	}

	.title {
		letter-spacing: 0.1em;
		color: var(--brand-color);
		text-align: center;
		font-size: 1.2em;
	}
}

.easy-typed-cursor {
	margin-left: 0.625rem;
	opacity: 1;
	animation: blink 0.7s infinite;
}

.arrow-down {
	cursor: pointer;
	position: absolute;
	bottom: 70px;
	animation: arrow-shake 1.5s ease-out infinite;
	z-index: 8;
	fill: var(--box-shadow-hover);
}

@media (max-width: 767px) {
	.brand-container {
		padding: 3rem 0.5rem 0;
	}
}

@media (min-width: 760px) {
	.title {
		font-size: 1.5rem;
	}
}

@keyframes arrow-shake {
	0% {
		opacity: 1;
		transform: translateY(0);
	}

	30% {
		opacity: 0.5;
		transform: translateY(25px);
	}

	100% {
		opacity: 1;
		transform: translateY(0);
	}
}

@keyframes blink {
	0% {
		opacity: 0;
	}

	100% {
		opacity: 1;
	}
}

@keyframes titleScale {
	0% {
		opacity: 0;
		transform: scale(0.7);
	}
	100% {
		opacity: 1;
		transform: scale(1);
	}
}
</style> 