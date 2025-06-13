import router from "@/router";
import { useUserStore, usePermissionStore } from "@/store";
import { isRelogin } from "@/utils/request";
import { getToken } from "@/utils/token";
import { ElMessage } from "element-plus";
import NProgress from "nprogress";
import { RouteRecordRaw } from "vue-router";
import Layout from "@/layouts/index.vue";

NProgress.configure({
  easing: "ease",
  speed: 500,
  showSpinner: false,
  trickleSpeed: 200,
  minimum: 0.3,
});

// 白名单路由
const whiteList = ["/login"];
// 用于记录路由是否已添加
let hasAddRoutes = false;

// 类型定义，确保类型安全
type UserStore = ReturnType<typeof useUserStore>;
type PermissionStore = ReturnType<typeof usePermissionStore>;

router.beforeEach(async (to, from, next) => {
  NProgress.start();
  console.log("路由导航开始 - 目标路径:", to.path);

  // 判断是否有 token
  if (getToken()) {
    if (to.path === "/login") {
      // 如果已登录，跳转到首页
      next({ path: "/" });
      NProgress.done();
    } else {
      try {
        // 获取store
        const userStore = useUserStore();
        const permissionStore = usePermissionStore();

        // 检查用户信息是否存在
        const hasUserInfo = userStore.roleList && userStore.roleList.length > 0;

        // 检查路由是否已经加载
        const hasRoutes =
          permissionStore.addRoutes && permissionStore.addRoutes.length > 0;

        console.log(
          "用户信息状态:",
          hasUserInfo,
          "路由状态:",
          hasRoutes,
          "路由已添加状态:",
          hasAddRoutes
        );

        // 情况1: 需要获取用户信息和路由
        if (!hasUserInfo) {
          console.log("获取用户信息...");
          isRelogin.show = true;

          try {
            // 使用类型断言调用方法
            await (userStore as any).GetInfo();
            console.log("用户信息获取成功");
          } catch (error) {
            console.error("获取用户信息失败:", error);
            throw error;
          } finally {
            isRelogin.show = false;
          }
        }

        // 情况2: 需要加载路由
        if (!hasAddRoutes) {

          try {
            let accessRoutes: RouteRecordRaw[] = [];

            // 如果已经有路由配置，直接使用
            if (hasRoutes) {
              accessRoutes = permissionStore.addRoutes as RouteRecordRaw[];
            } else {
              // 没有路由配置，从服务器获取
              accessRoutes = (await (
                permissionStore as any
              ).generateRoutes()) as RouteRecordRaw[];
            }

            // 添加路由
            accessRoutes.forEach((route) => {
              // 调试信息 - 检查路由配置
              if (route.name) {
                if (!router.hasRoute(route.name)) {
                  router.addRoute(route);
                } else {
                  console.log("路由已存在:", route.path);
                }
              } else {
                console.warn("路由没有名称，无法添加:", route.path);
              }
            });

            hasAddRoutes = true;

            // 重新跳转到目标路由，触发新的路由匹配
            next({ ...to, replace: true });
            return;
          } catch (error) {
            console.error("加载路由失败:", error);
            throw error;
          }
        }

        // 检查路由是否匹配到了组件
        if (to.matched.length === 0) {
          console.warn(`路由 ${to.path} 没有匹配到组件，跳转到404页面`);
          next({ path: "/404" });
          return;
        }

        // 情况3: 所有信息都已加载，正常导航
        console.log("所有信息已加载，正常导航到:", to.path);
        next();
      } catch (error: any) {
        // 发生错误，登出用户
        console.error("路由导航错误:", error);

        const userStore = useUserStore();
        // 使用类型断言调用方法
        (userStore as any).LogOut().then(() => {
          ElMessage.error(error?.message || error?.toString() || "未知错误");
          next({ path: "/login" });
        });
      }
    }
  } else {
    // 没有token
    if (whiteList.includes(to.path)) {
      // 白名单路由，直接跳转
      console.log("白名单路由，允许访问:", to.path);
      next();
    } else {
      // 非白名单路由，跳转到登录页
      console.log("未登录，重定向到登录页");
      next(`/login?redirect=${to.path}`);
      NProgress.done();
    }
  }
});

router.afterEach((to) => {
  console.log("路由导航完成:", to.path);
  NProgress.done();
});
