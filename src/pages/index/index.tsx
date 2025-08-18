import React, { useEffect, useState, useCallback } from "react";
import { Box, Page, Text, Button } from "zmp-ui";
import { useNavigate } from "react-router";
import { fetchDataItem, fetchNewsList } from "../../utils/http";
import ImageWithFallback from "../../components/ImageWithFallback";
import { SafeAreaHeader } from "../../components/safe-area";

// News type interface
interface NewsType {
  id: number;
  f_ItemName: string;
  f_ItemCode: string;
}

// News item interface
interface NewsItem {
  id: string;
  title: string;
  content: string;
  published_date?: string;
  type: number;
  icon?: string;
}

const HomePage: React.FunctionComponent = () => {
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState(0);
  const [toggleTitle, setToggleTitle] = useState(0);
  const [messageList, setMessageList] = useState<NewsType[]>([]);
  const [listALL, setListALL] = useState<NewsItem[]>([]);
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [displayedNewsList, setDisplayedNewsList] = useState<NewsItem[]>([]);
  const [loadCount] = useState(10);
  const [currentLoadIndex, setCurrentLoadIndex] = useState(0);
  const [hasMoreData, setHasMoreData] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  // Function to translate Chinese news type names to English
  const translateNewsType = (newsType: NewsType): NewsType => {
    const translations: Record<string, string> = {
      '最新资讯': 'Latest News',
      '公告': 'Announcements',
      '集团资讯': 'Group News',
      '资讯': 'News',
      '活动': 'Activities',
      '新闻': 'News'
    };

    return {
      ...newsType,
      f_ItemName: translations[newsType.f_ItemName] || newsType.f_ItemName
    };
  };
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [startY, setStartY] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);

  // Initialize data loading
  useEffect(() => {
    const initData = async () => {
      try {
        setIsLoading(true);
        console.log('Starting data initialization...');

        // Check current token storage status
        console.log('=== Token Storage Check ===');
        console.log('authToken:', localStorage.getItem('authToken'));
        console.log('token:', localStorage.getItem('token'));
        console.log('userInfo:', localStorage.getItem('userInfo'));

        // Parallel fetch of tag title list and news list data - following original Vue code approach
        const [messageListRes, newsListRes] = await Promise.all([
          // Get tag title list data - using original FETCH_DATAITEM method
          fetchDataItem('NewsType'),
          // Get news list data - using original HTTP_POST method and path
          fetchNewsList({
            paramsJson: "{}",
            sidx: ""
          })
        ]);

        console.log('Tag data response:', messageListRes);
        console.log('News data response:', newsListRes);

        // Set tag list - translate Chinese to English
        if (messageListRes && messageListRes.length > 0) {
          const translatedMessageList = messageListRes.map(translateNewsType);
          setMessageList(translatedMessageList);
          console.log('Successfully set translated tag list:', translatedMessageList);
        } else {
          console.error('Tag data is empty, cannot continue');
          setMessageList([]);
        }

        // Set news list - not using fallback data
        if (newsListRes && newsListRes.length > 0) {
          setListALL(newsListRes);
          console.log('Successfully set news list:', newsListRes);

          // If tag data is also available, initialize first tab content
          if (messageListRes && messageListRes.length > 0) {
            // Filter news for first tab
            const firstTabNews = newsListRes.filter(res => res.type === 1);
            setNewsList(firstTabNews);
            // Directly set initial displayed news list
            setDisplayedNewsList(firstTabNews.slice(0, loadCount));
            setCurrentLoadIndex(loadCount);
            setHasMoreData(loadCount < firstTabNews.length);
            setCurrentTab(0);
            setToggleTitle(0);
          }
        } else {
          console.error('News data is empty, cannot continue');
          setListALL([]);
        }
        
      } catch (error) {
        console.error('Data loading completely failed:', error);
        console.error('Error details:', {
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          name: error instanceof Error ? error.name : 'UnknownError'
        });

        // Don't use any fallback data, let the error be exposed
        setMessageList([]);
        setListALL([]);
      } finally {
        setIsLoading(false);
        console.log('Data loading process ended');
      }
    };

    initData();
  }, []);

  // Handle data recovery when page regains focus
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && listALL.length > 0 && messageList.length > 0) {
        // If page is visible again and has data, but display list is empty, reload current tab data
        if (displayedNewsList.length === 0) {
          console.log('Page visible again, restoring current tab data...');
          const filteredNews = listALL.filter(res => res.type === currentTab + 1);
          setNewsList(filteredNews);
          setDisplayedNewsList(filteredNews.slice(0, loadCount));
          setCurrentLoadIndex(loadCount);
          setHasMoreData(loadCount < filteredNews.length);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [listALL, messageList, displayedNewsList, currentTab, loadCount]);

  // Pull to refresh functionality
  const handleRefresh = useCallback(async () => {
    if (isRefreshing || isSwitching) return;

    setIsRefreshing(true);
    try {
      console.log('Starting pull to refresh...');

      // Re-fetch data
      const [messageListRes, newsListRes] = await Promise.all([
        fetchDataItem('NewsType'),
        fetchNewsList({
          paramsJson: "{}",
          sidx: ""
        })
      ]);

      if (messageListRes && messageListRes.length > 0) {
        const translatedMessageList = messageListRes.map(translateNewsType);
        setMessageList(translatedMessageList);
      }

      if (newsListRes && newsListRes.length > 0) {
        setListALL(newsListRes);

        // Refresh current tab data
        const filteredNews = newsListRes.filter(res => res.type === currentTab + 1);
        setNewsList(filteredNews);
        setDisplayedNewsList(filteredNews.slice(0, loadCount));
        setCurrentLoadIndex(loadCount);
        setHasMoreData(loadCount < filteredNews.length);
      }

      console.log('Pull to refresh completed');
    } catch (error) {
      console.error('Pull to refresh failed:', error);
    } finally {
      setIsRefreshing(false);
      setPullDistance(0);
    }
  }, [isRefreshing, isSwitching, currentTab, loadCount]);

  // Touch event handling
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (isSwitching || isRefreshing) return;
    setStartY(e.touches[0].clientY);
    setIsScrolling(false);
  }, [isSwitching, isRefreshing]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (isSwitching || isRefreshing || isScrolling) return;

    const currentY = e.touches[0].clientY;
    const diff = currentY - startY;

    // Only trigger when at page top and pulling down
    const scrollElement = e.currentTarget as HTMLElement;
    if (scrollElement.scrollTop === 0 && diff > 0) {
      e.preventDefault();
      const distance = Math.min(diff, 120); // Maximum pull distance
      setPullDistance(distance);
    }
  }, [startY, isSwitching, isRefreshing, isScrolling]);

  const handleTouchEnd = useCallback(() => {
    if (isSwitching || isRefreshing) return;

    // If pull distance exceeds threshold, trigger refresh
    if (pullDistance > 60) {
      handleRefresh();
    } else {
      setPullDistance(0);
    }
  }, [pullDistance, isSwitching, isRefreshing, handleRefresh]);

  // Method to load more data
  const loadMoreData = useCallback(async () => {
    // When there's more data and not in loading or tab switching state, perform load more operation
    if (hasMoreData && !isLoading && !isSwitching) {
      // Set loading data flag to true
      setIsLoading(true);
      try {
        // Calculate start index for this load more operation
        const start = currentLoadIndex;
        // Calculate end index for this load more operation
        const end = start + loadCount;
        // Extract data from start to end index in current selected tab's news list
        const newData = newsList.slice(start, end);
        // Append new data to currently displayed news list
        setDisplayedNewsList(prev => [...prev, ...newData]);
        // Update current load index
        setCurrentLoadIndex(end);
        // Check if there's more data available for loading
        setHasMoreData(end < newsList.length);
      } catch (error) {
        // Output error message to console when loading more data fails
        console.error('Failed to load more data:', error);
      } finally {
        // Whether loading succeeds or fails, set loading data flag to false
        setIsLoading(false);
      }
    }
  }, [hasMoreData, isLoading, isSwitching, currentLoadIndex, loadCount, newsList]);

  // Scroll listener to implement auto load more
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    if (isSwitching || isRefreshing) return;

    const target = e.currentTarget;
    const scrollTop = target.scrollTop;
    const scrollHeight = target.scrollHeight;
    const clientHeight = target.clientHeight;

    setIsScrolling(scrollTop > 0);

    // Auto load more when scrolled to 100px from bottom
    if (scrollHeight - scrollTop - clientHeight < 100 && hasMoreData && !isLoading) {
      loadMoreData();
    }
  }, [isSwitching, isRefreshing, hasMoreData, isLoading, loadMoreData]);

  // Method to load data
  const loadData = useCallback((newsData?: NewsItem[], resetIndex?: boolean) => {
    const dataToUse = newsData || newsList;
    // Calculate start index for this load - if reset mode, start from 0
    const start = resetIndex ? 0 : currentLoadIndex;
    // Calculate end index for this load
    const end = start + loadCount;
    // Extract data from start to end index in current selected tab's news list, assign to displayedNewsList
    setDisplayedNewsList(dataToUse.slice(0, end));
    // Update current load index
    setCurrentLoadIndex(end);
    // Check if there's more data available for loading
    setHasMoreData(end < dataToUse.length);
  }, [newsList, currentLoadIndex, loadCount]);

  // Tab switching functionality
  const switchTab = useCallback(async (tabIndex: number) => {
    if (isSwitching) return;

    // Set tab switching flag to true
    setIsSwitching(true);
    // Set animation flag to true
    setIsAnimating(true);
    // Update toggle title transition state
    setToggleTitle(tabIndex);
    // Update current selected tab index
    setCurrentTab(tabIndex);

    // Delay 0.5 seconds for animation transition effect
    await new Promise(resolve => setTimeout(resolve, 500));

    // Use filter method to filter news list for current selected tab
    const filteredNews = listALL.filter(res => res.type === tabIndex + 1);
    setNewsList(filteredNews);

    // Reset current load index to 0
    setCurrentLoadIndex(0);
    // Load data - using reset mode
    loadData(filteredNews, true);
    
    // Set animation flag to false
    setIsAnimating(false);
    // Set tab switching flag to false
    setIsSwitching(false);
  }, [listALL, isSwitching, loadData]);

  // Method to navigate to news detail page when clicking news item
  const goNewMessage = useCallback((message: NewsItem) => {
    // Navigate only when not in tab switching state
    if (!isSwitching) {
      // Show loading indicator (simulated)
      setIsLoading(true);
      // Navigate to news detail page after 1.5 second delay
      setTimeout(() => {
        setIsLoading(false);
        navigate(`/news-detail?id=${message.id}`, {
          state: { newsItem: message }
        });
      }, 1500);
    }
  }, [navigate, isSwitching]);

  return (
    <Page className="flex flex-col h-screen bg-gray-50">
      {/* Navigation bar section */}
      <SafeAreaHeader className="bg-primary text-white px-6 shadow-md">
        <Text className="text-white text-lg font-bold text-center">
          News & Announcements
        </Text>
      </SafeAreaHeader>
      
      {/* News and announcements tab bar */}
      <Box className="bg-white border-gray-200 sticky top-0 z-10">
        <Box className="flex">
          {messageList.map((title, index) => (
            <Button
              key={`tab-${title.id}-${index}`}
              className={`flex-1 py-4 px-2 text-center transition-all duration-300 rounded-none ${
                currentTab === index
                  ? 'text-blue-600 border-b-3 border-blue-500 font-semibold transform scale-105 bg-blue-50'
                  : 'text-gray-600 border-b-3 border-transparent hover:text-blue-500 hover:bg-gray-50'
              }`}
              variant="tertiary"
              onClick={() => !isSwitching && switchTab(index)}
              disabled={isSwitching}
            >
              <Text 
                className={currentTab === index ? 'font-semibold text-blue-600' : 'text-gray-600'}
              >
                {title.f_ItemName}
              </Text>
            </Button>
          ))}
        </Box>
      </Box>

      {/* Content area */}
      <Box 
        className="flex-1 overflow-auto relative"
        onScroll={handleScroll}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: isRefreshing ? 'transform 0.3s ease' : 'none'
        }}
      >
        {/* Pull to refresh indicator */}
        {(pullDistance > 0 || isRefreshing) && (
          <Box
            className="absolute top-0 left-0 right-0 flex items-center justify-center bg-primary text-white py-2 z-20"
            style={{
              transform: `translateY(-${Math.max(0, 60 - pullDistance)}px)`,
              opacity: pullDistance > 0 ? Math.min(pullDistance / 60, 1) : 1
            }}
          >
            {isRefreshing ? (
              <>
                <Box className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></Box>
                <Text className="text-white text-sm">Refreshing...</Text>
              </>
            ) : pullDistance > 60 ? (
              <Text className="text-white text-sm">Release to refresh</Text>
            ) : (
              <Text className="text-white text-sm">Pull to refresh</Text>
            )}
          </Box>
        )}

        <Box className="p-4">
          {/* Display corresponding news list based on currently selected tab */}
          <Box key={`content-tab-${currentTab}`} className={`transition-opacity duration-500 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
          {displayedNewsList.length > 0 ? (
              <Box key="news-list" className="space-y-4">
                {/* Loop render each news item */}
                {displayedNewsList.map((news, index) => (
                  <Box
                    key={`news-${news.id}-${index}`}
                    className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1 ${
                      isSwitching ? 'opacity-70' : 'opacity-100'
                    }`}
                    onClick={() => !isSwitching && goNewMessage(news)}
                    style={{
                      animationDelay: `${index * 0.1}s`,
                      animation: 'fadeInUp 0.6s ease-out forwards'
                    }}
                  >
                    <Box className="flex p-4">
                      {/* News thumbnail area */}
                      <Box className="w-28 h-20 mr-5 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        {/* Display news thumbnail according to original project approach: prioritize icon, otherwise show default news image */}
                        <ImageWithFallback
                          src={news.icon}
                          alt={news.title}
                          className="w-full h-full object-cover"
                          fallbackType="news"
                        />
                      </Box>

                      {/* News information area */}
                      <Box className="flex-1 flex flex-col justify-between">
                        {/* News title */}
                        <Text
                          className="text-sm font-semibold text-gray-800 line-clamp-2 mb-2 leading-relaxed"
                        >
                          {news.title}
                        </Text>
                        {/* News publish date, show 'No publish date' if none */}
                        <Text
                          className="text-xs text-gray-500"
                        >
                          {news.published_date || 'No publish date'}
                        </Text>
                      </Box>
                    </Box>
                  </Box>
                ))}
                
                {/* Loading animation, shown when loading data */}
                {isLoading && hasMoreData && (
                  <Box key="loading-more" className="text-center py-8">
                    {/* Spinning loading icon */}
                    <Box className="inline-block w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4"></Box>
                    {/* Loading text */}
                    <Text className="text-gray-500">Loading more...</Text>
                  </Box>
                )}

                {/* Prompt when no more data */}
                {!hasMoreData && displayedNewsList.length > 0 && (
                  <Box key="no-more-data" className="text-center py-6">
                    <Text className="text-gray-400 text-sm">All content loaded</Text>
                  </Box>
                )}
              </Box>
            ) : (
              <Box className="text-center py-20">
                {isLoading ? (
                  <Box key="loading-initial">
                    <Box className="inline-block w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4"></Box>
                    <Text className="text-gray-500">Loading...</Text>
                  </Box>
                ) : (
                  <Box key="no-data">
                    <Text className="text-gray-500 text-lg mb-2">📰</Text>
                    <Text className="text-gray-500">No news data available</Text>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </Page>
  );
};

export default HomePage;
