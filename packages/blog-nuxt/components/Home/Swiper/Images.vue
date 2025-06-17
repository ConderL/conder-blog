<template>
	<div class="imgs">
		<ul>	
			<li
				v-for="(img, index) of carouselList" :key="index"
				class="item" :style="{'background-image': 'url(' + img.imgUrl + ')', 'animation-duration': animationDuration + 's'}">
			</li>
		</ul>
	</div>
</template>

<script setup lang="ts">
// 默认导出
defineExpose({
  name: 'Images'
});

// 使用useFetch获取轮播图数据
const { carousel } = useApi();
const { data } = await carousel.getList();
const carouselList = computed(() => unref(data) || []);

// 根据图片数量动态计算动画时长
const animationDuration = computed(() => {
  const count = carouselList.value.length;
  // 每张图片显示6秒，确保总时长能被图片数量整除
  return count > 0 ? count * 6 : 18;
});
</script>

<style lang="scss" scoped>
.imgs {
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100vh;
	z-index: -9;
	background-color: #363636;
	overflow: hidden;

	.item {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: no-repeat 50% 50% / cover;
		opacity: 0;
		animation: imageAnimation linear infinite 0s;
		backface-visibility: hidden;
		transform-style: preserve-3d;
		will-change: opacity, transform; /* 优化动画性能 */

		@for $i from 1 through 10 {
			&:nth-child(#{$i}) {
				animation-delay: #{($i - 1) * 6}s;
			}
		}
	}

	&::before {
		content: '';
		display: block;
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, .2);
		transition: all .2s ease-in-out 0s;
	}
}

@keyframes imageAnimation {
	0% {
		opacity: 0;
		animation-timing-function: ease-in;
	}

	3% {
		opacity: 1;
	}

	15% {
		opacity: 1;
		transform: scale(1.05);
		animation-timing-function: ease-out;
	}

	25% {
		opacity: 1;
		transform: scale(1.1);
	}

	45% {
		opacity: 0;
		transform: scale(1.1);
	}

	100% {
		opacity: 0;
	}
}
</style> 