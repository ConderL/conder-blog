<template>
  <div :class="classObj" class="app-wrapper">
    <div
      v-if="device === 'mobile' && sidebar.opened"
      class="drawer-bg"
      @click="handleClickOutside"
    />
    <!-- 侧边栏 -->
    <SideBar class="sidebar-container"></SideBar>
    <div :class="{ hasTagsView: needTagView }" class="main-container">
      <div :class="{ 'fixed-header': fixedHeader }">
        <!-- 导航栏 -->
        <NavBar @setLayout="setLayout"></NavBar>
        <!-- 历史标签栏 -->
        <TagView v-if="needTagView"></TagView>
      </div>
      <AppMain></AppMain>
      <!-- 设置 -->
      <Settings ref="settingRef"></Settings>
    </div>
    <div v-if="isDev" class="route-debug">
      <h3>
        路由调试面板
        <button @click="isDebugVisible = !isDebugVisible">
          {{ isDebugVisible ? "隐藏" : "显示" }}
        </button>
      </h3>
      <div v-if="isDebugVisible" class="debug-content">
        <p>当前路由: {{ $route.path }}</p>
        <p>路由名称: {{ $route.name }}</p>
        <p>路由元数据: {{ JSON.stringify($route.meta) }}</p>
        <h4>所有注册路由:</h4>
        <pre>{{ routeDebugInfo }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Settings from "@/components/Settings/index.vue";
import TagView from "@/components/TagView/index.vue";
import { useAppStore, useSettingStore } from "@/store";
import { useWindowSize } from "@vueuse/core";
import { computed, ref, watchEffect } from "vue";
import AppMain from "./components/AppMain/index.vue";
import NavBar from "./components/NavBar/index.vue";
import SideBar from "./components/SideBar/index.vue";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";

const appStore = useAppStore();
const settingStore = useSettingStore();
const { sidebar, device } = storeToRefs(appStore);
const { width } = useWindowSize();
const WIDTH = 992;
const settingRef = ref();
const isDev = import.meta.env.MODE === "development";
const isDebugVisible = ref(false);
const router = useRouter();

const needTagView = computed(() => settingStore.tagView);
const fixedHeader = computed(() => settingStore.fixedHeader);
const classObj = computed(() => ({
  hideSidebar: !sidebar.value.opened,
  openSidebar: sidebar.value.opened,
  mobile: device.value === "mobile",
}));

// 获取所有路由信息用于调试
const routeDebugInfo = computed(() => {
  const routes = router.getRoutes();
  return JSON.stringify(
    routes.map((route) => ({
      path: route.path,
      name: route.name,
      meta: route.meta,
    })),
    null,
    2
  );
});

watchEffect(() => {
  if (width.value - 1 < WIDTH) {
    appStore.toggleDevice("mobile");
    appStore.closeSideBar({ withoutAnimation: false });
  } else {
    appStore.toggleDevice("desktop");
  }
});

const handleClickOutside = () => {
  appStore.closeSideBar({ withoutAnimation: false });
};

const setLayout = () => {
  settingRef.value.openSetting();
};
</script>

<style lang="scss" scoped>
@use "@/assets/styles/mixin.scss" as *;
@use "@/assets/styles/variables.module.scss" as *;

.app-wrapper {
  @include clearfix;
  position: relative;
  height: 100%;
  width: 100%;

  &.mobile.openSidebar {
    position: fixed;
    top: 0;
  }
}

.drawer-bg {
  background: #000;
  opacity: 0.3;
  width: 100%;
  top: 0;
  height: 100%;
  position: absolute;
  z-index: 999;
}

.fixed-header {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 40;
  width: calc(100% - #{$sideBarWidth});
  transition: width 0.28s;
}

.hideSidebar .fixed-header {
  width: calc(100% - 64px);
}

.sidebarHide .fixed-header {
  width: 100%;
}

.mobile .fixed-header {
  width: 100%;
}

.route-debug {
  position: fixed;
  bottom: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.8);
  color: #fff;
  padding: 10px;
  border-radius: 5px;
  z-index: 9999;
  max-width: 500px;
  font-size: 12px;

  h3 {
    margin-top: 0;
    display: flex;
    justify-content: space-between;

    button {
      background: #4a5568;
      border: none;
      color: white;
      padding: 2px 8px;
      border-radius: 4px;
      cursor: pointer;

      &:hover {
        background: #2d3748;
      }
    }
  }

  .debug-content {
    max-height: 400px;
    overflow: auto;

    pre {
      white-space: pre-wrap;
      word-break: break-all;
    }
  }
}
</style>
