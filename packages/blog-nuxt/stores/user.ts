import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getSafeStorage, useStorage } from '~/utils/storage';
import { getToken, removeToken, setToken as setTokenUtil } from '~/utils/token';

export interface UserInfo {
  id: string;
  username: string;
  nickname: string;
  avatar: string;
  email: string;
  role: string;
  [key: string]: any;
}

export const useUserStore = defineStore('user', () => {
  const token = ref('');
  const userInfo = ref<UserInfo>({} as UserInfo);
  const isLogin = ref(false);
  const articleLikeSet = ref<number[]>([]);
  const commentLikeSet = ref<number[]>([]);
  const talkLikeSet = ref<number[]>([]);
  const id = ref(0);
  const nickname = ref('');
  const avatar = ref('');
  const intro = ref('');
  const webSite = ref('');

  function setToken(newToken: string) {
    token.value = newToken;
    isLogin.value = !!newToken;
    setTokenUtil(newToken);
  }

  function setUserInfo(info: UserInfo) {
    userInfo.value = info;
    id.value = parseInt(info.id) || 0;
    nickname.value = info.nickname || '';
    avatar.value = info.avatar || '';
    intro.value = info.intro || '';
    webSite.value = info.webSite || '';
    articleLikeSet.value = info.articleLikeSet || [];
    commentLikeSet.value = info.commentLikeSet || [];
    talkLikeSet.value = info.talkLikeSet || [];
  }

  function logout() {
    token.value = '';
    userInfo.value = {} as UserInfo;
    isLogin.value = false;
    id.value = 0;
    nickname.value = '';
    avatar.value = '';
    intro.value = '';
    webSite.value = '';
    articleLikeSet.value = [];
    commentLikeSet.value = [];
    talkLikeSet.value = [];
    removeToken();
  }

  function loadToken() {
    const storedToken = getToken();
    if (storedToken) {
      setToken(storedToken);
    }
  }

  // 获取用户信息
  async function fetchUserInfo() {
    if (!token.value) return;
    
    try {
      const res = await getUserInfo();
      if (res.data.flag) {
        setUserInfo(res.data.data);
      } else {
        // 如果获取用户信息失败，可能是token已过期
        logout();
      }
    } catch (error) {
      console.error('获取用户信息失败', error);
      // 如果发生错误，也可能是token无效
      logout();
    }
  }

  // 更新文章点赞状态
  function articleLike(articleId: number) {
    const index = articleLikeSet.value.indexOf(articleId);
    if (index !== -1) {
      // 如果已存在，则移除
      articleLikeSet.value.splice(index, 1);
    } else {
      // 如果不存在，则添加
      articleLikeSet.value.push(articleId);
    }
  }
  
  // 更新评论点赞状态
  function commentLike(commentId: number) {
    const index = commentLikeSet.value.indexOf(commentId);
    if (index !== -1) {
      commentLikeSet.value.splice(index, 1);
    } else {
      commentLikeSet.value.push(commentId);
    }
  }
  
  // 更新说说点赞状态
  function talkLike(talkId: number) {
    const index = talkLikeSet.value.indexOf(talkId);
    if (index !== -1) {
      talkLikeSet.value.splice(index, 1);
    } else {
      talkLikeSet.value.push(talkId);
    }
  }

  return {
    token,
    userInfo,
    isLogin,
    id,
    nickname,
    avatar,
    intro,
    webSite,
    articleLikeSet,
    commentLikeSet,
    talkLikeSet,
    setToken,
    setUserInfo,
    logout,
    loadToken,
    fetchUserInfo,
    articleLike,
    commentLike,
    talkLike
  };
}, {
  persist: {
    key: 'user-store',
    storage: getSafeStorage()
  }
}); 