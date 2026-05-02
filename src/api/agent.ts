import { request } from './request';

export interface AgentSummaryResponse {
  invited_users: number;
  effective_invited_users: number;
  total_share_amount: number;
}

export interface PartnerLevelResponse {
  invite_code: string;
  first_ratio: number;
  second_ratio: number;
}

export const agentApi = {
  getSummary: () => {
    return request<AgentSummaryResponse>('/agent/summary/', {
      method: 'GET'
    }).then(res => res.data);
  },

  getPartnerLevel: () => {
    return request<PartnerLevelResponse>('/partnerlevel/', {
      method: 'GET'
    }).then(res => res.data);
  }
};
