<template>
  <div class="app-container">
    <el-tabs type="border-card" class="demo-tabs">
      <!-- 网站信息 -->
      <el-tab-pane>
        <template #label>
          <span class="custom-tabs-label">
            <el-icon>
              <Platform />
            </el-icon>
            <span>网站信息</span>
          </span>
        </template>
        <el-form
          label-width="80px"
          :model="siteConfig"
          label-position="left"
          v-hasPerm="['web:site:update']"
        >
          <el-row>
            <el-col :md="6">
              <el-form-item label="用户头像">
                <el-upload
                  class="avatar-uploader"
                  :headers="authorization"
                  :action="baseURL + '/admin/site/upload'"
                  :show-file-list="false"
                  accept="image/*"
                  :on-success="handleUserAvatarSuccess"
                >
                  <img
                    v-if="siteConfig.userAvatar"
                    :src="siteConfig.userAvatar"
                    class="avatar"
                  />
                  <el-icon v-else class="avatar-uploader-icon">
                    <Plus />
                  </el-icon>
                </el-upload>
              </el-form-item>
            </el-col>
            <el-col :md="6">
              <el-form-item label="游客头像">
                <el-upload
                  class="avatar-uploader"
                  :headers="authorization"
                  :action="baseURL + '/admin/site/upload'"
                  :show-file-list="false"
                  accept="image/*"
                  :on-success="handleTouristAvatarSuccess"
                >
                  <img
                    v-if="siteConfig.touristAvatar"
                    :src="siteConfig.touristAvatar"
                    class="avatar"
                  />
                  <el-icon v-else class="avatar-uploader-icon">
                    <Plus />
                  </el-icon>
                </el-upload>
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="网站名称">
            <el-input
              v-model="siteConfig.siteName"
              style="width: 400px"
            ></el-input>
          </el-form-item>
          <el-form-item label="网站地址">
            <el-input
              v-model="siteConfig.siteAddress"
              style="width: 400px"
            ></el-input>
          </el-form-item>
          <el-form-item label="网站简介">
            <el-input
              v-model="siteConfig.siteIntro"
              style="width: 400px"
            ></el-input>
          </el-form-item>
          <el-form-item label="网站公告">
            <el-input
              style="width: 400px"
              v-model="siteConfig.siteNotice"
              :autosize="{ minRows: 4, maxRows: 5 }"
              resize="none"
              type="textarea"
            ></el-input>
          </el-form-item>
          <el-form-item label="建站日期">
            <el-date-picker
              v-model="siteConfig.createSiteTime"
              value-format="YYYY-MM-DD"
              type="date"
              placeholder="选择日期"
            ></el-date-picker>
          </el-form-item>
          <el-form-item label="备案号">
            <el-input
              v-model="siteConfig.recordNumber"
              style="width: 400px"
            ></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleUpdate">保 存</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>
      <!-- 作者信息 -->
      <el-tab-pane label="author">
        <template #label>
          <span class="custom-tabs-label">
            <el-icon>
              <Flag />
            </el-icon>
            <span>作者信息</span>
          </span>
        </template>
        <el-form
          label-width="80px"
          :model="siteConfig"
          label-position="left"
          v-hasPerm="['web:site:update']"
        >
          <el-form-item label="作者头像">
            <el-upload
              class="avatar-uploader"
              :headers="authorization"
              :action="baseURL + '/admin/site/upload'"
              :show-file-list="false"
              accept="image/*"
              :on-success="handleAuthorAvatarSuccess"
            >
              <img
                v-if="siteConfig.authorAvatar"
                :src="siteConfig.authorAvatar"
                class="avatar"
              />
              <el-icon v-else class="avatar-uploader-icon">
                <Plus />
              </el-icon>
            </el-upload>
          </el-form-item>
          <el-form-item label="网站作者">
            <el-input
              v-model="siteConfig.siteAuthor"
              style="width: 400px"
            ></el-input>
          </el-form-item>
          <el-form-item label="关于我">
            <MdEditor
              ref="editorRef"
              v-model="siteConfig.aboutMe"
              :theme="isDark ? 'dark' : 'light'"
              showCodeRowNumber
              autoDetectCode
              class="md-container"
              :toolbars="toolbars"
              :footers="footers"
              @on-upload-img="uploadImg"
              placeholder="请输入内容..."
              height="400px"
            >
              <template #defToolbars>
                <Mark> </Mark>
                <Emoji :emojis="emojis" />
              </template>
              <template #defFooters>
                <TimeNow />
              </template>
            </MdEditor>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleUpdate">保 存</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>
      <!-- 社交信息 -->
      <el-tab-pane label="social">
        <template #label>
          <span class="custom-tabs-label">
            <el-icon>
              <Opportunity />
            </el-icon>
            <span>社交信息</span>
          </span>
        </template>
        <el-form
          label-width="70px"
          :model="siteConfig"
          label-position="left"
          v-hasPerm="['web:site:update']"
        >
          <el-checkbox-group v-model="socialList">
            <el-form-item label="Github">
              <el-input
                v-model="siteConfig.github"
                style="width: 400px; margin-right: 1rem"
              ></el-input>
              <el-checkbox value="github">是否展示</el-checkbox>
            </el-form-item>
            <el-form-item label="Gitee">
              <el-input
                v-model="siteConfig.gitee"
                style="width: 400px; margin-right: 1rem"
              ></el-input>
              <el-checkbox value="gitee">是否展示</el-checkbox>
            </el-form-item>
            <el-form-item label="BiliBili">
              <el-input
                v-model="siteConfig.bilibili"
                style="width: 400px; margin-right: 1rem"
              ></el-input>
              <el-checkbox value="bilibili">是否展示</el-checkbox>
            </el-form-item>
            <el-form-item label="QQ">
              <el-input
                v-model="siteConfig.qq"
                style="width: 400px; margin-right: 1rem"
              ></el-input>
              <el-checkbox value="qq">是否展示</el-checkbox>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleUpdate">保 存</el-button>
            </el-form-item>
          </el-checkbox-group>
        </el-form>
      </el-tab-pane>
      <!-- 审核&打赏 -->
      <el-tab-pane label="check">
        <template #label>
          <span class="custom-tabs-label">
            <el-icon>
              <Stamp />
            </el-icon>
            <span>审核&打赏</span>
          </span>
        </template>
        <el-form
          label-width="100px"
          :model="siteConfig"
          label-position="left"
          v-hasPerm="['web:site:update']"
        >
          <el-form-item label="评论审核">
            <el-radio-group
              v-model="siteConfig.commentCheck"
              @change="handleCommentCheckChange"
            >
              <el-radio :label="0">关闭</el-radio>
              <el-radio :label="1">开启</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="留言审核">
            <el-radio-group
              v-model="siteConfig.messageCheck"
              @change="handleMessageCheckChange"
            >
              <el-radio :label="0">关闭</el-radio>
              <el-radio :label="1">开启</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="百度审核">
            <el-radio-group
              v-model="siteConfig.baiduCheck"
              @change="handleBaiduCheckChange"
            >
              <el-radio :label="0">关闭</el-radio>
              <el-radio :label="1">开启</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="打赏状态">
            <el-radio-group v-model="siteConfig.isReward">
              <el-radio :label="0">关闭</el-radio>
              <el-radio :label="1">开启</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-row style="width: 600px" v-if="siteConfig.isReward == 1">
            <el-col :md="12">
              <el-form-item label="微信收款码">
                <el-upload
                  class="avatar-uploader"
                  :headers="authorization"
                  :action="baseURL + '/admin/site/upload'"
                  :show-file-list="false"
                  accept="image/*"
                  :on-success="handleWeiXinSuccess"
                >
                  <img
                    v-if="siteConfig.weiXinCode"
                    :src="siteConfig.weiXinCode"
                    class="avatar"
                  />
                  <el-icon v-else class="avatar-uploader-icon">
                    <Plus />
                  </el-icon>
                </el-upload>
              </el-form-item>
            </el-col>
            <el-col :md="12">
              <el-form-item label="支付宝收款码">
                <el-upload
                  class="avatar-uploader"
                  :headers="authorization"
                  :action="baseURL + '/admin/site/upload'"
                  :show-file-list="false"
                  accept="image/*"
                  :on-success="handleAliSuccess"
                >
                  <img
                    v-if="siteConfig.aliCode"
                    :src="siteConfig.aliCode"
                    class="avatar"
                  />
                  <el-icon v-else class="avatar-uploader-icon">
                    <Plus />
                  </el-icon>
                </el-upload>
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item>
            <el-button type="primary" @click="handleUpdate">保 存</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>
      <!-- 壁纸设置 -->
      <el-tab-pane label="other">
        <template #label>
          <span class="custom-tabs-label">
            <el-icon>
              <Picture />
            </el-icon>
            <span>壁纸设置</span>
          </span>
        </template>
        <el-form
          label-width="120px"
          :model="siteConfig"
          label-position="left"
          v-hasPerm="['web:site:update']"
        >
          <el-row>
            <el-col :span="8">
              <el-form-item label="归档">
                <el-upload
                  class="avatar-uploader"
                  :headers="authorization"
                  :action="baseURL + '/admin/site/upload'"
                  :show-file-list="false"
                  accept="image/*"
                  :on-success="handleArchiveSuccess"
                >
                  <img
                    v-if="siteConfig.archiveWallpaper"
                    :src="siteConfig.archiveWallpaper"
                    class="article-cover"
                  />
                  <el-icon v-else class="avatar-uploader-icon">
                    <Plus />
                  </el-icon>
                </el-upload>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="分类">
                <el-upload
                  class="avatar-uploader"
                  :headers="authorization"
                  :action="baseURL + '/admin/site/upload'"
                  :show-file-list="false"
                  accept="image/*"
                  :on-success="handleCategorySuccess"
                >
                  <img
                    v-if="siteConfig.categoryWallpaper"
                    :src="siteConfig.categoryWallpaper"
                    class="article-cover"
                  />
                  <el-icon v-else class="avatar-uploader-icon">
                    <Plus />
                  </el-icon>
                </el-upload>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="标签">
                <el-upload
                  class="avatar-uploader"
                  :headers="authorization"
                  :action="baseURL + '/admin/site/upload'"
                  :show-file-list="false"
                  accept="image/*"
                  :on-success="handleTagSuccess"
                >
                  <img
                    v-if="siteConfig.tagWallpaper"
                    :src="siteConfig.tagWallpaper"
                    class="article-cover"
                  />
                  <el-icon v-else class="avatar-uploader-icon">
                    <Plus />
                  </el-icon>
                </el-upload>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="8">
              <el-form-item label="说说">
                <el-upload
                  class="avatar-uploader"
                  :headers="authorization"
                  :action="baseURL + '/admin/site/upload'"
                  :show-file-list="false"
                  accept="image/*"
                  :on-success="handleTalkSuccess"
                >
                  <img
                    v-if="siteConfig.talkWallpaper"
                    :src="siteConfig.talkWallpaper"
                    class="article-cover"
                  />
                  <el-icon v-else class="avatar-uploader-icon">
                    <Plus />
                  </el-icon>
                </el-upload>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="相册&照片">
                <el-upload
                  class="avatar-uploader"
                  :headers="authorization"
                  :action="baseURL + '/admin/site/upload'"
                  :show-file-list="false"
                  accept="image/*"
                  :on-success="handleAlbumSuccess"
                >
                  <img
                    v-if="siteConfig.albumWallpaper"
                    :src="siteConfig.albumWallpaper"
                    class="article-cover"
                  />
                  <el-icon v-else class="avatar-uploader-icon">
                    <Plus />
                  </el-icon>
                </el-upload>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="追番">
                <el-upload
                  class="avatar-uploader"
                  :headers="authorization"
                  :action="baseURL + '/admin/site/upload'"
                  :show-file-list="false"
                  accept="image/*"
                  :on-success="handleAnimeSuccess"
                >
                  <img
                    v-if="siteConfig.animeWallpaper"
                    :src="siteConfig.animeWallpaper"
                    class="article-cover"
                  />
                  <el-icon v-else class="avatar-uploader-icon">
                    <Plus />
                  </el-icon>
                </el-upload>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="8">
              <el-form-item label="友链">
                <el-upload
                  class="avatar-uploader"
                  :headers="authorization"
                  :action="baseURL + '/admin/site/upload'"
                  :show-file-list="false"
                  accept="image/*"
                  :on-success="handleFriendSuccess"
                >
                  <img
                    v-if="siteConfig.friendWallpaper"
                    :src="siteConfig.friendWallpaper"
                    class="article-cover"
                  />
                  <el-icon v-else class="avatar-uploader-icon">
                    <Plus />
                  </el-icon>
                </el-upload>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="留言板">
                <el-upload
                  class="avatar-uploader"
                  :headers="authorization"
                  :action="baseURL + '/admin/site/upload'"
                  :show-file-list="false"
                  accept="image/*"
                  :on-success="handleMessageSuccess"
                >
                  <img
                    v-if="siteConfig.messageWallpaper"
                    :src="siteConfig.messageWallpaper"
                    class="article-cover"
                  />
                  <el-icon v-else class="avatar-uploader-icon">
                    <Plus />
                  </el-icon>
                </el-upload>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="关于">
                <el-upload
                  class="avatar-uploader"
                  :headers="authorization"
                  :action="baseURL + '/admin/site/upload'"
                  :show-file-list="false"
                  accept="image/*"
                  :on-success="handleAboutSuccess"
                >
                  <img
                    v-if="siteConfig.aboutWallpaper"
                    :src="siteConfig.aboutWallpaper"
                    class="article-cover"
                  />
                  <el-icon v-else class="avatar-uploader-icon">
                    <Plus />
                  </el-icon>
                </el-upload>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="20" />
            <el-col :span="4">
              <el-form-item>
                <el-button type="primary" @click="handleUpdate"
                  >保 存</el-button
                >
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-tab-pane>
      <!-- 其他设置 -->
      <el-tab-pane label="other">
        <template #label>
          <span class="custom-tabs-label">
            <el-icon>
              <Briefcase />
            </el-icon>
            <span>其他设置</span>
          </span>
        </template>
        <el-form
          label-width="120px"
          :model="siteConfig"
          label-position="left"
          v-hasPerm="['web:site:update']"
        >
          <el-form-item label="文章默认封面" class="article-cover-item">
            <el-upload
              class="avatar-uploader"
              :headers="authorization"
              :action="baseURL + '/admin/site/upload'"
              :show-file-list="false"
              accept="image/*"
              :on-success="handleArticleSuccess"
            >
              <img
                v-if="siteConfig.articleCover"
                :src="siteConfig.articleCover"
                class="article-cover"
              />
              <el-icon v-else class="avatar-uploader-icon">
                <Plus />
              </el-icon>
            </el-upload>
            <el-input v-model="siteConfig.articleCover" style="width: 400px" />
          </el-form-item>
          <el-form-item label="邮箱通知">
            <el-radio-group v-model="siteConfig.emailNotice">
              <el-radio :label="0">关闭</el-radio>
              <el-radio :label="1">开启</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="第三方登录">
            <el-checkbox-group v-model="loginList">
              <el-checkbox value="qq">QQ</el-checkbox>
              <el-checkbox value="gitee">Gitee</el-checkbox>
              <el-checkbox value="github">Github</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
          <el-form-item label="音乐播放器">
            <el-radio-group v-model="siteConfig.isMusic">
              <el-radio :label="0">关闭</el-radio>
              <el-radio :label="1">开启</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="网易云歌单Id" v-if="siteConfig.isMusic == 1">
            <el-input
              v-model="siteConfig.musicId"
              style="width: 400px"
            ></el-input>
          </el-form-item>
          <el-form-item label="聊天室">
            <el-radio-group v-model="siteConfig.isChat">
              <el-radio :label="0">关闭</el-radio>
              <el-radio :label="1">开启</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="websocket链接" v-if="siteConfig.isChat == 1">
            <el-input
              v-model="siteConfig.websocketUrl"
              style="width: 400px"
            ></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleUpdate">保 存</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { getSiteConfig, updateSiteConfig, uploadSiteImg } from "@/api/site";
