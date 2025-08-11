import React, { useState, useEffect } from 'react';
import { Box, Button, Text } from 'zmp-ui';

const DebugPanel: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<any>({});

  const collectDebugInfo = () => {
    const token = localStorage.getItem('token');
    const authToken = localStorage.getItem('authToken');
    const userInfo = localStorage.getItem('userInfo');
    
    let parsedUserInfo: any = null;
    try {
      parsedUserInfo = userInfo ? JSON.parse(userInfo) : null;
    } catch (e) {
      parsedUserInfo = { error: 'JSON parse failed', raw: userInfo };
    }

    setDebugInfo({
      hasToken: !!token,
      hasAuthToken: !!authToken,
      tokenLength: token ? token.length : 0,
      authTokenLength: authToken ? authToken.length : 0,
      userInfoExists: !!userInfo,
      parsedUserInfo: parsedUserInfo,
      allKeys: Object.keys(localStorage),
    });
  };

  const setTestData = () => {
    const testUser = {
      f_UserId: 'test123',
      f_RealName: 'Test User',
      f_Account: 'testuser',
      f_CompanyName: 'Test Company',
      f_DepartmentName: 'Test Department',
      f_HeadIcon: '',
      token: 'test-token-123456789'
    };

    localStorage.setItem('token', 'test-token-123456789');
    localStorage.setItem('authToken', 'test-token-123456789');
    localStorage.setItem('userInfo', JSON.stringify(testUser));

    alert('Test data has been set, please refresh the page to see the effect');
    collectDebugInfo();
  };

  const testAPI = async () => {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');

    if (!token) {
      alert('No token found, please login first');
      return;
    }

    try {
      console.log('Testing API call, token:', token.substring(0, 20) + '...');

      const response = await fetch('https://webapp.crystal-csc.cn/csp_core_api_v3/login/app', {
        method: 'GET',
        headers: {
          'token': token,
          'Content-Type': 'application/json',
        },
      });

      console.log('API response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('API returned data:', data);
        alert('API call successful, please check console');
      } else {
        const errorText = await response.text();
        console.error('API call failed:', response.status, errorText);
        alert(`API call failed: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('API call exception:', error);
      alert(`API call exception: ${error}`);
    }
  };

  const clearAllData = () => {
    localStorage.clear();
    sessionStorage.clear();
    alert('All data has been cleared');
    collectDebugInfo();
  };

  useEffect(() => {
    collectDebugInfo();
  }, []);

  return (
    <Box className="fixed top-4 right-4 bg-white p-4 rounded-lg shadow-lg z-50 max-w-md">
      <Text className="font-bold mb-2">Debug Panel</Text>

      <Box className="space-y-2 text-xs">
        <Text>Token: {debugInfo.hasToken ? '✅' : '❌'} ({debugInfo.tokenLength})</Text>
        <Text>AuthToken: {debugInfo.hasAuthToken ? '✅' : '❌'} ({debugInfo.authTokenLength})</Text>
        <Text>UserInfo: {debugInfo.userInfoExists ? '✅' : '❌'}</Text>

        {debugInfo.parsedUserInfo && (
          <Box className="mt-2">
            <Text className="font-semibold">User Info:</Text>
            <Text>Name: {debugInfo.parsedUserInfo.f_RealName || 'None'}</Text>
            <Text>Company: {debugInfo.parsedUserInfo.f_CompanyName || 'None'}</Text>
            <Text>Department: {debugInfo.parsedUserInfo.f_DepartmentName || 'None'}</Text>
          </Box>
        )}

        <Box className="mt-2">
          <Text className="font-semibold">LocalStorage Keys:</Text>
          <Text>{debugInfo.allKeys?.join(', ') || 'None'}</Text>
        </Box>
      </Box>

      <Box className="flex flex-col gap-2 mt-4">
        <Button size="small" onClick={collectDebugInfo}>
          Refresh Debug Info
        </Button>
        <Button size="small" onClick={setTestData}>
          Set Test Data
        </Button>
        <Button size="small" onClick={testAPI}>
          Test API Call
        </Button>
        <Button size="small" onClick={clearAllData} type="danger">
          Clear All Data
        </Button>
      </Box>
    </Box>
  );
};

export default DebugPanel;
