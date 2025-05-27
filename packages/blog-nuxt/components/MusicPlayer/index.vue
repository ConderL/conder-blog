<template>
	<!-- <meting-js v-if="blog.blogInfo.siteConfig.isMusic" server="netease" type="playlist"
		:id="blog.blogInfo.siteConfig.musicId" fixed="true" theme="#e9546b"></meting-js> -->
	<aplayer
		v-if="blog.blogInfo.siteConfig?.musicId"
		:id="blog.blogInfo.siteConfig.musicId"
		server="netease"
		type="playlist"
		:fixed="true"
		theme="#e9546b"
	/>
</template>

<script setup lang="ts">
import aplayer from "./aplayer.vue";
import { useBlogStore } from "~/stores";
const blog = useBlogStore();
</script>

<style scoped></style>
