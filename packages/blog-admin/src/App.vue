<template>
  <el-config-provider :locale="zhCn" :size="size">
    <router-view />
  </el-config-provider>
</template>

<script setup lang="ts">
import { defineComponent, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useUserStore } from "./store/modules/user";
import { usePermissionStore } from "./store/modules/permission";
import { ElConfigProvider } from "element-plus";
import zhCn from "element-plus/es/locale/lang/zh-cn";
import type { EpPropMergeType } from "element-plus/es/utils/vue/props/types";
import { computed } from "vue";
import { report } from "./api/blog";

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const permissionStore = usePermissionStore();

const size = computed(
  () =>
    userStore.size as EpPropMergeType<
      StringConstructor,
      "default" | "small" | "large",
      never
    >
);

onMounted(() => {
  report();
});
</script>
