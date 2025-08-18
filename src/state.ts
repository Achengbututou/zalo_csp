import { atom, selector } from "recoil";
import { getUserInfo } from "zmp-sdk";
import { Notification } from "types/notification";

// User authentication status
export const authTokenState = atom({
  key: "authToken",
  default:
    typeof localStorage !== "undefined"
      ? localStorage.getItem("authToken") || null
      : null,
});

// Current logged-in user information
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

// Whether user is logged in
export const isAuthenticatedState = selector({
  key: "isAuthenticated",
  get: ({ get }) => {
    const token = get(authTokenState);
    const user = get(currentUserState);
    
    // Only check if token and user info both exist, don't clear data here
    // Data clearing should be handled by AuthInitializer or HTTP service
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
