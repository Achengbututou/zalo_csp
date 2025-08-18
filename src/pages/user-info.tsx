import React, { FC, useState, useEffect } from "react";
import { Box, Page, Text } from "zmp-ui";
import { useNavigate } from "react-router-dom";
import ImageWithFallback from "components/ImageWithFallback";
import { SafeHeader } from "components/with-safe-area";

// User information interface
interface UserInfo {
  f_UserId: string;
  f_RealName: string;
  f_Account: string;
  f_HeadIcon?: string;
  f_CompanyName?: string;
  f_DepartmentName?: string;
  f_Phone?: string;
  f_Email?: string;
  f_CreateDate?: string;
}

const UserInfoPage: FC = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    // 获取用户信息的函数
    const fetchUserInfo = async () => {
      try {
        // 首先尝试从localStorage获取缓存的用户信息
        const storedUserInfo = localStorage.getItem('userInfo');
        if (storedUserInfo) {
          try {
            const user = JSON.parse(storedUserInfo);
            setUserInfo(user);
          } catch (error) {
            console.error('解析缓存用户信息失败:', error);
          }
        }

        // 从API获取最新的用户信息
        const token = localStorage.getItem('token') || 
                     localStorage.getItem('authToken');
        
        if (token) {
          const response = await fetch('https://webapp.crystal-csc.cn/csp_core_api_v3/login/app', {
            method: 'GET',
            headers: {
              'token': token,  // 使用原项目的token格式
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const userData = await response.json();
            if (userData) {
              // 处理用户数据
              const processedUser = {
                f_UserId: userData.f_UserId,
                f_RealName: userData.f_RealName,
                f_Account: userData.f_Account,
                f_HeadIcon: userData.f_HeadIcon,
                f_CompanyName: userData.f_CompanyName,
                f_DepartmentName: userData.f_DepartmentName,
                f_Phone: userData.f_Phone,
                f_Email: userData.f_Email,
                f_CreateDate: userData.f_CreateDate,
              };

              setUserInfo(processedUser);
              // 更新localStorage中的用户信息
              localStorage.setItem('userInfo', JSON.stringify(processedUser));
            }
          } else {
            console.error('获取用户信息失败:', response.status, response.statusText);
          }
        }
      } catch (error) {
        console.error('获取用户信息时发生错误:', error);
      }
    };

    fetchUserInfo();
  }, []);

  // 构建头像URL
  const getAvatarUrl = (headIcon?: string) => {
    if (!headIcon) {
      return "/static/img-avatar/head.png";
    }
    
    if (headIcon.startsWith('http')) {
      return headIcon;
    }
    
    const token = localStorage.getItem('token') || 
                 localStorage.getItem('authToken') || 
                 JSON.parse(localStorage.getItem('userInfo') || '{}')?.token || '';
    
    return `https://webapp.crystal-csc.cn/csp_core_api_v3/File/FileDownload/${headIcon}?token=${token}`;
  };

  if (!userInfo) {
    return (
      <Page className="bg-gray-50 min-h-screen">
        <SafeHeader title="个人信息" showBackIcon={true} onBackClick={() => navigate(-1)}>
        </SafeHeader>
        <Box className="flex items-center justify-center py-20">
          <Text className="text-gray-500">加载中...</Text>
        </Box>
      </Page>
    );
  }

  return (
    <Page className="bg-gray-50 min-h-screen">
      <SafeHeader title="Personal Information" showBackIcon={true} onBackClick={() => navigate(-1)}>
      </SafeHeader>

      {/* Avatar area */}
      <Box className="bg-white mx-4 mt-4 rounded-2xl shadow-sm p-6">
        <Box className="flex flex-col items-center">
          <Box className="w-24 h-24 rounded-full overflow-hidden shadow-lg bg-gray-100 mb-4">
            <ImageWithFallback
              src={getAvatarUrl(userInfo.f_HeadIcon)}
              alt={userInfo.f_RealName}
              className="w-full h-full object-cover"
              fallbackType="avatar"
            />
          </Box>
          <Text className="text-xl font-bold text-gray-900 mb-2">
            {userInfo.f_RealName}
          </Text>
          <Text className="text-gray-500 text-sm">
            {userInfo.f_Account}
          </Text>
        </Box>
      </Box>

      {/* 详细信息 */}
      <Box className="bg-white mx-4 mt-4 rounded-2xl shadow-sm overflow-hidden">
        {/* 公司信息 */}
        {userInfo.f_CompanyName && (
          <Box className="flex items-center p-4 border-b border-gray-100">
            <Text className="text-gray-600 w-20 flex-shrink-0">公司</Text>
            <Text className="text-gray-900 flex-1">{userInfo.f_CompanyName}</Text>
          </Box>
        )}

        {/* 部门信息 */}
        {userInfo.f_DepartmentName && (
          <Box className="flex items-center p-4 border-b border-gray-100">
            <Text className="text-gray-600 w-20 flex-shrink-0">部门</Text>
            <Text className="text-gray-900 flex-1">{userInfo.f_DepartmentName}</Text>
          </Box>
        )}

        {/* 手机号 */}
        {userInfo.f_Phone && (
          <Box className="flex items-center p-4 border-b border-gray-100">
            <Text className="text-gray-600 w-20 flex-shrink-0">手机</Text>
            <Text className="text-gray-900 flex-1">{userInfo.f_Phone}</Text>
          </Box>
        )}

        {/* 邮箱 */}
        {userInfo.f_Email && (
          <Box className="flex items-center p-4 border-b border-gray-100">
            <Text className="text-gray-600 w-20 flex-shrink-0">邮箱</Text>
            <Text className="text-gray-900 flex-1">{userInfo.f_Email}</Text>
          </Box>
        )}

        {/* 用户ID */}
        <Box className="flex items-center p-4 border-b border-gray-100">
          <Text className="text-gray-600 w-20 flex-shrink-0">用户ID</Text>
          <Text className="text-gray-900 flex-1">{userInfo.f_UserId}</Text>
        </Box>

        {/* 创建时间 */}
        {userInfo.f_CreateDate && (
          <Box className="flex items-center p-4">
            <Text className="text-gray-600 w-20 flex-shrink-0">创建时间</Text>
            <Text className="text-gray-900 flex-1">
              {new Date(userInfo.f_CreateDate).toLocaleDateString('zh-CN')}
            </Text>
          </Box>
        )}
      </Box>

      {/* 占位空间 */}
      <Box className="h-8"></Box>
    </Page>
  );
};

export default UserInfoPage;
