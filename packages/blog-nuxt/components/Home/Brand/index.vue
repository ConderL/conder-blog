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
		<UIcon name="icon:down" class="arrow-down cursor-pointer" @click="scrollDown" />
	</div>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick, onMounted } from 'vue';
import Waves from '../../Waves/index.vue';

const { directFetch } = useRequest();

// 默认导出
defineExpose({
	name: 'Brand'
});

const blog = useBlogStore();

// 打字机配置对象
const obj = reactive({
	output: "",
	isEnd: false,
	speed: 80,
	singleBack: false,
	sleep: 5000,
	type: "rollback",
	backSpeed: 40,
	sentencePause: false
});

// 存储从接口获取的一言数据
const hitokotoList = ref([]);
// 当前选择的一言索引
const currentIndex = ref(0);
// 保存当前打字机实例
const typerInstance = ref(null);

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
		fetchHitokotoData();
	}
});

// 从本地接口获取一言数据
const fetchHitokotoData = async () => {
	try {
		const { data: hitokoto } = await directFetch('/hitokoto');
		hitokotoList.value = hitokoto;
		currentIndex.value = 0;
		showNextHitokoto();
	} catch (error) {
		console.error('获取一言数据失败:', error);
		useDefaultText();
	}
};

// 显示下一条一言数据
const showNextHitokoto = () => {
	if (hitokotoList.value && hitokotoList.value.length > 0) {
		// 检查是否需要重新获取数据
		if (currentIndex.value >= hitokotoList.value.length) {
			currentIndex.value = 0;
			fetchHitokotoData();
			return;
		}
		
		const item = hitokotoList.value[currentIndex.value];
		currentIndex.value++;
		
		// 显示当前数据
		showTyperEffect(`${item.hitokoto} —— ${item.from}`);
	} else {
		useDefaultText();
	}
};

// 显示打字机效果
const showTyperEffect = (text) => {
	// 动态导入打字机库
	import('easy-typer-js').then(({ default: EasyTyper }) => {
		try {
			// 如果有之前的实例，先清理
			if (typerInstance.value) {
				typerInstance.value = null;
			}
			
			// 重置输出
			obj.output = '';
			
			// 创建新实例
			typerInstance.value = new EasyTyper(obj, text, () => {
				// 延迟一点时间再显示下一条，避免立即切换
				setTimeout(() => {
					showNextHitokoto();
				}, 1000);
			});
		} catch (error) {
			console.error('初始化打字机失败:', error);
			obj.output = text;
			// 出错时也尝试显示下一条
			setTimeout(() => {
				showNextHitokoto();
			}, 5000);
		}
	}).catch(error => {
		console.error('加载打字机库失败:', error);
		obj.output = text;
	});
};

// 使用默认文本
const useDefaultText = () => {
	showTyperEffect("让思想在文字中流淌，让灵感在记录中延伸。");
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