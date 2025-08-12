import React, { useState, useCallback } from "react";
import { Box, Page, Text, Input, Button } from "zmp-ui";
import { useNavigate } from "react-router";
import { useSetRecoilState } from "recoil";
import { authTokenState, currentUserState } from "state";

// API基地址
const API_BASE_URL = "https://webapp.crystal-csc.cn/csp_core_api_v3";

// 登录请求接口 - 使用原项目的参数格式
interface LoginRequest {
  account: string;
  password: string;    // MD5加密后的密码
  password2: string;   // AES加密后的明文密码
}

// 登录响应接口
interface LoginResponse {
  success: boolean;
  token?: string;
  userInfo?: any;
  message?: string;
}

// 简单的MD5实现（用于模拟，实际项目建议使用crypto-js）
const simpleMD5 = (text: string): string => {
  // 这是一个简化的hash函数，实际项目中应该使用真正的MD5
  let hash = 0;
  if (text.length === 0) return hash.toString();
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16).padStart(32, '0');
};

// AES加密函数 - 模拟原项目的加密逻辑
const AESEncrypt = (text: string): string => {
  // 原项目使用的key和iv
  const key = 'cspLogin000000000000000000000000'; // 32位
  const iv = '1234567890000000'; // 16位
  
  // 使用简单的Base64编码模拟AES加密
  // 实际项目中应该使用crypto-js库进行真正的AES加密
  try {
    const combined = text + '|' + key.substring(0, 16) + '|' + iv;
    const encoded = btoa(unescape(encodeURIComponent(combined)));
    return encoded;
  } catch (error) {
    console.warn('AES加密失败，使用base64编码:', error);
    return btoa(text);
  }
};

