import React, { useState } from 'react';
import defaultNewsImage from '../static/404/Announcement.png';
import defaultAvatarImage from '../static/img-avatar/head.png';

interface ImageWithFallbackProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackType?: 'news' | 'avatar';
  [key: string]: any;
}

/**
 * 带有失败回退的图片组件
 * 模仿原始项目的图片错误处理方式
 */
const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  className = '',
  fallbackType = 'news',
  ...props
}) => {
  const [imageSrc, setImageSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  // 根据fallbackType选择默认图片
  const getFallbackImage = () => {
    switch (fallbackType) {
      case 'avatar':
        return defaultAvatarImage;
      case 'news':
      default:
        return defaultNewsImage;
    }
  };

  const handleImageError = () => {
    if (!hasError) {
      console.log(`[ImageWithFallback] 图片加载失败，使用默认图片: ${fallbackType}`);
      setImageSrc(getFallbackImage());
      setHasError(true);
    }
  };

  // 如果没有提供src，直接使用默认图片
  const displaySrc = imageSrc || getFallbackImage();

  return (
    <img
      src={displaySrc}
      alt={alt}
      className={className}
      onError={handleImageError}
      {...props}
    />
  );
};

export default ImageWithFallback;
