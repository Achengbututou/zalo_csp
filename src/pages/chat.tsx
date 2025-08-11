import React, { FC, useState, useEffect, useCallback, useRef } from "react";
import { Box, Header, Page, Text, Button, Input, Icon } from "zmp-ui";
import { useNavigate, useLocation } from "react-router";
import ImageWithFallback from "components/ImageWithFallback";
import { httpGetMethod, httpPostMethod } from "utils/http";

// Message type
interface ChatMessage {
  f_MsgId: string;
  f_Content: string;
  f_SendUserId: string;
  f_ReceiveUserId: string;
  f_CreateDate: string;
  senderName: string;
  senderAvatar?: string;
  f_MessageType?: number;
}

// Contact information
interface Contact {
  f_UserId: string;
  f_RealName: string;
  f_Account: string;
  f_HeadIcon?: string;
}

const ChatMessage: FC<{
  message: ChatMessage;
  isOwn: boolean;
  contact?: Contact;
}> = ({ message, isOwn, contact }) => {
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    
    // 检查日期是否有效
    if (isNaN(date.getTime())) {
      return '';
    }
    
    // 今天的日期（年月日）
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    // 如果是今天
    if (messageDate.getTime() === today.getTime()) {
      return `今天 ${date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // 如果是今年
    if (date.getFullYear() === now.getFullYear()) {
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const time = date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
      return `${month}月${day}日 ${time}`;
    }
    
    // 如果不是今年，只显示年月日
    return date.toLocaleDateString('zh-CN', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    });
  };

  // Build user avatar URL
  const buildAvatarUrl = (avatarPath?: string) => {
    if (!avatarPath) {
      return "/static/img-avatar/head.png";
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

  const getAvatar = () => {
    if (isOwn) {
      return "/static/img-avatar/head.png"; // Own avatar
    }
    return buildAvatarUrl(contact?.f_HeadIcon);
  };

  return (
    <Box className={`flex items-end mb-6 ${isOwn ? 'flex-row-reverse' : 'flex-row'} group`}>
      {/* 头像 */}
      <Box className="relative flex-shrink-0 mb-1">
        <Box className="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 shadow-md ring-2 ring-white">
          <ImageWithFallback
            src={getAvatar()}
            alt={message.senderName}
            className="w-full h-full object-cover"
            fallbackType="avatar"
          />
        </Box>
        {/* 在线状态指示 */}
        {!isOwn && (
          <Box className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full ring-2 ring-white"></Box>
        )}
      </Box>
      
      {/* 消息内容区域 */}
      <Box className={`max-w-xs lg:max-w-sm relative ${isOwn ? 'mr-3' : 'ml-3'}`}>
        {/* 发送者名称（仅对方消息显示） */}
        {!isOwn && (
          <Text className="text-xs text-gray-500 mb-1 px-1">
            {message.senderName}
          </Text>
        )}
        
        {/* 消息气泡 */}
        <Box
          className={`relative px-4 py-3 rounded-2xl text-sm shadow-sm transition-all duration-200 group-hover:shadow-md ${
            isOwn
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md'
              : 'bg-white text-gray-800 rounded-bl-md border border-gray-100'
          }`}
        >
          <Text className={`leading-relaxed ${isOwn ? 'text-white' : 'text-gray-800'}`}>
            {message.f_Content}
          </Text>
          
          {/* Message status and time */}
          <Box className={`flex items-center mt-2 space-x-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
            <Text className={`text-xs font-medium ${isOwn ? 'text-blue-200' : 'text-gray-500'}`}>
              {formatTime(message.f_CreateDate)}
            </Text>
            {isOwn && (
              <Icon 
                icon="zi-check-circle" 
                className="text-blue-200 text-xs" 
                size={12}
              />
            )}
          </Box>
          
          {/* 消息气泡尾巴 */}
          <Box
            className={`absolute bottom-3 w-0 h-0 ${
              isOwn
                ? 'right-0 border-l-6 border-l-blue-500 border-t-3 border-t-transparent border-b-3 border-b-transparent transform translate-x-full'
                : 'left-0 border-r-6 border-r-white border-t-3 border-t-transparent border-b-3 border-b-transparent transform -translate-x-full'
            }`}
          />
        </Box>
      </Box>
    </Box>
  );
};