import { SiteConfig } from "@/api/site/types";
import { notifySuccess } from "@/utils/modal";
import { getToken, token_prefix } from "@/utils/token";
import { getBaseURL } from "@/utils/request";
import { AxiosError, AxiosResponse } from "axios";
import { UploadRawFile } from "element-plus";
import * as imageConversion from "image-conversion";
import {
  computed,
  defineAsyncComponent,
  onMounted,
  reactive,
  toRefs,
} from "vue";
import TimeNow from "@/components/TimeNow/index.vue";
import { footers } from "@/utils/mdEditor/footers";
import "md-editor-v3/lib/style.css";
import "@vavt/v3-extension/lib/asset/style.css";
import { emojis } from "@/utils/mdEditor/emojis";
import { toolbars } from "@/utils/mdEditor/toolbars";
import { useDark } from "@vueuse/core";

// 使用异步组件加载编辑器和扩展
const MdEditor = defineAsyncComponent(() =>
  import("md-editor-v3").then((m) => {
    return { default: m.MdEditor };
  })
);

// 异步加载扩展
const vExtensions = import("@vavt/v3-extension").then((module) => {
  return {
    Emoji: module.Emoji,
    Mark: module.Mark,
  };
});

const isDark = useDark();
const authorization = computed(() => {
  return {
    Authorization: token_prefix + getToken(),
  };
});
const data = reactive({
  siteConfig: {} as SiteConfig,
  socialList: [] as string[],
  loginList: [] as string[],
});
const { siteConfig, socialList, loginList } = toRefs(data);

