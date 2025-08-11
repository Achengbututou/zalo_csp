import { useEffect, useRef, useState } from "react";
import { matchStatusBarColor } from "utils/device";

export function useMatchStatusTextColor(visible?: boolean) {
  const changedRef = useRef(false);
  useEffect(() => {
    if (changedRef.current) {
      matchStatusBarColor(visible ?? false);
    } else {
      changedRef.current = true;
    }
  }, [visible]);
}

const originalScreenHeight = window.innerHeight;

export function useVirtualKeyboardVisible() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const detectKeyboardOpen = () => {
      setVisible(window.innerHeight + 160 < originalScreenHeight);
    };
    window.addEventListener("resize", detectKeyboardOpen);
    return () => {
      window.removeEventListener("resize", detectKeyboardOpen);
    };
  }, []);

  return visible;
}

// 简化的支付处理hook，移除所有购物车依赖
export const useHandlePayment = () => {
  // 空的实现，保持兼容性
};

// 模拟待实现功能的hook
export const useToBeImplemented = () => {
  return () => {
    console.log("功能待实现");
    // 这里可以显示一个提示信息或者执行其他逻辑
  };
};
