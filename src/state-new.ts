import { atom, selector } from "recoil";
import { getUserInfo } from "zmp-sdk";
import { Notification } from "types/notification";

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