const baseURL = getBaseURL();

const uploadImg = async (
  files: Array<File>,
  callback: (urls: string[]) => void
) => {
  const res = await Promise.all(
    files.map((file) => {
      return new Promise((rev, rej) => {
        const form = new FormData();
        form.append("file", file);
        uploadSiteImg(form)
          .then(({ data }) => {
            if (data.flag) {
              rev(data);
            }
          })
          .catch((error: AxiosError) => rej(error));
      });
    })
  );
  callback(res.map((item: any) => item.data));
};
const handleUserAvatarSuccess = (response: AxiosResponse) => {
  console.log(response.data);
  siteConfig.value.userAvatar = response.data;
};
const handleTouristAvatarSuccess = (response: AxiosResponse) => {
  siteConfig.value.touristAvatar = response.data;
};
const handleAuthorAvatarSuccess = (response: AxiosResponse) => {
  siteConfig.value.authorAvatar = response.data;
};
const handleWeiXinSuccess = (response: AxiosResponse) => {
  siteConfig.value.weiXinCode = response.data;
};
const handleAliSuccess = (response: AxiosResponse) => {
  siteConfig.value.aliCode = response.data;
};
const handleArticleSuccess = (response: AxiosResponse) => {
  siteConfig.value.articleCover = response.data;
};
const handleArchiveSuccess = (response: AxiosResponse) => {
  siteConfig.value.archiveWallpaper = response.data;
};
const handleCategorySuccess = (response: AxiosResponse) => {
  siteConfig.value.categoryWallpaper = response.data;
};
const handleTagSuccess = (response: AxiosResponse) => {
  siteConfig.value.tagWallpaper = response.data;
};
const handleTalkSuccess = (response: AxiosResponse) => {
  siteConfig.value.talkWallpaper = response.data;
};
const handleAlbumSuccess = (response: AxiosResponse) => {
  siteConfig.value.albumWallpaper = response.data;
};
const handleAnimeSuccess = (response: AxiosResponse) => {
  siteConfig.value.animeWallpaper = response.data;
};
const handleFriendSuccess = (response: AxiosResponse) => {
  siteConfig.value.friendWallpaper = response.data;
};
const handleMessageSuccess = (response: AxiosResponse) => {
  siteConfig.value.messageWallpaper = response.data;
};
const handleAboutSuccess = (response: AxiosResponse) => {
  siteConfig.value.aboutWallpaper = response.data;
};
const handleUpdate = () => {
  if (loginList.value.length > 0) {
    siteConfig.value.loginList = loginList.value.toString();
  } else {
    siteConfig.value.loginList = "";
  }
  if (socialList.value.length > 0) {
    siteConfig.value.socialList = socialList.value.toString();
  } else {
    siteConfig.value.socialList = "";
  }
  updateSiteConfig({ ...siteConfig.value }).then(({ data }) => {
    if (data.flag) {
      notifySuccess(data.msg);
      getList();
    }
  });
};
const getList = () => {
  getSiteConfig().then(({ data }) => {
    siteConfig.value = data.data;
    socialList.value = data.data.socialList.split(",");
    loginList.value = data.data.loginList.split(",");
  });
};
const handleCommentCheckChange = (value: number) => {
  if (value === 1) {
    // 如果开启评论审核，则关闭百度审核
    siteConfig.value.baiduCheck = 0;
  }
};
const handleMessageCheckChange = (value: number) => {
  if (value === 1) {
    // 如果开启留言审核，则关闭百度审核
    siteConfig.value.baiduCheck = 0;
  }
};
const handleBaiduCheckChange = (value: number) => {
  if (value === 1) {
    // 如果开启百度审核，则关闭评论审核和留言审核
    siteConfig.value.commentCheck = 0;
    siteConfig.value.messageCheck = 0;
  }
};
onMounted(() => {
  getList();
});
</script>

<style scoped>
.demo-tabs > .el-tabs__content {
  padding: 32px;
  color: #6b778c;
  font-size: 32px;
  font-weight: 600;
}

.demo-tabs .custom-tabs-label .el-icon {
  vertical-align: middle;
}

.demo-tabs .custom-tabs-label span {
  vertical-align: middle;
  margin-left: 4px;
}

.avatar-uploader .avatar {
  width: 120px;
  height: 120px;
  object-fit: contain;
}

.article-cover {
  width: 300px;
}

.article-cover-item :deep(.el-form-item__content) {
  flex-direction: column;
  align-items: flex-start;
}

.article-cover-item :deep(.el-input) {
  margin-top: 10px;
}
</style>
