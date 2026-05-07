'use client'

import { useEffect, useState } from 'react'

import { Copy } from 'lucide-react'
import { toast } from 'sonner'

import { request } from '@/api/request'
import { CopyTaskConfigSheet } from '@/app/[locale]/dashboard/add_task/_components/copy-task-config-sheet'
import { Card } from '@/components/ui/card'

type TwitterKolItem = {
  id: string
  username: string
  twitterName: string
  address: string
  accountValue: number
  monthlyProfit: number
  positions: number
  winRate: string
  avatarType: number
  avatarUrl: string
}

const AVATAR_TYPE_COUNT = 6
const DEFAULT_PAGE_NUM = 1
const DEFAULT_PAGE_SIZE = 12
const DEFAULT_PERIOD = 7
const DEFAULT_LANG = 'zh'

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
  if (!value) {
    return '--'
  }

  if (value.length <= 12) {
    return value
  }

  return `${value.slice(0, 6)}...${value.slice(-4)}`
}

function toNumber(value: unknown) {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0
  }

  if (typeof value === 'string') {
    const parsed = Number(value)

    return Number.isFinite(parsed) ? parsed : 0
  }

  return 0
}

function toWinRate(value: unknown) {
  if (typeof value === 'string') {
    return value.trim() ? value : '-%'
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    if (value > 0 && value <= 1) {
      return `${(value * 100).toFixed(2).replace(/\.00$/, '')}%`
    }

    return `${value.toFixed(2).replace(/\.00$/, '')}%`
  }

  return '-%'
}

function normalizeTwitterName(value: unknown) {
  if (typeof value !== 'string') {
    return '--'
  }

  const normalized = value.trim()

  if (!normalized) {
    return '--'
  }

  if (normalized.startsWith('@')) {
    return normalized
  }

  if (normalized.startsWith('http://') || normalized.startsWith('https://')) {
    return normalized
  }

  return `@${normalized}`
}

function extractArrayPayload(payload: unknown): unknown[] {
  if (Array.isArray(payload)) {
    return payload
  }

  if (!payload || typeof payload !== 'object') {
    return []
  }

  const container = payload as Record<string, unknown>
  const directCandidates = ['data', 'list', 'items', 'rows', 'result']

  for (const key of directCandidates) {
    const value = container[key]

    if (Array.isArray(value)) {
      return value
    }
  }

  for (const key of directCandidates) {
    const value = container[key]

    if (!value || typeof value !== 'object') {
      continue
    }

    const nested = value as Record<string, unknown>

    for (const nestedKey of directCandidates) {
      const nestedValue = nested[nestedKey]

      if (Array.isArray(nestedValue)) {
        return nestedValue
      }
    }
  }

  return []
}

function mapXKolItem(raw: unknown, index: number): TwitterKolItem | null {
  if (!raw || typeof raw !== 'object') {
    return null
  }

  const item = raw as Record<string, unknown>

  const address = String(
    item.address ??
    item.wallet_address ??
    item.walletAddress ??
    item.wallet ??
    item.user_address ??
    item.userAddress ??
    ''
  )

  const username = String(item.name ?? item.nickname ?? item.nick_name ?? item.username ?? formatAddress(address))

  const twitterName = normalizeTwitterName(
    item.twitterName ??
    item.twitter_name ??
    item.xName ??
    item.x_name ??
    item.twitter ??
    item.x ??
    item.handle
  )

  const rawId = item.id ?? item.uid ?? item.user_id ?? item.userId ?? address ?? `${username}-${index}`

  return {
    id: String(rawId || `x-kol-${index}`),
    username,
    twitterName,
    address,
    accountValue: toNumber(
      item.accountTotalValue ?? item.accountValue ?? item.account_value ?? item.total_asset ?? item.totalAsset ?? item.balance
    ),
    monthlyProfit: toNumber(
      item.accountTotalValue ??
      item.accountValue ??
      item.account_value ??
      item.realizedPnl ??
      item.monthlyProfit ??
      item.monthly_profit ??
      item.pnl_1m ??
      item.pnl1m ??
      item.pnl ??
      item.profit
    ),
    positions: Math.max(
      0,
      Math.trunc(toNumber(item.currentPosition ?? item.positions ?? item.position_count ?? item.positionCount ?? item.holding_count))
    ),
    winRate: toWinRate(item.winRate ?? item.win_rate ?? item.winrate),
    avatarType: index % AVATAR_TYPE_COUNT,
    avatarUrl: String(item.profilePicture ?? item.profile_picture ?? item.avatar ?? item.avatarUrl ?? '')
  }
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

function TraderAvatar({ avatarUrl, avatarType, alt }: { avatarUrl: string; avatarType: number; alt: string }) {
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    setHasError(false)
  }, [avatarUrl])

  if (!avatarUrl || hasError) {
    return <BlockyAvatar type={avatarType} />
  }

  return (
    <img
      src={avatarUrl}
      alt={alt}
      className='h-[24px] w-[24px] shrink-0 rounded-full object-cover'
      referrerPolicy='no-referrer'
      onError={() => setHasError(true)}
    />
  )
}

