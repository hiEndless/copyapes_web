import { toast } from 'sonner';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface BaseResponse<T = any> {
  code: number;
  data?: T;
  error?: string;
  message?: string;
  detail?: Record<string, string[]>;
}

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  params?: Record<string, string | number | boolean | null | undefined>;
  body?: any;
}

export async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<BaseResponse<T>> {
  const { params = {}, body, ...customConfig } = options;

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  if (token && !params.token) {
    params.token = token;
  }

  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });

  const queryString = searchParams.toString();

  // 严格匹配是否以 /api/ 开头（而不是仅仅 startsWith('/api')，因为这会把 /apiadd/ 误判为已包含前缀）
  const hasApiPrefix = endpoint.startsWith('/api/') || endpoint === '/api';
  const apiPath = hasApiPrefix ? endpoint : `/api${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const url = `${API_BASE_URL}${apiPath}${queryString ? '?' + queryString : ''}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...customConfig.headers,
  };

  const config: RequestInit = {
    ...customConfig,
    headers,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (data.code !== 0 && typeof window !== 'undefined') {
      let errorMessage = data.error || data.message || '操作失败';

      if (data.detail && Object.keys(data.detail).length > 0) {
        const firstErrorKey = Object.keys(data.detail)[0];

        errorMessage = data.detail[firstErrorKey][0];
      }

      toast.error(errorMessage);
    }

    return data as BaseResponse<T>;
  } catch (error) {
    console.error('API Request Error:', error);

    if (typeof window !== 'undefined') {
      toast.error('网络请求失败，请稍后重试');
    }

    return {
      code: 1005, // API_ERROR based on backend
      error: '网络请求失败，请稍后重试',
    } as BaseResponse<T>;
  }
}
