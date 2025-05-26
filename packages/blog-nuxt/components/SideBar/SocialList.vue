<template>
  <div class="social-container">
    <template v-for="(item, index) in showSocialList" :key="index">
      <a
        class="social-item"
        target="_blank"
        :href="item.href"
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

// 由于当前store中没有社交媒体链接，我们使用静态链接作为示例
const showSocialList = ref([
  {
    type: isDark.value ? "icon:github-dark" : "icon:github",
    href: "https://github.com",
    color: "#24292e"
  },
  {
    type: "icon:gitee",
    href: "https://gitee.com",
    color: "#c71d23"
  },
  {
    type: "icon:bilibili",
    href: "https://bilibili.com",
    color: "#00a1d6"
  },
  {
    type: "icon:qq",
    href: "https://im.qq.com",
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