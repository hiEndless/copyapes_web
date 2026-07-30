'use client'

import { useEffect, useMemo, useState } from 'react'

import { Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import Pricing, { type Plan } from '@/components/shadcn-studio/blocks/pricing-component-07/pricing-component-07'
import { settingsApi, type RebateVipDiscountInfo } from '@/api/settings'

const REBATE_VIP_DISCOUNT_PRICE_SOURCE = 'rebate_vip_discount_price'

const PLAN_DEFS: Array<{
  id: Plan['id']
  priceMonthly: number
  oneTimePrice?: number
  hasYearlyFeatures?: boolean
}> = [
  { id: 'free_vip', priceMonthly: 0 },
  { id: 'vip_month', priceMonthly: 50, hasYearlyFeatures: true },
  { id: 'studio_vip_month', priceMonthly: 100, hasYearlyFeatures: true },
  { id: 'vip_permanent', priceMonthly: 0, oneTimePrice: 1200 },
  { id: 'vip_limit_pack_20000', priceMonthly: 0, oneTimePrice: 100 },
  { id: 'studio_limit_pack_50000', priceMonthly: 0, oneTimePrice: 300 },
  { id: 'studio_api_slot_pack_5', priceMonthly: 0, oneTimePrice: 300 }
]

function getRebateRenewalInfoBadge(
  t: (key: string, values?: Record<string, string | number | Date>) => string,
  rebateDiscount?: RebateVipDiscountInfo
) {
  if (!rebateDiscount || rebateDiscount.eligible) {
    return null
  }

  if (rebateDiscount.is_studio_vip_active === true || rebateDiscount.studio_vip_days > 0) {
    return null
  }

  if (rebateDiscount.has_rebate_binding === false) {
    return null
  }

  if (rebateDiscount.cooldown_remaining_days > 0) {
    return t('badges.renewInDays', { days: rebateDiscount.cooldown_remaining_days })
  }

  if (rebateDiscount.renew_window_open === false && rebateDiscount.has_rebate_binding === true) {
    return t('badges.renewWindowClosed')
  }

  return null
}

export default function PricingPage() {
  const t = useTranslations('DashboardPricing')

  const defaultPlans = useMemo<Plan[]>(() => {
    return PLAN_DEFS.map(def => {
      const base: Plan = {
        id: def.id,
        name: t(`plans.${def.id}.name`),
        subtitle: t(`plans.${def.id}.subtitle`),
        priceMonthly: def.priceMonthly,
        oneTimePrice: def.oneTimePrice,
        accounts: t(`plans.${def.id}.accounts`),
        features: t.raw(`plans.${def.id}.features`) as string[],
        buttonText: t(`plans.${def.id}.buttonText`)
      }

      if (def.hasYearlyFeatures) {
        base.yearlyFeatures = t.raw(`plans.${def.id}.yearlyFeatures`) as string[]
      }

      return base
    })
  }, [t])

  const [plans, setPlans] = useState<Plan[]>(defaultPlans)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setPlans(defaultPlans)
  }, [defaultPlans])

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await settingsApi.getPriceInfo()
        const items = res?.plans || []
        const rebateRenewalInfoBadge = getRebateRenewalInfoBadge(t, res?.rebate_vip_discount)
        const rebateBadge = t('badges.rebateExclusive')

        const updatedPlans = defaultPlans.map(plan => {
          if (plan.id === 'vip_month') {
            const monthPlan = items.find(item => item.plan_code === 'vip_month')
            const yearPlan = items.find(item => item.plan_code === 'vip_year')

            return {
              ...plan,
              priceMonthly: monthPlan ? Number(monthPlan.effective_price) : plan.priceMonthly,
              priceYearly: yearPlan ? Number(yearPlan.effective_price) : undefined,
              monthPlanCode: 'vip_month',
              yearPlanCode: 'vip_year',
              monthBadge:
                monthPlan?.price_source === REBATE_VIP_DISCOUNT_PRICE_SOURCE ? rebateBadge : undefined,
              yearBadge:
                yearPlan?.price_source === REBATE_VIP_DISCOUNT_PRICE_SOURCE ? rebateBadge : undefined,
              monthInfoBadge:
                monthPlan?.price_source === REBATE_VIP_DISCOUNT_PRICE_SOURCE
                  ? undefined
                  : rebateRenewalInfoBadge ?? undefined
            }
          }

          if (plan.id === 'studio_vip_month') {
            const monthPlan = items.find(item => item.plan_code === 'studio_vip_month')
            const yearPlan = items.find(item => item.plan_code === 'studio_vip_year')

            return {
              ...plan,
              priceMonthly: monthPlan ? Number(monthPlan.effective_price) : plan.priceMonthly,
              priceYearly: yearPlan ? Number(yearPlan.effective_price) : undefined,
              monthPlanCode: 'studio_vip_month',
              yearPlanCode: 'studio_vip_year',
              monthBadge:
                monthPlan?.price_source === REBATE_VIP_DISCOUNT_PRICE_SOURCE ? rebateBadge : undefined,
              yearBadge:
                yearPlan?.price_source === REBATE_VIP_DISCOUNT_PRICE_SOURCE ? rebateBadge : undefined
            }
          }

          if (plan.id === 'vip_permanent') {
            const serverPlan = items.find(item => item.plan_code === 'vip_permanent')

            return {
              ...plan,
              oneTimePrice: serverPlan ? Number(serverPlan.effective_price) : plan.oneTimePrice,
              oneTimePlanCode: 'vip_permanent',
              oneTimeBadge:
                serverPlan?.price_source === REBATE_VIP_DISCOUNT_PRICE_SOURCE ? rebateBadge : undefined
            }
          }

          if (plan.id === 'vip_limit_pack_20000') {
            const serverPlan = items.find(item => item.plan_code === 'vip_limit_pack_20000')

            return {
              ...plan,
              oneTimePrice: serverPlan ? Number(serverPlan.effective_price) : plan.oneTimePrice,
              oneTimePlanCode: 'vip_limit_pack_20000',
              oneTimeBadge:
                serverPlan?.price_source === REBATE_VIP_DISCOUNT_PRICE_SOURCE ? rebateBadge : undefined
            }
          }

          if (plan.id === 'studio_limit_pack_100000') {
            const serverPlan = items.find(item => item.plan_code === 'studio_limit_pack_100000')

            return {
              ...plan,
              oneTimePrice: serverPlan ? Number(serverPlan.effective_price) : plan.oneTimePrice,
              oneTimePlanCode: 'studio_limit_pack_100000',
              oneTimeBadge:
                serverPlan?.price_source === REBATE_VIP_DISCOUNT_PRICE_SOURCE ? rebateBadge : undefined
            }
          }

          if (plan.id === 'vip_api_slot_pack_5') {
            const serverPlan = items.find(item => item.plan_code === 'vip_api_slot_pack_5')

            return {
              ...plan,
              oneTimePrice: serverPlan ? Number(serverPlan.effective_price) : plan.oneTimePrice,
              oneTimePlanCode: 'vip_api_slot_pack_5',
              oneTimeBadge:
                serverPlan?.price_source === REBATE_VIP_DISCOUNT_PRICE_SOURCE ? rebateBadge : undefined
            }
          }

          if (plan.id === 'studio_api_slot_pack_5') {
            const serverPlan = items.find(item => item.plan_code === 'studio_api_slot_pack_5')

            return {
              ...plan,
              oneTimePrice: serverPlan ? Number(serverPlan.effective_price) : plan.oneTimePrice,
              oneTimePlanCode: 'studio_api_slot_pack_5',
              oneTimeBadge:
                serverPlan?.price_source === REBATE_VIP_DISCOUNT_PRICE_SOURCE ? rebateBadge : undefined
            }
          }

          // Keep studio_limit_pack_50000 price merge aligned with plan id in UI defaults
          if (plan.id === 'studio_limit_pack_50000') {
            const serverPlan =
              items.find(item => item.plan_code === 'studio_limit_pack_50000') ||
              items.find(item => item.plan_code === 'studio_limit_pack_100000')

            return {
              ...plan,
              oneTimePrice: serverPlan ? Number(serverPlan.effective_price) : plan.oneTimePrice,
              oneTimePlanCode: serverPlan?.plan_code || 'studio_limit_pack_50000',
              oneTimeBadge:
                serverPlan?.price_source === REBATE_VIP_DISCOUNT_PRICE_SOURCE ? rebateBadge : undefined
            }
          }

          return plan
        })

        setPlans(updatedPlans)
      } catch {
        toast.error(t('page.fetchFailed'))
      } finally {
        setLoading(false)
      }
    }

    fetchPrices()
  }, [defaultPlans, t])

  return (
    <div className='flex flex-1 flex-col p-4 md:px-6'>
      <div className='space-y-4'>
        <div>
          <h1 className='text-2xl font-semibold tracking-tight'>{t('page.title')}</h1>
          <p className='text-muted-foreground mt-1 text-sm'>{t('page.subtitle')}</p>
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
  )
}
