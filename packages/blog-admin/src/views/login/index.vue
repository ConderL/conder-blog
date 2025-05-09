<template>
  <div class="login" :class="{ 'password-visible': showPassword }">
    <el-form ref="ruleFormRef" :model="loginForm" class="login-form">
      <h3 class="title">博客后台管理系统</h3>
      <el-form-item prop="username">
        <el-input
          v-model="loginForm.username"
          type="text"
          size="large"
          placeholder="账号"
          :rules="rules.username"
        >
          <template #prefix>
            <svg-icon icon-class="user"></svg-icon>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item prop="password">
        <el-input
          v-model="passwordRaw"
          :type="showPassword ? 'text' : 'password'"
          size="large"
          placeholder="密码"
          :rules="rules.password"
          @keyup.enter="handleLogin(ruleFormRef)"
        >
          <template #prefix>
            <svg-icon icon-class="password"></svg-icon>
          </template>
          <template #suffix>
            <el-icon
              class="password-icon"
              @click="showPassword = !showPassword"
            >
              <el-icon v-if="showPassword"><View /></el-icon>
              <el-icon v-else><Hide /></el-icon>
            </el-icon>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item prop="code">
        <el-input
          v-model="loginForm.code"
          type="text"
          size="large"
          placeholder="验证码"
          :rules="rules.code"
          @keyup.enter="handleLogin(ruleFormRef)"
          style="width: 63%"
        >
          <template #prefix>
            <svg-icon icon-class="key"></svg-icon>
          </template>
        </el-input>
        <div class="captcha-container">
          <el-image
            v-if="captcha"
            :src="captcha"
            class="login-code-img"
            @click="initCaptcha"
            loading="eager"
          >
            <template #placeholder>
              <div class="image-slot">
                <el-icon class="is-loading"><Loading /></el-icon>
                <span class="loading-text">加载中</span>
              </div>
            </template>
            <template #error>
              <div class="image-slot" @click="initCaptcha">
                <el-icon><RefreshRight /></el-icon>
                <span class="loading-text">点击刷新</span>
              </div>
            </template>
          </el-image>
          <div v-else class="image-slot" @click="initCaptcha">
            <el-icon class="is-loading"><Loading /></el-icon>
            <span class="loading-text">加载中</span>
          </div>
        </div>
      </el-form-item>
      <el-form-item>
        <el-button
          :loading="loading"
          type="primary"
          @click.prevent="handleLogin(ruleFormRef)"
          style="width: 100%"
        >
          <span v-if="!loading">登 录</span>
          <span v-else>登 录 中...</span>
        </el-button>
      </el-form-item>
    </el-form>
    <!--  底部  -->
    <div class="el-login-footer">
      <span>Copyright © 2022 - {{ new Date().getFullYear() }} By Conder</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import router from "@/router";
import { useUserStore } from "@/store/modules/user";
import { usePermissionStore } from "@/store/modules/permission";
import { ElNotification, FormInstance, FormRules } from "element-plus";
import { onMounted, reactive, ref } from "vue";
import { LoginForm } from "@/api/login/types";
import { debounce } from "@/utils/debounce";
import { getCaptcha } from "@/api/login";
import { encodeRSA } from "@/utils/secret";
import { Loading, RefreshRight, View, Hide } from "@element-plus/icons-vue";

const userStore = useUserStore();
const permissionStore = usePermissionStore();
const ruleFormRef = ref<FormInstance>();
const loading = ref(false);
const captcha = ref("");
const passwordRaw = ref("");
const captchaLoading = ref(false);
const showPassword = ref(false);

const loginForm = reactive<LoginForm>({
  username: "",
  password: "",
  code: "",
  captchaUUID: "",
  type: "ConderAdmin",
});
const rules = reactive<FormRules>({
  username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    {
      min: 3,
      message: "密码不能少于3位",
      trigger: "blur",
    },
  ],
  code: [{ required: true, message: "请输入验证码", trigger: "blur" }],
});

const handleLogin = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  try {
    const valid = await formEl.validate();
    if (valid) {
      loading.value = true;
      // 恢复密码加密
      const password = encodeRSA(passwordRaw.value);
      if (typeof password === "string") {
        loginForm.password = password;
      }
      try {
        // @ts-ignore 确保方法存在
        await userStore.LogIn(loginForm);
        console.log("登录成功");
        // 获取用户信息
        // @ts-ignore 确保方法存在
        await userStore.GetInfo();
        // 生成路由
        const accessRoutes = await permissionStore.generateRoutes();
        // 添加路由
        accessRoutes.forEach((route) => {
          router.addRoute(route);
        });
        // 跳转到主页
        router.push({ path: "/" });
        ElNotification({
          message: "登陆成功",
          type: "success",
          duration: 2 * 1000,
        });
      } catch (error) {
        console.error("登录失败:", error);
      } finally {
        loading.value = false;
      }
    }
  } catch (e) {
    return false;
  }
};
const initCaptcha = debounce(() => {
  captchaLoading.value = true;
  getCaptcha()
    .then(({ data }) => {
      if (data.flag) {
        const img = new Image();
        img.onload = () => {
          captcha.value =
            "data:image/svg+xml;charset=utf-8," +
            encodeURIComponent(data.data.captchaImg);
          captchaLoading.value = false;
        };
        img.onerror = () => {
          captchaLoading.value = false;
        };
        img.src =
          "data:image/svg+xml;charset=utf-8," +
          encodeURIComponent(data.data.captchaImg);
        loginForm.captchaUUID = data.data.captchaUuid;
      } else {
        captchaLoading.value = false;
      }
    })
    .catch(() => {
      captchaLoading.value = false;
    });
}, 500);
onMounted(() => {
  initCaptcha();
});
</script>
<style lang="scss" scoped>
.login {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  background-image: url("https://img.conder.top/config/bg-close-eyes");
  background-size: contain;
  transition: background-image 0.5s ease;

  &.password-visible {
    background-image: url("https://img.conder.top/config/bg-open-eyes");
  }
}

.title {
  margin: 0 auto 30px auto;
  text-align: center;
  color: #707070;
}

.login-form {
  border-radius: 6px;
  background: #ffffff;
  width: 400px;
  padding: 25px 25px 5px 25px;
}

.login-tip {
  font-size: 13px;
  text-align: center;
  color: #bfbfbf;
}

.el-login-footer {
  height: 40px;
  line-height: 40px;
  position: fixed;
  bottom: 0;
  width: 100%;
  text-align: center;
  color: #fff;
  font-family: Arial;
  font-size: 12px;
  letter-spacing: 1px;
}

.login-code-img {
  height: 38px;
  margin-left: 10px;
}

.captcha-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 128px;
  cursor: pointer;
}

.image-slot {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 38px;
  width: 100%;
  cursor: pointer;
}

.loading-text {
  margin-top: 5px;
  font-size: 12px;
  color: #909399;
}

.password-icon {
  cursor: pointer;
}
</style>
