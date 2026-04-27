import { request } from './request';

export interface EffectivePricingResponse {
  studio_id: number;
  items: any[];
  team_manager_upgrade_price: string;
}

export interface CurrentMembershipResponse {
  studio_id: number;
  plan_code: string;
  plan_name: string;
  source: string;
  subscription_id: string | null;
  subscription_end_at: string | null;
}

export interface EntitlementProfileResponse {
  membership_tier: string;
  is_vip: boolean;
  is_studio_vip: boolean;
  vip_days: number;
  studio_vip_days: number;
  legacy_limit_usdt: number;
  asset_limit_usdt: number;
  asset_limit_usdt_extra: number;
  api_slot_limit: number;
  api_slot_used: number;
  api_slot_available: number;
  task_slot_limit: number;
  task_slot_used: number;
  task_slot_available: number;
  api_slot_extra_perm: number;
  task_slot_extra: number;
}

export interface PlanPriceItem {
  plan_code: string;
  plan_name: string;
  membership_type: string;
  billing_cycle: string;
  preset_price: number;
  effective_price: number;
  price_source: string;
  currency: string;
}

export interface PriceInfoResponse {
  ip_price: number;
  vip_price: number;
  plans: PlanPriceItem[];
  price_priority: string[];
}

export interface NoticeResponse {
  notice: string | null;
}

export interface ConnectResponse {
  nickname: string | null;
  wx: string | null;
  telegram: string | null;
}

export const settingsApi = {
  redeemCode: (code: string) => {
    return request<string>('/redeemcode/', {
      method: 'POST',
      body: { redeem_code: code }
    });
  },

  getEffectivePricing: () => {
    return request<EffectivePricingResponse>('/settings/memberships/pricing/effective', {
      method: 'GET'
    }).then(res => res.data);
  },

  getPriceInfo: () => {
    return request<PriceInfoResponse>('/price/', {
      method: 'GET'
    }).then(res => res.data);
  },

  getNoticeInfo: () => {
    return request<NoticeResponse>('/notice/', {
      method: 'GET'
    }).then(res => res.data);
  },

  getConnectInfo: () => {
    return request<ConnectResponse>('/connect/', {
      method: 'GET'
    }).then(res => res.data);
  },

  getCurrentMembership: () => {
    return request<CurrentMembershipResponse>('/settings/memberships/current', {
      method: 'GET'
    }).then(res => res.data);
  },

  getEntitlementProfile: () => {
    return request<EntitlementProfileResponse>('/entitlement/profile/', {
      method: 'GET'
    }).then(res => res.data);
  }
};
