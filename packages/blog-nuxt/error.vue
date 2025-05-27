<template>
  <div>
    <div class="page-header">
      <img
        class="page-cover"
        :src="blog.blogInfo.siteConfig?.aboutWallpaper"
        alt="错误页面背景图"
      />
      <Waves></Waves>
    </div>
    <div class="bg">
      <div class="page-container">
        <NotFound v-if="error.statusCode === 404">
          <div class="not-found-hint">
            <p class="error-code">404</p>
            <h1 class="error-title">页面不存在</h1>
            <p class="error-description">{{ error.message || '抱歉，您访问的页面不存在' }}</p>
            <UButton
              color="primary"
              variant="solid"
              class="home-button"
              @click="handleError"
            >
              返回首页
            </UButton>
          </div>
          <ClientOnly>
            <LottieWeb
              :options="options"
              :style="{
                height: '50vh',
                opacity: showLottieWeb ? 1 : 0,
                'margin-top': '-60px',
              }"
              @d-o-m-loaded="DOMLoaded"
            />
          </ClientOnly>
        </NotFound>
        <div v-else class="error-container">
          <h1 class="error-title">{{ error.statusCode }}</h1>
          <p class="error-description">{{ error.message || '抱歉，发生了一个错误' }}</p>
          <UButton
            color="primary"
            variant="solid"
            class="home-button"
            @click="handleError"
          >
            返回首页
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBlogStore } from "~/stores";

// 获取错误信息
const props = defineProps({
  error: Object
});

const error = props.error || { statusCode: 404, message: '页面不存在' };
const blog = useBlogStore();
const showLottieWeb = ref(false);
const options = ref({
  path: "/json/404.json",
});

// 处理错误，清除错误并返回首页
function handleError() {
  clearError({ redirect: '/' });
}

function DOMLoaded() {
  const $rectList = document.querySelectorAll(
    '.lottie-web rect[fill="#ffffff"]'
  );
  $rectList.forEach((element) => {
    element.setAttribute("fill", "transparent");
  });
  showLottieWeb.value = true;
}

// SEO优化
useHead({
  title: `${error.statusCode} - 错误 - ${blog.blogInfo.siteConfig?.siteName || '博客'}`,
  meta: [
    { 
      name: 'description', 
      content: error.statusCode === 404 ? '页面不存在，请检查您输入的网址是否正确。' : '抱歉，发生了一个错误。'
    },
    { 
      name: 'robots',
      content: 'noindex, nofollow'
    }
  ]
});
</script>

<style scoped lang="scss">
.page-header {
  position: relative;
  padding: 3rem 0;
  color: #fff;
  text-align: center;
  background-color: var(--primary-color);
  
  .page-cover {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    z-index: 0;
  }
}

.bg {
  background-color: var(--background-color);
  padding: 2rem 0;
}

.page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  background-color: var(--card-bg);
  border-radius: 0.5rem;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.05);
}

.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 0;
  text-align: center;
}

.not-found-hint {
  padding-bottom: 0;
}

.error-code {
  font-size: 6rem;
  font-weight: 700;
  color: var(--primary-color);
  margin: 0;
  line-height: 1;
}

.error-title {
  font-size: 2rem;
  font-weight: 500;
  color: var(--text-color);
  margin: 0.5rem 0;
}

.error-description {
  font-size: 1.125rem;
  color: var(--text-color-secondary);
  margin-bottom: 2rem;
}

.home-button {
  min-width: 120px;
}

@media (max-width: 768px) {
  .page-container {
    padding: 1.5rem;
  }
  
  .error-code {
    font-size: 4rem;
  }
  
  .error-title {
    font-size: 1.5rem;
  }
}
</style> 