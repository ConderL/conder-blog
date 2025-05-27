import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { getSafeStorage } from '~/utils/storage';

export interface SiteConfig {
    siteName?: string;
    siteAuthor?: string;
    siteIntro?: string;
    siteUrl?: string;
    siteAvatar?: string;
    siteNotice?: string;
    createSiteTime?: string;
    touristAvatar?: string;
    commentCheck?: boolean;
    recordNumber?: string;
    authorAvatar?: string;
    siteAddress?: string;
    weiXinCode?: string;
    aliCode?: string;
    isReward?: boolean;
    isEmailNotice?: boolean;
    isCommentReview?: boolean;
    isMessageReview?: boolean;
    socialUrlList?: any[];
    socialLoginList?: string;
    qq?: string;
    github?: string;
    gitee?: string;
    bilibili?: string;
    archiveWallpaper?: string;
    albumWallpaper?: string;
    friendWallpaper?: string;
    tagWallpaper?: string;
    talkWallpaper?: string;
}

export interface BlogInfo {
  articleCount: number;
  categoryCount: number;
  tagCount: number;
  viewCount: number;
  commentCount: number;
  userCount: number;
  siteConfig: SiteConfig;
  [key: string]: any;
}

// 创建一个默认的空博客信息对象，避免空引用
const defaultBlogInfo: BlogInfo = {
  articleCount: 0,
  categoryCount: 0,
  tagCount: 0,
  viewCount: 0,
  commentCount: 0,
  userCount: 0,
  siteConfig: {}
};

// 博客信息 Store
export const useBlogStore = defineStore('blog', () => {
  // 使用 ref 创建的状态
  const blogInfo = ref<BlogInfo>(defaultBlogInfo);
  
  // 获取博客信息
  const fetchBlogInfo = async () => {
    try {
      const { blogInfo: blogInfoApi } = useApi();
      const { data } = await blogInfoApi.getBlogInfo();
      const info = unref(data);
      
      if (info) {
        blogInfo.value = info;
        return true;
      }
      return false;
    } catch (error) {
      console.error('获取博客信息失败:', error);
      return false;
    }
  };
  
  // 站点信息
  const siteConfig = computed(() => blogInfo.value?.siteConfig || {});

  // 社交登录列表
  const loginList = computed(() => {
    const list = siteConfig.value?.socialLoginList?.split(',') || [];
    return list.filter(item => item);
  });

  return {
    blogInfo,
    siteConfig,
    loginList,
    fetchBlogInfo
  };
}, {
  persist: {
    key: 'blog-store',
    storage: getSafeStorage()
  }
}); 