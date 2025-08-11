import React, { FC, useState, useEffect, useCallback, useRef } from "react";
import { Box, Header, Page, Text } from "zmp-ui";
import { useNavigate } from "react-router";
import ImageWithFallback from "components/ImageWithFallback";
import { httpGetMethod } from "utils/http";

// Message conversation data interface
interface ConversationItem {
  f_Id: string;
  f_SendUserId: string;
  f_ReceiveUserId: string;
  f_Content: string;
  f_Time: string;
  f_NoReadNum: number;
  senderName: string;
  senderAvatar?: string;
  isGroup?: boolean;
  f_MessageType?: number;
}

const MessageList: FC = () => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [nextTime, setNextTime] = useState('1888-10-10 10:10:10');
  const [timer, setTimer] = useState<number | null>(null);

  // Get message list - using real API
  const fetchMessages = useCallback(async () => {
    try {
      setIsLoading(true);

      console.log('[Message List] Getting message list, next time:', nextTime);

      // Call message API according to original project approach
      const messages = await httpGetMethod(`/message/contacts/${nextTime}`, {});

      console.log('[Message List] Message list response:', messages);
      
      if (messages && messages.length > 0) {
        // Process message data, convert to conversation format
        const processedMessages = messages.map(msg => {
          // Determine sender info based on message type
          const isSystemMessage = msg.f_MessageType === 1;
          const senderInfo = msg.senderInfo || {};

          return {
            f_Id: msg.f_Id || msg.f_MsgId,
            f_SendUserId: msg.f_SendUserId,
            f_ReceiveUserId: msg.f_ReceiveUserId,
            f_Content: msg.f_Content,
            f_Time: msg.f_Time || msg.f_CreateDate,
            f_NoReadNum: msg.f_NoReadNum || 0,
            senderName: senderInfo.f_RealName || msg.f_SendUserName || 'Unknown User',
            senderAvatar: senderInfo.f_HeadIcon,
            isGroup: isSystemMessage,
            f_MessageType: msg.f_MessageType
          };
        });

        // Update message list
        setConversations(processedMessages);

        // Update next fetch time
        if (messages.length > 0) {
          const latestMessage = messages[0];
          const newNextTime = latestMessage.f_Time || latestMessage.f_CreateDate;
          if (newNextTime) {
            setNextTime(new Date(newNextTime).toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, ''));
          }
        }
      }

    } catch (error) {
      console.error('[Message List] Failed to get message list:', error);
      // If API fails, don't show error to user, handle silently
    } finally {
      setIsLoading(false);
    }
  }, [nextTime]);

  // Build user avatar URL - using original project default avatar
  const buildAvatarUrl = (avatarPath?: string) => {
    if (!avatarPath) {
      return "/static/img-avatar/head.png"; // Use original project default avatar
    }

    // If already a complete URL, return directly
    if (avatarPath.startsWith('http')) {
      return avatarPath;
    }

    // Get token for avatar authentication
    const token = localStorage.getItem('token') ||
                 localStorage.getItem('authToken') ||
                 JSON.parse(localStorage.getItem('userInfo') || '{}')?.token || '';

    // Build avatar URL
    return `https://webapp.crystal-csc.cn/csp_core_api_v3/File/FileDownload/${avatarPath}?token=${token}`;
  };

  // 格式化时间显示
  const formatTime = useCallback((timeStr: string) => {
    const time = new Date(timeStr);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const messageDate = new Date(time.getFullYear(), time.getMonth(), time.getDate());
    
    if (messageDate.getTime() === today.getTime()) {
      // Today - show time
      return time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (messageDate.getTime() === yesterday.getTime()) {
      // Yesterday
      return 'Yesterday';
    } else if (now.getTime() - messageDate.getTime() < 7 * 24 * 60 * 60 * 1000) {
      // Within a week - show weekday
      const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return weekdays[time.getDay()];
    } else {
      // Earlier - show date
      return time.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' });
    }
  }, []);


  // 点击会话进入聊天
  const handleConversationClick = useCallback((conversation: ConversationItem) => {
    navigate(`/chat?id=${conversation.f_SendUserId}&name=${conversation.senderName}`, {
      state: { 
        contact: {
          f_UserId: conversation.f_SendUserId,
          f_RealName: conversation.senderName,
          f_Account: conversation.senderName.toLowerCase(),
          f_HeadIcon: conversation.senderAvatar
        }
      }
    });
  }, [navigate]);

  // 下拉刷新
  const handleRefresh = useCallback(async () => {
    setConversations([]);
    await fetchMessages();
  }, [fetchMessages]);

  // 初始化数据
  useEffect(() => {
    fetchMessages();
    
    // 设置定时器每15秒轮询新消息 (按照原项目逻辑)
    const pollTimer = setInterval(() => {
      fetchMessages();
    }, 15000);
    
    setTimer(pollTimer);
    
    return () => {
      if (timer) {
        clearInterval(timer);
      }
      if (pollTimer) {
        clearInterval(pollTimer);
      }
    };
  }, []);
  
  // 清理定时器
  useEffect(() => {
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [timer]);

  return (
    <Box className="flex flex-col h-full bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Message list */}
      <Box className="flex-1 overflow-auto px-4 py-2">
        {isLoading ? (
          <Box className="flex items-center justify-center py-20">
            <Box className="text-center">
              <Box className="inline-block w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></Box>
              <Text className="text-gray-600 font-medium">Loading messages...</Text>
              <Text className="text-gray-400 text-sm mt-1">Please wait</Text>
            </Box>
          </Box>
        ) : (
          <Box className="space-y-2">
            {conversations.map((conversation, index) => (
              <Box
                key={conversation.f_Id}
                className="message-item bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer border border-white/50 hover:bg-white/90 transform hover:-translate-y-0.5"
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => handleConversationClick(conversation)}
              >
                <Box className="flex items-center space-x-4">
                  {/* Avatar container */}
                  <Box className="relative flex-shrink-0">
                    <Box className="w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 p-0.5 shadow-lg">
                      <Box className="w-full h-full rounded-full overflow-hidden bg-white">
                        <ImageWithFallback
                          src={buildAvatarUrl(conversation.senderAvatar)}
                          alt={conversation.senderName}
                          className="w-full h-full object-cover"
                          fallbackType="avatar"
                        />
                      </Box>
                    </Box>
                    
                    {/* 在线状态指示器 */}
                    <Box className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-400 border-2 border-white rounded-full shadow-sm"></Box>
                    
                    {/* 未读消息角标 */}
                    {conversation.f_NoReadNum > 0 && (
                      <Box className="absolute -top-1 -right-1 min-w-6 h-6 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full flex items-center justify-center px-1.5 shadow-lg message-badge">
                        <Text className="text-white text-xs font-bold leading-none">
                          {conversation.f_NoReadNum > 99 ? '99+' : conversation.f_NoReadNum}
                        </Text>
                      </Box>
                    )}
                  </Box>
                  
                  {/* 消息内容区域 */}
                  <Box className="flex-1 min-w-0">
                    {/* 第一行：姓名和时间 */}
                    <Box className="flex items-center justify-between mb-2">
                      <Text className="text-lg font-semibold text-gray-800 truncate bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text">
                        {conversation.senderName}
                      </Text>
                      <Text className="text-xs text-gray-400 ml-3 flex-shrink-0 font-medium">
                        {formatTime(conversation.f_Time)}
                      </Text>
                    </Box>
                    
                    {/* Second row: Message content */}
                    <Box className="flex items-center">
                      <Text className="text-sm text-gray-600 truncate flex-1 leading-relaxed">
                        {conversation.f_Content}
                      </Text>
                      {/* Message type icon */}
                      <Box className="ml-2 flex-shrink-0">
                        {conversation.f_MessageType === 1 ? (
                          <Box className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center">
                            <Text className="text-blue-500 text-xs">📢</Text>
                          </Box>
                        ) : (
                          <Box className="w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center">
                            <Text className="text-gray-500 text-xs">💬</Text>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>
            ))}
            
            {conversations.length === 0 && !isLoading && (
              <Box className="text-center py-20">
                <Box className="mb-8">
                  <Box className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 rounded-full flex items-center justify-center shadow-lg mb-4">
                    <Box className="w-20 h-20 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full flex items-center justify-center">
                      <Text className="text-5xl">💬</Text>
                    </Box>
                  </Box>
                  <Box className="w-16 h-1 bg-gradient-to-r from-blue-300 to-purple-300 rounded-full mx-auto"></Box>
                </Box>
                <Text className="text-gray-600 text-xl font-semibold mb-3">No messages</Text>
                <Text className="text-gray-400 text-base">Start your first conversation</Text>
                <Box className="mt-6">
                  <Text className="text-gray-300 text-sm">Click on a contact to start chatting ✨</Text>
                </Box>
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

const MessagePage: FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const messageListRef = useRef<{ handleRefresh: () => Promise<void> } | null>(null);

  const handlePullDownRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      if (messageListRef.current) {
        await messageListRef.current.handleRefresh();
      }
    } finally {
      setRefreshing(false);
    }
  }, []);

  return (
    <Page className="flex flex-col h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header
        title="Messages"
        showBackIcon={false}
        className="bg-white/90 backdrop-blur-md border-b border-white/50 shadow-sm"
      />
      <MessageList />
    </Page>
  );
};

export default MessagePage;
