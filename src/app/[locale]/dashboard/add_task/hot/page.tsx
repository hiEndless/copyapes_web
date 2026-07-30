'use client'

import * as React from 'react'
import { useState, useEffect } from 'react'

import { Flame } from 'lucide-react'
import { motion } from 'motion/react'
import { useTranslations } from 'next-intl'

import { request } from '@/api/request'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MotionPreset } from '@/components/ui/motion-preset'
import { TOUR_ANCHORS, tourAnchor } from '@/features/tour/anchors'
import { CopyTaskConfigSheet } from '../_components/copy-task-config-sheet'

type PlatformKey = 'okx' | 'binance' | 'bicoin'

interface Trader {
  name: string
  avatar: string
  platform: {
    key: PlatformKey
    logo: string
  }
  balance: number
}

const initialTraders: Trader[] = [
  {
    name: '平凡无奇交易员',
    avatar: '/head/default-avatar.png',
    platform: { key: 'okx', logo: '/exchanges/okx.png' },
    balance: 0
  },
  {
    name: '熬鹰资本',
    avatar: '/head/aoying.jpg',
    platform: { key: 'binance', logo: '/exchanges/binance.png' },
    balance: 0
  },
  {
    name: '予与xx(私域)',
    avatar: 'https://public.bnbstatic.com/image/pgc/202604/299894bb01cffbefc7f5875aef779249.jpg',
    platform: { key: 'binance', logo: '/exchanges/binance.png' },
    balance: 0
  },
  {
    name: '意钦',
    avatar: 'https://public.bnbstatic.com/image/pgc/202603/9501dfeea9036dc99eef5adc0994ceaf.jpg',
    platform: { key: 'binance', logo: '/exchanges/binance.png' },
    balance: 0
  },
  {
    name: '意钦(私域)',
    avatar: 'https://public.bnbstatic.com/image/pgc/202603/9501dfeea9036dc99eef5adc0994ceaf.jpg',
    platform: { key: 'binance', logo: '/exchanges/binance.png' },
    balance: 0
  },
  {
    name: '创造奇迹666',
    avatar: '/head/qiji666.jpg',
    platform: { key: 'binance', logo: '/exchanges/binance.png' },
    balance: 0
  },
  {
    name: 'Callme卢本伟',
    avatar: '/head/default-avatar.png',
    platform: { key: 'binance', logo: '/exchanges/binance.png' },
    balance: 0
  },
  {
    name: 'Btc星辰',
    avatar: '/head/default-avatar.png',
    platform: { key: 'binance', logo: '/exchanges/binance.png' },
    balance: 0
  },
  {
    name: 'MasterRayn(私域)',
    avatar: '/head/default-avatar.png',
    platform: { key: 'binance', logo: '/exchanges/binance.png' },
    balance: 0
  },
  {
    name: 'trader Yy',
    avatar: '/head/yy.jpg',
    platform: { key: 'binance', logo: '/exchanges/binance.png' },
    balance: 0
  },
  {
    name: '明明明宏',
    avatar: '/head/minghong.jpg',
    platform: { key: 'okx', logo: '/exchanges/okx.png' },
    balance: 0
  },
  {
    name: '牛的青山在',
    avatar: '/head/niude.jpg',
    platform: { key: 'bicoin', logo: '/exchanges/bicoin.png' },
    balance: 0
  },
  {
    name: '暖然-风火山林(聪明钱)',
    avatar: '/head/fenghuoshanlin.jpg',
    platform: { key: 'binance', logo: '/exchanges/binance.png' },
    balance: 0
  },
  {
    name: '星辰社区',
    avatar: '/head/default-avatar.png',
    platform: { key: 'okx', logo: '/exchanges/okx.png' },
    balance: 0
  },
  {
    name: '小周同学',
    avatar: '/head/xiaozhou.jpg',
    platform: { key: 'okx', logo: '/exchanges/okx.png' },
    balance: 0
  }
]

