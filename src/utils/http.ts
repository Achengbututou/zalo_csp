// API服务配置
const API_BASE_URL = "https://webapp.crystal-csc.cn/csp_core_api_v3";

// HTTP请求类，模仿原始项目的http.js mixins
class HttpService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // 处理登录状态失效
  private handleAuthError() {
    console.log('[HTTP Service] 检测到登录状态无效，清理登录数据并重定向到登录页');
    
    // 清理所有登录相关的localStorage数据
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem("authToken");
      localStorage.removeItem("token");
      localStorage.removeItem("userInfo");
    }

    // 触发一个自定义事件，让React组件处理重定向
    if (typeof window !== "undefined") {
      const event = new CustomEvent('auth-error', { detail: { reason: 'token-invalid' } });
      window.dispatchEvent(event);
      
      // 作为备用方案，如果事件处理失败，直接重定向
      setTimeout(() => {
        if (window.location.pathname !== '/login') {
          window.location.replace('/login');
        }
      }, 100);
    }
  }

  // 处理URL - 模仿原始项目的learun_handleUrl方法
  handleUrl(url) {
    let result = url;
    if (result.startsWith("http://") || result.startsWith("https://")) {
      return result;
    }
    if (!result.startsWith("/")) {
      result = "/" + result;
    }
    if (!result.startsWith(this.baseURL)) {
      result = this.baseURL + result;
    }
    return result;
  }

  // 获取token
  getToken() {
    try {
      // 首先尝试从直接存储的token获取（模仿原始项目的SET_STORAGE('token', token)）
      const directToken = localStorage.getItem("token");
      if (directToken) {
        console.log(
          `[HTTP Service] 使用直接存储的token: ${directToken.substring(
            0,
            20
          )}...`
        );
        return directToken;
      }

      // 其次尝试从authToken获取（React项目的存储方式）
      const authToken = localStorage.getItem("authToken");
      if (authToken) {
        console.log(
          `[HTTP Service] 使用authToken: ${authToken.substring(0, 20)}...`
        );
        return authToken;
      }

      // 最后尝试从userInfo.token获取
      const userInfo = localStorage.getItem("userInfo");
      if (userInfo) {
        const user = JSON.parse(userInfo);
        if (user.token) {
          console.log(
            `[HTTP Service] 使用userInfo.token: ${user.token.substring(
              0,
              20
            )}...`
          );
          return user.token;
        }
      }

      console.log("[HTTP Service] 未找到有效token");
    } catch (error) {
      console.error("[HTTP Service] 获取token失败:", error);
    }

    // 如果没有token，返回空字符串
    return "";
  }

  // HTTP GET请求 - 模仿原始项目的HTTP_GET方法
  async httpGet(url, params = {}) {
    try {
      const requestUrl = this.handleUrl(url);
      const token = this.getToken();

      console.log(`[HTTP GET] 请求URL: ${requestUrl}`);
      console.log(`[HTTP GET] 参数:`, params);
      console.log(`[HTTP GET] Token:`, token ? "已设置" : "未设置");

      // 构建查询参数
      const searchParams = new URLSearchParams();
      Object.keys(params).forEach((key) => {
        if (params[key] !== undefined && params[key] !== null) {
          searchParams.append(key, params[key]);
        }
      });

      const fullUrl = searchParams.toString()
        ? `${requestUrl}?${searchParams.toString()}`
        : requestUrl;

      console.log(`[HTTP GET] 完整URL: ${fullUrl}`);

      const response = await fetch(fullUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token && { token: token }), // 原始项目使用token而不是Authorization
        },
      });

      console.log(
        `[HTTP GET] 响应状态: ${response.status} ${response.statusText}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log(`[HTTP GET] 响应数据:`, result);

      // 检查API返回格式，模仿原始项目的learun_handleResult方法
      if (result.code === 401 || response.status === 410) {
        this.handleAuthError();
        throw new Error("登录状态无效");
      }

      if (result.code !== 200) {
        throw new Error(result.info || "请求失败");
      }

      // 返回实际数据，模仿原始项目返回result.data.data
      return result.data || [];
    } catch (error) {
      console.error("[HTTP GET] 请求失败:", error);
      throw error;
    }
  }

  // HTTP POST请求 - 模仿原始项目的HTTP_POST方法
  async httpPost(url, data = {}) {
    try {
      const requestUrl = this.handleUrl(url);
      const token = this.getToken();

      console.log(`[HTTP POST] 请求URL: ${requestUrl}`);
      console.log(`[HTTP POST] 请求数据:`, data);
      console.log(`[HTTP POST] Token:`, token ? "已设置" : "未设置");

      const response = await fetch(requestUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { token: token }), // 原始项目使用token而不是Authorization
        },
        body: JSON.stringify(data),
      });

      console.log(
        `[HTTP POST] 响应状态: ${response.status} ${response.statusText}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log(`[HTTP POST] 响应数据:`, result);

      // 检查API返回格式，模仿原始项目的learun_handleResult方法
      if (result.code === 401 || response.status === 410) {
        this.handleAuthError();
        throw new Error("登录状态无效");
      }

      if (result.code !== 200) {
        throw new Error(result.info || "请求失败");
      }

      // 返回实际数据，模仿原始项目返回result.data.data
      return result.data || [];
    } catch (error) {
      console.error("[HTTP POST] 请求失败:", error);
      throw error;
    }
  }

  // Get data dictionary - mimicking original project FETCH_DATAITEM method
  async fetchDataItem(code) {
    try {
      console.log(`[HTTP Service] Getting data dictionary: ${code}`);
      const url = `/data/dataitem/details/${code}`;
      const result = await this.httpGet(url);
      console.log(`[HTTP Service] Data dictionary ${code} response:`, result);
      return result;
    } catch (error) {
      console.error(`[HTTP Service] Failed to get data dictionary ${code}:`, error);

      // Return English fallback data for NewsType
      if (code === 'NewsType') {
        console.log(`[HTTP Service] Using English fallback data for ${code}`);
        return [
          { id: 1, f_ItemName: "Latest News", f_ItemCode: "news" },
          { id: 2, f_ItemName: "Announcements", f_ItemCode: "announcement" },
          { id: 3, f_ItemName: "Group News", f_ItemCode: "activity" },
        ];
      }

      throw error;
    }
  }

  // Get news list - mimicking original project news list API call
  async fetchNewsList(params = {}) {
    try {
      console.log(`[HTTP Service] Getting news list, parameters:`, params);
      const url = "/data/dbsource/newsList/list";
      const requestData = {
        paramsJson: JSON.stringify(params),
        sidx: "",
        sord: "desc",
        ...params,
      };

      console.log(`[HTTP Service] News list request data:`, requestData);
      const result = await this.httpPost(url, requestData);
      console.log(`[HTTP Service] News list response:`, result);
      return result;
    } catch (error) {
      console.error("[HTTP Service] Failed to get news list:", error);
      throw error;
    }
  }
}

// 创建HTTP服务实例
const httpService = new HttpService();

// 导出方法，模仿原始项目的mixin使用方式
export const fetchDataItem = (code) => httpService.fetchDataItem(code);
export const httpPostMethod = (url, data) => httpService.httpPost(url, data);
export const httpGetMethod = (url, params) => httpService.httpGet(url, params);
export const fetchNewsList = (params) => httpService.fetchNewsList(params);

export default httpService;
