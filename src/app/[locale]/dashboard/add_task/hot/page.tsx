'use client'

import * as React from 'react'
import { useState, useEffect } from 'react'

import { Flame } from 'lucide-react'
import { motion } from 'motion/react'

import { request } from '@/api/request'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MotionPreset } from '@/components/ui/motion-preset'
import { CopyTaskConfigSheet } from '../_components/copy-task-config-sheet'

interface Trader {
  name: string
  avatar: string
  platform: {
    name: string
    logo: string
  }
  balance: number
}

const initialTraders: Trader[] = [
  {
    name: '平凡无奇交易员',
    avatar: '/head/default-avatar.png',
    platform: { name: 'OKX', logo: '/exchanges/okx.png' },
    balance: 0
  },
  {
    name: '佑凡交易',
    avatar: '/head/default-avatar.png',
    platform: { name: 'Binance', logo: '/exchanges/binance.png' },
    balance: 0
  },
  {
    name: 'Callme卢本伟',
    avatar: '/head/default-avatar.png',
    platform: { name: 'Binance', logo: '/exchanges/binance.png' },
    balance: 0
  },
  {
    name: 'Btc星辰',
    avatar: '/head/default-avatar.png',
    platform: { name: 'Binance', logo: '/exchanges/binance.png' },
    balance: 0
  },
  {
    name: 'MasterRayn(私域)',
    avatar: '/head/default-avatar.png',
    platform: { name: 'Binance', logo: '/exchanges/binance.png' },
    balance: 0
  },
  {
    name: '白羊齐夏',
    avatar: '/head/default-avatar.png',
    platform: { name: '币coin', logo: '/exchanges/bicoin.png' },
    balance: 0
  },
  {
    name: '用公式赚钱就是快',
    avatar: '/head/gongshi.jpg',
    platform: { name: 'Binance', logo: '/exchanges/binance.png' },
    balance: 0
  },
  {
    name: 'trader Yy',
    avatar: '/head/yy.jpg',
    platform: { name: 'Binance', logo: '/exchanges/binance.png' },
    balance: 0
  },
  {
    name: '土鸭神队',
    avatar: '/head/tuya.jpg',
    platform: { name: '币coin', logo: '/exchanges/bicoin.png' },
    balance: 0
  },
  {
    name: '老恶魔',
    avatar: '/head/default-avatar.png',
    platform: { name: 'OKX', logo: '/exchanges/okx.png' },
    balance: 0
  },
  {
    name: '明明明宏',
    avatar: '/head/minghong.jpg',
    platform: { name: 'OKX', logo: '/exchanges/okx.png' },
    balance: 0
  },
  {
    name: '牛的青山在',
    avatar: '/head/niude.jpg',
    platform: { name: '币coin', logo: '/exchanges/bicoin.png' },
    balance: 0
  },
  {
    name: '暖然-风火山林(聪明钱)',
    avatar: '/head/fenghuoshanlin.jpg',
    platform: { name: 'Binance', logo: '/exchanges/binance.png' },
    balance: 0
  },
  {
    name: '星辰社区',
    avatar: '/head/default-avatar.png',
    platform: { name: 'OKX', logo: '/exchanges/okx.png' },
    balance: 0
  },
  {
    name: '小周同学',
    avatar: '/head/xiaozhou.jpg',
    platform: { name: 'OKX', logo: '/exchanges/okx.png' },
    balance: 0
  }
]

export default function HotTaskPage() {
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

  // TODO: 后续可以接入真实资金获取接口，这里仅做格式化展示
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
          >
            <CardContent className='flex gap-6 px-6 max-sm:flex-col max-sm:gap-2 max-sm:text-center sm:px-10'>
              <div className='space-y-3 pb-2 sm:flex-1 sm:pb-8'>
                <h2 className='flex items-center gap-2 text-xl font-bold tracking-tighter text-white max-sm:mx-auto sm:text-xl md:text-xl'>
                  <Flame className='h-6 w-6' />
                  精选热门带单 KOL
                </h2>
                <p className='mb-3 text-sm text-white/70'>
                  精选全网来自币安排行榜、欧意牛人榜、币coin等平台的顶级交易员，收益各个平台可查。信号来源第三方渠道，可能有时不稳定，建议优先选择原版信号跟单！
                </p>
              </div>
              <div className='flex items-center justify-center pb-6 sm:my-auto sm:min-w-56 sm:pb-0'>
                {/* Logo 云布局：移动端一行四列，大屏两行两列错位 */}
                <div className='flex flex-row gap-3 sm:flex-row sm:gap-4'>
                  {/* 第一组：在移动端是前两个，大屏是第一列 */}
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
                  {/* 第二组：在移动端是后两个，大屏是第二列（错位排布） */}
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
          <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3'>
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
                        {trader.platform.name}
                      </span>
                    </div>
                  </div>
                </div>

                <div className='bg-muted/30 flex items-center justify-between rounded-md px-2 py-1.5'>
                  <span className='text-muted-foreground text-[10px]'>当前资金</span>
                  <span className='text-foreground text-xs font-medium'>${formatBalance(trader.balance)}</span>
                </div>

                <Button size='sm' className='h-7 w-full text-xs' onClick={() => handleFollow(trader)}>
                  立即跟单
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
        platform='4' // 4 代表热门交易员
        roleType='1' // 默认传1
        traderPlatform={4}
      />
    </div>
  )
}
