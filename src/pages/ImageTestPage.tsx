import React from 'react';
import { Page, Box, Text } from 'zmp-ui';
import ImageWithFallback from '../components/ImageWithFallback';

const ImageTestPage: React.FC = () => {
  return (
    <Page>
      <Box className="p-4 space-y-4">
        <Text.Title>图片组件测试</Text.Title>
        
        <Box className="space-y-4">
          <Box>
            <Text className="mb-2">正常图片（原始项目logo）:</Text>
            <ImageWithFallback
              src="/src/static/logo.png"
              alt="Logo"
              className="w-32 h-32 object-contain border"
              fallbackType="news"
            />
          </Box>
          
          <Box>
            <Text className="mb-2">错误图片URL（会回退到默认新闻图片）:</Text>
            <ImageWithFallback
              src="https://invalid-url.com/image.jpg"
              alt="Invalid Image"
              className="w-32 h-32 object-cover border"
              fallbackType="news"
            />
          </Box>
          
          <Box>
            <Text className="mb-2">空URL（会显示默认头像图片）:</Text>
            <ImageWithFallback
              src=""
              alt="Empty Image"
              className="w-32 h-32 object-cover border rounded-full"
              fallbackType="avatar"
            />
          </Box>
          
          <Box>
            <Text className="mb-2">无src属性（会显示默认新闻图片）:</Text>
            <ImageWithFallback
              alt="No Source Image"
              className="w-32 h-32 object-cover border"
              fallbackType="news"
            />
          </Box>
        </Box>
      </Box>
    </Page>
  );
};

export default ImageTestPage;
