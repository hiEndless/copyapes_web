import { request } from './request';

// 获取可用的跟单 API 列表
export function getApiOptions() {
  return request('/apiadd/', {
    method: 'GET',
  });
}

// 获取预估本金
export function getTraderBalance(data: {
  trader_platform: string | number;
  role_type?: string | number;
  uniqueName: string;
}) {
  return request('/trader_balance/', {
    method: 'POST',
    body: data,
  });
}

// 获取交易员平台名称
export function getCurlName(data: { curl_id: string }) {
  return request('/curlname/', {
    method: 'POST',
    body: data,
  });
}

// 获取API名称
export function getApiName(data: { api_id: string }) {
  return request('/apiname/', {
    method: 'POST',
    body: data,
  });
}

// 提交创建任务
export function addTask(data: any) {
  return request('/taskadd/', {
    method: 'POST',
    body: data,
  });
}

// 获取任务列表
export function getTaskList() {
  return request('/taskadd/', {
    method: 'GET',
  });
}

// 终止任务
export function stopTask(id: string | number) {
  return request(`/taskadd/${id}/`, {
    method: 'PATCH',
    body: { task_id: id, status: '2' },
  });
}

// 币coin API
export function getBicoinInfo() {
  return request('/bicoin/', {
    method: 'GET',
  });
}

export function updateBicoinInfo(data: any) {
  return request('/bicoin/', {
    method: 'PATCH',
    body: data,
  });
}

export function searchBicoinTrader(data: { search_name: string }) {
  return request('/bicoin/', {
    method: 'POST',
    body: data,
  });
}
