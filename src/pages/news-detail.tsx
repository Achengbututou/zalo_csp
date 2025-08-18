import React, { FC, useState, useEffect } from "react";
import { Box, Header, Page, Text, Button, Icon } from "zmp-ui";
import { useNavigate, useLocation } from "react-router";
import { NewsItem } from "types/news";
import { SafeAreaHeader } from "../components/safe-area";

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
            
            <h3 style="color: #d4a574; margin: 24px 0 16px 0;">🎃 New Product Introduction</h3>
            
            <ul style="margin-bottom: 20px; padding-left: 20px;">
              <li style="margin-bottom: 8px;"><strong>Pumpkin Spice Latte</strong> - Rich pumpkin flavor with classic spices to warm your autumn days</li>
              <li style="margin-bottom: 8px;"><strong>Cinnamon Apple Latte</strong> - Sweet apple fragrance with warm cinnamon, like a cozy autumn afternoon</li>
              <li style="margin-bottom: 8px;"><strong>Caramel Chestnut Latte</strong> - Sweet chestnuts with smooth caramel for a rich taste experience</li>
              <li style="margin-bottom: 8px;"><strong>Maple Walnut Latte</strong> - Canadian maple syrup with crunchy walnuts for a unique autumn flavor</li>
            </ul>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 12px; margin: 20px 0;">
              <h3 style="color: #28a745; margin-top: 0;">💰 Special Offers</h3>
              <p style="margin-bottom: 12px;">From now until October 31st, enjoy these benefits when purchasing any autumn limited latte:</p>
              <ul style="margin: 0; padding-left: 20px;">
                <li>20% off your first cup</li>
                <li>Buy 2 get 1 free (same flavor only)</li>
                <li>Members get double points</li>
              </ul>
            </div>
            
            <p style="margin-bottom: 16px;">
              We carefully select premium coffee beans from around the world, combined with professional brewing techniques,
              to bring you the warmest taste experience this autumn. Every cup carries our commitment to quality and care for you.
            </p>
            
            <div style="text-align: center; margin: 30px 0; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; color: white;">
              <h3 style="margin-top: 0; color: white;">🕐 Business Hours</h3>
              <p style="margin: 8px 0;">Monday - Friday: 7:00 AM - 10:00 PM</p>
              <p style="margin: 8px 0;">Weekends & Holidays: 8:00 AM - 11:00 PM</p>
            </div>
            
            <p style="margin-bottom: 16px; font-style: italic; text-align: center; color: #666;">
              "In this season of golden osmanthus fragrance, let us add a touch of richness to your autumn moments with a warm cup of coffee."
            </p>
          </div>
        `,
        published_date: "2024-08-01",
        type: 1,
        icon: "https://stc-zmp.zadn.vn/templates/zaui-coffee/dummy/product-square-1.webp"
      };

      setNewsItem(mockNewsDetail);
    } catch (error) {
      console.error('Failed to fetch news details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Go back to previous page
  const goBack = () => {
    navigate(-1);
  };

  // Truncate title for display
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
        {/* Unified style header */}
        <SafeAreaHeader className="bg-primary text-white relative flex items-center px-4 shadow-md sticky top-0 z-10">
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
        </SafeAreaHeader>
        <Box className="flex-1 flex items-center justify-center">
          <Box className="text-center">
            <Box className="inline-block w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4"></Box>
            <Text className="text-gray-500">Loading...</Text>
          </Box>
        </Box>
      </Page>
    );
  }

  if (!newsItem) {
    return (
      <Page className="flex flex-col h-screen bg-gray-50">
        {/* Unified style header */}
        <SafeAreaHeader className="bg-primary text-white relative flex items-center px-4 shadow-md sticky top-0 z-10">
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
        </SafeAreaHeader>
        <Box className="flex-1 flex items-center justify-center">
          <Box className="text-center">
            <Text className="text-gray-500 mb-4">News content not found</Text>
            <Button onClick={goBack} variant="primary">
              Go Back
            </Button>
          </Box>
        </Box>
      </Page>
    );
  }

  return (
    <Page className="flex flex-col h-screen bg-gray-50">
      {/* Custom header */}
      <SafeAreaHeader className="bg-primary text-white relative flex items-center px-4 shadow-md sticky top-0 z-10">
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
      </SafeAreaHeader>

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
