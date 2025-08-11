export interface NewsType {
  id: number;
  f_ItemName: string;
  f_ItemCode: string;
}

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  published_date?: string;
  type: number;
  icon?: string;
}

export interface NewsPageData {
  messageList: NewsType[];
  newsList: NewsItem[];
}
