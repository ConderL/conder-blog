import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

// 博客站点配置类型定义
interface SiteConfig {
  siteAuthor: string;
  siteAvatar: string;
  siteName: string;
  siteIntro: string;
  siteNotice: string;
  createSiteTime: string;
  recordNumber: string;
  commentCheck: boolean;
  touristAvatar: string;
}

// 博客信息类型定义
interface BlogInfo {
  articleCount: number;
  categoryCount: number;
  tagCount: number;
  viewCount: number;
  siteConfig: SiteConfig;
}

export const useBlogStore = defineStore('blog', () => {
  // 博客信息状态
  const blogInfo = ref<BlogInfo>({
    articleCount: 0,
    categoryCount: 0,
    tagCount: 0,
    viewCount: 0,
    siteConfig: {
      siteAuthor: 'Conder',
      siteAvatar: '',
      siteName: '技术博客',
      siteIntro: '记录学习与成长',
      siteNotice: '欢迎来到我的博客',
      createSiteTime: '2024-01-01',
      recordNumber: '粤ICP备XXXXXXXX号',
      commentCheck: false,
      touristAvatar: '/images/default-avatar.png'
    }
  });

  // 更新博客信息
  function setBlogInfo(info: BlogInfo) {
    blogInfo.value = info;
  }

  return {
    blogInfo,
    setBlogInfo
  };
}); 