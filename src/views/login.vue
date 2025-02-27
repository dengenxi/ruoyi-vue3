<template>
  <div class="login">
    <div class="login-container">
      <!-- 登录表单卡片 -->
      <div class="login-box">
        <div class="login-header">
          <div class="logo">
            <img src="@/assets/logo/logo.png" alt="Logo" />
          </div>
          <h2>管理系统</h2>
          <p>欢迎回来，请登录您的账号</p>
        </div>

        <el-form
          ref="loginRef"
          :model="loginForm"
          :rules="loginRules"
          class="login-form"
        >
          <el-form-item prop="username">
            <el-input
              v-model="loginForm.username"
              placeholder="请输入账号"
              size="large"
            >
              <template #prefix>
                <svg-icon icon-class="user" class="input-icon" />
              </template>
            </el-input>
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="请输入密码"
              size="large"
              @keyup.enter="handleLogin"
            >
              <template #prefix>
                <svg-icon icon-class="password" class="input-icon" />
              </template>
              <template #suffix>
                <svg-icon
                  :icon-class="showPassword ? 'eye-open' : 'eye'"
                  class="cursor-pointer eye-icon"
                  @click="showPassword = !showPassword"
                />
              </template>
            </el-input>
          </el-form-item>

          <Verify
            v-if="captchaEnabled"
            ref="verify"
            @success="capctchaCheckSuccess"
            mode="pop"
            captchaType="blockPuzzle"
            :imgSize="{ width: '330px', height: '155px' }"
          />

          <el-checkbox v-model="loginForm.rememberMe" class="remember-me">
            记住密码
          </el-checkbox>

          <el-button
            :loading="loading"
            type="primary"
            class="login-button"
            @click.prevent="handleLogin"
          >
            {{ loading ? "登录中..." : "登 录" }}
          </el-button>
        </el-form>
      </div>

      <div class="copyright">
        Copyright © 2018-2023 ruoyi.vip All Rights Reserved.
      </div>
    </div>
  </div>
</template>

<script setup>
import Cookies from "js-cookie";
import { encrypt, decrypt } from "@/utils/jsencrypt";
import useUserStore from "@/store/modules/user";
import Verify from "@/components/Verifition/Verify";
import { isCaptchaEnabled } from "@/api/login";

const userStore = useUserStore();
const route = useRoute();
const router = useRouter();
const { proxy } = getCurrentInstance();

const loginForm = ref({
  username: "admin",
  password: "admin123",
  rememberMe: false,
  code: "",
});

const loginRules = {
  username: [{ required: true, trigger: "blur", message: "请输入您的账号" }],
  password: [{ required: true, trigger: "blur", message: "请输入您的密码" }],
};

const loading = ref(false);
// 验证码开关
const captchaEnabled = ref(true);
// 注册开关
const register = ref(false);
const redirect = ref(undefined);
const showPassword = ref(false);

watch(
  route,
  (newRoute) => {
    redirect.value = newRoute.query && newRoute.query.redirect;
  },
  { immediate: true }
);

function userRouteLogin() {
  // 调用action的登录方法
  userStore
    .login(loginForm.value)
    .then(() => {
      const query = route.query;
      const otherQueryParams = Object.keys(query).reduce((acc, cur) => {
        if (cur !== "redirect") {
          acc[cur] = query[cur];
        }
        return acc;
      }, {});
      router.push({ path: redirect.value || "/", query: otherQueryParams });
    })
    .catch(() => {
      loading.value = false;
    });
}

function handleLogin() {
  proxy.$refs.loginRef.validate((valid) => {
    if (valid && captchaEnabled.value) {
      proxy.$refs.verify.show();
    } else if (valid && !captchaEnabled.value) {
      userRouteLogin();
    }
  });
}

function getCookie() {
  const username = Cookies.get("username");
  const password = Cookies.get("password");
  const rememberMe = Cookies.get("rememberMe");
  loginForm.value = {
    username: username === undefined ? loginForm.value.username : username,
    password:
      password === undefined ? loginForm.value.password : decrypt(password),
    rememberMe: rememberMe === undefined ? false : Boolean(rememberMe),
  };
}

