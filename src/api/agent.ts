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

export interface UpdateInviteCodeResponse {
  invite_code: string;
}

export type AdminNoticeAudienceType = "all_users" | "vip_users" | "task_users" | "platform_role_users";

export interface AdminNoticeAudienceFilter {
  audience_type: AdminNoticeAudienceType;
  trader_platform?: number;
  role_type?: number;
}

export interface AdminNoticeBroadcastPayload {
  scene_code: string;
  audience: AdminNoticeAudienceFilter;
  wx?: { text: string };
  qq_mail?: { text: string };
  ding_bot?: { text: string };
}

export interface AdminNoticePreviewResponse {
  audience_type: AdminNoticeAudienceType;
  estimated_user_count: number;
  sample_user_ids: number[];
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

  updateInviteCode: (data: { invite_code: string }) => {
    return request<UpdateInviteCodeResponse>('/invitecode/', {
      method: 'PATCH',
      body: data,
    });
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

  // withdraw
  getWithdrawMethod: () => request<any>('/withdraw/method/', { method: 'GET' }),
  saveWithdrawMethod: (data: { payload_json: Record<string, any> }) =>
    request<any>('/withdraw/method/', { method: 'POST', body: data }),
  getWithdrawSummary: () => request<any>('/withdraw/summary/', { method: 'GET' }),
  createWithdrawRequest: (data: { channel: string }) =>
    request<any>('/withdraw/request/', { method: 'POST', body: data }),
  getWithdrawRequests: (params: { limit: number; offset: number }) =>
    request<any>('/withdraw/request/', { method: 'GET', params }),

  // admin withdraw review
  adminGetWithdrawRequests: (params: { limit: number; offset: number }) =>
    request<any>('/admin/withdraw/request/', { method: 'GET', params }),
  adminApproveWithdrawRequest: (requestId: number, data: { admin_note?: string }) =>
    request<any>(`/admin/withdraw/request/${requestId}/approve/`, { method: 'PATCH', body: data }),
  adminRejectWithdrawRequest: (requestId: number, data: { admin_note?: string }) =>
    request<any>(`/admin/withdraw/request/${requestId}/reject/`, { method: 'PATCH', body: data }),

  // admin system notice
  adminNoticePreview: (data: AdminNoticeBroadcastPayload) =>
    request<AdminNoticePreviewResponse>('/admin/notice/broadcast/preview/', { method: 'POST', body: data }),
  adminNoticeSend: (data: AdminNoticeBroadcastPayload) =>
    request<any>('/admin/notice/broadcast/send/', { method: 'POST', body: data }),
};
