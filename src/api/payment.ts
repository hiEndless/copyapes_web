import { request } from './request';

export type BuyOrderRequest = {
  plan_code: string;
  pay_type: number;
  order_price: number;
  price: number;
  fromWdId: string;
  product_id: number;
  coupon_code: string;
  discount: number;
};

export const paymentApi = {
  /**
   * 购买套餐订单
   */
  buyOrder: async (data: BuyOrderRequest) => {
    return request<any>('/buyorder/', {
      method: 'POST',
      body: data,
    });
  },
};
