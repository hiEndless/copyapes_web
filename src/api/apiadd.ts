import { request } from './request';

// 获取 API 列表
export function getApiList() {
  return request('/apiadd/', {
    method: 'GET',
  });
}

// 删除 API
export function deleteApi(id: string | number) {
  return request(`/apiadd/${id}/`, {
    method: 'DELETE',
  });
}

// 获取 IP 白名单
export function getIpList() {
  return request<{ ip: string; [key: string]: any }[]>('/api/ip/', {
    method: 'GET'
  })
}

// 更新 API 名称
export function updateApiName(data: { api_id: string | number; api_name: string }) {
  return request('/apiname/', {
    method: 'PATCH',
    body: data,
  });
}

// 验证 API
export function validateApiAdd(data: any) {
  return request('/apiadd/validate/', {
    method: 'POST',
    body: data,
  });
}

// 添加 API
export function addApi(data: any) {
  return request('/apiadd/', {
    method: 'POST',
    body: data,
  });
}

// 搜索 API
export function searchApi(search_name: string) {
  return request('/speedtrade/apisearch/', {
    method: 'POST',
    body: { search_name },
  });
}