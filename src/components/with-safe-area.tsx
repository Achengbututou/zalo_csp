import React from "react";
import { Page } from "zmp-ui";
import { SafeArea, SafeAreaHeader } from "./safe-area";

interface WithSafeAreaOptions {
  top?: boolean;
  bottom?: boolean;
  left?: boolean;
  right?: boolean;
  topOffset?: number;
  bottomOffset?: number;
  leftOffset?: number;
  rightOffset?: number;
  pageClassName?: string;
  containerClassName?: string;
}

// HOC for wrapping components with SafeArea
export const withSafeArea = <P extends object>(
  Component: React.ComponentType<P>,
  options: WithSafeAreaOptions = {}
) => {
  const {
    top = true,
    bottom = false,
    left = false,
    right = false,
    topOffset = 0,
    bottomOffset = 0,
    leftOffset = 0,
    rightOffset = 0,
    pageClassName = "",
    containerClassName = "",
  } = options;

  return React.forwardRef<any, P>((props, ref) => (
    <Page className={pageClassName} ref={ref}>
      <SafeArea
        className={containerClassName}
        top={top}
        bottom={bottom}
        left={left}
        right={right}
        topOffset={topOffset}
        bottomOffset={bottomOffset}
        leftOffset={leftOffset}
        rightOffset={rightOffset}
      >
        <Component {...props} />
      </SafeArea>
    </Page>
  ));
};

// 预设的HOC变体
export const withSafeAreaTop = <P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<WithSafeAreaOptions, 'top' | 'bottom' | 'left' | 'right'> = {}
) => withSafeArea(Component, { ...options, top: true, bottom: false, left: false, right: false });

export const withSafeAreaFull = <P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<WithSafeAreaOptions, 'top' | 'bottom' | 'left' | 'right'> = {}
) => withSafeArea(Component, { ...options, top: true, bottom: true, left: true, right: true });

// 用于替换现有Header组件的SafeHeader组件
interface SafeHeaderProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onBackClick?: () => void;
  showBackIcon?: boolean;
  title?: string;
}

export const SafeHeader: React.FC<SafeHeaderProps> = ({
  children,
  className = "",
  style = {},
  onBackClick,
  showBackIcon = false,
  title,
  ...props
}) => {
  return (
    <SafeAreaHeader 
      className={`bg-primary text-white relative flex items-center px-4 shadow-md sticky top-0 z-10 ${className}`}
      style={style}
      {...props}
    >
      {showBackIcon && onBackClick && (
        <div 
          className="absolute left-4 cursor-pointer hover:bg-white hover:bg-opacity-10 active:bg-opacity-20 rounded-full p-2 transition-all duration-200"
          onClick={onBackClick}
        >
          <span className="text-white text-xl font-medium">←</span>
        </div>
      )}
      <div className="flex-1 flex justify-center items-center px-12">
        {title ? (
          <span className="text-white font-semibold text-lg text-center leading-tight">
            {title}
          </span>
        ) : (
          children
        )}
      </div>
    </SafeAreaHeader>
  );
};

export default withSafeArea;