export default function HotTaskPage() {
  const t = useTranslations('DashboardHotKol')
  const [traders, setTraders] = useState<Trader[]>(initialTraders)
  const [selectedTrader, setSelectedTrader] = useState<Trader | null>(null)
  const [isConfigOpen, setIsConfigOpen] = useState(false)

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const res = await request<Record<string, number>[]>('/api/hotbalance/')

        if (res.code === 0 && res.data) {
          const balanceMap = res.data.reduce((acc, curr) => {
            if (curr && typeof curr === 'object') {
              Object.entries(curr).forEach(([key, value]) => {
                acc[key] = Number(value) || 0
              })
            }

            return acc
          }, {} as Record<string, number>)

          setTraders(prev =>
            prev.map(trader => ({
              ...trader,
              balance: balanceMap[trader.name] || 0
            }))
          )
        }
      } catch (error) {
        console.error('Failed to fetch hot balances:', error)
      }
    }

    fetchBalance()
  }, [])

  const formatBalance = (balance: number) => {
    return balance.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }

  const handleFollow = (trader: Trader) => {
    setSelectedTrader(trader)
    setIsConfigOpen(true)
  }

  return (
    <div className='flex h-full items-start justify-center overflow-y-auto p-4 lg:p-8'>
      <div className='w-full max-w-2xl space-y-6 pb-20'>
        <MotionPreset fade blur slide={{ direction: 'down' }} delay={0.6} transition={{ duration: 0.5 }}>
          <Card
            className={`overflow-hidden rounded-xl border-none bg-blue-600 bg-[url('https://cdn.shadcnstudio.com/ss-assets/blocks/marketing/download/image-09.png')] bg-cover bg-center p-0 pt-6 shadow-lg sm:pt-8 lg:h-[216px]`}
            {...tourAnchor(TOUR_ANCHORS.hotIntro)}
          >
            <CardContent className='flex gap-6 px-6 max-sm:flex-col max-sm:gap-2 max-sm:text-center sm:px-10'>
              <div className='space-y-3 pb-2 sm:flex-1 sm:pb-8'>
                <h2 className='flex items-center gap-2 text-xl font-bold tracking-tighter text-white max-sm:mx-auto sm:text-xl md:text-xl'>
                  <Flame className='h-6 w-6' />
                  {t('title')}
                </h2>
                <p className='mb-3 text-sm text-white/70'>{t('subtitle')}</p>
              </div>
              <div className='flex items-center justify-center pb-6 sm:my-auto sm:min-w-56 sm:pb-0'>
                <div className='flex flex-row gap-3 sm:flex-row sm:gap-4'>
                  <div className='flex flex-row gap-3 sm:flex-col sm:gap-4'>
                    <motion.div
                      className='flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-blue-600 shadow-lg backdrop-blur-sm sm:h-14 sm:w-14'
                      animate={{ scale: [1, 1.08, 1], y: [0, -5, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <img
                        src='/face/face-2.png'
                        alt='binance'
                        className='h-full w-full object-cover transition-all duration-300 hover:scale-110'
                      />
                    </motion.div>
                    <motion.div
                      className='flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-white shadow-lg backdrop-blur-sm sm:h-14 sm:w-14'
                      animate={{ scale: [1, 1.08, 1], y: [0, 5, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <img
                        src='/face/face-3.png'
                        alt='okx'
                        className='h-full w-full object-cover transition-all duration-300 hover:scale-110'
                      />
                    </motion.div>
                  </div>
                  <div className='flex flex-row gap-3 sm:mt-8 sm:flex-col sm:gap-4'>
                    <motion.div
                      className='flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-white shadow-lg backdrop-blur-sm sm:h-14 sm:w-14'
                      animate={{ scale: [1, 1.08, 1], y: [0, 5, 0] }}
                      transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <img
                        src='/face/face-4.png'
                        alt='bitget'
                        className='h-full w-full object-cover transition-all duration-300 hover:scale-110'
                      />
                    </motion.div>
                    <motion.div
                      className='flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-white shadow-lg backdrop-blur-sm sm:h-14 sm:w-14'
                      animate={{ scale: [1, 1.08, 1], y: [0, -5, 0] }}
                      transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <img
                        src='/face/face-5.png'
                        alt='gate'
                        className='h-full w-full object-cover transition-all duration-300 hover:scale-110'
                      />
                    </motion.div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </MotionPreset>

        <MotionPreset fade blur slide={{ direction: 'down' }} delay={0.8} transition={{ duration: 0.5 }}>
          <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3' {...tourAnchor(TOUR_ANCHORS.hotTraderList)}>
            {traders.map(trader => (
              <Card
                key={trader.name}
                className='flex flex-col justify-between gap-2 p-3 shadow-sm transition-shadow hover:shadow-md'
              >
                <div className='flex items-center gap-2'>
                  <div className='shrink-0'>
                    <img
                      src={trader.avatar}
                      alt={trader.name}
                      className='border-muted h-10 w-10 rounded-md border object-cover'
                    />
                  </div>

                  <div className='flex flex-1 flex-col overflow-hidden'>
                    <span className='text-foreground truncate text-xs font-medium'>{trader.name}</span>
                    <div className='mt-0.5 flex items-center gap-1.5'>
                      <span className='bg-muted text-muted-foreground truncate rounded px-1 py-0.5 text-[10px] leading-none'>
                        {t(`platforms.${trader.platform.key}`)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className='bg-muted/30 flex items-center justify-between rounded-md px-2 py-1.5'>
                  <span className='text-muted-foreground text-[10px]'>{t('currentBalance')}</span>
                  <span className='text-foreground text-xs font-medium'>${formatBalance(trader.balance)}</span>
                </div>

                <Button
                  size='sm'
                  className='h-7 w-full text-xs'
                  onClick={() => handleFollow(trader)}
                  disabled={trader.balance === 0}
                >
                  {trader.balance === 0 ? t('unavailable') : t('followNow')}
                </Button>
              </Card>
            ))}
          </div>
        </MotionPreset>
      </div>

      <CopyTaskConfigSheet
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        traderId={selectedTrader?.name || ''}
        traderName={selectedTrader?.name || ''}
        platform='4'
        roleType='1'
        traderPlatform={4}
      />
    </div>
  )
}