const ChatPage: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  
  const [contact, setContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  // Current user ID (simulated)
  const currentUserId = "current_user";

  // Get contact information and chat history
  const initChatData = useCallback(async () => {
    try {
      setIsLoading(true);

      // Get contact information from route parameters
      const urlParams = new URLSearchParams(location.search);
      const contactId = urlParams.get('id');
      const contactName = urlParams.get('name');

      if (location.state?.contact) {
        setContact(location.state.contact);
      } else if (contactId && contactName) {
        // Simulate contact information
        setContact({
          f_UserId: contactId,
          f_RealName: contactName,
          f_Account: contactName.toLowerCase(),
        });
      }
      
      // Get chat history - using real API
      if (contactId) {
        console.log('[Chat Page] Getting chat history, contact ID:', contactId);

        try {
          // Call chat history API according to original project approach
          const chatHistory = await httpGetMethod('/message/msg/list/last', {
            toId: contactId
          });

          console.log('[Chat Page] Chat history response:', chatHistory);
          
          if (chatHistory && Array.isArray(chatHistory) && chatHistory.length > 0) {
            // Process chat history data
            const processedMessages = chatHistory.map(msg => ({
              f_MsgId: msg.f_MsgId,
              f_Content: msg.f_Content,
              f_SendUserId: msg.f_SendUserId,
              f_ReceiveUserId: msg.f_RecvUserId || msg.f_ReceiveUserId,
              f_CreateDate: msg.f_CreateDate,
              senderName: msg.f_SendUserId === currentUserId ? 'Me' : contactName || 'Other',
              senderAvatar: msg.f_SendUserId === currentUserId ? null : location.state?.contact?.f_HeadIcon,
              f_MessageType: msg.f_MessageType
            }));

            // Sort by time (API returns reverse order, convert to normal order for display)
            processedMessages.reverse();

            setMessages(processedMessages);
          }
        } catch (error) {
          console.error('[Chat Page] Failed to get chat history:', error);
          // Don't show error when API fails, keep empty message list
          setMessages([]);
        }
      }

    } catch (error) {
      console.error('[Chat Page] Failed to initialize chat data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [location]);

  // Send message - using real API
  const sendMessage = useCallback(async () => {
    if (!inputMessage.trim() || isSending || !contact) {
      return;
    }

    try {
      setIsSending(true);
      const content = inputMessage.trim();

      console.log('[Chat Page] Sending message:', content, 'Target user:', contact.f_UserId);

      // Add to local message list first (optimistic update)
      const newMessage: ChatMessage = {
        f_MsgId: `temp_${Date.now()}`,
        f_Content: content,
        f_SendUserId: currentUserId,
        f_ReceiveUserId: contact.f_UserId,
        f_CreateDate: new Date().toISOString(),
        senderName: "Me",
      };

      setMessages(prev => [...prev, newMessage]);
      setInputMessage("");

      try {
        // Call send message API - using original project interface
        const result = await httpPostMethod('/message/msg/send', {
          f_RecvUserId: contact.f_UserId,
          f_Content: content
        });

        console.log('[Chat Page] Send message response:', result);

        if (result) {
          // Update message ID to real ID, construct message object according to original project
          setMessages(prev =>
            prev.map(msg =>
              msg.f_MsgId === newMessage.f_MsgId
                ? {
                    ...msg,
                    f_MsgId: result.toString(), // API returns message ID
                    f_CreateDate: new Date().toISOString() // Use current time
                  }
                : msg
            )
          );
        }

      } catch (error) {
        console.error('[Chat Page] Failed to send message:', error);
        // If sending fails, can choose to remove or mark as failed
        // Keep local message for now
      }

    } catch (error) {
      console.error('[Chat Page] Send message process failed:', error);
    } finally {
      setIsSending(false);
    }
  }, [inputMessage, isSending, contact, currentUserId]);

  // 滚动到底部
  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  // 移除键盘事件处理（手机端不需要）
  // const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
  //   if (e.key === 'Enter' && !e.shiftKey) {
  //     e.preventDefault();
  //     sendMessage();
  //   }
  // }, [sendMessage]);

  // 返回上一页
  const goBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  // 初始化数据
  useEffect(() => {
    initChatData();
  }, [initChatData]);

  // 消息更新时滚动到底部
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  if (isLoading) {
    return (
      <Page className="flex flex-col h-screen bg-gray-50">
        <Header title="Chat" showBackIcon={true} onBackClick={goBack} />
        <Box className="flex-1 flex items-center justify-center">
          <Box className="text-center">
            <Box className="inline-block w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></Box>
            <Text className="text-gray-500">Loading...</Text>
          </Box>
        </Box>
      </Page>
    );
  }

  return (
    <Page className="flex flex-col h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Chat header */}
      <Header 
        title={contact?.f_RealName || "Chat"}
        showBackIcon={true} 
        onBackClick={goBack}
        className="bg-white shadow-sm"
      />
      
      {/* 消息列表 */}
      <Box 
        className="flex-1 overflow-auto bg-gray-50"
        style={{ 
          paddingBottom: '90px',
          backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.03) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(168, 85, 247, 0.03) 0%, transparent 50%)'
        }}
      >
        <div ref={scrollRef} className="p-4 space-y-2">
          {/* Chat start indicator */}
          {messages.length > 0 && (
            <Box className="text-center py-4">
              <Box className="inline-flex items-center bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
                <Icon icon="zi-user" className="text-gray-400 text-sm mr-2" />
                <Text className="text-xs text-gray-500">
                  Chat with {contact?.f_RealName}
                </Text>
              </Box>
            </Box>
          )}
          
          {messages.map((message) => (
            <ChatMessage
              key={message.f_MsgId}
              message={message}
              isOwn={message.f_SendUserId === currentUserId}
              contact={contact || undefined}
            />
          ))}
          
          {messages.length === 0 && (
            <Box className="text-center py-20">
              <Box className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Icon icon="zi-user" className="text-blue-500 text-2xl" />
              </Box>
              <Text className="text-gray-600 text-lg font-medium mb-2">开始聊天</Text>
              <Text className="text-gray-400 text-sm">发送消息与 {contact?.f_RealName} 开始对话</Text>
            </Box>
          )}
        </div>
      </Box>

      {/* 输入框区域 */}
      <Box className="bg-white/95 backdrop-blur-sm border-t border-gray-200/50 p-4 sticky bottom-0 shadow-lg">
        <Box className="flex items-center space-x-3">
          {/* 输入框 */}
          <Box className="flex-1 relative">
            <Input
              placeholder={`给 ${contact?.f_RealName || '对方'} 发消息...`}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className=" bg-gray-100 rounded-2xl  text-sm placeholder-gray-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
              maxLength={500}
            />
          </Box>
          
          {/* 发送按钮 */}
          <Button
            variant="primary"
            size="small"
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isSending}
            className={`w-10 h-12 rounded-full transition-all duration-200 flex items-center justify-center p-0 ${
              inputMessage.trim() 
                ? 'bg-blue-500 hover:bg-blue-600 shadow-lg hover:shadow-xl transform hover:scale-105' 
                : 'bg-gray-300'
            }`}
          >
            {isSending ? (
              <Box className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></Box>
            ) : (
              <Icon icon="zi-arrow-right" className="text-white text-sm" />
            )}
          </Button>
        </Box>
      </Box>
    </Page>
  );
};

export default ChatPage;
