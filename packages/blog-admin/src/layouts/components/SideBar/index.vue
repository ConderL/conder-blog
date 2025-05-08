<template>
  <div class="sidebar-container">
    <el-scrollbar wrap-class="scrollbar-wrapper">
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :unique-opened="false"
        :collapse-transition="false"
        mode="vertical"
        :background-color="variables.menuBg"
        :text-color="variables.menuText"
        :active-text-color="variables.menuActiveText"
      >
        <sidebar-item
          v-for="route in routes"
          :key="route.path"
          :item="route as any"
          :base-path="route.path || ''"
        />
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useAppStore, usePermissionStore } from "@/store";
import { storeToRefs } from "pinia";
import SidebarItem from "./SidebarItem.vue";
import { MenuItem } from "@/types/menu";

const variables = {
  menuText: "#bfcbd9",
  menuActiveText: "#409EFF",
  menuBg: "#304156",
};

const route = useRoute();
const appStore = useAppStore();
const permissionStore = usePermissionStore();
const { sidebar } = storeToRefs(appStore);
const { routes } = storeToRefs(permissionStore);

const isCollapse = computed(() => {
  return sidebar.value.opened === false;
});

const activeMenu = computed(() => {
  const { meta, path } = route;
  if (meta?.activeMenu) {
    return meta.activeMenu;
  }
  return path;
});
</script>

<style lang="scss" scoped>
.sidebar-container {
  transition: width 0.28s;
  width: 210px !important;
  height: 100%;
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: 1001;
  overflow: hidden;
  background-color: var(--el-menu-bg-color);

  .scrollbar-wrapper {
    overflow-x: hidden !important;
  }

  .el-scrollbar__view {
    height: 100%;
  }

  &.has-logo {
    .el-scrollbar {
      height: calc(100% - 50px);
    }
  }

  .is-horizontal {
    display: none;
  }

  a {
    display: inline-block;
    width: 100%;
    overflow: hidden;
  }

  .el-menu {
    border: none;
    height: 100%;
    width: 100% !important;
  }

  .el-menu-item {
    &:hover {
      background-color: #263445 !important;
    }
    // &.is-active {
    //   background-color: #1890ff !important;
    // }
  }
}
</style>
