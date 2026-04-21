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
    id: 'vip',
    name: 'VIP',
    subtitle: '适合个人交易',
    priceMonthly: 40,
    accounts: '5 个交易 API，15 个跟单任务',
    features: ['5 个交易 API', '15 个跟单任务', '授权交易 API 累计资金不超过 5,000 USDT', '可添加任意交易所 API', '支持带单 API', '交易消息通知', '7 * 24 小时专业客服支持'],
    buttonText: '开通 VIP'
  },
  {
    id: 'studio_vip',
    name: '工作室 VIP',
    subtitle: '适合小型跟单工作室',
    priceMonthly: 200,
    accounts: '10 个交易 API，不限制跟单任务数量',
    features: ['10 个交易 API', '不限制跟单任务数量', '授权交易 API 累计资金不超过 200,000 USDT', '可添加任意交易所 API','支持带单 API', '交易消息通知', '专属工作室管理功能', '7 * 24 小时专业客服支持', '支持功能定制'],
    buttonText: '开通 VIP PRO'
  },
  {
    id: 'permanent',
    name: '永久 VIP',
    subtitle: '适合个人交易',
    priceMonthly: 0,
    oneTimePrice: 1500,
    accounts: '5 个交易 API，15 个跟单任务',
    features: ['5 个交易 API', '15 个跟单任务', '授权交易 API 累计资金不超过 5,000 USDT', '可添加任意交易所 API', '支持带单 API', '交易消息通知', '7 * 24 小时专业客服支持', '支持功能定制'],
    buttonText: '开通永久 VIP'
  },
  {
    id: 'balance',
    name: 'VIP 资金限额提额',
    subtitle: '提升资金限额至 20,000 USDT',
    priceMonthly: 0,
    oneTimePrice: 100,
    accounts: '提升资金限额至 20,000 USDT',
    features: ['VIP 有效期内，永久提升资金限额至 20,000 USDT', 'VIP 到期后，资金额度提升失效', '仅限个人 VIP 用户购买'],
    buttonText: '购买 VIP 资金提额'
  },
  {
    id: 'studio_balance',
    name: '工作室 VIP 资金限额提额',
    subtitle: '提升资金限额至 500,000 USDT',
    priceMonthly: 0,
    oneTimePrice: 1000,
    accounts: '提升资金限额至 500,000 USDT',
    features: ['工作室VIP 有效期内，永久提升资金限额至 500,000 USDT', '工作室VIP 到期后，资金额度提升失效', '仅限工作室 VIP 用户购买'],
    buttonText: '购买工作室 VIP 资金提额'
  },
  {
    id: 'studio_api',
    name: '工作室 VIP 提升 API 授权数量',
    subtitle: '提升 API 授权数量',
    priceMonthly: 0,
    oneTimePrice: 300,
    accounts: '提升添加交易 API 的授权数量',
    features: ['工作室VIP 有效期内，永久提升 API 授权数量 5个，可叠加', '工作室VIP 到期后，授权数量提升失效', '仅限工作室 VIP 用户购买'],
    buttonText: '购买工作室 VIP API 授权数量'
  }
];

export default function PricingPage() {
  const [plans, setPlans] = useState<Plan[]>(defaultPlans);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await settingsApi.getEffectivePricing();
        const items = res?.items || [];
        const upgradePrice = res?.team_manager_upgrade_price;

        // Merge fetched prices into defaultPlans
        const updatedPlans = defaultPlans.map(plan => {
          if (plan.id === 'team') {
            if (upgradePrice) {
              return {
                ...plan,
                oneTimePrice: Number(upgradePrice)
              };
            }

            return plan;
          }

          const serverPlan = items.find(item => item.plan_code === plan.id);

          if (serverPlan && serverPlan.effective_month_price) {
            return {
              ...plan,
              priceMonthly: Number(serverPlan.effective_month_price)
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