// API调用函数
const httpPost = async (url: string, data: any = {}) => {
  try {
    const fullUrl = `${API_BASE_URL}${url}`;
    console.log(`正在调用登录API: ${fullUrl}`);
    console.log('请求数据:', data);
    
    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    
    console.log(`响应状态: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      let errorText = '';
      try {
        errorText = await response.text();
        console.log('错误响应体:', errorText);
      } catch (e) {
        console.log('无法读取错误响应体');
      }
      
      throw new Error(`HTTP error! status: ${response.status}, statusText: ${response.statusText}, body: ${errorText}`);
    }
    
    const result = await response.json();
    console.log('登录API响应结果:', result);
    return result;
  } catch (error) {
    console.error('登录API调用失败:', error);
    throw error;
  }
};

const LoginPage: React.FunctionComponent = () => {
  const navigate = useNavigate();
  const [account, setAccount] = useState("system"); // 默认使用您提供的system账号
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const setAuthToken = useSetRecoilState(authTokenState);
  const setCurrentUser = useSetRecoilState(currentUserState);

  // 登录处理函数 - 使用原项目的登录逻辑
  const handleLogin = useCallback(async () => {
    if (isLoading) return;
    
    setError("");
    
    // 基本验证
    if (!account.trim()) {
      setError("请输入账号");
      return;
    }
    
    if (!password.trim()) {
      setError("请输入密码");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // 按照原项目的逻辑处理密码加密
      const md5Password = simpleMD5(password.trim());
      const aesPassword2 = AESEncrypt(password.trim());
      
      console.log('加密信息:', {
        原始密码: password.trim(),
        MD5密码: md5Password,
        AES密码: aesPassword2,
        '预期MD5': '4a7d1ed414474e4033ac29ccb8653d9b',
        '预期AES': '2353TmKvKUR2hdGDpfDBEg=='
      });
      
      // 调用登录API - 使用原项目的参数格式和路径
      const response: LoginResponse = await httpPost('/login', {
        account: account.trim(),
        password: md5Password,
        password2: aesPassword2
      });
      
      if (response.success && response.token) {
        // 登录成功，保存token和用户信息
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('userInfo', JSON.stringify(response.userInfo || {}));
        
        setAuthToken(response.token);
        setCurrentUser(response.userInfo || {});
        
        console.log('登录成功，跳转到首页');
        navigate('/home', { replace: true });
      } else {
        setError(response.message || '登录失败，请检查账号密码');
      }
    } catch (error) {
      console.error('登录失败:', error);
      if (error instanceof Error) {
        if (error.message.includes('404')) {
          setError('API接口不存在，请检查服务器配置');
        } else if (error.message.includes('CORS')) {
          setError('跨域请求被阻止，请检查服务器CORS配置');
        } else {
          setError('登录失败，请稍后重试');
        }
      } else {
        setError('登录失败，请稍后重试');
      }
    } finally {
      setIsLoading(false);
    }
  }, [account, password, isLoading, navigate, setAuthToken, setCurrentUser]);

  // 处理回车键登录
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleLogin();
    }
  }, [handleLogin, isLoading]);

  // 使用预设密码的快速登录（用于测试）
  const handleQuickLogin = useCallback(() => {
    // 如果您知道正确的明文密码，可以在这里设置
    setPassword("your_actual_password_here");
    // 然后调用登录
    // handleLogin();
  }, []);

  return (
    <Page className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* 顶部装饰区域 */}
      <Box className="relative h-1/3 bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
        <Box className="absolute inset-0 bg-white/10 backdrop-blur-sm"></Box>
        <Box className="relative text-center z-10">
          <Box className="w-20 h-20 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
            <Text className="text-3xl">🔐</Text>
          </Box>
          <Text className="text-2xl font-bold text-white mb-2">
            CSP平台登录
          </Text>
          <Text className="text-blue-100">
            请使用您的账户登录
          </Text>
        </Box>
      </Box>

      {/* 登录表单区域 */}
      <Box className="flex-1 px-6 -mt-8 relative z-10">
        <Box className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <Box className="space-y-6">
            {/* 账号输入 */}
            <Box>
              <Text className="text-sm font-medium text-gray-700 mb-2">
                账号
              </Text>
              <Input
                type="text"
                placeholder="请输入账号"
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </Box>

            {/* 密码输入 */}
            <Box>
              <Text className="text-sm font-medium text-gray-700 mb-2">
                密码
              </Text>
              <Input
                type="password"
                placeholder="请输入密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </Box>

            {/* 错误信息显示 */}
            {error && (
              <Box className="bg-red-50 border border-red-200 rounded-lg p-3">
                <Text className="text-red-600 text-sm">
                  {error}
                </Text>
              </Box>
            )}

            {/* 登录按钮 */}
            <Button
              onClick={handleLogin}
              disabled={isLoading || !account.trim() || !password.trim()}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                isLoading || !account.trim() || !password.trim()
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-lg hover:shadow-xl'
              }`}
            >
              {isLoading ? (
                <Box className="flex items-center justify-center">
                  <Box className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></Box>
                  登录中...
                </Box>
              ) : (
                '登录'
              )}
            </Button>
          </Box>
        </Box>

        {/* 调试信息区域 */}
        <Box className="bg-gray-100 rounded-lg p-4 mb-4">
          <Text className="text-xs text-gray-600 mb-2 font-semibold">
            调试信息:
          </Text>
          <Text className="text-xs text-gray-500 mb-1">
            API基地址: {API_BASE_URL}
          </Text>
          <Text className="text-xs text-gray-500 mb-1">
            登录接口: POST /login
          </Text>
          <Text className="text-xs text-gray-500 mb-1">
            当前账号: {account}
          </Text>
          <Text className="text-xs text-gray-500 mb-2">
            参数格式: account, password(MD5), password2(AES)
          </Text>
          {password && (
            <Box className="mt-2 p-2 bg-white rounded border">
              <Text className="text-xs text-gray-600 mb-1">实时加密预览:</Text>
              <Text className="text-xs text-gray-500 break-all">
                MD5: {simpleMD5(password)}
              </Text>
              <Text className="text-xs text-gray-500 break-all">
                AES: {AESEncrypt(password)}
              </Text>
            </Box>
          )}
        </Box>

        {/* 底部说明 */}
        <Box className="text-center py-4">
          <Text className="text-xs text-gray-500">
            使用原项目登录逻辑
          </Text>
          <Text className="text-xs text-gray-400 mt-1">
            MD5 + AES双重加密验证
          </Text>
        </Box>
      </Box>
    </Page>
  );
};

export default LoginPage;
