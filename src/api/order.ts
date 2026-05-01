import { request } from './request';

export type CloseSymbolRequest = {
  api_id: number;
  symbol: string;
  pos_side?: string;
  mgn_mode?: string;
  quantity?: number;
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
};
