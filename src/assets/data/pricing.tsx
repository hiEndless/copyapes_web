import { Flower2Icon, FlowerIcon, SproutIcon } from 'lucide-react'

import { type Plans } from '@/components/blocks/pricing/pricing'

export const plans: Plans = [
  {
    icon: <SproutIcon />,
    title: '免费套餐',
    description: '免费体验基础跟单功能',
    price: {
      yearly: 0,
      monthly: 0
    },
    period: '/month',
    buttonText: '免费体验',
    features: [
      '1 个交易所API授权',
      '1 个跟单任务',
      '授权API累计交易资金不超过 1000 USDT',
      '仅支持添加欧意、Gate、Bitget交易所 API'
    ]
  },
  {
    icon: <FlowerIcon />,
    title: 'VIP 套餐',
    description: '为专业交易员提供服务',
    price: {
      yearly: 36,
      monthly: 40
    },
    period: '/month',
    buttonText: '立即开始',
    features: [
      '支持带单员 API Key 接入',
      '支持添加币安交易所 API',
      '5 个交易所API授权',
      '15 个跟单任务',
      '授权API累计交易资金不超过 5000 USDT'
    ],
    extraFeatures: ['跟单消息通知', '极速交易'],
    isPopular: true
  },
  {
    icon: <Flower2Icon />,
    title: 'VIP Pro 套餐',
    description: '更专业的跟单服务',
    price: {
      yearly: 72,
      monthly: 80
    },
    period: '/month',
    buttonText: '立即开始',
    features: [
      '支持带单员 API Key 接入',
      '支持添加币安交易所 API',
      '♾️ 个交易所API授权',
      '♾️ 个跟单任务',
      '授权API累计交易资金不超过 20000 USDT'
    ],
    extraFeatures: ['毫秒级超低延迟', '专属产品客服']
  }
]
