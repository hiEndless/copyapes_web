'use client';

import { useEffect, useState } from 'react';

import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

import Pricing, { type Plan } from '@/components/shadcn-studio/blocks/pricing-component-07/pricing-component-07';
import { settingsApi } from '@/api/settings';

const defaultPlans: Plan[] = [
  {
    id: 'free_vip',
    name: '免费体验',
    subtitle: '适合个人交易',
    priceMonthly: 0,
    accounts: '1 个交易 API，1 个跟单任务',
    features: ['1 个交易 API', '1 个跟单任务', '授权交易 API 累计资金不超过 1,000 USDT', '只能添加 OKX / Gate / Bitget 交易所 API', '不支持带单 API', '交易消息通知', '普通客服支持'],
    buttonText: '开通 VIP'
  },
  {
    id: 'vip_month',
    name: 'VIP',
    subtitle: '适合个人交易',
    priceMonthly: 40,
    accounts: '5 个交易 API，15 个跟单任务',
    features: ['5 个交易 API', '15 个跟单任务', '授权交易 API 累计资金不超过 5,000 USDT', '可添加任意交易所 API', '支持带单 API', '交易消息通知', '7 * 24 小时专业客服支持'],
    yearlyFeatures: ['5 个交易 API', '15 个跟单任务', '授权交易 API 累计资金不超过 5,000 USDT', '可添加任意交易所 API', '支持带单 API', '交易消息通知', '7 * 24 小时专业客服支持', '享包年 9 折优惠', '额外赠送永久代理商权限'],
    buttonText: '开通 VIP'
  },
  {
    id: 'studio_vip_month',
    name: '工作室 VIP',
    subtitle: '适合小型跟单工作室',
    priceMonthly: 100,
    accounts: '10 个交易 API，不限制跟单任务数量',
    features: ['10 个交易 API', '50 个跟单任务', '授权交易 API 累计资金不超过 20,000 USDT', '可添加任意交易所 API','支持带单 API', '交易消息通知', '专属工作室管理功能', '7 * 24 小时专业客服支持', '支持功能定制', '额外赠送永久代理商权限'],
    yearlyFeatures: ['10 个交易 API', '50 个跟单任务', '授权交易 API 累计资金不超过 20,000 USDT', '可添加任意交易所 API','支持带单 API', '交易消息通知', '专属工作室管理功能', '7 * 24 小时专业客服支持', '支持功能定制', '享包年 9 折优惠', '额外赠送永久代理商权限'],
    buttonText: '开通工作室 VIP'
  },
  {
    id: 'vip_permanent',
    name: '永久 VIP',
    subtitle: '适合个人交易',
    priceMonthly: 0,
    oneTimePrice: 1000,
    accounts: '5 个交易 API，15 个跟单任务',
    features: ['5 个交易 API', '15 个跟单任务', '授权交易 API 累计资金不超过 5,000 USDT', '可添加任意交易所 API', '支持带单 API', '交易消息通知', '7 * 24 小时专业客服支持', '支持功能定制'],
    buttonText: '开通永久 VIP'
  },
  {
    id: 'vip_limit_pack_20000',
    name: 'VIP 资金限额提额',
    subtitle: '资金限额提升 20,000 USDT',
    priceMonthly: 0,
    oneTimePrice: 100,
    accounts: '资金限额提升 20,000 USDT',
    features: ['VIP 有效期内，永久提升资金限额 20,000 USDT', 'VIP 到期后，资金额度提升失效', '仅限个人 VIP 用户购买'],
    buttonText: '购买 VIP 资金提额'
  },
  {
    id: 'studio_limit_pack_100000',
    name: '工作室 VIP 资金限额提额',
    subtitle: '资金限额提升 100,000 USDT',
    priceMonthly: 0,
    oneTimePrice: 300,
    accounts: '资金限额提升 100,000 USDT',
    features: ['工作室VIP 有效期内，永久提升资金限额 100,000 USDT', '工作室VIP 到期后，资金额度提升失效', '仅限工作室 VIP 用户购买'],
    buttonText: '购买工作室 VIP 资金提额'
  },
  // {
  //   id: 'vip_api',
  //   name: 'VIP 提升 API 授权数量',
  //   subtitle: '提升 API 授权数量',
  //   priceMonthly: 0,
  //   oneTimePrice: 100,
  //   accounts: '提升交易 API 授权数量 5个',
  //   features: ['VIP 有效期内，永久提升交易 API 授权数量 5个，可叠加', 'VIP 到期后，授权数量提升失效', '仅限个人 VIP 用户购买'],
  //   buttonText: '购买 VIP API 授权数量'
  // },
  {
    id: 'studio_api_slot_pack_5',
    name: '工作室 VIP 提升 API 授权数量',
    subtitle: '提升 API 授权数量',
    priceMonthly: 0,
    oneTimePrice: 300,
    accounts: '提升交易 API 授权数量 5个',
    features: ['工作室VIP 有效期内，永久提升交易 API 授权数量 5 个，可叠加', '工作室VIP 有效期内，永久提升跟单任务数量 25 个，可叠加','工作室VIP 到期后，额外提升失效', '仅限工作室 VIP 用户购买'],
    buttonText: '购买工作室 VIP API 授权数量'
  }
];

