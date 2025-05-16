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

// 使用不同的函数名以避免重复声明
export const blogStore = defineStore('blog', () => {
  // 确保默认值与客户端一致
  const blogInfo = ref<BlogInfo>({
    articleCount: 0,
    categoryCount: 0,
    tagCount: 0,
    viewCount: 0,
    commentCount: 0,
    userCount: 0,
    siteConfig: {
      siteName: '博客系统',
      siteAuthor: '博主',
      siteIntro: '这是一个基于Nuxt.js的博客网站',
      siteUrl: '',
      siteAvatar: '',
      siteNotice: '欢迎来到我的博客，这里记录了我的技术成长和生活点滴。',
      createSiteTime: '2023-01-01', 
      touristAvatar: 'https://picsum.photos/100',
      commentCheck: false,
      recordNumber: 'ICP备xxxxxxxx号'
    }
  });

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