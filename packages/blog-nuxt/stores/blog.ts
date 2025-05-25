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

// 使用不同的函数名以避免重复声明
export const useBlogStore = defineStore('blog', () => {
  const blogInfo = ref<BlogInfo>({
    articleCount: 0,
    categoryCount: 0,
    tagCount: 0,
    viewCount: 0,
    commentCount: 0,
    userCount: 0,
    siteConfig: {
      siteName: '个人博客',
      siteAuthor: '@ConderL',
      siteIntro: '这是一个个人博客网站',
      siteNotice: '欢迎访问我的博客！',
      createSiteTime: '2023-01-01',
      siteAvatar: '',
      touristAvatar: '',
      weiXinCode: '',
      aliCode: '',
      isReward: true,
      isEmailNotice: true,
      isCommentReview: false,
      isMessageReview: false,
      socialUrlList: [],
      socialLoginList: 'qq,github,gitee',
      qq: '',
      github: '',
      gitee: '',
      bilibili: ''
    }
  });
  
  // 站点信息
  const siteConfig = computed(() => blogInfo.value?.siteConfig || {});

  // 社交登录列表
  const loginList = computed(() => {
    const list = siteConfig.value?.socialLoginList?.split(',') || [];
    return list.filter(item => item);
  });

  // 更新博客信息
  function setBlogInfo(info: BlogInfo) {
    blogInfo.value = info;
  }

  return {
    blogInfo,
    siteConfig,
    loginList,
    setBlogInfo,
  };
}, {
  persist: {
    key: 'blog-store',
    storage: getSafeStorage()
  }
}); 