import { request } from './request';

// 获取可用的跟单 API 列表
export function getApiOptions() {
  return request('/apiadd/', {
    method: 'GET',
  });
}

// 获取预估本金
export const getTraderBalance = (params: {
  trader_platform: string | number
  uniqueName: string
  role_type?: string | number
}) => {
  return request<number | string>('/api/trader_balance/', {
    method: 'POST',
    body: params,
    silent: true // 防止内部 toast 弹出
  })
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
export function getTaskList(params?: {
  page?: number
  page_size?: number
  limit?: number
  offset?: number
  active_only?: boolean
  status?: number
}) {
  return request('/taskadd/', {
    method: 'GET',
    params,
  });
}

// 终止任务
export function stopTask(id: string | number) {
  return request(`/taskadd/${id}/`, {
    method: 'PATCH',
    body: { task_id: id, status: '2' },
  });
}

// 获取任务详情
export function getTaskDetail(id: string | number) {
  return request<any>(`/taskadd/${id}/`, {
    method: 'GET',
  });
}

// 获取交易员交易记录
export function getTraderDetail(id: string | number) {
  return request<any>(`/traderdetial/${id}/`, {
    method: 'GET',
  });
}

// 获取跟单猿跟单记录（仓位和历史）
export function getTradeOrder(id: string | number) {
  return request<any>(`/tradeorder/${id}/`, {
    method: 'GET',
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

// 删除 API
export function deleteApi(id: number | string) {
  return request(`/api/apiadd/${id}`, {
    method: 'DELETE'
  })
}

// 获取抢位任务列表
export function getGrabTaskList() {
  return request<any[]>('/api/grabtask/', {
    method: 'GET'
  })
}

// 停止抢位任务
export function stopGrabTask(id: number | string) {
  return request('/api/grabtask/', {
    method: 'PATCH',
    body: { id }
  })
}

export type LeaderInfoData = {
  detail: {
    nicknameTranslate?: string
    avatarUrl?: string
    descTranslate?: string
  }
  performance: {
    roi?: string | number
    pnl?: string | number
  }
  limit_info: {
    minCostPerOrderAmount?: string | number
    maxCostPerOrderAmount?: string | number
    fixAmtMinCopyAmount?: string | number
    fixAmtMaxCopyAmount?: string | number
    fixRatioMinCopyAmount?: string | number
    fixRatioMaxCopyAmount?: string | number
  }
}

// 获取抢位目标交易员详情与限额
export function getLeaderInfo(data: { uniqueName: string; exchange: number }) {
  return request<LeaderInfoData>('/api/leader-info/', {
    method: 'POST',
    body: data,
    silent: true
  })
}

// 创建抢位任务
export function createGrabTask(data: {
  uniqueName: string
  exchange: number
  nickname: string
  follow_type?: number
  investAmount: number
  costPerOrder: number
}) {
  return request('/api/grabtask/', {
    method: 'POST',
    body: data,
    silent: true
  })
}