function capctchaCheckSuccess(params) {
  loginForm.value.code = params.captchaVerification;
  loading.value = true;
  // 勾选了需要记住密码设置在 cookie 中设置记住用户名和密码
  if (loginForm.value.rememberMe) {
    Cookies.set("username", loginForm.value.username, { expires: 30 });
    Cookies.set("password", encrypt(loginForm.value.password), { expires: 30 });
    Cookies.set("rememberMe", loginForm.value.rememberMe, { expires: 30 });
  } else {
    // 否则移除
    Cookies.remove("username");
    Cookies.remove("password");
    Cookies.remove("rememberMe");
  }
  userRouteLogin();
}

// 获取验证码开关
function getCaptchaEnabled() {
  isCaptchaEnabled().then((res) => {
    captchaEnabled.value =
      res.captchaEnabled === undefined ? true : res.captchaEnabled;
  });
}

getCookie();
getCaptchaEnabled();
</script>

<style lang="scss" scoped>
.login {
  min-height: 100vh;
  background: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;

  .login-container {
    width: 100%;
    min-height: 100vh;
    padding: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
  }

  .login-box {
    width: 400px;
    background: #fff;
    border-radius: 20px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05),
      0 10px 15px -3px rgba(0, 0, 0, 0.1);
    padding: 40px;
    margin: auto;

    .login-header {
      text-align: center;
      margin-bottom: 40px;

      .logo {
        width: 64px;
        height: 64px;
        margin: 0 auto 20px;
        padding: 12px;
        background: #f0f2f5;
        border-radius: 16px;

        img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
      }

      h2 {
        font-size: 24px;
        font-weight: 600;
        color: #1a1a1a;
        margin-bottom: 8px;
      }

      p {
        font-size: 14px;
        color: #666;
      }
    }

    .login-form {
      .el-form-item {
        margin-bottom: 24px;

        :deep(.el-input__wrapper) {
          background-color: #f0f2f5;
          border: 1px solid transparent;
          border-radius: 12px;
          height: 48px;
          transition: all 0.3s ease;
          box-shadow: none;

          &:hover {
            background-color: #e8eaed;
          }

          &.is-focus {
            background-color: #fff;
            border-color: #409eff;
            box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
          }

          .el-input__inner {
            height: 100%;
            color: #1a1a1a;
            font-size: 15px;

            &::placeholder {
              color: #999;
            }
          }
        }

        .input-icon {
          font-size: 18px;
          color: #666;
        }

        .eye-icon {
          font-size: 16px;
          color: #666;
          cursor: pointer;

          &:hover {
            color: #409eff;
          }
        }
      }

      .remember-me {
        margin-bottom: 24px;

        :deep(.el-checkbox__label) {
          color: #666;
        }

        :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
          background-color: #409eff;
          border-color: #409eff;
        }
      }

      .login-button {
        width: 100%;
        height: 48px;
        border-radius: 12px;
        font-size: 16px;
        font-weight: 500;
        background: linear-gradient(135deg, #409eff, #66b1ff);
        border: none;
        transition: all 0.3s ease;

        &:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
        }

        &:active {
          transform: translateY(0);
        }
      }
    }
  }

  .copyright {
    width: 100%;
    position: absolute;
    bottom: 20px;
    left: 0;
    text-align: center;
    color: #666;
    font-size: 13px;
    padding: 0 20px;
  }
}

// 验证码弹窗样式
:deep(.mask) {
  background: rgba(0, 0, 0, 0.3) !important;
}

:deep(.container) {
  background: #fff !important;
  border-radius: 20px !important;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1) !important;
  overflow: hidden !important;

  .title {
    background: #f8f9fa !important;
    border-bottom: 1px solid #eee !important;
    padding: 16px 24px !important;
    color: #1a1a1a !important;
    font-size: 15px !important;
    font-weight: 500 !important;
  }

  .drag {
    background: #f8f9fa !important;
    border: 1px solid #eee !important;
    border-radius: 12px !important;
    margin: 20px !important;

    .handler {
      background: #409eff !important;
      color: #fff !important;
      border: none !important;
      box-shadow: 0 2px 6px rgba(64, 158, 255, 0.2) !important;

      &:hover {
        background: #66b1ff !important;
      }
    }

    .drag_bg {
      background: rgba(64, 158, 255, 0.1) !important;
    }
  }

  .verify-msg {
    background: #fff !important;
    border-top: 1px solid #eee !important;
    color: #1a1a1a !important;
    padding: 16px 24px !important;
  }
}

:deep(.close) {
  color: rgba(0, 0, 0, 0.45) !important;

  &:hover {
    color: #409eff !important;
  }
}
</style>
