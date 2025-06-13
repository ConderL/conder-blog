import { getUserMenu } from "@/api/menu";
import { constantRoutes } from "@/router";
import { defineStore } from "pinia";
import { RouteComponent, RouteRecordRaw } from "vue-router";
import { PermissionState } from "../interface";

// 预先导入所有视图组件
const modules = import.meta.glob("../../views/**/**.vue");

// 懒加载组件，避免循环引用
const getLayoutComponent = () => import("@/layouts/index.vue");
const getParentViewComponent = () =>
  import("@/components/ParentView/index.vue");

// 加载视图组件
function loadView(component: string): RouteComponent {

  // 如果是Layout组件，直接返回
  if (component === "Layout") {
    return getLayoutComponent;
  }

  // 如果是ParentView组件，直接返回
  if (component === "ParentView") {
    return getParentViewComponent;
  }

  try {
    // 处理以/开头的组件路径
    if (component.startsWith("/")) {
      component = component.substring(1); // 移除开头的/
    }

    // 查找匹配的模块路径
    const modulePath = Object.keys(modules).find(
      (key) =>
        key.includes(`/${component}.vue`) ||
        key.includes(`/${component}/index.vue`)
    );

    if (modulePath) {
      return modules[modulePath] as unknown as RouteComponent;
    } else {
      console.warn("未找到组件路径:", component);
      return () => import("@/views/error/404.vue");
    }
  } catch (error) {
    console.error("组件加载失败:", component, error);
    return () => import("@/views/error/404.vue");
  }
}

/**
 * 过滤异步路由
 * @param routes 路由配置
 */
export function filterAsyncRoutes(routes: RouteRecordRaw[]) {
  const res: RouteRecordRaw[] = [];

  routes.forEach((route) => {
    const tmp = { ...route };

    // 确保路由有名称
    if (!tmp.name) {
      tmp.name = tmp.path.replace(/\//g, "-") || "unnamed-route";
      console.log("路由没有名称，自动生成:", tmp.name);
    }

    // 处理组件
    if (tmp.component) {

      // 判断组件类型
      const componentName = tmp.component as unknown as string;

      if (componentName === "Layout") {
        tmp.component = getLayoutComponent;
      } else if (componentName === "ParentView") {
        tmp.component = getParentViewComponent;
      } else {
        tmp.component = loadView(componentName);
      }
    }

    // 处理子路由
    if (tmp.children) {
      tmp.children = filterAsyncRoutes(tmp.children);
    }

    res.push(tmp);
  });

  return res;
}

// 创建store
export const usePermissionStore = defineStore("usePermissionStore", {
  state: (): PermissionState => ({
    routes: [],
    addRoutes: [],
    cachedRoutes: new Set(),
  }),

  actions: {
    setRoutes(routes: RouteRecordRaw[]) {
      this.addRoutes = routes;
      this.routes = constantRoutes.concat(routes);
    },

    async generateRoutes() {
      return new Promise<RouteRecordRaw[]>((resolve, reject) => {
        getUserMenu()
          .then(({ data }) => {
            if (data.flag) {
              try {
                const asyncRoutes = data.data;
                // 过滤处理异步路由
                const accessedRoutes = filterAsyncRoutes(asyncRoutes);
                // 设置到store中
                this.setRoutes(accessedRoutes);
                resolve(accessedRoutes);
              } catch (err) {
                console.error("处理路由出错:", err);
                reject(err);
              }
            } else {
              console.error("获取菜单失败:", data.msg);
              reject(new Error(`获取用户菜单失败: ${data.msg}`));
            }
          })
          .catch((error) => {
            console.error("获取用户菜单请求失败:", error);
            reject(error);
          });
      });
    },

    // 添加路由到router的方法
    addRoutesToRouter(router: any) {
      const addRoutes = this.addRoutes || [];
      console.log("准备添加路由到router, 数量:", addRoutes.length);

      // 添加路由
      addRoutes.forEach((route) => {
        try {
          if (!router.hasRoute(route.name)) {
            router.addRoute(route);
            console.log("添加路由成功:", route.path, route.name);
          } else {
            console.log("路由已存在，跳过:", route.path, route.name);
          }
        } catch (error) {
          console.error("添加路由失败:", route.path, error);
        }
      });

      return addRoutes;
    },
  },
});
