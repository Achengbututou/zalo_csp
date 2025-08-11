import React, { FC, useState, useEffect } from "react";
import { Box, Header, Page, Text, Button, Icon } from "zmp-ui";
import { useNavigate, useLocation } from "react-router";
import { NewsItem } from "types/news";

const NewsDetailPage: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [newsItem, setNewsItem] = useState<NewsItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Get news data from route parameters or state
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const newsId = urlParams.get('id');

    // First try to get data from state
    if (location.state?.newsItem) {
      setNewsItem(location.state.newsItem);
      setIsLoading(false);
    } else if (newsId) {
      // If no state data, simulate getting from API
      fetchNewsDetail(newsId);
    } else {
      // No ID parameter, go back to previous page
      navigate(-1);
    }
  }, [location, navigate]);

  // Simulate getting news detail data
  const fetchNewsDetail = async (id: string) => {
    try {
      setIsLoading(true);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock data
      const mockNewsDetail: NewsItem = {
        id,
        title: "New Coffee Shop Products - Autumn Limited Latte Series",
        content: `
          <div style="font-family: 'Arial', sans-serif; line-height: 1.8; color: #333;">
            <h2 style="color: #2c5aa0; margin-bottom: 20px;">🍂 Autumn Limited Latte Series Now Available!</h2>

            <p style="margin-bottom: 16px;">
              Dear coffee lovers, we are excited to announce that our highly anticipated autumn limited latte series is now officially available!
            </p>
            
            <h3 style="color: #d4a574; margin: 24px 0 16px 0;">🎃 新品介绍</h3>
            
            <ul style="margin-bottom: 20px; padding-left: 20px;">
              <li style="margin-bottom: 8px;"><strong>南瓜香料拿铁</strong> - 浓郁的南瓜香味配上经典香料，温暖你的秋日</li>
              <li style="margin-bottom: 8px;"><strong>肉桂苹果拿铁</strong> - 清甜的苹果香配上温暖的肉桂，如秋日午后的惬意</li>
              <li style="margin-bottom: 8px;"><strong>焦糖栗子拿铁</strong> - 香甜的栗子配上丝滑焦糖，层次丰富的口感体验</li>
              <li style="margin-bottom: 8px;"><strong>枫糖胡桃拿铁</strong> - 加拿大枫糖配上香脆胡桃，给你不一样的秋日风情</li>
            </ul>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 12px; margin: 20px 0;">
              <h3 style="color: #28a745; margin-top: 0;">💰 优惠活动</h3>
              <p style="margin-bottom: 12px;">即日起至10月31日，购买任意秋季限定拿铁可享受：</p>
              <ul style="margin: 0; padding-left: 20px;">
                <li>首杯8折优惠</li>
                <li>买二送一（仅限同款）</li>
                <li>会员额外享受积分翻倍</li>
              </ul>
            </div>
            
            <p style="margin-bottom: 16px;">
              我们精心挑选了来自世界各地的优质咖啡豆，配合专业的调制技艺，
              为您带来这个秋天最温暖的味蕾体验。每一杯都承载着我们对品质的坚持和对您的用心。
            </p>
            
            <div style="text-align: center; margin: 30px 0; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; color: white;">
              <h3 style="margin-top: 0; color: white;">🕐 营业时间</h3>
              <p style="margin: 8px 0;">周一至周五：7:00 - 22:00</p>
              <p style="margin: 8px 0;">周末及节假日：8:00 - 23:00</p>
            </div>
            
            <p style="margin-bottom: 16px; font-style: italic; text-align: center; color: #666;">
              "在这个金桂飘香的季节里，让我们用一杯温暖的咖啡，为您的秋日时光增添一抹香醇。"
            </p>
          </div>
        `,
        published_date: "2024-08-01",
        type: 1,
        icon: "https://stc-zmp.zadn.vn/templates/zaui-coffee/dummy/product-square-1.webp"
      };

      setNewsItem(mockNewsDetail);
    } catch (error) {
      console.error('获取新闻详情失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 返回上一页
  const goBack = () => {
    navigate(-1);
  };

  // 截断标题显示
  const getTruncatedTitle = (title: string, maxLength: number = 20) => {
    if (!title) return '';
    if (title.length <= maxLength) return title;
    
    // Smart truncation: try to truncate at spaces or punctuation marks
    const truncated = title.slice(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    const lastPunctuation = Math.max(
      truncated.lastIndexOf(','),
      truncated.lastIndexOf('.'),
      truncated.lastIndexOf('-'),
      truncated.lastIndexOf('—')
    );
    
    const cutPoint = Math.max(lastSpace, lastPunctuation);
    if (cutPoint > maxLength * 0.7) {
      return title.slice(0, cutPoint) + '...';
    }
    
    return truncated + '...';
  };

  if (isLoading) {
    return (
      <Page className="flex flex-col h-screen bg-gray-50">
        {/* 统一样式的头部 */}
        <Box className="bg-primary text-white relative flex items-center px-4 py-4 shadow-md sticky top-0 z-10">
          <Box 
            className="absolute left-4 cursor-pointer hover:bg-white hover:bg-opacity-10 active:bg-opacity-20 rounded-full p-2 transition-all duration-200"
            onClick={goBack}
          >
            <Icon icon="zi-arrow-left" className="text-white text-xl font-medium drop-shadow-sm" />
          </Box>
          <Box className="flex-1 flex justify-center items-center px-12">
            <Text className="text-white font-semibold text-lg text-center leading-tight">
              新闻详情
            </Text>
          </Box>
        </Box>
        <Box className="flex-1 flex items-center justify-center">
          <Box className="text-center">
            <Box className="inline-block w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4"></Box>
            <Text className="text-gray-500">加载中...</Text>
          </Box>
        </Box>
      </Page>
    );
  }

  if (!newsItem) {
    return (
      <Page className="flex flex-col h-screen bg-gray-50">
        {/* Unified style header */}
        <Box className="bg-primary text-white relative flex items-center px-4 py-4 shadow-md sticky top-0 z-10">
          <Box
            className="absolute left-4 cursor-pointer hover:bg-white hover:bg-opacity-10 active:bg-opacity-20 rounded-full p-2 transition-all duration-200"
            onClick={goBack}
          >
            <Icon icon="zi-arrow-left" className="text-white text-xl font-medium drop-shadow-sm" />
          </Box>
          <Box className="flex-1 flex justify-center items-center px-12">
            <Text className="text-white font-semibold text-lg text-center leading-tight">
              News Details
            </Text>
          </Box>
        </Box>
        <Box className="flex-1 flex items-center justify-center">
          <Box className="text-center">
            <Text className="text-gray-500 mb-4">未找到新闻内容</Text>
            <Button onClick={goBack} variant="primary">
              返回上一页
            </Button>
          </Box>
        </Box>
      </Page>
    );
  }

  return (
    <Page className="flex flex-col h-screen bg-gray-50">
      {/* Custom header */}
      <Box className="bg-primary text-white relative flex items-center px-4 py-4 shadow-md sticky top-0 z-10">
        {/* Back icon */}
        <Box
          className="absolute left-4 cursor-pointer hover:bg-white hover:bg-opacity-10 active:bg-opacity-20 rounded-full p-2 transition-all duration-200"
          onClick={goBack}
        >
          <Icon icon="zi-arrow-left" className="text-white text-xl font-medium drop-shadow-sm" />
        </Box>

        {/* Centered title */}
        <Box className="flex-1 flex justify-center items-center px-12">
          <Text className="text-white font-semibold text-lg text-center leading-tight max-w-full">
            {getTruncatedTitle(newsItem.title, 24)}
          </Text>
        </Box>
      </Box>

      {/* Content area */}
      <Box className="flex-1 overflow-auto">
        <Box className="bg-white m-4 rounded-xl shadow-sm">
          {/* Article header info */}
          <Box className="p-6 border-b border-gray-100">
            <Text className="text-xl font-bold text-gray-800 mb-3 leading-relaxed">
              {newsItem.title}
            </Text>
            {newsItem.published_date && (
              <Text className="text-sm text-gray-500">
                Published: {newsItem.published_date}
              </Text>
            )}
          </Box>

          {/* Article content */}
          <Box className="p-6">
            <Box
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: newsItem.content }}
            />
          </Box>
        </Box>

        {/* Bottom action area */}
        <Box className="p-4">
          <Button
            fullWidth
            variant="secondary"
            onClick={goBack}
            className="bg-gray-100 text-gray-700 border-gray-200"
          >
            Back to News List
          </Button>
        </Box>
      </Box>
    </Page>
  );
};

export default NewsDetailPage;
