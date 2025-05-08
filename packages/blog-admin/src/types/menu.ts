import { RouteRecordRaw } from "vue-router";

export type MenuItem = {
  path?: string;
  name?: string | symbol;
  alwaysShow?: boolean;
  meta?: {
    title?: string;
    icon?: string;
    hidden?: boolean;
    activeMenu?: string;
  };
  children?: MenuItem[];
  noShowingChildren?: boolean;
  component?: any;
  redirect?: string;
  strict?: boolean;
} & Partial<RouteRecordRaw>;
