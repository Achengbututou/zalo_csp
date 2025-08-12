import { atom, selector } from "recoil";
import { getUserInfo } from "zmp-sdk";
import { Notification } from "types/notification";

// 用户认证状态
export const authTokenState = atom({
  key: "authToken",
  default:
    typeof localStorage !== "undefined"
      ? localStorage.getItem("authToken") || null
      : null,
});

// 当前登录用户信息
export const currentUserState = atom({
  key: "currentUser",
  default: (() => {
    if (typeof localStorage !== "undefined") {
      const userInfo = localStorage.getItem("userInfo");
      return userInfo ? JSON.parse(userInfo) : null;
    }
    return null;
  })(),
});

// 是否已登录的状态
export const isAuthenticatedState = selector({
  key: "isAuthenticated",
  get: ({ get }) => {
    const token = get(authTokenState);
    const user = get(currentUserState);
    
    // 只检查token和用户信息是否都存在，不在这里清理数据
    // 数据清理应该由AuthInitializer或HTTP服务来处理
    return !!(token && user);
  },
});

export const userState = selector({
  key: "user",
  get: async () => {
    try {
      const { userInfo } = await getUserInfo({ autoRequestPermission: true });
      return userInfo;
    } catch (error) {
      console.warn("Failed to get user info:", error);
      return null;
    }
  },
});

export const notificationsState = atom<Notification[]>({
  key: "notifications",
  default: [],
});

export const keywordState = atom({
  key: "keyword",
  default: "",
});
