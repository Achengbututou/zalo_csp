import { useVirtualKeyboardVisible } from "hooks";
import React, { FC, useMemo } from "react";
import { useLocation, useNavigate } from "react-router";
import { useRecoilValue } from "recoil";
import { BottomNavigation, Icon } from "zmp-ui";
import { isAuthenticatedState } from "state";

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  activeIcon?: React.ReactNode;
  onClick?: () => void;
}

export type TabKeys = "/home" | "/notification" | "/message" | "/profile";

export const NO_BOTTOM_NAVIGATION_PAGES = ["/result", "/news-detail", "/login", "/company-intro", "/login-guide", "/chat", "/phone-example", "/form-test", "/form-test-original"];

export const Navigation: FC = () => {
  const keyboardVisible = useVirtualKeyboardVisible();
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useRecoilValue(isAuthenticatedState);

  const tabs: Record<string, MenuItem> = {
    "/home": {
      label: "News",
      icon: <Icon icon="zi-home" />,
    },
    "/notification": {
      label: "Contacts",
      icon: <Icon icon="zi-user-circle" />,
    },
    "/message": {
      label: "Messages",
      icon: <Icon icon="zi-chat" />,
    },
    "/profile": {
      label: "Profile",
      icon: <Icon icon="zi-user" />,
    },
  };

  const noBottomNav = useMemo(() => {
    return NO_BOTTOM_NAVIGATION_PAGES.includes(location.pathname);
  }, [location]);

  // Don't show bottom navigation if not logged in or on pages that don't show navigation
  if (!isAuthenticated || noBottomNav || keyboardVisible) {
    return <></>;
  }

  return (
    <BottomNavigation
      id="footer"
      activeKey={location.pathname}
      onChange={(key) => {
        const tab = tabs[key];
        if (tab.onClick) {
          tab.onClick();
        } else {
          navigate(key);
        }
      }}
      className="z-50"
    >
      {Object.keys(tabs).map((path: TabKeys) => (
        <BottomNavigation.Item
          key={path}
          label={tabs[path].label}
          icon={tabs[path].icon}
          activeIcon={tabs[path].activeIcon}
        />
      ))}
    </BottomNavigation>
  );
};
