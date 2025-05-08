import router from "@/router";
import { useUserStore, usePermissionStore } from "@/store";
import { isRelogin } from "@/utils/request";
import { getToken } from "@/utils/token";
import { ElMessage } from "element-plus";
import NProgress from "nprogress";

NProgress.configure({
  easing: "ease",
  speed: 500,
  showSpinner: false,
  trickleSpeed: 200,
  minimum: 0.3,
});

// 白名单路由
const whiteList = ["/login"];

router.beforeEach((to, from, next) => {
  NProgress.start();
  const user = useUserStore();
  const permission = usePermissionStore();
  // 判断是否有token
  if (getToken()) {
    if (to.path === "/login") {
      next({ path: "/" });
      NProgress.done();
    } else {
      console.log(user, "user");
      if (user.roleList.length === 0) {
        console.log("用户角色列表为空，需要重新登录");
        isRelogin.show = true;
        // 判断当前用户是否已拉取完user_info信息
        user
          .GetInfo()
          .then(() => {
            console.log("用户信息已获取，开始生成路由");
            isRelogin.show = false;
            permission.generateRoutes().then((accessRoutes) => {
              accessRoutes.forEach((route) => {
                router.addRoute(route);
              });
              next({ ...to, replace: true });
            });
          })
          .catch((err) => {
            setTimeout(() => {
              user.LogOut().then(() => {
                ElMessage.error(err);
                next({ path: "/login" });
              });
            }, 3000);
          });
      } else {
        next();
      }
    }
  } else {
    // 未登录可以访问白名单页面(登录页面)
    if (whiteList.indexOf(to.path) !== -1) {
      next();
    } else {
      next(`/login?redirect=${to.path}`);
      NProgress.done();
    }
  }
});

router.afterEach(() => {
  NProgress.done();
});
