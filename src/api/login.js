import request from "@/utils/request";

// 登录方法
export function login(username, password, code) {
  const data = {
    username,
    password,
    code,
  };
  return request({
    url: "/login",
    headers: {
      isToken: false,
      repeatSubmit: false,
    },
    method: "post",
    data: data,
  });
}

// 注册方法
export function register(data) {
  return request({
    url: "/register",
    headers: {
      isToken: false,
    },
    method: "post",
    data: data,
  });
}

// 获取用户详细信息
export function getInfo() {
  return request({
    url: "/getInfo",
    method: "get",
  });
}

// 退出方法
export function logout() {
  return request({
    url: "/logout",
    method: "post",
  });
}

// 获取验证码开关
export function isCaptchaEnabled() {
  return request({
    url: "/captchaEnabled",
    method: "get",
  });
}

// 获取公钥
export function getPublicKey() {
  return request({
    url: '/publicKey',
    method: 'get',
  })
}