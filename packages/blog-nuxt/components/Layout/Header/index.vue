<template>
  <header class="header-wrapper" :class="fixedClass">
    <!-- 切换按钮 -->
    <Toggle></Toggle>
    <!-- 菜单 -->
    <NavBar :class="{ sub: y > 0 }"></NavBar>
    <!-- 右侧按钮 -->
    <ul class="right">
      <li class="item">
        <ClientOnly>
          <UIcon :name="isDark ? 'icon:moon' : 'icon:sun'" class="clickable-icon" @click="toggle()" />
        </ClientOnly>
      </li>
      <li class="item">
        <ClientOnly>
          <UIcon name="icon:search" class="clickable-icon" @click="app.searchFlag = true" />
        </ClientOnly>
      </li>
    </ul>
  </header>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { useDark, useScroll, useToggle } from "@vueuse/core";

const app = useAppStore();
// 使用 Nuxt 兼容的写法处理客户端对象
const y = ref(0);

// 在客户端上使用 useScroll
onMounted(() => {
  if (process.client) {
    const { y: scrollY } = useScroll(window);
    watch(scrollY, (val) => {
      y.value = val;
    });
  }
});

const isDark = useDark({
  selector: 'html',
  attribute: 'theme',
  valueDark: 'dark',
  valueLight: 'light',
});
const toggle = useToggle(isDark);
const fixedClass = ref("");

// 确保在客户端初始化时同步主题
onMounted(() => {
  if (process.client) {
    // 如果存储的主题是dark，但当前HTML属性不是dark，则同步
    if (app.theme === 'dark' && document.documentElement.getAttribute('theme') !== 'dark') {
      isDark.value = true;
    } else if (app.theme === 'light' && document.documentElement.getAttribute('theme') !== 'light') {
      isDark.value = false;
    }
  }
});

watch(y, (newValue, oldValue) => {
  if (newValue > 0) {
    if (newValue < oldValue) {
      fixedClass.value = "show up";
    } else {
      fixedClass.value = "show down";
    }
  } else {
    fixedClass.value = "";
  }
});

// 监听主题变化，更新app的theme状态
watch(isDark, (value) => {
  app.switchTheme(value ? 'dark' : 'light');
});

defineExpose({
  name: 'Header'
});
</script>

<style lang="scss" scoped>
.header-wrapper {
	position: fixed;
	display: flex;
	flex-wrap: nowrap;
	align-items: center;
	justify-content: space-between;
	width: 100%;
	height: 3.125rem;
	padding: 0 1rem;
	text-shadow: 0 0.2rem 0.3rem rgb(0 0 0 / 50%);
	color: var(--header-text-color);
	transition: all 0.2s ease-in-out 0s;
	z-index: 9;
}

.show {
	background: var(--nav-bg);
	box-shadow: 0.1rem 0.1rem 0.2rem var(--grey-9-a1);
	text-shadow: 0 0 0.625rem var(--grey-9-a1);
	color: var(--text-color);
}

.up {
	transform: translateY(0);
}

.down {
	transform: translateY(-100%);
}

.right {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	height: 100%;

	.item {
		padding: 0.625rem 0.5rem;
	}
}

.clickable-icon {
  width: 1.25rem;
  height: 1.25rem;
  cursor: pointer;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: scale(1.1);
  }
}

@media (max-width: 991px) {
	.header-wrapper {
		padding: 0;
	}
}
</style> 