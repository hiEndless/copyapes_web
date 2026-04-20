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

export const settingsApi = {
  getEffectivePricing: () => {
    return request<EffectivePricingResponse>('/settings/memberships/pricing/effective', {
      method: 'GET'
    }).then(res => res.data);
  },

  getCurrentMembership: () => {
    return request<CurrentMembershipResponse>('/settings/memberships/current', {
      method: 'GET'
    }).then(res => res.data);
  }
};
