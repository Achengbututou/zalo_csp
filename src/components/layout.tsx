import React, { FC } from "react";
import { Route, Routes, Navigate } from "react-router";
import { Box } from "zmp-ui";
import { Navigation } from "./navigation";
import { ProtectedRoute, PublicRoute } from "./route-guard";
import { AuthInitializer } from "./auth-initializer";
import HomePage from "pages/index";
import LoginPage from "pages/login";
import NotificationPage from "pages/notification";
import ProfilePage from "pages/profile";
import UserInfoPage from "pages/user-info";
import CheckoutResultPage from "pages/result";
import NewsDetailPage from "pages/news-detail";
import ChatPage from "pages/chat";
import MessagePage from "pages/message";
import FormTestFixedPage from "pages/form-test-fixed";
import FormTestOriginalPage from "pages/form-test-original";
import PhoneExamplePage from "pages/phone-example";
import { getSystemInfo } from "zmp-sdk";
import { ScrollRestoration } from "./scroll-restoration";
import { useHandlePayment } from "hooks";
import { useRecoilValue } from "recoil";
import { isAuthenticatedState } from "state";

if (import.meta.env.DEV) {
  document.body.style.setProperty("--zaui-safe-area-inset-top", "24px");
} else if (getSystemInfo().platform === "android") {
  const statusBarHeight =
    window.ZaloJavaScriptInterface?.getStatusBarHeight() ?? 0;
  const androidSafeTop = Math.round(statusBarHeight / window.devicePixelRatio);
  document.body.style.setProperty(
    "--zaui-safe-area-inset-top",
    `${androidSafeTop}px`
  );
}

// 根路由重定向组件
const RootRedirect: FC = () => {
  const isAuthenticated = useRecoilValue(isAuthenticatedState);
  
  // 根据登录状态重定向
  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  } else {
    return <Navigate to="/login" replace />;
  }
};

export const Layout: FC = () => {
  useHandlePayment();

  return (
    <AuthInitializer>
      <Box flex flexDirection="column" className="h-screen">
        <ScrollRestoration />
        <Box className="flex-1 flex flex-col overflow-hidden">
          <Routes>
            {/* Root route - redirect based on auth status */}
            <Route path="/" element={<RootRedirect />} />

            {/* Public routes - Login page */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />

            {/* Protected routes - Require login to access */}
            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notification"
              element={
                <ProtectedRoute>
                  <NotificationPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/user-info"
              element={
                <ProtectedRoute>
                  <UserInfoPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/result"
              element={
                <ProtectedRoute>
                  <CheckoutResultPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/news-detail"
              element={
                <ProtectedRoute>
                  <NewsDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <ChatPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/message"
              element={
                <ProtectedRoute>
                  <MessagePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/form-test"
              element={
                <ProtectedRoute>
                  <FormTestFixedPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/form-test-original"
              element={
                <ProtectedRoute>
                  <FormTestOriginalPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/phone-example"
              element={
                <ProtectedRoute>
                  <PhoneExamplePage />
                </ProtectedRoute>
              }
            />

            {/* Catch all route - redirect to login for unknown paths */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Box>
        <Navigation />
      </Box>
    </AuthInitializer>
  );
};
