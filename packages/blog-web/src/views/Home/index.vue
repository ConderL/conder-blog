<template>
	<!--背景轮播-->
	<Images></Images>
	<!-- 品牌 -->
	<Brand></Brand>
	<div class="bg">
		<div class="main-container mt">
			<div class="left-container" :class="app.sideFlag ? 'test' : ''">
				<!-- 说说 -->
				<TalkSwiper></TalkSwiper>
				<!-- 推荐文章 -->
				<Recommend></Recommend>
				<!-- 文章列表 -->
				<ArticleItem></ArticleItem>
			</div>
			<SideBar
				class="right-container"
				:class="app.sideFlag ? 'temp' : ''"
			></SideBar>
		</div>
	</div>
</template>

<script setup lang="ts">
import {
	getBlogInfo,
	// report
} from "@/api/blogInfo";
import { useAppStore, useBlogStore } from "@/store";
import { defineAsyncComponent } from "vue";

// 使用异步组件
const ArticleItem = defineAsyncComponent(
	() => import("@/views/Article/ArticleItem.vue"),
);
const Brand = defineAsyncComponent(() => import("./Brand/index.vue"));
const Images = defineAsyncComponent(() => import("./Swiper/Images.vue"));
const Recommend = defineAsyncComponent(() => import("./Swiper/Recommend.vue"));
const TalkSwiper = defineAsyncComponent(
	() => import("./Swiper/TalkSwiper.vue"),
);

const app = useAppStore();
const blog = useBlogStore();
onMounted(async () => {
	const res = await getBlogInfo();
	blog.setBlogInfo(res.data.data);
	// report();
});
</script>

<style lang="scss" scoped>
.mt {
	margin-top: 1rem;
	padding-bottom: 1.75rem;
}
</style>
