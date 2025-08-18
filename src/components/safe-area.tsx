import React from "react";
import { Box } from "zmp-ui";

interface SafeAreaProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  top?: boolean;
  bottom?: boolean;
  left?: boolean;
  right?: boolean;
  topOffset?: number;
  bottomOffset?: number;
  leftOffset?: number;
  rightOffset?: number;
}

export const SafeArea: React.FC<SafeAreaProps> = ({
  children,
  className = "",
  style = {},
  top = true,
  bottom = false,
  left = false,
  right = false,
  topOffset = 0,
  bottomOffset = 0,
  leftOffset = 0,
  rightOffset = 0,
}) => {
  const safeAreaStyle: React.CSSProperties = {
    ...style,
  };

  if (top) {
    safeAreaStyle.paddingTop = `calc(var(--zaui-safe-area-inset-top, 0px) + ${topOffset}px)`;
  }

  if (bottom) {
    safeAreaStyle.paddingBottom = `calc(var(--zaui-safe-area-inset-bottom, 0px) + ${bottomOffset}px)`;
  }

  if (left) {
    safeAreaStyle.paddingLeft = `calc(var(--zaui-safe-area-inset-left, 0px) + ${leftOffset}px)`;
  }

  if (right) {
    safeAreaStyle.paddingRight = `calc(var(--zaui-safe-area-inset-right, 0px) + ${rightOffset}px)`;
  }

  return (
    <Box className={className} style={safeAreaStyle}>
      {children}
    </Box>
  );
};

// 预设的SafeArea组件变体
export const SafeAreaTop: React.FC<Omit<SafeAreaProps, 'top' | 'bottom' | 'left' | 'right'>> = (props) => (
  <SafeArea {...props} top={true} bottom={false} left={false} right={false} />
);

export const SafeAreaHeader: React.FC<Omit<SafeAreaProps, 'top' | 'topOffset'>> = ({ children, className = "", style = {}, ...props }) => (
  <SafeArea 
    {...props}
    top={true} 
    topOffset={16}
    className={`${className}`}
    style={{
      paddingBottom: '16px',
      ...style
    }}
  >
    {children}
  </SafeArea>
);

export const SafeAreaPage: React.FC<SafeAreaProps> = (props) => (
  <SafeArea {...props} top={true} bottom={true} left={false} right={false} />
);

export default SafeArea;
