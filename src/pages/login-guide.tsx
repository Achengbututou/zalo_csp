import React, { FC } from "react";
import { Box, Page, Text, Button, Icon } from "zmp-ui";
import { useNavigate } from "react-router";
import logoImage from '../static/logo.png';
import { SafeArea } from '../components/safe-area';

const LoginGuidePage: FC = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/login');
  };

  const handleBackToIntro = () => {
    navigate('/company-intro');
  };

  return (
    <Page className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600">
      <SafeArea className="w-full max-w-md mx-auto px-6 py-8 text-center">
        {/* Header Section */}
        <Box className="mb-12">
          <img
            src={logoImage}
            alt="Crystal International Group Logo"
            className="h-16 w-24 object-contain mx-auto mb-6"
          />
          <Text.Title size="large" className="text-white font-bold mb-3">
            Welcome to Crystal Service Platform
          </Text.Title>
          <Text className="text-blue-100 text-lg">
            Your Gateway to Excellence
          </Text>
        </Box>

        {/* Main Content Card */}
        <Box className="bg-white rounded-3xl shadow-2xl p-8 mb-8">
          {/* Welcome Icon */}
          <Box className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Icon icon="zi-user-circle" className="text-blue-600 text-3xl" />
          </Box>

          {/* Welcome Message */}
          <Text.Title size="medium" className="text-gray-800 font-bold mb-4">
            Ready to Connect?
          </Text.Title>
          
          <Text className="text-gray-600 leading-relaxed mb-8 text-base">
            Access your personalized dashboard to stay connected with Crystal International Group. 
            Get the latest company updates, connect with colleagues, and manage your work efficiently.
          </Text>

          {/* Features List */}
          <Box className="space-y-4 mb-8">
            <Box className="flex items-center text-left">
              <Box className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-4">
                <Icon icon="zi-check" className="text-green-600 text-sm" />
              </Box>
              <Text className="text-gray-700 font-medium">Latest News & Announcements</Text>
            </Box>
            
            <Box className="flex items-center text-left">
              <Box className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <Icon icon="zi-check" className="text-blue-600 text-sm" />
              </Box>
              <Text className="text-gray-700 font-medium">Internal Communication Tools</Text>
            </Box>
            
            <Box className="flex items-center text-left">
              <Box className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                <Icon icon="zi-check" className="text-purple-600 text-sm" />
              </Box>
              <Text className="text-gray-700 font-medium">Employee Directory & Contacts</Text>
            </Box>
            
            <Box className="flex items-center text-left">
              <Box className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-4">
                <Icon icon="zi-check" className="text-orange-600 text-sm" />
              </Box>
              <Text className="text-gray-700 font-medium">Personalized User Experience</Text>
            </Box>
          </Box>

          {/* Login Button */}
          <Button
            variant="primary"
            size="large"
            fullWidth
            onClick={handleLogin}
            className="mb-4 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-2xl shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95"
          >
            <Icon icon="zi-arrow-right" className="mr-3" />
            Login to Your Account
          </Button>

          {/* Secondary Action */}
          <Button
            variant="tertiary"
            size="medium"
            fullWidth
            onClick={handleBackToIntro}
            className="text-gray-500 hover:text-gray-700 font-medium transition-colors duration-200"
          >
            <Icon icon="zi-arrow-left" className="mr-2" />
            Back to Company Info
          </Button>
        </Box>

        {/* Security Notice */}
        <Box className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8">
          <Box className="flex items-center justify-center mb-3">
            <Icon icon="zi-lock" className="text-white mr-2" />
            <Text className="text-white font-semibold">Secure Access</Text>
          </Box>
          <Text className="text-blue-100 text-sm leading-relaxed">
            Your data is protected with enterprise-grade security. 
            All communications are encrypted and your privacy is our priority.
          </Text>
        </Box>

        {/* Help Section */}
        <Box className="bg-white/5 backdrop-blur-sm rounded-2xl p-6">
          <Text className="text-white font-semibold mb-3">Need Help?</Text>
          <Text className="text-blue-100 text-sm leading-relaxed mb-4">
            If you're having trouble accessing your account or need assistance, 
            please contact your system administrator or IT support team.
          </Text>
          
          <Box className="flex items-center justify-center space-x-6 text-blue-200">
            <Box className="flex items-center">
              <Icon icon="zi-chat" className="mr-2 text-sm" />
              <Text className="text-sm">Support Chat</Text>
            </Box>
            <Box className="flex items-center">
              <Icon icon="zi-user-circle" className="mr-2 text-sm" />
              <Text className="text-sm">Admin Contact</Text>
            </Box>
          </Box>
        </Box>

        {/* Footer */}
        <Box className="mt-12 pt-6">
          <Text className="text-blue-200 text-xs">
            Crystal Service Platform v1.1.0
          </Text>
          <Text className="text-blue-300 text-xs mt-1">
            © 2025 Crystal International Group
          </Text>
        </Box>
      </SafeArea>
    </Page>
  );
};

export default LoginGuidePage;
