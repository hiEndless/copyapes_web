import { request } from './request';

export interface RegisterParams {
  username?: string;
  password?: string;
  confirm_password?: string;
  invite_code?: string;
}

export interface LoginParams {
  username?: string;
  password?: string;
}

export interface UserInfo {
  name: string;
  id: number;
  token: string;
  is_admin: boolean;
  is_vip: boolean;
  is_private: boolean;
  is_partner: boolean;
  is_new_user: boolean;
  is_oem: boolean;
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
