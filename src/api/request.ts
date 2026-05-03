import { toast } from 'sonner';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface BaseResponse<T = any> {
  code: number;
  data?: T;
  error?: string;
  message?: string;
  msg?: string;
  detail?: Record<string, string[]>;
}

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  params?: Record<string, string | number | boolean | null | undefined>;
  body?: any;
  silent?: boolean; // 如果为 true，遇到错误时不弹出 toast
}

export async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<BaseResponse<T>> {
  const { params = {}, body, silent = false, ...customConfig } = options;

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

  // 如果原 endpoint 中已经包含了 `?`，则后续参数应使用 `&` 连接，避免出现 `?limit=10&offset=0?token=...` 的错误情况
  const hasQueryInPath = apiPath.includes('?');
  const separator = hasQueryInPath ? '&' : '?';
  const url = `${API_BASE_URL}${apiPath}${queryString ? separator + queryString : ''}`;

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

    // 兼容旧接口：如果返回值没有 code 字段，并且 HTTP 状态码正常，则默认包装一层 code: 0
    if (response.ok && data && typeof data === 'object' && !('code' in data)) {
      const successMsg = data.message || data.msg;

      if (successMsg && !silent && typeof window !== 'undefined') {
        toast.success(successMsg);
      }

      return {
        code: 0,
        data: data as T,
      };
    }

    if (data.code === 0 && typeof window !== 'undefined') {
      const successMsg = data.message || data.msg;

      if (successMsg && !silent) {
        toast.success(successMsg);
      }
    }

    if (data.code !== 0 && typeof window !== 'undefined') {
      let errorMessage = data.error || data.message || data.msg || '操作失败';

      if (data.detail && Object.keys(data.detail).length > 0) {
        const firstErrorKey = Object.keys(data.detail)[0];

        // 兼容 FastAPI 的 detail 格式，它可能是字符串或者数组对象
        if (typeof data.detail === 'string') {
          errorMessage = data.detail;
        } else if (Array.isArray(data.detail)) {
          errorMessage = data.detail[0]?.msg || errorMessage;
        } else {
          errorMessage = data.detail[firstErrorKey][0];
        }
      }

      if (!silent) {
        toast.error(errorMessage);
      }
    }

    return data as BaseResponse<T>;
  } catch (error) {
    console.error('API Request Error:', error);

    if (!silent && typeof window !== 'undefined') {
      toast.error('网络请求失败，请稍后重试');
    }

    return {
      code: 1005, // API_ERROR based on backend
      error: '网络请求失败，请稍后重试',
    } as BaseResponse<T>;
  }
}
