/**
 * Zalo Mini App 模拟器检测工具
 * 
 * 用于检测当前应用是否运行在模拟器环境中
 * 在模拟器环境中，某些Zalo API无法正常工作，需要使用Mock数据
 */

export interface SimulatorInfo {
  isSimulator: boolean;
  reason: string;
  environment: 'simulator' | 'real' | 'unknown';
}

/**
 * 检测是否在模拟器环境中运行
 */
export function detectSimulator(): SimulatorInfo {
  // 检测方法1: User Agent检测
  const userAgent = navigator.userAgent.toLowerCase();
  const simulatorKeywords = [
    'simulator',
    'zalo-simulator',
    'zmp-simulator'
  ];
  
  const hasSimulatorUA = simulatorKeywords.some(keyword => 
    userAgent.includes(keyword)
  );
  
  if (hasSimulatorUA) {
    return {
      isSimulator: true,
      reason: 'User Agent contains simulator keywords',
      environment: 'simulator'
    };
  }

  // 检测方法2: 开发环境检测
  const isDevelopment = 
    window.location.hostname === 'localhost' ||
    window.location.hostname.includes('127.0.0.1') ||
    window.location.hostname.includes('192.168.') ||
    window.location.port !== '';

  if (isDevelopment) {
    return {
      isSimulator: true,
      reason: 'Running in development environment',
      environment: 'simulator'
    };
  }

  // 检测方法3: Zalo环境检测
  const hasZaloInterface = typeof window !== 'undefined' && 
    (window as any).ZaloJavaScriptInterface !== undefined;

  const hasZaloSDK = typeof window !== 'undefined' && 
    (window as any).ZMP !== undefined;

  if (!hasZaloInterface && !hasZaloSDK) {
    return {
      isSimulator: true,
      reason: 'Zalo native interface not available',
      environment: 'simulator'
    };
  }

  // 检测方法4: 设备信息检测
  const platform = navigator.platform.toLowerCase();
  const isDesktop = platform.includes('win') || 
                   platform.includes('mac') || 
                   platform.includes('linux');

  if (isDesktop && !hasZaloInterface) {
    return {
      isSimulator: true,
      reason: 'Running on desktop without Zalo interface',
      environment: 'simulator'
    };
  }

  // 如果所有检测都通过，认为是真实环境
  return {
    isSimulator: false,
    reason: 'All checks passed, appears to be real device',
    environment: 'real'
  };
}

/**
 * 获取模拟器环境的Mock数据
 */
export class MockDataProvider {
  /**
   * 生成Mock手机号token
   */
  static generateMockPhoneToken(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `mock_phone_token_${timestamp}_${random}`;
  }

  /**
   * 生成Mock访问token
   */
  static generateMockAccessToken(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 10);
    return `mock_access_token_${timestamp}_${random}`;
  }

  /**
   * 生成Mock手机号
   */
  static generateMockPhoneNumber(): string {
    // 生成越南手机号格式 (84 + 9位数字)
    const prefix = '849';
    const suffix = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
    return prefix + suffix;
  }

  /**
   * 模拟网络延迟
   */
  static async simulateNetworkDelay(min: number = 1000, max: number = 3000): Promise<void> {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * 模拟API调用成功
   */
  static async mockApiCall<T>(
    mockData: T, 
    delay: { min?: number; max?: number } = {}
  ): Promise<T> {
    await this.simulateNetworkDelay(delay.min, delay.max);
    
    // 10%的概率模拟失败
    if (Math.random() < 0.1) {
      throw new Error('Mock API call failed (simulated error)');
    }
    
    return mockData;
  }
}

/**
 * 环境适配的API调用包装器
 */
export class EnvironmentAdapter {
  private simulatorInfo: SimulatorInfo;

  constructor() {
    this.simulatorInfo = detectSimulator();
  }

  /**
   * 获取环境信息
   */
  getEnvironmentInfo(): SimulatorInfo {
    return this.simulatorInfo;
  }

  /**
   * 是否为模拟器环境
   */
  isSimulator(): boolean {
    return this.simulatorInfo.isSimulator;
  }

  /**
   * 环境适配的手机号token获取
   */
  async getPhoneToken(): Promise<string> {
    if (this.isSimulator()) {
      console.log('[EnvironmentAdapter] Using mock phone token');
      return MockDataProvider.mockApiCall(
        MockDataProvider.generateMockPhoneToken(),
        { min: 1000, max: 2000 }
      );
    } else {
      // 这里应该调用真实的Zalo API
      throw new Error('Real API call should be implemented here');
    }
  }

  /**
   * 环境适配的访问token获取
   */
  async getAccessToken(): Promise<string> {
    if (this.isSimulator()) {
      console.log('[EnvironmentAdapter] Using mock access token');
      return MockDataProvider.mockApiCall(
        MockDataProvider.generateMockAccessToken(),
        { min: 500, max: 1500 }
      );
    } else {
      // 这里应该调用真实的Zalo API
      throw new Error('Real API call should be implemented here');
    }
  }

  /**
   * 环境适配的手机号获取
   */
  async getPhoneNumber(): Promise<string> {
    if (this.isSimulator()) {
      console.log('[EnvironmentAdapter] Using mock phone number');
      return MockDataProvider.mockApiCall(
        MockDataProvider.generateMockPhoneNumber(),
        { min: 1500, max: 3000 }
      );
    } else {
      // 这里应该调用真实的Zalo API
      throw new Error('Real API call should be implemented here');
    }
  }
}

// 导出单例实例
export const environmentAdapter = new EnvironmentAdapter();

// 导出便捷函数
export const isSimulatorEnvironment = () => environmentAdapter.isSimulator();
export const getEnvironmentInfo = () => environmentAdapter.getEnvironmentInfo();
