import { RouteRecordRaw } from "vue-router";

export interface TagView {
  fullPath: string;
  path: string;
  name?: string;
  title?: string;
  icon?: string;
  keepAlive?: boolean;
  meta?: any;
  query?: any;
}

export interface AppState {
  device: string;
  sidebar: {
    opened: boolean;
    withoutAnimation: boolean;
  };
  size: string;
  isCollapse: boolean;
}

export interface SettingState {
  theme: string;
  showSettings: boolean;
  showTagsView: boolean;
  showSidebarLogo: boolean;
  fixedHeader: boolean;
  showNotify: boolean;
  showThemeSwitch: boolean;
  showScreenfull: boolean;
  showGreyMode: boolean;
  showColorWeakness: boolean;
  tagView: boolean;
  sidebarLogo: boolean;
}

export interface TagViewState {
  visitedViews: TagView[];
  cachedViews: string[];
}

export interface UserState {
  token: string;
  nickname: string;
  avatar: string;
  roles: string[];
  perms: string[];
  id: number | null;
  username: string;
  roleList: string[];
  permissionList: string[];
  permissions: string[];
  lockState: boolean;
}

export interface PermissionState {
  routes: RouteRecordRaw[];
  addRoutes: RouteRecordRaw[];
  cachedRoutes: Set<RouteRecordRaw>;
}
