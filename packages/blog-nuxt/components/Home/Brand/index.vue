<template>
	<div ref="brandRef" class="brand-container">
		<div class="brand">
			<!-- 标题 -->
			<p class="artboard">{{ blog.blogInfo.siteConfig?.siteName }}</p>
			<!-- 打字机 -->
			<div class="title">
				<ClientOnly>
					<span>{{ obj.output }}</span>
					<span class="easy-typed-cursor">|</span>
					
					<template #fallback>
						<span>让思想在文字中流淌，让灵感在记录中延伸。</span>
					</template>
				</ClientOnly>
			</div>
		</div>
		<!-- 波浪 -->
		<client-only>
			<Waves></Waves>
		</client-only>
		<!-- 向下按钮 -->
		<UIcon name="icon:down" class="arrow-down" @click="scrollDown" />
	</div>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick, onMounted } from 'vue';
import Waves from '../../Waves/index.vue';
import request from '~/utils/http';

// 默认导出
defineExpose({
	name: 'Brand'
});

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

onMounted(() => {
	// 仅在客户端获取一言数据
	if (process.client) {
		fetchData();
	}
});

// 一言数据接口返回类型
interface HitokotoResponse {
  hitokoto: string;
  from: string;
  [key: string]: any;
}

// 将fetchData函数移到onMounted之后，确保只在客户端执行
const fetchData = () => {
	request<HitokotoResponse>({
		url: "https://v1.hitokoto.cn",
		method: "get"
	})
		.then(({ data }) => {
			const { hitokoto, from } = data;
			// 动态导入，避免SSR问题
			import('easy-typer-js').then(({ default: EasyTyper }) => {
				try {
					// 创建打字机实例
					const typer = new EasyTyper({
						output: obj.output,
						isEnd: obj.isEnd,
						speed: obj.speed,
						singleBack: obj.singleBack,
						sleep: obj.sleep,
						type: obj.type,
						backSpeed: obj.backSpeed,
						sentencePause: obj.sentencePause
					}, `${hitokoto} —— ${from}`, fetchData);
					
					// 保持引用，避免被垃圾回收
					obj._typer = typer;
				} catch (error) {
					console.error('初始化打字机失败:', error);
					// 设置默认文本
					obj.output = `${hitokoto} —— ${from}`;
				}
			});
		})
		.catch((error) => {
			console.error('获取一言数据失败:', error);
			// 如果API请求失败，使用默认文字
			import('easy-typer-js').then(({ default: EasyTyper }) => {
				try {
					// 创建打字机实例
					const typer = new EasyTyper({
						output: obj.output,
						isEnd: obj.isEnd,
						speed: obj.speed,
						singleBack: obj.singleBack,
						sleep: obj.sleep,
						type: obj.type,
						backSpeed: obj.backSpeed,
						sentencePause: obj.sentencePause
					}, "让思想在文字中流淌，让灵感在记录中延伸。", fetchData);
					
					// 保持引用，避免被垃圾回收
					obj._typer = typer;
				} catch (error) {
					console.error('初始化打字机失败:', error);
					// 设置默认文本
					obj.output = "让思想在文字中流淌，让灵感在记录中延伸。";
				}
			});
		});
};
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
	text-align: center;	
	position: fixed;
	z-index: -1;

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
  width: 32px;
  height: 32px;
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