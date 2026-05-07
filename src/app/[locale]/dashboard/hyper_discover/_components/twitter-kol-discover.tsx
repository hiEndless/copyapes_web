'use client'

import { Copy } from 'lucide-react'
import { toast } from 'sonner'

import { Card } from '@/components/ui/card'

type HotAddressItem = {
  id: string
  username: string
  twitterName: string
  address: string
  accountValue: number
  monthlyProfit: number
  positions: number
  winRate: string
  avatarType: number
}

const HOT_ADDRESS_ITEMS: HotAddressItem[] = [
  {
    id: 'bit-entity-1',
    username: 'CL',
    twitterName: '@CL207',
    address: '0xFd42EFe8C7cbA6A4bB18D6C8d3c6E9130bA63d97',
    accountValue: 4799144.71,
    monthlyProfit: 2525959.28,
    positions: 1,
    winRate: '100%',
    avatarType: 0
  },
  {
    id: 'bit-entity-2',
    username: 'Ape Whale',
    twitterName: '@apewhale',
    address: '0xA875EFe8C7cbA6A4bB18D6C8d3c6E9130bA6325a8',
    accountValue: 12318616.23,
    monthlyProfit: 1928957.08,
    positions: 1,
    winRate: '100%',
    avatarType: 1
  },
  {
    id: 'matrixport-entity',
    username: 'Matrix Alpha',
    twitterName: '@matrixalpha',
    address: '0x6C85EFe8C7cbA6A4bB18D6C8d3c6E9130bA684F6',
    accountValue: 51912239.06,
    monthlyProfit: 18047536.13,
    positions: 1,
    winRate: '100%',
    avatarType: 2
  },
  {
    id: 'bit-entity-3',
    username: 'Trader Neo',
    twitterName: '@traderneo',
    address: '0xa5B0EFe8C7cbA6A4bB18D6C8d3c6E9130bA61D41',
    accountValue: 40181495.49,
    monthlyProfit: 36811485.73,
    positions: 1,
    winRate: '100%',
    avatarType: 3
  },
  {
    id: 'ultimate-bear',
    username: 'Ultimate Bear',
    twitterName: '@ultimatebear',
    address: '0x5D2FEFe8C7cbA6A4bB18D6C8d3c6E9130bA69Bb7',
    accountValue: 9093582.88,
    monthlyProfit: -143823.83,
    positions: 2,
    winRate: '0%',
    avatarType: 4
  },
  {
    id: 'continue-capital',
    username: 'Continue Capital',
    twitterName: '@continuecap',
    address: '0x3E38EFe8C7cbA6A4bB18D6C8d3c6E9130bA6140C',
    accountValue: 4.48,
    monthlyProfit: 0,
    positions: 0,
    winRate: '-%',
    avatarType: 5
  }
]

function formatCurrency(value: number) {
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)

  return `$ ${formatted}`
}

function formatProfit(value: number) {
  if (value === 0) return { text: '$ 0.00', color: 'text-[#777]' }

  const isPositive = value > 0
  const absValue = Math.abs(value)

  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(absValue)

  if (isPositive) {
    return { text: `+$${formatted}`, color: 'text-[#4ade80]' }
  } else {
    return { text: `-$${formatted}`, color: 'text-[#f87171]' }
  }
}

function formatAddress(value: string) {
  if (value.length <= 12) {
    return value
  }

  return `${value.slice(0, 6)}...${value.slice(-4)}`
}

function BlockyAvatar({ type }: { type: number }) {
  const colors = [
    'bg-[#529b2b] dark:bg-[#529b2b]', // 0: Green
    'bg-[#a39f28] dark:bg-[#a39f28]', // 1: Olive
    'bg-[#b28236] dark:bg-[#b28236]', // 2: Brown
    'bg-[#a93b76] dark:bg-[#a93b76]', // 3: Pink/Purple
    'bg-[#8b31a3] dark:bg-[#8b31a3]', // 4: Purple
    'bg-[#b82b6b] dark:bg-[#b82b6b]'  // 5: Magenta
  ]

  const bgColor = colors[type % colors.length]

  const patterns = [
    [1, 0, 1, 0, 1, 0, 1, 0, 1],
    [0, 1, 0, 1, 1, 1, 0, 1, 0],
    [1, 1, 0, 1, 0, 1, 0, 1, 1],
    [0, 1, 1, 0, 1, 0, 1, 1, 0],
    [1, 0, 0, 1, 1, 1, 0, 0, 1],
    [0, 0, 1, 1, 1, 1, 1, 0, 0]
  ]

  const pattern = patterns[type % patterns.length]

  return (
    <div
      className={`grid h-[24px] w-[24px] shrink-0 grid-cols-3 grid-rows-3 gap-[1px] overflow-hidden rounded-full ${bgColor} p-[4px]`}
    >
      {pattern.map((isFilled, i) => (
        <div key={i} className={`rounded-[1px] ${isFilled ? 'bg-white/90 dark:bg-white/80' : 'bg-transparent'}`} />
      ))}
    </div>
  )
}

