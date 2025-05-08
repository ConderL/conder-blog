<template>
  <div v-if="!item.meta || !item.meta.hidden">
    <template
      v-if="
        hasOneShowingChild(item.children, item) &&
        onlyOneChild &&
        (!onlyOneChild.children || onlyOneChild.noShowingChildren) &&
        !item.alwaysShow
      "
    >
      <app-link
        v-if="onlyOneChild && onlyOneChild.meta"
        :to="resolvePath(onlyOneChild.path || '')"
      >
        <el-menu-item
          :index="resolvePath(onlyOneChild.path || '')"
          :class="{ 'submenu-title-noDropdown': !isNest }"
        >
          <el-icon v-if="onlyOneChild.meta && onlyOneChild.meta.icon">
            <svg-icon :icon-class="onlyOneChild.meta.icon" />
          </el-icon>
          <template #title>
            <span>{{ onlyOneChild.meta?.title || "未命名菜单" }}</span>
          </template>
        </el-menu-item>
      </app-link>
    </template>

    <el-sub-menu v-else :index="resolvePath(item.path || '')">
      <template #title>
        <el-icon v-if="item.meta && item.meta.icon">
          <svg-icon :icon-class="item.meta.icon" />
        </el-icon>
        <span v-if="item.meta && item.meta.title">{{ item.meta.title }}</span>
        <span v-else>未命名菜单</span>
      </template>

      <sidebar-item
        v-for="child in item.children || []"
        :key="child.path"
        :is-nest="true"
        :item="child"
        :base-path="resolvePath(child.path || '')"
        class="nest-menu"
      />
    </el-sub-menu>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import path from "path-browserify";
import SvgIcon from "@/components/SvgIcon/index.vue";
import AppLink from "./Link.vue";
import { MenuItem } from "@/types/menu";
import { useRoute } from "vue-router";

const props = defineProps({
  // route object
  item: {
    type: Object as () => MenuItem,
    required: true,
  },
  isNest: {
    type: Boolean,
    default: false,
  },
  basePath: {
    type: String,
    default: "",
  },
});

const route = useRoute();
const onlyOneChild = ref<MenuItem | null>(null);

// 判断路由是否为当前激活路由
const isActive = computed(() => {
  const fullPath = resolvePath(props.item.path || "");
  return route.path === fullPath || route.path.startsWith(fullPath + "/");
});

function hasOneShowingChild(children: MenuItem[] = [], parent: MenuItem) {
  if (!children) {
    children = [];
  }

  const showingChildren = children.filter((item) => {
    if (item?.meta?.hidden) {
      return false;
    }
    // 检查 item 是否是一个有效的对象
    if (item && typeof item === "object") {
      onlyOneChild.value = item;
      return true;
    }
    return false;
  });

  if (showingChildren.length === 1) {
    return true;
  }

  if (showingChildren.length === 0) {
    onlyOneChild.value = { ...parent, path: "", noShowingChildren: true };
    return true;
  }

  return false;
}

function resolvePath(routePath: string) {
  if (!routePath) {
    return props.basePath;
  }

  if (routePath.startsWith("/")) {
    return routePath;
  }

  return path.resolve(props.basePath, routePath);
}
</script>

<style lang="scss" scoped>
.el-menu-item,
.el-sub-menu {
  .el-icon {
    margin-right: 8px;
  }
}

.menu-title {
  display: inline-block;
  margin-left: 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

// 保持菜单项样式一致
.el-menu-item.is-active {
  // background-color: #1890ff !important;
  color: #fff !important;
}

// 修复子菜单样式
.nest-menu .el-menu-item {
  padding-left: 40px !important;

  &:hover {
    background-color: #263445 !important;
  }
}
</style>
