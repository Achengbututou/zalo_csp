import React, { FC } from "react";
import { Box, Page, Text, Button, Icon } from "zmp-ui";
import { useNavigate } from "react-router";
import logoImage from '../static/logo.png';
import { SafeArea } from '../components/safe-area';

const CompanyIntroPage: FC = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/login-guide');
  };

  const handleDirectLogin = () => {
    navigate('/login');
  };

  return (
    <Page className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <SafeArea className="w-full max-w-4xl mx-auto px-6 py-8">
        {/* Header Section */}
        <Box className="text-center mb-12">
          <Box className="mb-8">
            <img
              src={logoImage}
              alt="Crystal International Group Logo"
              className="h-20 w-28 object-contain mx-auto mb-6"
            />
            <Text.Title size="large" className="text-gray-800 font-bold mb-3">
              Crystal International Group
            </Text.Title>
            <Text className="text-blue-600 font-medium text-lg">
              Leading Textile & Apparel Manufacturing Excellence
            </Text>
          </Box>
        </Box>

        {/* Company Overview */}
        <Box className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <Box className="flex items-center mb-6">
            <Box className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
              <Icon icon="zi-star" className="text-blue-600 text-xl" />
            </Box>
            <Text.Title size="medium" className="text-gray-800 font-bold">
              About Crystal International Group
            </Text.Title>
          </Box>
          
          <Text className="text-gray-700 leading-relaxed mb-6 text-base">
            Crystal International Group is a leading global textile and apparel manufacturing company, 
            established with a commitment to excellence, innovation, and sustainable practices. 
            With decades of experience in the industry, we have built a reputation for delivering 
            high-quality products and services to customers worldwide.
          </Text>

          <Text className="text-gray-700 leading-relaxed text-base">
            Our operations span across multiple countries in Asia, including significant presence 
            in Vietnam, where we leverage local expertise and advanced manufacturing capabilities 
            to serve our global clientele with efficiency and precision.
          </Text>
        </Box>

        {/* Key Strengths */}
        <Box className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <Box className="flex items-center mb-6">
            <Box className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
              <Icon icon="zi-check-circle" className="text-green-600 text-xl" />
            </Box>
            <Text.Title size="medium" className="text-gray-800 font-bold">
              Our Core Strengths
            </Text.Title>
          </Box>

          <Box className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Box className="flex items-start">
              <Box className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-4 mt-1">
                <Icon icon="zi-setting" className="text-blue-600" />
              </Box>
              <Box>
                <Text className="font-semibold text-gray-800 mb-2">Advanced Manufacturing</Text>
                <Text className="text-gray-600 text-sm">
                  State-of-the-art production facilities with cutting-edge technology and automation.
                </Text>
              </Box>
            </Box>

            <Box className="flex items-start">
              <Box className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-4 mt-1">
                <Icon icon="zi-user-circle" className="text-green-600" />
              </Box>
              <Box>
                <Text className="font-semibold text-gray-800 mb-2">Skilled Workforce</Text>
                <Text className="text-gray-600 text-sm">
                  Highly trained professionals committed to quality and continuous improvement.
                </Text>
              </Box>
            </Box>

            <Box className="flex items-start">
              <Box className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-4 mt-1">
                <Icon icon="zi-more-grid" className="text-purple-600" />
              </Box>
              <Box>
                <Text className="font-semibold text-gray-800 mb-2">Global Network</Text>
                <Text className="text-gray-600 text-sm">
                  Strategic locations across Asia-Pacific region for optimal supply chain management.
                </Text>
              </Box>
            </Box>

            <Box className="flex items-start">
              <Box className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-4 mt-1">
                <Icon icon="zi-calendar" className="text-orange-600" />
              </Box>
              <Box>
                <Text className="font-semibold text-gray-800 mb-2">Sustainability Focus</Text>
                <Text className="text-gray-600 text-sm">
                  Environmental responsibility and sustainable manufacturing practices.
                </Text>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Vietnam Operations */}
        <Box className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-lg p-8 mb-8 text-white">
          <Box className="flex items-center mb-6">
            <Box className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-4">
              <Text className="text-2xl">🇻🇳</Text>
            </Box>
            <Text.Title size="medium" className="text-white font-bold">
              Our Presence in Vietnam
            </Text.Title>
          </Box>
          
          <Text className="text-blue-100 leading-relaxed mb-4 text-base">
            Vietnam represents a strategic cornerstone of our operations, where we combine 
            local expertise with international standards to deliver exceptional results. 
            Our Vietnamese facilities are equipped with modern technology and staffed by 
            dedicated professionals who embody our commitment to quality and innovation.
          </Text>

          <Box className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <Box className="bg-white/10 rounded-lg p-4 text-center">
              <Text className="text-2xl mb-2">🏭</Text>
              <Text className="font-semibold mb-1">Modern Facilities</Text>
              <Text className="text-blue-100 text-sm">Advanced manufacturing plants</Text>
            </Box>
            <Box className="bg-white/10 rounded-lg p-4 text-center">
              <Text className="text-2xl mb-2">👥</Text>
              <Text className="font-semibold mb-1">Local Talent</Text>
              <Text className="text-blue-100 text-sm">Skilled Vietnamese workforce</Text>
            </Box>
            <Box className="bg-white/10 rounded-lg p-4 text-center">
              <Text className="text-2xl mb-2">🌱</Text>
              <Text className="font-semibold mb-1">Sustainable Growth</Text>
              <Text className="text-blue-100 text-sm">Environmental stewardship</Text>
            </Box>
          </Box>
        </Box>

        {/* Call to Action */}
        <Box className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <Text.Title size="medium" className="text-gray-800 font-bold mb-4">
            Ready to Get Started?
          </Text.Title>
          <Text className="text-gray-600 mb-8 leading-relaxed">
            Access our Crystal Service Platform to connect with our team, 
            stay updated with company news, and manage your business operations efficiently.
          </Text>
          
          <Box className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="primary"
              size="large"
              onClick={handleGetStarted}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              <Icon icon="zi-arrow-right" className="mr-2" />
              Get Started
            </Button>
            
            <Button
              variant="secondary"
              size="large"
              onClick={handleDirectLogin}
              className="px-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl border border-gray-300 transition-all duration-200"
            >
              <Icon icon="zi-user" className="mr-2" />
              Direct Login
            </Button>
          </Box>
        </Box>

        {/* Footer */}
        <Box className="text-center mt-12 pt-8 border-t border-gray-200">
          <Text className="text-gray-500 text-sm">
            © 2025 Crystal International Group. All rights reserved.
          </Text>
          <Text className="text-gray-400 text-xs mt-2">
            Excellence in Textile & Apparel Manufacturing
          </Text>
        </Box>
      </SafeArea>
    </Page>
  );
};

export default CompanyIntroPage;