export function TwitterKolDiscover() {
  const handleCopy = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address)
      toast.success('地址已复制')
    } catch (error) {
      console.error('Failed to copy address:', error)
      toast.error('复制失败，请手动复制')
    }
  }

  return (
    <section>
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3'>
        {HOT_ADDRESS_ITEMS.map(item => {
          const profit = formatProfit(item.monthlyProfit)

          return (
            <Card
              key={item.id}
              className='flex h-[197px] flex-col justify-between overflow-hidden rounded-xl border border-zinc-200 bg-white p-4 text-zinc-900 shadow-sm transition-colors hover:border-zinc-300 dark:border-[#222] dark:bg-[#121212] dark:text-white dark:shadow-none dark:hover:border-white/20'
            >
              <div>
                <div className='flex items-center justify-between'>
                  <div className='flex min-w-0 flex-1 items-start gap-2 pr-2'>
                    <BlockyAvatar type={item.avatarType} />
                    <div className='min-w-0 flex-1'>
                      <div className='flex flex-wrap items-baseline gap-x-1.5 gap-y-0'>
                        <h3 className='text-[15px] font-semibold leading-[1.1] tracking-wide text-zinc-900 break-words whitespace-normal dark:text-white'>
                          {item.username}
                        </h3>
                        <p className='text-[15px] leading-[1.1] text-zinc-500 break-words whitespace-normal dark:text-[#999]'>
                          {item.twitterName}
                        </p>
                      </div>
                      <div className='mt-0.5 flex items-center gap-1'>
                        <p className='truncate text-[11px] text-zinc-900 dark:text-white'>{formatAddress(item.address)}</p>
                        <button
                          type='button'
                          aria-label='复制地址'
                          className='text-zinc-400 transition-colors hover:text-zinc-600 dark:text-[#888] dark:hover:text-white'
                          onClick={() => handleCopy(item.address)}
                        >
                          <Copy className='h-[13px] w-[13px]' strokeWidth={2} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className='flex shrink-0 items-center gap-2'>
                    <button
                      type='button'
                      className='rounded-md border border-zinc-200 px-2.5 py-1 text-[11px] text-zinc-500 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 dark:border-white/10 dark:text-[#888] dark:hover:border-white/10 dark:hover:bg-white/5 dark:hover:text-white'
                    >
                      分析
                    </button>
                    <button
                      type='button'
                      className='rounded-md border border-zinc-200 px-2.5 py-1 text-[11px] text-zinc-500 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 dark:border-white/10 dark:text-[#888] dark:hover:border-white/10 dark:hover:bg-white/5 dark:hover:text-white'
                    >
                      跟单
                    </button>
                  </div>
                </div>
              </div>

              <div className='mt-auto'>
                <div className='space-y-0.5'>
                  <p className='text-[11px] text-zinc-500 dark:text-[#777]'>账户总价值（合约+现货）</p>
                  <p className='tracking-tight text-[18px] font-bold text-zinc-900 dark:text-white'>
                    {formatCurrency(item.accountValue)}
                  </p>
                </div>

                <div className='mt-2.5 grid grid-cols-3 gap-3'>
                  <div className='flex flex-col gap-0.5 min-w-0'>
                    <p className='text-[11px] text-zinc-500 dark:text-[#777]'>净盈亏(1月)</p>
                    <p className={`truncate text-[12px] font-semibold ${profit.color}`}>{profit.text}</p>
                  </div>

                  <div className='flex flex-col gap-0.5'>
                    <p className='text-[11px] text-zinc-500 dark:text-[#777]'>当前持仓</p>
                    <p className='text-[12px] font-semibold text-zinc-900 dark:text-white'>{item.positions}</p>
                  </div>

                  <div className='flex flex-col gap-0.5'>
                    <p className='text-[11px] text-zinc-500 dark:text-[#777]'>胜率(1月)</p>
                    <p
                      className={`text-[12px] font-semibold ${item.winRate === '-%' ? 'text-zinc-400 dark:text-[#777]' : 'text-zinc-900 dark:text-white'}`}
                    >
                      {item.winRate}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
