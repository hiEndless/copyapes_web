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
  email?: string | null
  email_verified?: boolean
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

  passwordResetEmailSendCode(data: { email: string; cf_turnstile_token?: string }) {
    return request<null>('/password/reset/email/send-code/', {
      method: 'POST',
      body: data,
    });
  },

  passwordResetEmailConfirm(data: { email: string; code: string; new_password: string; confirm_password: string }) {
    return request<null>('/password/reset/email/confirm/', {
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

  patchUsername(body: { new_username: string; password: string }) {
    return request<{ name: string }>('/username/', {
      method: 'PATCH',
      body,
    });
  },

  emailChangeOldSendCode(body: { cf_turnstile_token?: string }) {
    return request<{ skip_old?: boolean } | null>('/email/change/old/send-code/', {
      method: 'POST',
      body,
    });
  },

  emailChangeOldVerify(body: { code: string }) {
    return request<null>('/email/change/old/verify/', {
      method: 'POST',
      body,
    });
  },

  emailChangeNewSendCode(body: { email: string; cf_turnstile_token?: string }) {
    return request<null>('/email/change/new/send-code/', {
      method: 'POST',
      body,
    });
  },

  emailChangeNewVerify(body: { email: string; code: string }) {
    return request<{ email: string; email_verified: boolean }>('/email/change/new/verify/', {
      method: 'POST',
      body,
    });
  },
};
