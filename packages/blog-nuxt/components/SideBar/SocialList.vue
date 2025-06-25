<template>
  <div class="social-container">
    <template v-for="(item, index) in showSocialList" :key="index">
      <a
        class="social-item"
        target="_blank"
        :href="item.href"
        v-if="isShowSocial(item.type)"
      >
        <UIcon :name="item.type" class="social-icon" :style="{ color: item.color }" />
      </a>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useDark } from "@vueuse/core";

const isDark = useDark();
const blog = useBlogStore();
const socialList = blog.blogInfo.siteConfig.socialList;

const isShowSocial = computed(() => (social: string) => {
	if (socialList) {
		return socialList.split(",").some((item) => social.includes(item));
	}
});

const showSocialList = computed(() => [
  {
    type: isDark.value ? "icon:github-dark" : "icon:github",
    href: blog.blogInfo.siteConfig.github,
    color: "#24292e"
  },
  {
    type: "icon:gitee",
    href: blog.blogInfo.siteConfig.gitee,
    color: "#c71d23"
  },
  {
    type: "icon:bilibili",
    href: blog.blogInfo.siteConfig.bilibili,
    color: "#00a1d6"
  },
  {
    type: "icon:qq",
    href: "http://wpa.qq.com/msgrd?v=3&uin=" +
			blog.blogInfo.siteConfig.qq +
			"&site=qq&menu=yes",
    color: "#00aeec"
  },
]);

// 默认导出组件名称
defineExpose({
  name: 'SocialList'
});
</script>

<style lang="scss" scoped>
.social-container {
  margin-top: 1rem;
  text-align: center;

  .social-item {
    display: inline-block;
    width: 1.875rem;
    height: 1.875rem;
    margin: 0 0.125rem;
    text-align: center;
  }
  
  .social-icon {
    width: 1.4rem;
    height: 1.4rem;
    vertical-align: middle;
  }
}
</style> 