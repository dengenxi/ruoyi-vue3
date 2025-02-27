import { login, logout, getInfo, getPublicKey } from "@/api/login"; // 在原来的基础上加上 getPublicKey
import { encrypt } from "@/utils/jsencrypt"; // 额外添加
import { getToken, setToken, removeToken } from "@/utils/auth";
import { isHttp, isEmpty } from "@/utils/validate";
import defAva from "@/assets/images/profile.jpg";

const useUserStore = defineStore("user", {
  state: () => ({
    token: getToken(),
    id: "",
    name: "",
    avatar: "",
    roles: [],
    permissions: [],
  }),
  actions: {
    // 登录
    // login(userInfo) {
    //   const username = userInfo.username.trim()
    //   const password = userInfo.password
    //   const code = userInfo.code
    //   return new Promise((resolve, reject) => {
    //     login(username, password, code).then(res => {
    //       setToken(res.token)
    //       this.token = res.token
    //       resolve()
    //     }).catch(error => {
    //       reject(error)
    //     })
    //   })
    // },
    async getPublicKey() {
      try {
        const response = await getPublicKey();
        return response.data; // 返回获取到的秘钥对象
      } catch (error) {
        throw error; // 如果获取秘钥对象失败，则抛出错误
      }
    },

    async login(userInfo) {
      try {
        const username = userInfo.username.trim();
        const code = userInfo.code;
        const uuid = userInfo.uuid;

        // 获取秘钥对象
        const rsaKeyPair = await this.getPublicKey();

        // 使用公钥加密密码
        const encryptedPassword = encrypt(userInfo.password, rsaKeyPair);

        // 使用加密后的密码登录
        const res = await login(username, encryptedPassword, code, uuid);
        setToken(res.token);
        this.token = res.token;
        return res; // 可以返回res以便进一步处理或捕获错误
      } catch (error) {
        throw error; // 抛出错误以便外部捕获
      }
    },
    // 获取用户信息
    getInfo() {
      return new Promise((resolve, reject) => {
        getInfo()
          .then((res) => {
            const user = res.user;
            let avatar = user.avatar || "";
            if (!isHttp(avatar)) {
              avatar = isEmpty(avatar)
                ? defAva
                : import.meta.env.VITE_APP_BASE_API + avatar;
            }
            if (res.roles && res.roles.length > 0) {
              // 验证返回的roles是否是一个非空数组
              this.roles = res.roles;
              this.permissions = res.permissions;
            } else {
              this.roles = ["ROLE_DEFAULT"];
            }
            this.id = user.userId;
            this.name = user.userName;
            this.avatar = avatar;
            resolve(res);
          })
          .catch((error) => {
            reject(error);
          });
      });
    },
    // 退出系统
    logOut() {
      return new Promise((resolve, reject) => {
        logout(this.token)
          .then(() => {
            this.token = "";
            this.roles = [];
            this.permissions = [];
            removeToken();
            resolve();
          })
          .catch((error) => {
            reject(error);
          });
      });
    },
  },
});

export default useUserStore;
