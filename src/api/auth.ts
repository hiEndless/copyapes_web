import { request } from './request';

export interface RegisterParams {
  username?: string;
  password?: string;
  confirm_password?: string;
  invite_code?: string;
  email?: string;
  email_code?: string;
  /** Cloudflare Turnstile，后端配置 TURNSTILE_SECRET_KEY 时必填 */
  cf_turnstile_token?: string;
}

export interface LoginParams {
  username?: string;
  password?: string;
  /** Cloudflare Turnstile，后端配置 TURNSTILE_SECRET_KEY 时必填 */
  cf_turnstile_token?: string;
}

export interface UserInfo {
  name: string;
  id: number;
  token: string;
  is_admin: boolean;
  is_vip: boolean;
  is_studio_vip: boolean;
  is_partner: boolean;
  is_new_user: boolean;
  is_oem: boolean;
  vip_days?: number
  studio_vip_days?: number
  limit_usdt?: number
  api_limit?: number
  task_limit?: number
}

export const authApi = {
  /**
   * 注册
   */
  register(data: RegisterParams) {
    return request<{ username: string }>('/register/', {
      method: 'POST',
      body: data,
    });
  },

  /**
   * 发送注册邮箱验证码
   */
  registerSendCode(data: { email: string; cf_turnstile_token?: string }) {
    return request<null>('/register/email/send-code/', {
      method: 'POST',
      body: data,
    });
  },

  /**
   * 登录
   */
  login(data: LoginParams) {
    return request<UserInfo>('/login/', {
      method: 'POST',
      body: data,
    });
  },

  /**
   * 获取当前登录信息
   */
  getLoginInfo() {
    return request<UserInfo>('/login/', {
      method: 'GET',
    });
  },
};
