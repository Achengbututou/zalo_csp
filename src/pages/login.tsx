import React, { useState, useCallback } from "react";
import { Box, Page, Text, Input, Button, Icon } from "zmp-ui";
import { useNavigate } from "react-router";
import { useSetRecoilState } from "recoil";
import { authTokenState, currentUserState } from "state";
import CryptoJS from 'crypto-js';
import logoImage from '../static/logo.png';
import { SafeArea } from '../components/safe-area';

// API Base URL
const API_BASE_URL = "https://webapp.crystal-csc.cn/csp_core_api_v3";

// Login request interface - using original project parameter format
interface LoginRequest {
  account: string;
  password: string;    // MD5 encrypted password
  password2: string;   // AES encrypted plain text password
}

// Login response interface - updated to actual API return format
interface LoginResponse {
  code: number;
  info: string;
  data?: {
    token: string;
    user: any;
  };
}

// MD5 encryption function - using crypto-js
const MD5 = (text: string): string => {
  return CryptoJS.MD5(text).toString();
};

// AES encryption function - following original project encryption logic
const AESEncrypt = (text: string): string => {
  // Key and IV used in original project
  const key = CryptoJS.enc.Utf8.parse('cspLogin000000000000000000000000'); // 32 bits
  const iv = CryptoJS.enc.Utf8.parse('1234567890000000'); // 16 bits

  // Use AES encryption with original project parameters
  const encrypted = CryptoJS.AES.encrypt(text, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });

  return encrypted.toString();
};

// API call function
const httpPost = async (url: string, data: any = {}) => {
  try {
    const fullUrl = `${API_BASE_URL}${url}`;

    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      let errorText = '';
      try {
        errorText = await response.text();
      } catch (e) {
        // Unable to read error response body
      }

      throw new Error(`HTTP error! status: ${response.status}, statusText: ${response.statusText}, body: ${errorText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Login API call failed:', error);
    throw error;
  }
};

const LoginPage: React.FunctionComponent = () => {
  const navigate = useNavigate();
  const [account, setAccount] = useState(""); // Default using provided system account
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // Control password visibility state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const setAuthToken = useSetRecoilState(authTokenState);
  const setCurrentUser = useSetRecoilState(currentUserState);

  // Login handler function - using original project login logic
  const handleLogin = useCallback(async () => {
    if (isLoading) return;

    setError("");

    // Basic validation
    if (!account.trim()) {
      setError("Please enter your account");
      return;
    }

    if (!password.trim()) {
      setError("Please enter your password");
      return;
    }
    
    setIsLoading(true);

    try {
      // Process password encryption according to original project logic
      const md5Password = MD5(password.trim());
      const aesPassword2 = AESEncrypt(password.trim());

      // Call login API - using original project parameter format and path
      const response: LoginResponse = await httpPost('/login', {
        account: account.trim(),
        password: md5Password,
        password2: aesPassword2
      });

      if (response.code === 200 && response.data?.token) {
        // Login successful, save token and user info according to original project
        const token = response.data.token;
        const user = response.data.user || {};

        // Store token (mimicking original project's SET_STORAGE('token', token))
        localStorage.setItem('authToken', token);
        localStorage.setItem('token', token);

        // Store user info with token included in user object
        const userWithToken = { ...user, token };
        localStorage.setItem('userInfo', JSON.stringify(userWithToken));

        console.log('Login successful, token saved:', token.substring(0, 20) + '...');

        // 先设置Recoil状态
        setAuthToken(token);
        setCurrentUser(userWithToken);

        // 等待一小段时间确保状态更新完成，然后跳转
        setTimeout(() => {
          navigate('/home', { replace: true });
        }, 100);
      } else {
        setError(response.info || 'Login failed, please check your account and password');
      }
    } catch (error) {
      console.error('Login failed:', error);
      if (error instanceof Error) {
        if (error.message.includes('404')) {
          setError('API endpoint not found, please check server configuration');
        } else if (error.message.includes('CORS')) {
          setError('Cross-origin request blocked, please check server CORS configuration');
        } else {
          setError('Login failed, please try again later');
        }
      } else {
        setError('Login failed, please try again later');
      }
    } finally {
      setIsLoading(false);
    }
  }, [account, password, isLoading, navigate, setAuthToken, setCurrentUser]);

  // Handle Enter key login
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleLogin();
    }
  }, [handleLogin, isLoading]);

  // Toggle password visibility state
  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  return (
    <Page className="min-h-screen bg-white">
      {/* Main content area */}
      <SafeArea 
        className="w-full max-w-md mx-auto px-6 text-center" 
        topOffset={100}
      >

        {/* Header area */}
        <Box className="mb-12">
          {/* Logo area */}
          <Box className="mb-8 text-center">
            <img
              src={logoImage}
              alt="Crystal Service Platform Logo"
              className="h-16 w-24 object-contain mx-auto mb-6"
            />
            <Text.Title size="large" className="text-gray-800 font-medium mb-2">
              Crystal Service Platform
            </Text.Title>
            <Text className="text-gray-500">
              V1.1.0
            </Text>
          </Box>
        </Box>

        {/* Login form area */}
        <Box className="w-full space-y-6">
          {/* Account input area */}
          <Box>
            {/* <Text className="text-gray-700 mb-2 block">
              Account
            </Text> */}
            <Input
              type="text"
              placeholder="Please enter your account"
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              size="large"
              className="w-full"
            />
          </Box>

          {/* Password input area */}
          <Box>
            {/* <Text className="text-gray-700 mb-2 block">
              Password
            </Text> */}
            <Box className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Please enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                size="large"
                className="w-full pr-12"
              />
              <Button
                size="small"
                variant="tertiary"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 rounded p-0 flex items-center justify-center"
                onClick={togglePasswordVisibility}
              >
                <Icon
                  icon={showPassword ? "zi-unlock" : "zi-lock"}
                  className="text-gray-500"
                />
              </Button>
            </Box>
          </Box>

          {/* Error message display */}
          {error && (
            <Box className="bg-red-50 border border-red-200 rounded-lg p-4">
              <Text className="text-red-600 text-sm">
                {error}
              </Text>
            </Box>
          )}

          {/* Login button */}
          <Button
            variant="primary"
            size="large"
            fullWidth
            loading={isLoading}
            disabled={!account.trim() || !password.trim()}
            onClick={handleLogin}
            className="mt-8"
          >
            {isLoading ? "Logging in..." : "Login"}
          </Button>
        </Box>

        {/* Footer info - fixed at bottom */}
        <Box className="fixed bottom-5 left-0 right-0 text-center">
          <Text size="small" className="text-gray-400">
            Crystal International Group
          </Text>
        </Box>
      </SafeArea>
    </Page>
  );
};

export default LoginPage;
