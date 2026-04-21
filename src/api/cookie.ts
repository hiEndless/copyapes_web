import { request } from './request';

// 获取 Cookie 列表
export function getCookies() {
  return request('/curl/', {
    method: 'GET',
  });
}

// 提交或更新 Cookie (手动上传)
export function addOrUpdateCookie(data: {
  exchange: string | number;
  curl_text: string;
}) {
  return request('/curl/', {
    method: 'POST',
    body: data,
  });
}

// 修改 Cookie 名称
export function updateCookieName(data: {
  curl_id: string | number;
  curl_name: string;
}) {
  return request('/curl/', {
    method: 'PATCH',
    body: data,
  });
}

// 搜索 Cookie
export function searchCookie(search_name: string) {
  return request('/speedtrade/curlsearch/', {
    method: 'POST',
    body: { search_name },
  });
}

