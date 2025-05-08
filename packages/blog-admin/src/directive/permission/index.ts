import { Directive, DirectiveBinding, App } from "vue";
import { useUserStore } from "@/store";

// 存储无权限的命令集合
const noPermissionCommands = new Set<string>();

/**
 * v-hasPerm 按钮权限处理
 */
export const hasPerm: Directive = {
  async mounted(el: HTMLElement, binding: DirectiveBinding) {
    try {
      const userStore = useUserStore();

      // 检查userStore.user是否存在
      if (!userStore || !userStore.roleList) {
        console.warn("用户权限未加载或不存在");
        handleNoPermission(el, binding);
        return;
      }

      // 管理员角色 (角色ID为1的是管理员)
      if (userStore.roleList?.some((role) => String(role) === "1")) {
        return true;
      }

      // 其他角色处理
      const { value } = binding;
      if (value) {
        // 按钮权限标识
        const requiredPerms = value as string[];
        // 检查是否有权限列表
        if (
          !userStore.permissionList ||
          userStore.permissionList.length === 0
        ) {
          console.warn("用户权限列表为空");
          handleNoPermission(el, binding);
          return;
        }

        // 修正权限判断逻辑：检查按钮所需权限中的任一个是否在用户权限列表中
        const hasPerm = requiredPerms.some((requiredPerm: string) => {
          return userStore.permissionList.includes(requiredPerm);
        });

        if (!hasPerm) {
          handleNoPermission(el, binding);
        }
      } else {
        throw new Error(
          "need perms! Like v-has-perm=\"['sys:user:add','sys:user:edit']\""
        );
      }
    } catch (error) {
      console.error("权限检查出错:", error);
      handleNoPermission(el, binding);
    }
  },
};

/**
 * 处理无权限情况
 */
function handleNoPermission(el: HTMLElement, binding: DirectiveBinding) {
  const isDropdownItem =
    el.classList.contains("el-dropdown-item") ||
    el.className.includes("dropdown-item") ||
    el.tagName === "EL-DROPDOWN-ITEM";

  if (isDropdownItem) {
    // 对于下拉菜单项，只设置视觉效果和记录命令
    el.setAttribute("disabled", "disabled");
    el.classList.add("is-disabled");
    el.style.opacity = "0.6";
    el.style.color = "#c0c4cc";
    el.style.cursor = "not-allowed";

    // 重要：记录无权限的命令值，用于全局拦截
    if (el.hasAttribute("command")) {
      const commandValue = el.getAttribute("command") || "";
      if (commandValue) {
        noPermissionCommands.add(commandValue);
        console.log(`已记录无权限命令: ${commandValue}`);
      }
    }
  } else {
    // 常规按钮禁用处理
    el.setAttribute("disabled", "disabled");
    el.classList.add("is-disabled");
    el.style.cursor = "not-allowed";
    el.style.opacity = "0.6";
    el.style.pointerEvents = "none"; // 阻止点击事件

    // 阻止点击事件
    el.addEventListener(
      "click",
      (e) => {
        e.stopPropagation();
        e.preventDefault();
      },
      true
    );
  }
}

/**
 * v-hasRole 角色权限处理
 */
export const hasRole: Directive = {
  async mounted(el: HTMLElement, binding: DirectiveBinding) {
    try {
      const userStore = useUserStore();

      // 检查userStore.user是否存在
      if (!userStore || !userStore.roleList) {
        console.warn("用户角色未加载或不存在");
        el.parentNode && el.parentNode.removeChild(el);
        return;
      }

      const { value } = binding;
      if (value) {
        const requiredRoles = value;
        const hasRole = userStore.roleList.some((role) => {
          return requiredRoles.includes(role);
        });

        if (!hasRole) {
          el.parentNode && el.parentNode.removeChild(el);
        }
      } else {
        throw new Error("need roles! Like v-has-role=\"['admin','test']\"");
      }
    } catch (error) {
      console.error("角色检查出错:", error);
      el.parentNode && el.parentNode.removeChild(el);
    }
  },
};

// 为Window添加自定义属性声明
declare global {
  interface Window {
    // Element Plus可能在window上挂载的事件处理函数
    handleMenuItemClick?: (command: any, instance: any) => void;
    // Element Plus可能使用的事件总线
    eventBus?: any;
  }
}

/**
 * 安装全局命令拦截器
 */
export function setupPermissionInterceptor(app: App) {
  // 安装全局click事件拦截
  document.addEventListener(
    "click",
    (e) => {
      // 查找被点击的下拉菜单项
      const clickedElement = e.target as HTMLElement;
      let dropdownItem = clickedElement;

      // 向上找到第一个el-dropdown-item元素
      while (
        dropdownItem &&
        !dropdownItem.classList.contains("el-dropdown-item") &&
        dropdownItem !== document.body
      ) {
        dropdownItem = dropdownItem.parentElement as HTMLElement;
      }

      // 如果找到了下拉菜单项
      if (dropdownItem && dropdownItem.classList.contains("el-dropdown-item")) {
        const command = dropdownItem.getAttribute("command");

        // 检查是否是无权限命令
        if (command && noPermissionCommands.has(command)) {
          console.log(`拦截无权限命令: ${command}`);
          e.stopPropagation();
          e.preventDefault();
          return false;
        }
      }
    },
    true
  );

  // 尝试拦截Element Plus的下拉菜单点击事件
  if (typeof window.handleMenuItemClick === "function") {
    const originalHandleMenuItemClick = window.handleMenuItemClick;
    window.handleMenuItemClick = function (command: any, instance: any) {
      if (noPermissionCommands.has(command)) {
        console.log(`阻止执行命令: ${command}`);
        return false;
      }
      return originalHandleMenuItemClick(command, instance);
    };
  }

  // 监听自定义事件 - Element Plus可能使用
  setTimeout(() => {
    // 定位所有下拉菜单项
    document.querySelectorAll(".el-dropdown-item").forEach((item) => {
      // 为所有下拉菜单项添加点击拦截
      item.addEventListener(
        "click",
        (e) => {
          const el = e.currentTarget as HTMLElement;
          const command = el.getAttribute("command");
          if (command && noPermissionCommands.has(command)) {
            console.log(`通过DOM点击拦截命令: ${command}`);
            e.stopPropagation();
            e.preventDefault();
            return false;
          }
        },
        true
      );
    });
  }, 500); // 给页面加载一些时间
}
