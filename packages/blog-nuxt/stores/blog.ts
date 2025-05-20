import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getSafeStorage } from '~/utils/storage';

export interface BlogInfo {
  articleCount: number;
  categoryCount: number;
  tagCount: number;
  viewCount: number;
  commentCount: number;
  userCount: number;
  siteConfig: {
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
  };
  [key: string]: any;
}

// 使用不同的函数名以避免重复声明
export const blogStore = defineStore('blog', () => {
  // 使用空对象初始化，与blog-web保持一致
  const blogInfo = ref<BlogInfo>({
    siteConfig: {}
  } as BlogInfo);

  function setBlogInfo(data: BlogInfo) {
    blogInfo.value = data;
  }

  return {
    blogInfo,
    setBlogInfo
  };
}, {
  persist: {
    key: 'blog-store',
    storage: getSafeStorage()
  }
}); 