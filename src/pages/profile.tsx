import React, { FC, useState, useEffect } from "react";
import { Box, Header, Icon, Page, Text, Button, Modal } from "zmp-ui";
import subscriptionDecor from "static/subscription-decor.svg";
import { ListRenderer } from "components/list-renderer";
import { useNavigate } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import { authTokenState, currentUserState } from "state";
import ImageWithFallback from "components/ImageWithFallback";
import { SafeAreaTop } from "components/safe-area";

// User info interface
interface UserInfo {
  f_UserId: string;
  f_RealName: string;
  f_Account: string;
  f_HeadIcon?: string;
  f_CompanyName?: string;
  f_DepartmentName?: string;
}

// User tag interface
interface UserTag {
  title: string;
  type: "success" | "warning" | "error" | "info";
}

const UserBanner: FC = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [userTags, setUserTags] = useState<UserTag[]>([]);

  useEffect(() => {
    // Function to generate user tags
    const generateUserTags = (user: any): UserTag[] => {
      console.log('Generating user tags, user data:', user);
      const tags: UserTag[] = [];

      if (user.f_CompanyName) {
        tags.push({
          title: user.f_CompanyName,
          type: "success"
        });
        console.log('Added company tag:', user.f_CompanyName);
      }

      if (user.f_DepartmentName) {
        tags.push({
          title: user.f_DepartmentName,
          type: "warning"
        });
        console.log('Added department tag:', user.f_DepartmentName);
      }

      if (tags.length === 0) {
        tags.push({
          title: "Corporate Group",
          type: "success"
        });
        console.log('Using default tag: Corporate Group');
      }

      console.log('Final generated tags:', tags);
      return tags;
    };

    // Get missing organization information
    const fetchMissingOrgInfo = async (user: any, token: string) => {
      let updatedUser = { ...user };
      let hasUpdates = false;

      // Get company information
      if (!user.f_CompanyName && user.f_CompanyId) {
        console.log('Fetching company info:', user.f_CompanyId);
        try {
          const companyResponse = await fetch(`https://webapp.crystal-csc.cn/csp_core_api_v3/organization/company/${user.f_CompanyId}`, {
            method: 'GET',
            headers: {
              'token': token,
              'Content-Type': 'application/json',
            },
          });

          if (companyResponse.ok) {
            const companyData = await companyResponse.json();
            console.log('Company info API response:', companyData);
            if (companyData && companyData.code === 200 && companyData.data && companyData.data.f_FullName) {
              updatedUser.f_CompanyName = companyData.data.f_FullName;
              updatedUser.company = companyData.data;
              hasUpdates = true;
              console.log('Company name updated:', companyData.data.f_FullName);
            }
          } else {
            console.log('Failed to fetch company info:', companyResponse.status);
          }
        } catch (error) {
          console.error('Error fetching company info:', error);
        }
      }

      // Get department information
      if (!user.f_DepartmentName && user.f_DepartmentId) {
        console.log('Fetching department info:', user.f_DepartmentId);
        try {
          const deptResponse = await fetch(`https://webapp.crystal-csc.cn/csp_core_api_v3/organization/department/${user.f_DepartmentId}`, {
            method: 'GET',
            headers: {
              'token': token,
              'Content-Type': 'application/json',
            },
          });

          if (deptResponse.ok) {
            const deptData = await deptResponse.json();
            console.log('Department info API response:', deptData);
            if (deptData && deptData.code === 200 && deptData.data && deptData.data.f_FullName) {
              updatedUser.f_DepartmentName = deptData.data.f_FullName;
              updatedUser.department = deptData.data;
              hasUpdates = true;
              console.log('Department name updated:', deptData.data.f_FullName);
            }
          } else {
            console.log('Failed to fetch department info:', deptResponse.status);
          }
        } catch (error) {
          console.error('Error fetching department info:', error);
        }
      }

      // If there are updates, reset state and cache
      if (hasUpdates) {
        console.log('Organization info updated, resetting state');
        setUserInfo(updatedUser);
        const newTags = generateUserTags(updatedUser);
        setUserTags(newTags);
        localStorage.setItem('userInfo', JSON.stringify(updatedUser));
      }
    };

    // Function to get user information
    const fetchUserInfo = async () => {
      try {
        // First try to get cached user info from localStorage
        const storedUserInfo = localStorage.getItem('userInfo');
        if (storedUserInfo) {
          try {
            const user = JSON.parse(storedUserInfo);
            console.log('Cached user info:', user);

            // If cached user info is complete, use it directly
            if (user.f_RealName) {
              console.log('Using cached user info to set state');

              // Check if company and department names need to be fetched
              const needCompanyName = !user.f_CompanyName && user.f_CompanyId;
              const needDepartmentName = !user.f_DepartmentName && user.f_DepartmentId;

              if (needCompanyName || needDepartmentName) {
                console.log('Cached data missing company or department name, need to fetch from API');
                // Set basic info first, then async fetch company/department info
                setUserInfo(user);
                setUserTags(generateUserTags(user));

                // Async fetch missing info
                const token = localStorage.getItem('token') || localStorage.getItem('authToken');
                if (token) {
                  await fetchMissingOrgInfo(user, token);
                }
                return;
              } else {
                // Cached data is complete, use directly
                setUserInfo(user);
                const tags = generateUserTags(user);
                setUserTags(tags);
                return; // If complete cached data exists, return directly without calling API
              }
            }
          } catch (error) {
            console.error('Failed to parse cached user info:', error);
          }
        }

        // Get latest user info from API
        const token = localStorage.getItem('token') ||
                     localStorage.getItem('authToken');

        if (token) {
          console.log('Preparing to call API, token:', token.substring(0, 20) + '...');

          const response = await fetch('https://webapp.crystal-csc.cn/csp_core_api_v3/login/app', {
            method: 'GET',
            headers: {
              'token': token,  // Use original project token format
              'Content-Type': 'application/json',
            },
          });

          console.log('API response status:', response.status);

          if (response.ok) {
            const userData = await response.json();
            console.log('API returned user data:', userData);
            console.log('All fields in API response:', Object.keys(userData));

            // Check key fields
            console.log('f_CompanyName:', userData.f_CompanyName);
            console.log('f_DepartmentName:', userData.f_DepartmentName);
            console.log('CompanyName:', userData.CompanyName);
            console.log('DepartmentName:', userData.DepartmentName);
            
            if (userData) {
              // Process user data, add necessary fields according to original project logic
              const processedUser: any = {
                // Original API fields
                f_UserId: userData.f_UserId,
                f_RealName: userData.f_RealName,
                f_Account: userData.f_Account,
                f_HeadIcon: userData.f_HeadIcon,
                f_CompanyName: userData.f_CompanyName,
                f_DepartmentName: userData.f_DepartmentName,
                f_Phone: userData.f_Phone,
                f_Email: userData.f_Email,
                f_CreateDate: userData.f_CreateDate,
                f_DepartmentId: userData.f_DepartmentId,
                f_CompanyId: userData.f_CompanyId,

                // Field mapping inherited from original project
                id: userData.f_UserId,
                name: userData.f_RealName,
                account: userData.f_Account,
                roleIds: userData.roleIds,
                postIds: userData.postIds ? userData.postIds.split(',') : [],

                // Keep token
                token: token
              };

              // If API doesn't directly return department name, try to get it by department ID
              if (!processedUser.f_DepartmentName && processedUser.f_DepartmentId) {
                console.log('Trying to get department info by department ID:', processedUser.f_DepartmentId);
                try {
                  const deptResponse = await fetch(`https://webapp.crystal-csc.cn/csp_core_api_v3/organization/department/${processedUser.f_DepartmentId}`, {
                    method: 'GET',
                    headers: {
                      'token': token,
                      'Content-Type': 'application/json',
                    },
                  });

                  if (deptResponse.ok) {
                    const deptData = await deptResponse.json();
                    console.log('Department info API response:', deptData);
                    if (deptData && deptData.code === 200 && deptData.data && deptData.data.f_FullName) {
                      processedUser.f_DepartmentName = deptData.data.f_FullName;
                      processedUser.department = deptData.data;
                    }
                  } else {
                    console.log('Failed to get department info:', deptResponse.status);
                  }
                } catch (error) {
                  console.error('Error getting department info:', error);
                }
              }

              // If API doesn't directly return company name, try to get it by company ID
              if (!processedUser.f_CompanyName && processedUser.f_CompanyId) {
                console.log('Trying to get company info by company ID:', processedUser.f_CompanyId);
                try {
                  const companyResponse = await fetch(`https://webapp.crystal-csc.cn/csp_core_api_v3/organization/company/${processedUser.f_CompanyId}`, {
                    method: 'GET',
                    headers: {
                      'token': token,
                      'Content-Type': 'application/json',
                    },
                  });

                  if (companyResponse.ok) {
                    const companyData = await companyResponse.json();
                    console.log('Company info API response:', companyData);
                    if (companyData && companyData.code === 200 && companyData.data && companyData.data.f_FullName) {
                      processedUser.f_CompanyName = companyData.data.f_FullName;
                      processedUser.company = companyData.data;
                    }
                  } else {
                    console.log('Failed to get company info:', companyResponse.status);
                  }
                } catch (error) {
                  console.error('Error getting company info:', error);
                }
              }

              console.log('Processed user info:', processedUser);
              setUserInfo(processedUser);
              const tags = generateUserTags(processedUser);
              setUserTags(tags);

              // Update user info in localStorage
              localStorage.setItem('userInfo', JSON.stringify(processedUser));
            }
          } else {
            console.error('Failed to get user info:', response.status, response.statusText);
            const errorText = await response.text();
            console.error('Error details:', errorText);

            // If API call fails, token might be invalid, prompt user to re-login
            if (response.status === 401 || response.status === 403) {
              alert('Login expired, please log in again');
              // Clear invalid token
              localStorage.removeItem('token');
              localStorage.removeItem('authToken');
              localStorage.removeItem('userInfo');
            }
          }
        } else {
          console.error('No valid token found, user may not be logged in');
          // If no token, show prompt
          const defaultUser = {
            f_RealName: 'Not logged in',
            f_CompanyName: '',
            f_DepartmentName: ''
          } as UserInfo;
          setUserInfo(defaultUser);
          const tags = generateUserTags(defaultUser);
          setUserTags(tags);
        }
      } catch (error) {
        console.error('Error occurred while getting user info:', error);
      }
    };

    fetchUserInfo();
  }, []);

  // Build avatar URL
  const getAvatarUrl = (headIcon?: string) => {
    if (!headIcon) {
      return "/static/img-avatar/head.png";
    }

    if (headIcon.startsWith('http')) {
      return headIcon;
    }

    const token = localStorage.getItem('token') ||
                 localStorage.getItem('authToken') ||
                 JSON.parse(localStorage.getItem('userInfo') || '{}')?.token || '';

    return `https://webapp.crystal-csc.cn/csp_core_api_v3/File/FileDownload/${headIcon}?token=${token}`;
  };

  // Click avatar area to navigate to user info page
  const handleUserInfoClick = () => {
    navigate('/user-info');
  };

  return (
    <Box 
      className="relative h-44 flex items-center px-6 mb-2 shadow-lg cursor-pointer"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(12, 134, 216, 0.3), rgba(12, 134, 216, 0.8)), url(${subscriptionDecor})`,
        backgroundPosition: "0 0, right 8px center",
        backgroundRepeat: "no-repeat, no-repeat",
        backgroundSize: "cover, auto",
      }}
      onClick={handleUserInfoClick}
    >
      {/* Avatar container */}
      <Box className="flex-shrink-0 mr-5 relative">
        <Box className="w-20 h-20 rounded-full overflow-hidden shadow-lg bg-white p-0.5">
          <ImageWithFallback
            src={getAvatarUrl(userInfo?.f_HeadIcon)}
            alt={userInfo?.f_RealName || "User Avatar"}
            className="w-full h-full object-cover rounded-full"
            fallbackType="avatar"
          />
        </Box>
        {/* Online status indicator */}
        <Box className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-3 border-white rounded-full flex items-center justify-center shadow-sm">
          <Box className="w-2 h-2 bg-white rounded-full animate-pulse"></Box>
        </Box>
      </Box>

      {/* User info container */}
      <Box className="flex-1">
        {/* Username */}
        <Text className="text-white text-lg font-bold mb-2">
          {userInfo?.f_RealName || "Unknown User"}
        </Text>

        {/* User tags */}
        <Box className="flex flex-wrap gap-2">
          {userTags.map((tag, index) => (
            <Box
              key={index}
              className={`px-3 py-1.5 rounded-full text-xs font-medium shadow-sm ${
                tag.type === 'success' ? 'bg-green-500/90 text-white border border-green-400/50' :
                tag.type === 'warning' ? 'bg-orange-500/90 text-white border border-orange-400/50' :
                tag.type === 'error' ? 'bg-red-500/90 text-white border border-red-400/50' :
                'bg-blue-500/90 text-white border border-blue-400/50'
              }`}
            >
              <Text className="text-xs text-white font-medium">{tag.title}</Text>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Right arrow */}
      <Box className="flex-shrink-0 ml-4">
        <Icon icon="zi-chevron-right" className="text-white text-xl" />
      </Box>
    </Box>
  );
};

const MainMenu: FC = () => {
  const navigate = useNavigate();
  // Menu item click handler
  const handleMenuClick = (path: string) => {
    console.log(`[Profile] Menu clicked: ${path}`);
    switch (path) {
      case 'message':
        navigate('/message');
        break;
      case 'notification':
        navigate('/notification');
        break;
      case 'clear-cache':
        handleClearCache();
        break;
      case 'form-test':
        console.log('[Profile] Navigating to /form-test');
        navigate('/form-test');
        break;
      case 'form-test-original':
        console.log('[Profile] Navigating to /form-test-original');
        navigate('/form-test-original');
        break;

      case 'phone-example':
        console.log('[Profile] Navigating to /phone-example');
        navigate('/phone-example');
        break;
      default:
        console.log(`[Profile] Unknown menu item: ${path}`);
    }
  };

  // Clear cache
  const handleClearCache = async () => {
    try {
      // Clear local cache
      localStorage.removeItem('cacheData');
      sessionStorage.clear();

      // Call server clear cache API
      const token = localStorage.getItem('token') ||
                   localStorage.getItem('authToken');

      if (token) {
        const response = await fetch('https://webapp.crystal-csc.cn/csp_core_api_v3/login/cache', {
          method: 'POST',
          headers: {
            'token': token,  // Use original project token format
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          alert('Cache cleared successfully!');
        } else {
          console.error('Server cache clear failed:', response.status, response.statusText);
          alert('Cache cleared successfully!'); // Show success if local clear succeeded
        }
      } else {
        alert('Cache cleared successfully!'); // Show success if local clear succeeded
      }
    } catch (error) {
      console.error('Cache clear failed:', error);
      alert('Local cache cleared');
    }
  };

  const menuItems = [
    {
      id: 'message',
      icon: 'zi-chat' as const,
      title: 'Message Center',
      color: '#2979ff',
    },
    {
      id: 'notification',
      icon: 'zi-user-circle' as const,
      title: 'Contacts',
      color: '#2979ff',
    },
    {
      id: 'clear-cache',
      icon: 'zi-setting' as const,
      title: 'Clear Cache',
      color: '#2979ff',
    },
    {
      id: 'form-test',
      icon: 'zi-more-grid' as const,
      title: 'Test Page',
      color: '#2979ff',
    },
    {
      id: 'form-test-original',
      icon: 'zi-calendar' as const,
      title: 'Original Form Test',
      color: '#2979ff',
    },

    {
      id: 'phone-example',
      icon: 'zi-check-circle' as const,
      title: 'Employee Registration',
      color: '#2979ff',
    },
  ];

  return (
    <Box className="mx-4 mb-4">
      <Box className="bg-white rounded-2xl shadow-md overflow-hidden">
        {menuItems.map((item, index) => (
          <Box
            key={item.id}
            className={`flex items-center p-4 cursor-pointer hover:bg-blue-50 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] ${
              index < menuItems.length - 1 ? 'border-b border-gray-100' : ''
            }`}
            onClick={() => handleMenuClick(item.id)}
          >
            {/* Icon */}
            <Box className="flex-shrink-0 mr-4">
              <Box className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center shadow-sm border border-blue-100/50 relative">
                <Icon
                  icon={item.icon}
                  className="text-blue-600 absolute"
                  style={{
                    fontSize: '16px',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)'
                  }}
                />
              </Box>
            </Box>

            {/* Title */}
            <Box className="flex-1">
              <Text className="text-gray-900 font-medium text-base">{item.title}</Text>
            </Box>

            {/* Right arrow */}
            <Box className="flex-shrink-0">
              <Icon icon="zi-chevron-right" className="text-gray-400 text-sm" />
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

const VersionInfo: FC = () => {
  const currentYear = new Date().getFullYear();
  const appVersion = "1.0.0";
  const updateDate = "2025-08-04";

  return (
    <Box className="mx-4 mb-4">
      <Box className="bg-white rounded-2xl shadow-md p-6">
        <Box className="text-center">
          <Box className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center relative">
            <Text 
              className="text-2xl absolute" 
              style={{ 
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)'
              }}
            >
              🔧
            </Text>
          </Box>
          <Text className="text-gray-600 text-sm font-medium mb-1">
            APP Version: {appVersion}
          </Text>
          <Text className="text-gray-400 text-xs">
            Update Date: {updateDate}
          </Text>
        </Box>
      </Box>
    </Box>
  );
};

const LogoutButton: FC = () => {
  const navigate = useNavigate();
  const setAuthToken = useSetRecoilState(authTokenState);
  const setCurrentUser = useSetRecoilState(currentUserState);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleLogoutClick = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmLogout = async () => {
    setShowConfirmModal(false);
    
    try {
      console.log('[Profile] Starting logout process');
      
      // 1. Clear Recoil state
      setAuthToken(null);
      setCurrentUser(null);
      console.log('[Profile] Recoil state cleared');

      // 2. Clear localStorage data
      localStorage.removeItem("authToken");
      localStorage.removeItem("token");
      localStorage.removeItem("userInfo");
      // Clear other possible cache data
      localStorage.removeItem("cacheData");
      sessionStorage.clear();
      console.log('[Profile] localStorage and sessionStorage cleared');

      // 3. Wait briefly to ensure state updates complete
      setTimeout(() => {
        console.log('[Profile] Redirecting to company intro page');
        navigate('/company-intro', { replace: true });
      }, 100);

    } catch (error) {
      console.error('Logout failed:', error);
      // Even if error occurs, try to navigate to login page
      navigate('/login', { replace: true });
    }
  };

  const handleCancelLogout = () => {
    setShowConfirmModal(false);
  };

  return (
    <>
      <Box className="mx-4 mb-8">
        <Box className="bg-white rounded-2xl shadow-md p-4">
          <Button
            onClick={handleLogoutClick}
            className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-4 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] border-0"
            type="danger"
          >
            <Text className="text-white font-semibold">Logout</Text>
          </Button>
        </Box>
      </Box>

      {/* Logout confirmation modal */}
      <Modal
        visible={showConfirmModal}
        title=""
        onClose={handleCancelLogout}
        verticalActions
      >
        <Box className="text-center py-4">
          {/* Icon */}
          <Box className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <Text className="text-3xl">⚠️</Text>
          </Box>
          
          {/* Title */}
          <Text className="text-lg font-semibold text-gray-800 mb-2">
            Confirm Logout
          </Text>
          
          {/* Description */}
          <Text className="text-gray-600 mb-6 leading-relaxed">
            Are you sure you want to log out?<br />
            You will need to log in again to use the app features.
          </Text>
          
          {/* Button group */}
          <Box className="space-y-3">
            <Button
              onClick={handleConfirmLogout}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-3 rounded-lg transition-colors"
              type="danger"
            >
              Confirm Logout
            </Button>
            <Button
              onClick={handleCancelLogout}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-lg transition-colors"
              variant="secondary"
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
};

const Footer: FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <Box className="text-center pb-8">
      <Text className="text-gray-500 text-xs">
        Copyright © {currentYear} Crystal Service Platform
      </Text>
    </Box>
  );
};

const ProfilePage: FC = () => {
  return (
    <Page className="bg-gray-50 min-h-screen">
      <SafeAreaTop>
        <UserBanner />
        <MainMenu />
        <VersionInfo />
        <LogoutButton />
        <Footer />
      </SafeAreaTop>
    </Page>
  );
};

export default ProfilePage;
