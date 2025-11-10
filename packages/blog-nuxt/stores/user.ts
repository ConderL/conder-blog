import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getSafeStorage, useStorage } from '~/utils/storage';
import { useToken } from '~/composables/useToken';
import { useApi } from '~/composables/useApi';

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
  const { token, getToken, removeToken, setToken } = useToken();

  const userInfo = ref<UserInfo>({} as UserInfo);
  const isLogin = ref(false);
  const articleLikeSet = ref<number[]>([]);
  const animeCollectionSet = ref<number[]>([]);
  const commentLikeSet = ref<number[]>([]);
  const talkLikeSet = ref<number[]>([]);
  const id = ref(0);
  const nickname = ref('');
  const avatar = ref('');
  const intro = ref('');
  const webSite = ref('');
  const email = ref('');

  function setUserInfo(info: UserInfo) {
    userInfo.value = info;
    isLogin.value = true;
    id.value = parseInt(info.id) || 0;
    nickname.value = info.nickname || '';
    avatar.value = info.avatar || '';
    intro.value = info.intro || '';
    webSite.value = info.webSite || '';
    email.value = info.email || '';
    articleLikeSet.value = info.articleLikeSet || [];
    commentLikeSet.value = info.commentLikeSet || [];
    talkLikeSet.value = info.talkLikeSet || [];
    animeCollectionSet.value = info.animeCollectionSet || [];
  }

  function logout() {
    userInfo.value = {} as UserInfo;
    isLogin.value = false;
    id.value = 0;
    nickname.value = '';
    avatar.value = '';
    intro.value = '';
    webSite.value = '';
    email.value = '';
    articleLikeSet.value = [];
    commentLikeSet.value = [];
    talkLikeSet.value = [];
    animeCollectionSet.value = [];
    removeToken();
  }

  // 强制登出，用于token失效等情况
  function forceLogOut() {
    logout();
  }

  // 更新用户信息
  function updateUserInfo(info: any) {
    nickname.value = info.nickname || nickname.value;
    intro.value = info.intro || intro.value;
    webSite.value = info.webSite || webSite.value;

    // 更新userInfo
    userInfo.value = {
      ...userInfo.value,
      nickname: nickname.value,
      intro: intro.value,
      webSite: webSite.value
    };
  }

  // 获取用户信息
  async function fetchUserInfo() {

    if (!token.value) {
      console.log('没有token，无法获取用户信息');
      return;
    }

    try {
      const { login: loginApi } = useApi();
      const response = await loginApi.getUserInfo();

      if (response?.flag && response.data) {
        setUserInfo(response.data);
        console.log('用户信息设置成功');
        return;
      }

      // 未登录或响应异常时保持游客状态，不弹窗
      if (response?.code === 401 || response?.code === 402) {
        console.log('用户未登录或授权已过期');
        logout();
        return;
      }

      if (response?.flag === false) {
        console.warn('获取用户信息失败:', response?.msg);
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

  // 添加动漫收藏方法
  function animeCollect(animeId: number) {
    const index = animeCollectionSet.value.indexOf(animeId);
    if (index !== -1) {
      animeCollectionSet.value.splice(index, 1);
    } else {
      animeCollectionSet.value.push(animeId);
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
    email,
    articleLikeSet,
    commentLikeSet,
    talkLikeSet,
    animeCollectionSet,
    setToken,
    setUserInfo,
    logout,
    forceLogOut,
    fetchUserInfo,
    updateUserInfo,
    articleLike,
    commentLike,
    talkLike,
    animeCollect
  };
}, {
  persist: {
    key: 'user-store',
    storage: getSafeStorage()
  }
}); 