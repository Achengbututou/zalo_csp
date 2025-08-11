import { atom, selector } from "recoil";
import { NewsType, NewsItem } from "types/news";

// News type list state
export const newsTypesState = atom<NewsType[]>({
  key: "newsTypes",
  default: [],
});

// All news list state
export const allNewsListState = atom<NewsItem[]>({
  key: "allNewsList",
  default: [],
});

// Currently selected news type index
export const currentNewsTabState = atom<number>({
  key: "currentNewsTab",
  default: 0,
});

// Currently displayed news list (filtered based on selected type)
export const currentNewsListState = selector<NewsItem[]>({
  key: "currentNewsList",
  get: ({ get }) => {
    const allNews = get(allNewsListState);
    const currentTab = get(currentNewsTabState);
    return allNews.filter(news => news.type === currentTab + 1);
  },
});

// API base URL
export const API_BASE_URL = "https://webapp.crystal-csc.cn/csp_core_api_v3";

// Mock HTTP request function
export const httpPost = async (endpoint: string, data: any) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Mock data fetch function
export const fetchDataItem = async (type: string): Promise<NewsType[]> => {
  // Mock news type data
  const mockNewsTypes: NewsType[] = [
    { id: 1, f_ItemName: "Latest News", f_ItemCode: "news" },
    { id: 2, f_ItemName: "Announcements", f_ItemCode: "announcement" },
    { id: 3, f_ItemName: "Group News", f_ItemCode: "activity" },
  ];

  return new Promise((resolve) => {
    setTimeout(() => resolve(mockNewsTypes), 500);
  });
};
