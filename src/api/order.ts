import { request } from './request';

export type CloseSymbolRequest = {
  api_id: number;
  symbol: string;
  pos_side?: string;
  mgn_mode?: string;
  quantity?: number;
};

export type OpenSymbolRequest = {
  api_id: number;
  symbol: string;
  side: 'long' | 'short';
  quantity: number;
  marginMode?: 'cross' | 'isolated';
};

export type OrderSymbolsData = {
  platform: string;
  symbols: string[];
  count: number;
};

export const orderApi = {
  /**
   * 平仓
   */
  closeSymbol: async (data: CloseSymbolRequest) => {
    return request<any>('/order/close-symbol/', {
      method: 'POST',
      body: data,
    });
  },

  /**
   * 开仓
   */
  openSymbol: async (data: OpenSymbolRequest) => {
    return request<any>('/order/open-symbol/', {
      method: 'POST',
      body: data,
    });
  },

  /**
   * 读取指定交易所 USDT 永续（或等价）合约交易对列表（登录态；数据来自交易所 public 接口）
   */
  listSymbols: async (platform: string) => {
    return request<OrderSymbolsData>('/order/symbols/', {
      method: 'GET',
      params: { platform },
      silent: true,
    });
  },
};