export default function PricingPage() {
  const [plans, setPlans] = useState<Plan[]>(defaultPlans);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await settingsApi.getPriceInfo();
        const items = res?.plans || [];

        // Merge fetched prices into defaultPlans
        const updatedPlans = defaultPlans.map(plan => {
          if (plan.id === 'vip_month') {
            const monthPlan = items.find(item => item.plan_code === 'vip_month');
            const yearPlan = items.find(item => item.plan_code === 'vip_year');

            return {
              ...plan,
              priceMonthly: monthPlan ? Number(monthPlan.effective_price) : plan.priceMonthly,
              priceYearly: yearPlan ? Number(yearPlan.effective_price) : undefined,
              monthPlanCode: 'vip_month',
              yearPlanCode: 'vip_year',
            };
          }

          if (plan.id === 'studio_vip_month') {
            const monthPlan = items.find(item => item.plan_code === 'studio_vip_month');
            const yearPlan = items.find(item => item.plan_code === 'studio_vip_year');

            return {
              ...plan,
              priceMonthly: monthPlan ? Number(monthPlan.effective_price) : plan.priceMonthly,
              priceYearly: yearPlan ? Number(yearPlan.effective_price) : undefined,
              monthPlanCode: 'studio_vip_month',
              yearPlanCode: 'studio_vip_year',
            };
          }

          if (plan.id === 'vip_permanent') {
            const serverPlan = items.find(item => item.plan_code === 'vip_permanent');

            return {
              ...plan,
              oneTimePrice: serverPlan ? Number(serverPlan.effective_price) : plan.oneTimePrice,
              oneTimePlanCode: 'vip_permanent',
            };
          }

          if (plan.id === 'vip_limit_pack_20000') {
            const serverPlan = items.find(item => item.plan_code === 'vip_limit_pack_20000');

            return {
              ...plan,
              oneTimePrice: serverPlan ? Number(serverPlan.effective_price) : plan.oneTimePrice,
              oneTimePlanCode: 'vip_limit_pack_20000',
            };
          }

          if (plan.id === 'studio_limit_pack_100000') {
            const serverPlan = items.find(item => item.plan_code === 'studio_limit_pack_100000');

            return {
              ...plan,
              oneTimePrice: serverPlan ? Number(serverPlan.effective_price) : plan.oneTimePrice,
              oneTimePlanCode: 'studio_limit_pack_100000',
            };
          }

          if (plan.id === 'vip_api_slot_pack_5') {
            const serverPlan = items.find(item => item.plan_code === 'vip_api_slot_pack_5');

            return {
              ...plan,
              oneTimePrice: serverPlan ? Number(serverPlan.effective_price) : plan.oneTimePrice,
              oneTimePlanCode: 'vip_api_slot_pack_5',
            };
          }

          if (plan.id === 'studio_api_slot_pack_5') {
            const serverPlan = items.find(item => item.plan_code === 'studio_api_slot_pack_5');

            return {
              ...plan,
              oneTimePrice: serverPlan ? Number(serverPlan.effective_price) : plan.oneTimePrice,
              oneTimePlanCode: 'studio_api_slot_pack_5',
            };
          }

          return plan;
        });

        setPlans(updatedPlans);
      } catch {
        toast.error('获取套餐价格失败');
      } finally {
        setLoading(false);
      }
    };

    fetchPrices();
  }, []);

  return (
    <div className='flex flex-1 flex-col p-4 md:px-6'>
      <div className='space-y-4'>
        <div>
          <h1 className='text-2xl font-semibold tracking-tight'>会员服务</h1>
          <p className='text-muted-foreground mt-1 text-sm'>
            选择适合自己的会员服务
          </p>
        </div>

        {loading ? (
          <div className='flex items-center justify-center py-20'>
            <Loader2 className='text-muted-foreground size-8 animate-spin' />
          </div>
        ) : (
          <Pricing plans={plans} />
        )}
      </div>
    </div>
  );
}
