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
  id: number;
  is_vip: boolean;
  is_studio_vip: boolean;
  vip_days: number;
  studio_vip_days: number;
  limit_usdt: number;
  vip_limit_usdt_extra: number;
  studio_limit_usdt_extra: number;
  vip_api_slots_extra_perm: number;
  studio_api_slots_extra_perm: number;
  vip_task_slots_extra: number;
  studio_task_slots_extra: number;
  api_used_count: number;
  task_used_count: number;
  [key: string]: any;
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

export const settingsApi = {
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
