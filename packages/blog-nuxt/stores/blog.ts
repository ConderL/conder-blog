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
    weiXinCode?: string;
    aliCode?: string;
    isReward?: boolean;
    isEmailNotice?: boolean;
    isCommentReview?: boolean;
    isMessageReview?: boolean;
    socialUrlList?: any[];
    qq?: string;
    github?: string;
    gitee?: string;
    bilibili?: string;
  };
  [key: string]: any;
}

// 使用不同的函数名以避免重复声明
export const useBlogStore = defineStore('blog', () => {
  // 使用空对象初始化，与blog-web保持一致
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
      qq: '',
      github: '',
      gitee: '',
      bilibili: ''
    }
  } as BlogInfo);

  // 添加侧边栏标志
  const sideFlag = ref(false);

  function setBlogInfo(data: BlogInfo) {
    blogInfo.value = data;
  }

  return {
    blogInfo,
    setBlogInfo,
    sideFlag
  };
}, {
  persist: {
    key: 'blog-store',
    storage: getSafeStorage()
  }
}); 