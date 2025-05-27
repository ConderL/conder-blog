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
  const commentLikeSet = ref<number[]>([]);
  const talkLikeSet = ref<number[]>([]);
  const id = ref(0);
  const nickname = ref('');
  const avatar = ref('');
  const intro = ref('');
  const webSite = ref('');

  function setUserInfo(info: UserInfo) {
    userInfo.value = info;
    isLogin.value = true;
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

  // 获取用户信息
  async function fetchUserInfo() {

    if (!token.value) {
      console.log('没有token，无法获取用户信息');
      return;
    }
    
    try {
      const { login: loginApi } = useApi();
      const { data } = await loginApi.getUserInfo();

      console.log('获取用户信息结果:', data);

      if (data) {
        setUserInfo(data);
        console.log('用户信息设置成功');
      } else {
        // 如果获取用户信息失败，可能是token已过期
        console.log('获取用户信息失败，执行登出');
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