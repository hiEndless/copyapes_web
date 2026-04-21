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

// 更新 API 名称
export function updateApiName(data: { api_id: string | number; api_name: string }) {
  return request('/apiname/', {
    method: 'PATCH',
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