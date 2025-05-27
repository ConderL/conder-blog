import { Store } from 'pinia';

/**
 * App Store
 */
export interface AppState {
  sideFlag: boolean;
  isCollapse: boolean;
  theme: string;
  menuFlag: boolean;
  searchFlag: boolean;
  loginDialogVisible: boolean;
}

export interface AppActions {
  toggleSideFlag(): void;
  toggleSidebar(): void;
  toggleCollapse(): void;
  switchTheme(theme: string): void;
  setLoginFlag(value: boolean): void;
}

/**
 * Blog Store
 */
export interface BlogInfo {
  articleCount: number;
  categoryCount: number;
  tagCount: number;
  viewCount: number;
  commentCount: number;
  userCount: number;
  siteConfig: {
    siteName: string;
    siteAuthor: string;
    siteIntro: string;
    siteUrl: string;
    siteAvatar: string;
    siteNotice: string;
    createSiteTime: string;
    touristAvatar: string;
    commentCheck: boolean;
    recordNumber: string;
  };
  [key: string]: any;
}

export interface BlogActions {
  setBlogInfo(blogInfo: BlogInfo): void;
  getBlogInfo?(): Promise<void>;
}

/**
 * User Store
 */
export interface UserState {
  token: string;
  userInfo: {
    id: string | number;
    nickname: string;
    username: string;
    avatar: string;
    email: string;
    [key: string]: any;
  };
  isLogin: boolean;
  articleLikeSet?: number[];
  commentLikeSet?: number[];
  talkLikeSet?: number[];
}

export interface UserActions {
  setToken(token: string): void;
  setUserInfo(info: any): void;
  logout(): void;
  LogOut?(): void;
}

// 这里改为声明类型，不再导出具体的store实例
declare module '../stores/app' {
  const useAppStore: () => Store<'app', AppState, {}, AppActions>;
  export { useAppStore };
}

declare module '../stores/blog' {
  const useBlogStore: () => Store<'blog', BlogInfo, {}, BlogActions>;
  export { useBlogStore };
}

declare module '../stores/user' {
  const useUserStore: () => Store<'user', UserState, {}, UserActions>;
  export { useUserStore };
}

// 支持从~/stores路径导入
declare module '~/stores' {
  export { useAppStore } from '../stores/app';
  export { useBlogStore } from '../stores/blog';
  export { useUserStore } from '../stores/user';
} 