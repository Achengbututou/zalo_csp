import React from "react";
import { useRecoilValue } from "recoil";
import { Navigate, useLocation } from "react-router-dom";
import { isAuthenticatedState } from "state";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

// 受保护的路由组件
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const isAuthenticated = useRecoilValue(isAuthenticatedState);
  const location = useLocation();

  if (!isAuthenticated) {
    // 如果未登录，重定向到登录页面，并保存当前路径
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// 公共路由组件（已登录用户不应访问的页面，如登录页）
export const PublicRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const isAuthenticated = useRecoilValue(isAuthenticatedState);
  const location = useLocation();

  if (isAuthenticated) {
    // 如果已登录，重定向到首页或原来要访问的页面
    const from = (location.state as any)?.from?.pathname || "/home";
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
};
