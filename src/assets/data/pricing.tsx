import { Flower2Icon, FlowerIcon, SproutIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { type Plans } from '@/components/blocks/pricing/pricing'

export const usePricingPlans = (): Plans => {
  const t = useTranslations('PricingData')

  return [
    {
      icon: <SproutIcon />,
      title: t('free.title'),
      description: t('free.description'),
      price: {
        yearly: 0,
        monthly: 0
      },
      period: '/month',
      buttonText: t('free.button'),
      features: [
        t('free.f1'),
        t('free.f2'),
        t('free.f3'),
        t('free.f4')
      ]
    },
    {
      icon: <FlowerIcon />,
      title: t('vip.title'),
      description: t('vip.description'),
      price: {
        yearly: 36,
        monthly: 40
      },
      period: '/month',
      buttonText: t('vip.button'),
      features: [
        t('vip.f1'),
        t('vip.f2'),
        t('vip.f3'),
        t('vip.f4'),
        t('vip.f5')
      ],
      extraFeatures: [t('vip.ef1'), t('vip.ef2')],
      isPopular: true
    },
    {
      icon: <Flower2Icon />,
      title: t('pro.title'),
      description: t('pro.description'),
      price: {
        yearly: 90,
        monthly: 100
      },
      period: '/month',
      buttonText: t('pro.button'),
      features: [
        t('pro.f5'),
        t('pro.f1'),
        t('pro.f2'),
        t('pro.f3'),
      ],
      extraFeatures: [
        t('pro.ef1'),
        t('pro.ef2'),
        t('pro.ef3'),
        t('pro.ef4')
      ]
    }
  ]
}
