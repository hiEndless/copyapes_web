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
  },

  // redeems
  getRedeems: () => request<any>('/redeems/', { method: 'GET' }),
  createRedeems: (data: { redeem_code_num: number }) => request<any>('/redeems/', { method: 'POST', body: data }),

  // invite user
  getInviteUsers: (params: { limit: number; offset: number }) => request<any>('/rebate/invite_user/', { method: 'GET', params }),
  addInviteUser: (data: any) => request<any>('/rebate/invite_user/', { method: 'POST', body: data }),
  updateInviteUser: (data: any) => request<any>('/rebate/invite_user/', { method: 'PATCH', body: data }),
  deleteInviteUser: (data: { username: string }) => request<any>('/rebate/invite_user/', { method: 'DELETE', body: data }),

  // rebate exchange
  getRebateExchange: () => request<any>('/rebate/exchange/', { method: 'GET' }),
  updateRebateExchange: (data: any) => request<any>('/rebate/exchange/', { method: 'PUT', body: data }),

  // other rebate
  getRebateOkx: () => request<any>('/rebate/okx/', { method: 'GET' }),
  getRebateGate: () => request<any>('/rebate/gate/', { method: 'GET' }),
  getRebateBitget: () => request<any>('/rebate/bitget/', { method: 'GET' }),

  // bn invite
  getBnInvite: (params: { limit: number; offset: number }) => request<any>('/rebate/bn_invite/', { method: 'GET', params }),
  updateBnInvite: (data: { bn_uid: string }) => request<any>('/rebate/bn_invite/', { method: 'PUT', body: data }),
  createBnInvite: () => request<any>('/rebate/bn_invite/', { method: 'POST' }),

  // revenue
  getRevenue: (params: { limit: number; offset: number }) => request<any>('/revenue/', { method: 'GET', params }),

  // invite info
  getInviteInfo: (params: { limit: number; offset: number }) => request<any>('/inviteinfo/', { method: 'GET', params }),

  // my vips
  getMyVips: (params: { limit: number; offset: number }) => request<any>('/my_vips/', { method: 'GET', params }),

  // partner set
  getPartnerSet: () => request<any>('/partnerset/', { method: 'GET' }),
  updatePartnerSet: (data: any) => request<any>('/partnerset/', { method: 'POST', body: data }),

  // commissions
  getCommissions: () => request<any>('/commissions/', { method: 'GET' }),
};
