import React, { FC, useState, useEffect, useCallback, useRef } from "react";
import { Box, Header, Page, Text, Button, Input, Icon } from "zmp-ui";
import { useNavigate, useLocation } from "react-router";
import ImageWithFallback from "components/ImageWithFallback";
import { httpGetMethod, httpPostMethod } from "utils/http";

// 消息类型
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

// 联系人信息
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
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    if (messageDate.getTime() === today.getTime()) {
      return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }) + ' ' +
             date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    }
  };

  // 构建用户头像URL
  const buildAvatarUrl = (avatarPath?: string) => {
    if (!avatarPath) {
      return "https://stc-zmp.zadn.vn/templates/zaui-coffee/dummy/product-square-1.webp";
    }
    
    // 如果已经是完整URL，直接返回
    if (avatarPath.startsWith('http')) {
      return avatarPath;
    }
    
    // 获取token用于头像认证
    const token = localStorage.getItem('token') || 
                 localStorage.getItem('authToken') || 
                 JSON.parse(localStorage.getItem('userInfo') || '{}')?.token || '';
    
    // 构建头像URL
    return `https://webapp.crystal-csc.cn/csp_core_api_v3/File/FileDownload/${avatarPath}?token=${token}`;
  };

  const getAvatar = () => {
    if (isOwn) {
      return "https://stc-zmp.zadn.vn/templates/zaui-coffee/dummy/product-square-1.webp"; // 自己的头像
    }
    return buildAvatarUrl(contact?.f_HeadIcon);
  };

  return (
    <Box className={`flex mb-6 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* 头像 */}
      <Box className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
        <ImageWithFallback
          src={getAvatar()}
          alt={isOwn ? '我' : message.senderName}
          className="w-full h-full object-cover"
          fallbackType="avatar"
        />
      </Box>
      
      {/* 消息内容 */}
      <Box className={`flex flex-col max-w-xs mx-3 ${isOwn ? 'items-end' : 'items-start'}`}>
        <Box
          className={`px-4 py-2 rounded-2xl relative ${
            isOwn 
              ? 'bg-blue-500 text-white rounded-br-md' 
              : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md'
          }`}
        >
          <Text className={`text-sm leading-relaxed ${isOwn ? 'text-white' : 'text-gray-800'}`}>
            {message.f_Content}
          </Text>
          
          {/* 消息气泡尾巴 */}
          <Box
            className={`absolute top-6 w-0 h-0 ${
              isOwn
                ? 'right-0 border-l-8 border-l-blue-500 border-t-4 border-t-transparent border-b-4 border-b-transparent transform translate-x-full'
                : 'left-0 border-r-8 border-r-white border-t-4 border-t-transparent border-b-4 border-b-transparent transform -translate-x-full'
            }`}
          />
        </Box>
        
        {/* 时间 */}
        <Text className={`text-xs text-gray-400 mt-1 ${isOwn ? 'text-right' : 'text-left'}`}>
          {formatTime(message.f_CreateDate)}
        </Text>
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

  // 当前用户ID（模拟）
  const currentUserId = "current_user";

  // 获取联系人信息和聊天记录
  const initChatData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // 从路由参数获取联系人信息
      const urlParams = new URLSearchParams(location.search);
      const contactId = urlParams.get('id');
      const contactName = urlParams.get('name');
      
      if (location.state?.contact) {
        setContact(location.state.contact);
      } else if (contactId && contactName) {
        // 模拟联系人信息
        setContact({
          f_UserId: contactId,
          f_RealName: contactName,
          f_Account: contactName.toLowerCase(),
        });
      }
      
      // 获取聊天记录 - 使用真实API
      if (contactId) {
        console.log('[聊天页面] 获取聊天记录，联系人ID:', contactId);
        
        try {
          // 按照原项目的方式调用聊天记录接口
          const chatHistory = await httpGetMethod(`/message/chat/history`, {
            targetUserId: contactId,
            pageSize: 50,
            pageIndex: 1
          });
          
          console.log('[聊天页面] 聊天记录响应:', chatHistory);
          
          if (chatHistory && chatHistory.records) {
            // 处理聊天记录数据
            const processedMessages = chatHistory.records.map(msg => ({
              f_MsgId: msg.f_Id || msg.f_MsgId,
              f_Content: msg.f_Content,
              f_SendUserId: msg.f_SendUserId,
              f_ReceiveUserId: msg.f_ReceiveUserId,
              f_CreateDate: msg.f_CreateDate || msg.f_Time,
              senderName: msg.f_SendUserId === currentUserId ? '我' : contactName || '对方',
              senderAvatar: msg.f_SendUserId === currentUserId ? null : location.state?.contact?.f_HeadIcon,
              f_MessageType: msg.f_MessageType
            }));
            
            // 按时间排序（旧消息在上，新消息在下）
            processedMessages.sort((a, b) => 
              new Date(a.f_CreateDate).getTime() - new Date(b.f_CreateDate).getTime()
            );
            
            setMessages(processedMessages);
          }
        } catch (error) {
          console.error('[聊天页面] 获取聊天记录失败:', error);
          // API失败时不显示错误，保持空消息列表
          setMessages([]);
        }
      }
      
    } catch (error) {
      console.error('[聊天页面] 初始化聊天数据失败:', error);
    } finally {
      setIsLoading(false);
    }
  }, [location]);

  // 发送消息 - 使用真实API
  const sendMessage = useCallback(async () => {
    if (!inputMessage.trim() || isSending || !contact) {
      return;
    }

    try {
      setIsSending(true);
      const content = inputMessage.trim();
      
      console.log('[聊天页面] 发送消息:', content, '目标用户:', contact.f_UserId);
      
      // 先添加到本地消息列表（乐观更新）
      const newMessage: ChatMessage = {
        f_MsgId: `temp_${Date.now()}`,
        f_Content: content,
        f_SendUserId: currentUserId,
        f_ReceiveUserId: contact.f_UserId,
        f_CreateDate: new Date().toISOString(),
        senderName: "我",
      };
      
      setMessages(prev => [...prev, newMessage]);
      setInputMessage("");
      
      try {
        // 调用发送消息API
        const result = await httpPostMethod('/message/send', {
          f_ReceiveUserId: contact.f_UserId,
          f_Content: content,
          f_MessageType: 0 // 普通文本消息
        });
        
        console.log('[聊天页面] 发送消息响应:', result);
        
        if (result && result.f_Id) {
          // 更新消息ID为真实ID
          setMessages(prev => 
            prev.map(msg => 
              msg.f_MsgId === newMessage.f_MsgId 
                ? { ...msg, f_MsgId: result.f_Id }
                : msg
            )
          );
        }
        
      } catch (error) {
        console.error('[聊天页面] 发送消息失败:', error);
        // 如果发送失败，可以选择移除或标记失败
        // 这里暂时保留本地消息
      }
      
    } catch (error) {
      console.error('[聊天页面] 发送消息过程失败:', error);
    } finally {
      setIsSending(false);
    }
  }, [inputMessage, isSending, contact, currentUserId]);

    try {
      setIsSending(true);
      
      const newMessage: ChatMessage = {
        f_MsgId: `msg_${Date.now()}`,
        f_Content: inputMessage.trim(),
        f_SendUserId: currentUserId,
        f_ReceiveUserId: contact.f_UserId,
        f_CreateDate: new Date().toISOString(),
        senderName: "我",
      };

      // 添加到消息列表
      setMessages(prev => [...prev, newMessage]);
      setInputMessage("");

      // 模拟发送API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 模拟对方回复（延迟3秒）
      setTimeout(() => {
        const replyMessage: ChatMessage = {
          f_MsgId: `reply_${Date.now()}`,
          f_Content: "收到您的消息，我会尽快回复！",
          f_SendUserId: contact.f_UserId,
          f_ReceiveUserId: currentUserId,
          f_CreateDate: new Date().toISOString(),
          senderName: contact.f_RealName,
        };
        setMessages(prev => [...prev, replyMessage]);
      }, 3000);
      
    } catch (error) {
      console.error('发送消息失败:', error);
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

  // 处理键盘事件
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

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
        <Header title="聊天" showBackIcon={true} onBackClick={goBack} />
        <Box className="flex-1 flex items-center justify-center">
          <Box className="text-center">
            <Box className="inline-block w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></Box>
            <Text className="text-gray-500">加载中...</Text>
          </Box>
        </Box>
      </Page>
    );
  }

  return (
    <Page className="flex flex-col h-screen bg-gray-50">
      {/* 聊天头部 */}
      <Header 
        title={contact?.f_RealName || "Chat"}
        showBackIcon={true} 
        onBackClick={goBack}
      />
      
      {/* 消息列表 */}
      <Box 
        className="flex-1 overflow-auto p-4 bg-gray-100"
        style={{ paddingBottom: '80px' }}
      >
        <div ref={scrollRef}>
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
              <Text className="text-gray-500">Start chatting~</Text>
            </Box>
          )}
        </div>
      </Box>

      {/* Input box */}
      <Box className="bg-white border-t border-gray-200 p-4 sticky bottom-0">
        <Box className="flex items-end space-x-3">
          <Box className="flex-1">
            <Input
              placeholder="Enter message content to send"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="border border-gray-300 rounded-lg"
              maxLength={500}
            />
          </Box>
          <Button
            variant="primary"
            size="small"
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isSending}
            className="px-6"
          >
            {isSending ? "发送中..." : "发送"}
          </Button>
        </Box>
      </Box>
    </Page>
  );
};

export default ChatPage;
