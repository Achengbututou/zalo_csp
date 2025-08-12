import React, { useEffect } from "react";
import { useRecoilState, useSetRecoilState, useRecoilValue } from "recoil";
import { useNavigate, useLocation } from "react-router-dom";
import { authTokenState, currentUserState } from "state";

interface AuthInitializerProps {
  children: React.ReactNode;
}

export const AuthInitializer: React.FC<AuthInitializerProps> = ({ children }) => {
  const [authToken, setAuthToken] = useRecoilState(authTokenState);
  const setCurrentUser = useSetRecoilState(currentUserState);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // 检查并同步登录状态
    const checkAuthStatus = () => {
      if (typeof localStorage !== "undefined") {
        const token = localStorage.getItem("authToken");
        const userInfo = localStorage.getItem("userInfo");

        console.log('[AuthInitializer] 检查登录状态:', { token: token ? 'exists' : 'null', userInfo: userInfo ? 'exists' : 'null' });

        // 如果localStorage中有数据但Recoil状态中没有，同步到Recoil
        if (token && userInfo) {
          try {
            const parsedUserInfo = JSON.parse(userInfo);
            
            if (parsedUserInfo && typeof parsedUserInfo === 'object') {
              // 如果Recoil状态中没有数据，从localStorage同步
              if (!authToken) {
                console.log('[AuthInitializer] 从localStorage同步token到Recoil状态');
                setAuthToken(token);
              }
              if (!parsedUserInfo.token) {
                // 确保用户信息中包含token
                parsedUserInfo.token = token;
                localStorage.setItem('userInfo', JSON.stringify(parsedUserInfo));
              }
              setCurrentUser(parsedUserInfo);
              return; // 有效登录状态，直接返回
            }
          } catch (error) {
            console.warn("Failed to parse user info:", error);
          }
        }

        // 只有在localStorage中确实没有有效数据时才清理和重定向
        if (!token || !userInfo) {
          console.log('[AuthInitializer] 没有有效登录数据，清理状态');
          localStorage.removeItem("authToken");
          localStorage.removeItem("token");
          localStorage.removeItem("userInfo");
          setAuthToken(null);
          setCurrentUser(null);
          
          // 如果当前不在登录页面，重定向到登录页面
          if (location.pathname !== "/login") {
            navigate("/login", { replace: true });
          }
        }
      }
    };

    // 监听HTTP服务发出的认证错误事件
    const handleAuthError = (event: CustomEvent) => {
      console.log('[AuthInitializer] 收到认证错误事件:', event.detail);
      
      // 清理状态
      setAuthToken(null);
      setCurrentUser(null);
      
      // 重定向到登录页面
      if (location.pathname !== "/login") {
        navigate("/login", { replace: true });
      }
    };

    // 应用启动时检查登录状态
    checkAuthStatus();

    // 添加事件监听器
    if (typeof window !== "undefined") {
      window.addEventListener('auth-error', handleAuthError as EventListener);
      
      // 清理函数
      return () => {
        window.removeEventListener('auth-error', handleAuthError as EventListener);
      };
    }
  }, [authToken, setAuthToken, setCurrentUser, navigate, location.pathname]);

  return <>{children}</>;
};
