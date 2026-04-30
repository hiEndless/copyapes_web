import { request, BaseResponse } from './request';

export type Position = {
  api_id: number;
  platform: string;
  api_name: string;
  symbol: string;
  margin_mode: string | null;
  mark_price: number | null;
  leverage: number | null;
  position_size: number | null;
  side: string;
  avg_entry_price: number | null;
  opened_at: string | null;
  pnl_ratio: number | null;
  pnl: number | null;
};

export type PositionError = {
  api_id: number;
  platform: string;
  reason: string;
};

export type PositionSummary = {
  api_total: number;
  position_count: number;
  error_count: number;
};

export type CurrentPositionsResponse = {
  positions: Position[];
  errors: PositionError[];
  summary: PositionSummary;
};

export const positionsApi = {
  /**
   * 获取当前工作室下所有交易API的实时持仓
   */
  getCurrentPositions: async (instType = 'SWAP') => {
    return request<CurrentPositionsResponse>('/positions/current/', {
      method: 'GET',
      params: { instType },
    });
  },
};
