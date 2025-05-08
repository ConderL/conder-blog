import { App } from "vue";
import { checkPermission, checkRole } from "@/utils/permission";

/**
 * 注册全局属性和方法
 */
export default function setupGlobalProperties(app: App) {
  // 注册全局权限检查方法
  app.config.globalProperties.$checkPermission = checkPermission;
  app.config.globalProperties.$checkRole = checkRole;
}
