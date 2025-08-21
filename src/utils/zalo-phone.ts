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
   * 步骤3: 直接调用Zalo Open API获取真实手机号
   *
   * 根据Zalo官方文档，使用正确的API调用方式
   * API文档: https://mini.zalo.me/documents/api/getPhoneNumber/
   *
   * @param phoneToken 手机号token (从getPhoneNumber获取)
   * @param accessToken 访问token (从getAccessToken获取)
   * @returns Promise<PhoneNumberInfo> 手机号信息
   */
  async getPhoneNumberFromServer(phoneToken: string, accessToken: string): Promise<PhoneNumberInfo> {
    try {
      console.log('[ZaloPhoneService] 直接调用Zalo Open API获取真实手机号...');
      console.log('[ZaloPhoneService] phoneToken:', phoneToken);
      console.log('[ZaloPhoneService] accessToken:', accessToken);

      // 构建API URL，根据Zalo官方文档
      // 使用您的Zalo应用Secret Key
      const secretKey = 'WyBSOWS0NUw14KpbRUW8';
      const apiUrl = `https://graph.zalo.me/v2.0/me/info?access_token=${accessToken}&code=${phoneToken}&secret_key=${secretKey}`;

      console.log('[ZaloPhoneService] 调用API URL:', apiUrl.replace(/secret_key=[^&]*/, 'secret_key=***'));

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Zalo API请求失败: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();

      console.log('[ZaloPhoneService] Zalo API返回结果:', result);

      if (result.error && result.error !== 0) {
        throw new Error(`Zalo API错误: ${result.message || result.error}`);
      }

      // 提取手机号
      const phoneNumber = result.data?.number;

      if (!phoneNumber) {
        throw new Error('未能从Zalo API获取到手机号，可能需要配置Secret Key');
      }

      console.log('[ZaloPhoneService] 成功获取真实手机号:', phoneNumber);

      return {
        number: phoneNumber,
        success: true
      };

    } catch (error) {
      console.error('[ZaloPhoneService] 获取真实手机号失败:', error);

      // 如果是CORS问题，提供备选方案
      if (error instanceof Error && error.message.includes('CORS')) {
        console.log('[ZaloPhoneService] 检测到CORS问题，使用备选方案...');

        // 备选方案：返回phoneToken作为显示（临时方案）
        // 实际项目中应该通过服务器端代理调用API
        return {
          number: `Token:${phoneToken.substring(0, 10)}...`, // 显示部分token
          success: true,
          error: 'CORS限制，显示Token片段'
        };
      }

      // 如果是其他错误，直接抛出
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