export function TwitterKolDiscover() {
  const [items, setItems] = useState<TwitterKolItem[]>([])
  const [currentPage, setCurrentPage] = useState(DEFAULT_PAGE_NUM)
  const [hasMore, setHasMore] = useState(true)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [isConfigOpen, setIsConfigOpen] = useState(false)
  const [selectedTrader, setSelectedTrader] = useState<TwitterKolItem | null>(null)

  const handleCopy = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address)
      toast.success('地址已复制')
    } catch (error) {
      console.error('Failed to copy address:', error)
      toast.error('复制失败，请手动复制')
    }
  }

  const handleLoadMore = async () => {
    if (!hasMore || isLoadingMore) {
      return
    }

    const nextPage = currentPage + 1

    setIsLoadingMore(true)

    try {
      const res = await request<unknown>('/api/hyper-discover/x-kol', {
        params: {
          pageNum: nextPage,
          pageSize: DEFAULT_PAGE_SIZE,
          period: DEFAULT_PERIOD,
          lang: DEFAULT_LANG
        },
        silent: true
      })

      if (res.code !== 0 || !res.data) {
        toast.error('加载更多失败，请稍后重试')

        return
      }

      const list = extractArrayPayload(res.data)

      if (!list.length) {
        setHasMore(false)

        return
      }

      const mapped = list
        .map((item, index) => mapXKolItem(item, (nextPage - 1) * DEFAULT_PAGE_SIZE + index))
        .filter((item): item is TwitterKolItem => item !== null)

      if (!mapped.length) {
        setHasMore(false)

        return
      }

      setItems(prev => {
        const existed = new Set(prev.map(item => item.id))
        const appended = mapped.filter(item => !existed.has(item.id))

        return [...prev, ...appended]
      })
      setCurrentPage(nextPage)
      setHasMore(list.length >= DEFAULT_PAGE_SIZE)
    } finally {
      setIsLoadingMore(false)
    }
  }

  const handleAnalyze = (address: string) => {
    if (!address) {
      toast.error('地址无效')

      return
    }

    const targetUrl = `https://www.coinglass.com/zh/hyperliquid/${encodeURIComponent(address)}`

    window.open(targetUrl, '_blank', 'noopener,noreferrer')
  }

  const handleFollow = (item: TwitterKolItem) => {
    if (!item.address) {
      toast.error('地址无效')

      return
    }

    setSelectedTrader(item)
    setIsConfigOpen(true)
  }

  useEffect(() => {
    const fetchXKol = async () => {
      try {
        const res = await request<unknown>('/api/hyper-discover/x-kol', {
          params: {
            pageNum: DEFAULT_PAGE_NUM,
            pageSize: DEFAULT_PAGE_SIZE,
            period: DEFAULT_PERIOD,
            lang: DEFAULT_LANG
          },
          silent: true
        })

        if (res.code !== 0 || !res.data) {
          return
        }

        const list = extractArrayPayload(res.data)

        if (!list.length) {
          setHasMore(false)

          return
        }

        const mapped = list.map(mapXKolItem).filter((item): item is TwitterKolItem => item !== null)

        if (!mapped.length) {
          setHasMore(false)

          return
        }

        setItems(mapped)
        setCurrentPage(DEFAULT_PAGE_NUM)
        setHasMore(list.length >= DEFAULT_PAGE_SIZE)
      } finally {
        setIsInitialLoading(false)
      }
    }

    fetchXKol()
  }, [])

  return (
    <section>
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3'>
        {items.map(item => {
          const profit = formatProfit(item.monthlyProfit)
          const twitterNameText = item.twitterName.startsWith('@') ? item.twitterName.slice(1) : item.twitterName
          const normalizedUsername = item.username.trim().replace(/^@+/, '')
          const usernameText = normalizedUsername ? `@${normalizedUsername}` : '--'
          const profileUrl = normalizedUsername ? `https://x.com/${encodeURIComponent(normalizedUsername)}` : ''

          return (
            <Card
              key={item.id}
              className='flex h-[197px] flex-col justify-between overflow-hidden rounded-xl border border-zinc-200 bg-white p-4 text-zinc-900 shadow-sm transition-colors hover:border-zinc-300 dark:border-[#222] dark:bg-[#121212] dark:text-white dark:shadow-none dark:hover:border-white/20'
            >
              <div>
                <div className='flex items-start justify-between'>
                  <div className='flex min-w-0 flex-1 items-start gap-2 pr-2'>
                    <TraderAvatar avatarUrl={item.avatarUrl} avatarType={item.avatarType} alt={item.twitterName || item.username} />
                    <div className='min-w-0 flex-1'>
                      <div className='flex flex-wrap items-baseline gap-x-1.5 gap-y-0'>
                        <h3 className='text-[15px] font-semibold leading-[1.1] tracking-wide text-zinc-900 break-words whitespace-normal dark:text-white'>
                          {twitterNameText}
                        </h3>
                        <p className='text-[15px] leading-[1.1] text-zinc-500 break-words whitespace-normal dark:text-[#999]'>
                          {profileUrl ? (
                            <a
                              href={profileUrl}
                              target='_blank'
                              rel='noopener noreferrer'
                              className='decoration-zinc-400/70 underline-offset-2 transition-colors hover:text-blue-600 dark:hover:text-blue-400'
                            >
                              {usernameText}
                            </a>
                          ) : (
                            usernameText
                          )}
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

                  <div className='flex shrink-0 items-center gap-2 self-start'>
                    <button
                      type='button'
                      onClick={() => handleAnalyze(item.address)}
                      className='rounded-md border border-zinc-200 px-2.5 py-1 text-[11px] text-zinc-500 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 dark:border-white/10 dark:text-[#888] dark:hover:border-white/10 dark:hover:bg-white/5 dark:hover:text-white'
                    >
                      分析
                    </button>
                    <button
                      type='button'
                      onClick={() => handleFollow(item)}
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

      {isInitialLoading ? (
        <div className='mt-4 text-center text-sm text-zinc-500 dark:text-[#888]'>加载中...</div>
      ) : null}

      {!isInitialLoading && hasMore ? (
        <div className='mt-5 flex justify-center'>
          <button
            type='button'
            className='rounded-md border border-zinc-200 px-4 py-1.5 text-[12px] text-zinc-600 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:text-[#999] dark:hover:border-white/15 dark:hover:bg-white/5 dark:hover:text-white'
            onClick={handleLoadMore}
            disabled={isLoadingMore}
          >
            {isLoadingMore ? '加载中...' : '加载更多'}
          </button>
        </div>
      ) : null}

      <CopyTaskConfigSheet
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        traderId={selectedTrader?.address || ''}
        traderName={selectedTrader?.twitterName || selectedTrader?.username || selectedTrader?.address || ''}
        platform='hyperliquid'
        roleType='1'
        traderPlatform={10}
      />
    </section>
  )
}
