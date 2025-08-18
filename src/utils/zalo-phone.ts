/**
 * Zalo Mini App 获取用户手机号工具类
 * 
 * 官方文档: https://mini.zalo.me/documents/api/getPhoneNumber/
 * 
 * 使用流程:
 * 1. 在Mini App中调用getPhoneNumber()获取token
 * 2. 将token发送到服务器
 * 3. 服务器使用token调用Zalo Open API获取真实手机号
 * 4. 服务器返回手机号给Mini App
 */

import { getPhoneNumber, getAccessToken } from "zmp-sdk/apis";

// 手机号token响应接口
interface PhoneTokenResponse {
  token: string;
}

// 服务器返回的手机号信息接口
interface PhoneNumberInfo {
  number: string;
  success: boolean;
  error?: string;
}

// Zalo Open API响应接口
interface ZaloOpenAPIResponse {
  data: {
    number: string;
  };
  error: number;
  message: string;
}

/**
 * Zalo手机号获取工具类
 */
export class ZaloPhoneService {
  private static instance: ZaloPhoneService;
  private serverBaseUrl: string;

  constructor(serverBaseUrl: string = "https://webapp.crystal-csc.cn/csp_core_api_v3") {
    this.serverBaseUrl = serverBaseUrl;
  }

  public static getInstance(serverBaseUrl?: string): ZaloPhoneService {
    if (!ZaloPhoneService.instance) {
      ZaloPhoneService.instance = new ZaloPhoneService(serverBaseUrl);
    }
    return ZaloPhoneService.instance;
  }

  /**
   * 步骤1: 从Zalo Mini App获取手机号token
   * 
   * 注意事项:
   * - 需要在app-config.json中申请手机号权限
   * - 会弹出用户授权对话框
   * - token有效期2分钟，只能使用1次
   * 
   * @returns Promise<string> 手机号token
   */
  async getPhoneToken(): Promise<string> {
    try {
      console.log('[ZaloPhoneService] 开始获取手机号token...');
      
      // 调用Zalo SDK获取手机号token
      const result: PhoneTokenResponse = await getPhoneNumber();
      
      if (!result.token) {
        throw new Error('未获取到手机号token');
      }

      console.log('[ZaloPhoneService] 成功获取手机号token:', result.token.substring(0, 20) + '...');
      return result.token;
      
    } catch (error) {
      console.error('[ZaloPhoneService] 获取手机号token失败:', error);
      
      // 处理常见错误
      if (error instanceof Error) {
        if (error.message.includes('User denied')) {
          throw new Error('用户拒绝授权手机号');
        } else if (error.message.includes('Permission denied')) {
          throw new Error('应用未获得手机号权限，请在管理后台申请');
        }
      }
      
      throw new Error('获取手机号token失败，请重试');
    }
  }

  /**
   * 步骤2: 获取Access Token (用于服务器端调用)
   * 
   * @returns Promise<string> Access Token
   */
  async getAccessToken(): Promise<string> {
    try {
      console.log('[ZaloPhoneService] 获取Access Token...');
      
      const accessToken = await getAccessToken();
      
      if (!accessToken) {
        throw new Error('未获取到Access Token');
      }

      console.log('[ZaloPhoneService] 成功获取Access Token:', accessToken.substring(0, 20) + '...');
      return accessToken;
      
    } catch (error) {
      console.error('[ZaloPhoneService] 获取Access Token失败:', error);
      throw new Error('获取Access Token失败');
    }
  }

  /**
   * 步骤3: 通过服务器获取真实手机号
   * 
   * 服务器需要实现以下逻辑:
   * 1. 接收phoneToken和accessToken
   * 2. 调用Zalo Open API: https://graph.zalo.me/v2.0/me/info
   * 3. 返回手机号信息
   * 
   * @param phoneToken 手机号token
   * @param accessToken 访问token
   * @returns Promise<PhoneNumberInfo> 手机号信息
   */
  async getPhoneNumberFromServer(phoneToken: string, accessToken: string): Promise<PhoneNumberInfo> {
    try {
      console.log('[ZaloPhoneService] 通过服务器获取手机号...');
      
      const response = await fetch(`${this.serverBaseUrl}/zalo/phone-number`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneToken,
          accessToken
        })
      });

      if (!response.ok) {
        throw new Error(`服务器请求失败: ${response.status} ${response.statusText}`);
      }

      const result: PhoneNumberInfo = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || '获取手机号失败');
      }

      console.log('[ZaloPhoneService] 成功获取手机号:', result.number);
      return result;
      
    } catch (error) {
      console.error('[ZaloPhoneService] 通过服务器获取手机号失败:', error);
      throw error;
    }
  }

  /**
   * 完整流程: 获取用户手机号
   * 
   * 这是一个完整的获取手机号流程，包含所有必要步骤
   * 
   * @returns Promise<string> 用户手机号
   */
  async getUserPhoneNumber(): Promise<string> {
    try {
      console.log('[ZaloPhoneService] 开始完整的手机号获取流程...');
      
      // 步骤1: 获取手机号token
      const phoneToken = await this.getPhoneToken();
      
      // 步骤2: 获取access token
      const accessToken = await this.getAccessToken();
      
      // 步骤3: 通过服务器获取真实手机号
      const phoneInfo = await this.getPhoneNumberFromServer(phoneToken, accessToken);
      
      console.log('[ZaloPhoneService] 完整流程成功完成');
      return phoneInfo.number;
      
    } catch (error) {
      console.error('[ZaloPhoneService] 完整流程失败:', error);
      throw error;
    }
  }

  /**
   * 服务器端实现参考 (Node.js示例)
   * 
   * 注意: 这个方法仅用于文档说明，实际应该在服务器端实现
   */
  static getServerImplementationExample(): string {
    return `
// 服务器端实现示例 (Node.js + Express)
app.post('/zalo/phone-number', async (req, res) => {
  try {
    const { phoneToken, accessToken } = req.body;
    
    // 调用Zalo Open API获取手机号
    const response = await fetch('https://graph.zalo.me/v2.0/me/info', {
      method: 'GET',
      headers: {
        'access_token': accessToken,
        'code': phoneToken,
        'secret_key': process.env.ZALO_SECRET_KEY // 从环境变量获取
      }
    });
    
    const data = await response.json();
    
    if (data.error === 0) {
      res.json({
        success: true,
        number: data.data.number
      });
    } else {
      res.json({
        success: false,
        error: data.message
      });
    }
  } catch (error) {
    res.json({
      success: false,
      error: error.message
    });
  }
});
    `;
  }
}

// 导出默认实例
export const zaloPhoneService = ZaloPhoneService.getInstance();

// 导出便捷方法
export const getUserPhoneNumber = () => zaloPhoneService.getUserPhoneNumber();
export const getPhoneToken = () => zaloPhoneService.getPhoneToken();
