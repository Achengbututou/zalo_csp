import React, { useState, useCallback, useEffect } from "react";
import { Box, Page, Text, Button, Icon, Input } from "zmp-ui";
import { useNavigate } from "react-router";
import { zaloPhoneService } from "utils/zalo-phone";
import { SafeHeader } from "components/with-safe-area";

// 员工信息登记
interface EmployeeInfo {
  id: string;
  name: string;
  department: string;
  position: string;
}

const PhoneExamplePage: React.FunctionComponent = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'info' | 'phone' | 'complete'>('info');
  const [employeeInfo, setEmployeeInfo] = useState<EmployeeInfo>({
    id: 'EMP-' + Date.now(),
    name: '',
    department: '',
    position: ''
  });
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSimulator, setIsSimulator] = useState(false);

  // 检测是否在模拟器环境
  useEffect(() => {
    // 检测方法1: 检查User Agent
    const userAgent = navigator.userAgent.toLowerCase();
    const isSimulatorUA = userAgent.includes('simulator') ||
                         userAgent.includes('zalo-simulator') ||
                         window.location.hostname === 'localhost' ||
                         window.location.hostname.includes('127.0.0.1');

    // 检测方法2: 检查是否有真实的Zalo环境
    const hasZaloEnv = typeof window !== 'undefined' &&
                      window.ZaloJavaScriptInterface !== undefined;

    setIsSimulator(isSimulatorUA || !hasZaloEnv);
  }, []);

  // 处理员工信息输入
  const handleEmployeeInfoChange = (field: keyof EmployeeInfo, value: string) => {
    setEmployeeInfo(prev => ({ ...prev, [field]: value }));
  };

  // 继续到手机号步骤
  const proceedToPhone = () => {
    if (!employeeInfo.name.trim() || !employeeInfo.department.trim() || !employeeInfo.position.trim()) {
      setError('请填写完整的员工信息');
      return;
    }
    setError('');
    setStep('phone');
  };

  // 获取手机号
  const handleGetPhoneNumber = useCallback(async () => {
    if (isLoading) return;

    setIsLoading(true);
    setError('');

    try {
      let phone: string;

      if (isSimulator) {
        // 模拟器环境：使用Mock数据
        console.log('[PhoneExample] 检测到模拟器环境，使用Mock数据');
        await new Promise(resolve => setTimeout(resolve, 2000)); // 模拟网络延迟
        phone = '84912345678'; // Mock手机号
      } else {
        // 真实环境：调用Zalo API
        console.log('[PhoneExample] 真实环境，调用Zalo API');
        phone = await zaloPhoneService.getUserPhoneNumber();
      }

      setPhoneNumber(phone);
      setStep('complete');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '获取手机号失败';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, isSimulator]);

  // 跳过手机号（提供替代方案）
  const skipPhoneNumber = () => {
    setStep('complete');
  };

  // 渲染员工信息步骤
  const renderInfoStep = () => (
    <Box className="space-y-6">
      {/* 员工信息 */}
      <Box className="bg-white rounded-xl p-4 shadow-sm">
        <Text className="text-lg font-semibold text-gray-800 mb-4">
          � 员工信息登记
        </Text>

        <Box className="space-y-4">
          <Box>
            <Text className="text-gray-700 mb-2 text-sm font-medium">员工编号</Text>
            <Input
              value={employeeInfo.id}
              disabled
              className="w-full bg-gray-50"
            />
          </Box>

          <Box>
            <Text className="text-gray-700 mb-2 text-sm font-medium">姓名 *</Text>
            <Input
              placeholder="请输入员工姓名"
              value={employeeInfo.name}
              onChange={(e) => handleEmployeeInfoChange('name', e.target.value)}
              className="w-full"
            />
          </Box>

          <Box>
            <Text className="text-gray-700 mb-2 text-sm font-medium">部门 *</Text>
            <Input
              placeholder="请输入所属部门"
              value={employeeInfo.department}
              onChange={(e) => handleEmployeeInfoChange('department', e.target.value)}
              className="w-full"
            />
          </Box>

          <Box>
            <Text className="text-gray-700 mb-2 text-sm font-medium">职位 *</Text>
            <Input
              placeholder="请输入职位名称"
              value={employeeInfo.position}
              onChange={(e) => handleEmployeeInfoChange('position', e.target.value)}
              className="w-full"
            />
          </Box>
        </Box>

        {error && (
          <Text className="text-red-500 text-sm mt-2">{error}</Text>
        )}
      </Box>

      {/* 继续按钮 */}
      <Button
        onClick={proceedToPhone}
        className="w-full bg-primary text-white font-semibold py-4 rounded-xl"
        disabled={!employeeInfo.name.trim() || !employeeInfo.department.trim() || !employeeInfo.position.trim()}
      >
        继续登记
      </Button>
    </Box>
  );

  // 渲染手机号获取步骤
  const renderPhoneStep = () => (
    <Box className="space-y-6">
      {/* 环境提示 */}
      {isSimulator && (
        <Box className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 shadow-sm">
          <Text className="text-lg font-semibold text-yellow-800 mb-2">
            🔧 模拟器环境
          </Text>
          <Text className="text-yellow-700 text-sm">
            检测到您正在模拟器中运行，将使用Mock数据演示功能。在真实设备上会调用Zalo API获取真实手机号。
          </Text>
        </Box>
      )}

      {/* 说明区域 */}
      <Box className="bg-blue-50 border border-blue-200 rounded-xl p-4 shadow-sm">
        <Text className="text-lg font-semibold text-blue-800 mb-3">
          📱 员工联系方式登记
        </Text>
        <Text className="text-blue-700 text-sm leading-relaxed mb-4">
          为了完善员工档案和便于企业管理，我们需要您的手机号码用于：
        </Text>
        <Box className="space-y-2 text-sm text-blue-700">
          <Box className="flex items-start space-x-2">
            <Text>•</Text>
            <Text>紧急情况下的联系方式</Text>
          </Box>
          <Box className="flex items-start space-x-2">
            <Text>•</Text>
            <Text>工作相关的重要通知</Text>
          </Box>
          <Box className="flex items-start space-x-2">
            <Text>•</Text>
            <Text>企业内部通讯录建立</Text>
          </Box>
          <Box className="flex items-start space-x-2">
            <Text>•</Text>
            <Text>考勤和人事管理系统</Text>
          </Box>
        </Box>
      </Box>

      {/* 隐私保护说明 */}
      <Box className="bg-green-50 border border-green-200 rounded-xl p-4">
        <Text className="text-green-800 font-semibold mb-2">🔒 隐私保护承诺</Text>
        <Text className="text-green-700 text-sm">
          我们承诺仅将您的手机号用于企业内部管理和工作联系，严格遵守员工隐私保护政策，不会用于其他商业用途或与第三方分享。
        </Text>
      </Box>

      {/* 操作按钮 */}
      <Box className="space-y-3">
        <Button
          onClick={handleGetPhoneNumber}
          loading={isLoading}
          className="w-full bg-primary text-white font-semibold py-4 rounded-xl"
        >
          <Box className="flex items-center justify-center space-x-2">
            <Icon icon="zi-call" className="text-white" />
            <Text className="text-white font-semibold">
              {isLoading
                ? (isSimulator ? '模拟获取中...' : '获取中...')
                : (isSimulator ? '模拟获取手机号' : '授权获取手机号')
              }
            </Text>
          </Box>
        </Button>

        <Button
          onClick={skipPhoneNumber}
          className="w-full bg-gray-100 text-gray-700 font-medium py-3 rounded-xl"
          variant="secondary"
        >
          暂时跳过（稍后补充联系方式）
        </Button>
      </Box>

      {error && (
        <Box className="bg-red-50 border border-red-200 rounded-xl p-4">
          <Text className="text-red-700 text-sm">{error}</Text>
        </Box>
      )}
    </Box>
  );

  // 渲染完成步骤
  const renderCompleteStep = () => (
    <Box className="space-y-6">
      <Box className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
        <Text className="text-4xl mb-4">✅</Text>
        <Text className="text-lg font-semibold text-green-800 mb-2">
          员工信息登记成功！
        </Text>
        <Text className="text-green-700 text-sm">
          员工编号: {employeeInfo.id}
        </Text>
      </Box>

      {/* 员工信息摘要 */}
      <Box className="bg-white rounded-xl p-4 shadow-sm">
        <Text className="text-lg font-semibold text-gray-800 mb-3">
          📋 登记信息摘要
        </Text>
        <Box className="space-y-2 text-sm">
          <Box className="flex justify-between">
            <Text className="text-gray-600">姓名:</Text>
            <Text className="font-semibold">{employeeInfo.name}</Text>
          </Box>
          <Box className="flex justify-between">
            <Text className="text-gray-600">部门:</Text>
            <Text className="font-semibold">{employeeInfo.department}</Text>
          </Box>
          <Box className="flex justify-between">
            <Text className="text-gray-600">职位:</Text>
            <Text className="font-semibold">{employeeInfo.position}</Text>
          </Box>
          {phoneNumber && (
            <Box className="flex justify-between">
              <Text className="text-gray-600">手机号:</Text>
              <Text className="font-semibold">{phoneNumber}</Text>
            </Box>
          )}
        </Box>
      </Box>

      {phoneNumber && (
        <Box className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <Text className="text-blue-800 font-semibold mb-2">📱 联系方式已确认</Text>
          <Text className="text-blue-700 text-sm">
            手机号 {phoneNumber} 已成功添加到员工档案
          </Text>
        </Box>
      )}

      <Button
        onClick={() => navigate('/profile')}
        className="w-full bg-primary text-white font-semibold py-4 rounded-xl"
      >
        返回首页
      </Button>
    </Box>
  );

  return (
    <Page className="bg-gray-50 min-h-screen">
      <SafeHeader
        title="企业员工信息登记"
        showBackIcon={true}
        onBackClick={() => navigate(-1)}
        className="bg-primary text-white"
      >
      </SafeHeader>
      
      <Box className="p-4">
        {/* 步骤指示器 */}
        <Box className="flex items-center justify-center mb-6">
          <Box className="flex items-center space-x-4">
            <Box className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
              step === 'info' ? 'bg-primary text-white' : 'bg-green-500 text-white'
            }`}>
              1
            </Box>
            <Box className={`w-12 h-1 ${step !== 'info' ? 'bg-green-500' : 'bg-gray-300'}`} />
            <Box className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
              step === 'phone' ? 'bg-primary text-white' :
              step === 'complete' ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              2
            </Box>
            <Box className={`w-12 h-1 ${step === 'complete' ? 'bg-green-500' : 'bg-gray-300'}`} />
            <Box className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
              step === 'complete' ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              3
            </Box>
          </Box>
        </Box>

        {/* 渲染当前步骤 */}
        {step === 'info' && renderInfoStep()}
        {step === 'phone' && renderPhoneStep()}
        {step === 'complete' && renderCompleteStep()}
      </Box>
    </Page>
  );
};

export default PhoneExamplePage;
