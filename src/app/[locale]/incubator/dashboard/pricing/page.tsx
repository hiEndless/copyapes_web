'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

import Link from 'next/link'
import { toast } from 'sonner'
import { ChevronLeft, ChevronRight, ExternalLink, Minus, Plus, ShieldCheck } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { createSeatOrder, listPurchasedSeats, listSeatSnapshots } from '@/lib/incubator-seats'

type ExchangeId = 'BINANCE' | 'OKX' | 'GATE'

type ExchangeMeta = {
  exchange: ExchangeId
  label: string
  logo: string
  unitPriceUsdt: number
  giftSlots: number
  grantedSlots: number
  usedSlots: number
}

/** 每个加购席位独立订阅，互不影响 */
type AddonSeat = {
  id: string
  exchange: ExchangeId
  expiresAt: string
}

type ProxyIp = {
  id: string
  ip: string
  hostId: 1 | 2
  source: 'included' | 'addon'

  /** 加购按「份」成对分配，同 pack 共到期、共续费 */
  packId: string | null
  expiresAt: string | null
}

const GIFT_SLOTS_PER_EXCHANGE = 4
const DAY_MS = 24 * 60 * 60 * 1000

/** 1 份 = host_id 1/2 各 1 个 IP */
const IP_PACK_PRICE_USDT = 10
const IP_PER_PACK = 2

const EXCHANGES: ExchangeMeta[] = [
  {
    exchange: 'BINANCE',
    label: 'Binance',
    logo: '/exchanges/binance.png',
    unitPriceUsdt: 15,
    giftSlots: GIFT_SLOTS_PER_EXCHANGE,
    grantedSlots: 0,
    usedSlots: 2
  },
  {
    exchange: 'OKX',
    label: 'OKX',
    logo: '/exchanges/okx.png',
    unitPriceUsdt: 12,
    giftSlots: GIFT_SLOTS_PER_EXCHANGE,
    grantedSlots: 0,
    usedSlots: 5
  },
  {
    exchange: 'GATE',
    label: 'Gate',
    logo: '/exchanges/gate.png',
    unitPriceUsdt: 12,
    giftSlots: GIFT_SLOTS_PER_EXCHANGE,
    grantedSlots: 0,
    usedSlots: 1
  }
]

const INITIAL_IPS: ProxyIp[] = [
  { id: 'ip-1', ip: '203.0.113.18', hostId: 1, source: 'included', packId: null, expiresAt: null },
  { id: 'ip-2', ip: '198.51.100.44', hostId: 2, source: 'included', packId: null, expiresAt: null },
  {
    id: 'ip-3',
    ip: '203.0.113.77',
    hostId: 1,
    source: 'addon',
    packId: 'pack-demo-1',
    expiresAt: shiftDays(5)
  },
  {
    id: 'ip-4',
    ip: '198.51.100.88',
    hostId: 2,
    source: 'addon',
    packId: 'pack-demo-1',
    expiresAt: shiftDays(5)
  }
]

const EMPTY_QTY: Record<ExchangeId, number> = {
  BINANCE: 1,
  OKX: 1,
  GATE: 1
}

function shiftDays(days: number, from = new Date()): string {
  const next = new Date(from)

  next.setHours(0, 0, 0, 0)
  next.setDate(next.getDate() + days)

  return formatDate(next)
}

function addMonths(dateStr: string, months = 1): string {
  const base = new Date(`${dateStr}T00:00:00`)
  const today = startOfToday()
  const from = base.getTime() > today.getTime() ? base : today
  const next = new Date(from)

  next.setMonth(next.getMonth() + months)

  return formatDate(next)
}

function startOfToday() {
  const today = new Date()

  today.setHours(0, 0, 0, 0)

  return today
}

function formatDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')

  return `${y}-${m}-${d}`
}

function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null
  const target = new Date(`${dateStr}T00:00:00`)

  return Math.ceil((target.getTime() - startOfToday().getTime()) / DAY_MS)
}

function expiryTone(days: number | null): 'none' | 'ok' | 'warn' | 'danger' {
  if (days === null) return 'none'
  if (days < 0) return 'danger'
  if (days <= 7) return 'warn'

  return 'ok'
}

function expiryLabel(days: number | null, expiresAt: string | null): string {
  if (!expiresAt || days === null) return '—'
  if (days < 0) return `已过期 ${Math.abs(days)} 天`
  if (days === 0) return '今天到期'

  return `剩余 ${days} 天 · ${expiresAt}`
}

function exchangeMeta(id: ExchangeId) {
  return EXCHANGES.find(item => item.exchange === id)!
}

function seatIntentKey(kind: 'PURCHASE' | 'RENEWAL', exchange: ExchangeId, items: string[]) {
  return `incubator-seat-intent:${kind}:${exchange}:${[...items].sort().join(',')}`
}

function requestIdForIntent(key: string) {
  const existing = sessionStorage.getItem(key)

  if (existing) return existing

  const requestId = crypto.randomUUID()

  sessionStorage.setItem(key, requestId)

  return requestId
}

const SECTION_HEADER_CLASS =
  'border-border/60 bg-gradient-to-b from-background to-muted/20 dark:to-muted/10'

const VIP_HEADER_CLASS =
  'border-border/60 bg-gradient-to-b from-primary/8 via-primary/4 to-background dark:from-primary/15 dark:via-primary/5 dark:to-background'

const RENEW_BTN_CLASS =
  'h-7 border-amber-500/50 bg-transparent text-xs text-amber-700 hover:bg-amber-500/15 hover:text-amber-800 dark:text-amber-300 dark:hover:bg-amber-500/15 dark:hover:text-amber-200'

export default function IncubatorPricingPage() {
  const [exchanges, setExchanges] = useState(EXCHANGES)
  const [seats, setSeats] = useState<AddonSeat[]>([])
  const [seatStateReady, setSeatStateReady] = useState(false)
  const [seatStateError, setSeatStateError] = useState<string | null>(null)
  const [ips, setIps] = useState(INITIAL_IPS)
  const [apiQty, setApiQty] = useState(EMPTY_QTY)
  const [ipQty, setIpQty] = useState(1)
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([])
  const [seatPageSize, setSeatPageSize] = useState<10 | 20 | 30 | 40 | 50>(10)
  const [seatPage, setSeatPage] = useState(0)
  const [submittingKey, setSubmittingKey] = useState<string | null>(null)
  const submitLock = useRef(false)

  const refreshSeatState = async () => {
    const [snapshots, purchased] = await Promise.all([listSeatSnapshots(), listPurchasedSeats()])

    setExchanges(EXCHANGES.map(item => {
      const snapshot = snapshots.find(row => row.exchange === item.exchange)

      if (!snapshot) throw new Error('席位快照缺少交易所数据')

      return {
        ...item,
        giftSlots: snapshot.base_seats,
        grantedSlots: snapshot.granted_seats,
        usedSlots: snapshot.active_chargeable,
      }
    }))
    setSeats(purchased.map(item => ({
      id: item.seat_id, exchange: item.exchange, expiresAt: item.expires_at.slice(0, 10),
    })))
    setSeatStateReady(true)
    setSeatStateError(null)
  }

  useEffect(() => {
    void refreshSeatState().catch(error => setSeatStateError(error instanceof Error ? error.message : '席位读取失败'))
  }, [])

  const studioVip = {
    active: true,
    expiresAt: '2026-12-31'
  }

  const seatsByExchange = useMemo(() => {
    const map: Record<ExchangeId, AddonSeat[]> = { BINANCE: [], OKX: [], GATE: [] }

    for (const seat of seats) map[seat.exchange].push(seat)

    return map
  }, [seats])

  const totalApiCapacity = useMemo(
    () => exchanges.reduce((sum, item) => sum + item.giftSlots + item.grantedSlots, 0),
    [exchanges]
  )

  const totalApiUsed = useMemo(() => exchanges.reduce((sum, item) => sum + item.usedSlots, 0), [exchanges])

  const addonPackCount = useMemo(() => {
    const packs = new Set(
      ips.filter(item => item.source === 'addon' && item.packId).map(item => item.packId as string)
    )

    return packs.size
  }, [ips])

  const sortedIpPacks = useMemo(() => {
    const included = ips
      .filter(item => item.source === 'included')
      .sort((a, b) => a.hostId - b.hostId)

    const packMap = new Map<string, ProxyIp[]>()

    for (const item of ips) {
      if (item.source !== 'addon' || !item.packId) continue
      const list = packMap.get(item.packId) ?? []

      list.push(item)
      packMap.set(item.packId, list)
    }

    const packs = [...packMap.entries()]
      .map(([packId, members]) => {
        const sorted = [...members].sort((a, b) => a.hostId - b.hostId)
        const expiresAt = sorted[0]?.expiresAt ?? null

        return { packId, members: sorted, expiresAt }
      })
      .sort((a, b) => (a.expiresAt ?? '').localeCompare(b.expiresAt ?? ''))

    return { included, packs }
  }, [ips])

  const sortedSeats = useMemo(
    () => [...seats].sort((a, b) => a.expiresAt.localeCompare(b.expiresAt)),
    [seats]
  )

  const seatPageCount = Math.max(1, Math.ceil(sortedSeats.length / seatPageSize))
  const safeSeatPage = Math.min(seatPage, seatPageCount - 1)

  const pagedSeats = useMemo(() => {
    const start = safeSeatPage * seatPageSize

    return sortedSeats.slice(start, start + seatPageSize)
  }, [sortedSeats, safeSeatPage, seatPageSize])

  const selectedSeats = sortedSeats.filter(item => selectedSeatIds.includes(item.id))

  const selectedRenewFee = selectedSeats.reduce(
    (sum, seat) => sum + exchangeMeta(seat.exchange).unitPriceUsdt,
    0
  )

  const pageSelectedCount = pagedSeats.filter(item => selectedSeatIds.includes(item.id)).length
  const allPageSelected = pagedSeats.length > 0 && pageSelectedCount === pagedSeats.length

  const adjustApiQty = (exchange: ExchangeId, delta: number) => {
    setApiQty(prev => ({
      ...prev,
      [exchange]: Math.min(64, Math.max(1, prev[exchange] + delta))
    }))
  }

  const adjustIpQty = (delta: number) => {
    setIpQty(prev => Math.max(1, prev + delta))
  }

  const toggleSeat = (id: string, checked: boolean) => {
    setSelectedSeatIds(prev => (checked ? [...prev, id] : prev.filter(item => item !== id)))
  }

  const toggleAllSeatsOnPage = (checked: boolean) => {
    const pageIds = pagedSeats.map(item => item.id)

    setSelectedSeatIds(prev => {
      if (checked) return [...new Set([...prev, ...pageIds])]

      return prev.filter(id => !pageIds.includes(id))
    })
  }

  const changeSeatPageSize = (size: 10 | 20 | 30 | 40 | 50) => {
    setSeatPageSize(size)
    setSeatPage(0)
  }

  const purchaseApi = async (exchange: ExchangeId) => {
    if (submitLock.current) return

    submitLock.current = true
    const qty = apiQty[exchange]
    const meta = exchangeMeta(exchange)
    const intentKey = seatIntentKey('PURCHASE', exchange, [String(qty)])

    setSubmittingKey(`api-${exchange}`)

    try {
      const order = await createSeatOrder({ request_id: requestIdForIntent(intentKey), kind: 'PURCHASE', exchange, quantity: qty })

      if (order.status !== 'GRANTED') throw new Error(`席位尚未发放：${order.status}`)
      await refreshSeatState()
      sessionStorage.removeItem(intentKey)
      toast.success(`已模拟加购 ${meta.label} × ${qty}（未实际扣款）`)
      setApiQty(prev => ({ ...prev, [exchange]: 1 }))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '模拟购买失败')
    } finally {
      setSubmittingKey(null)
      submitLock.current = false
    }
  }

  const renewSelectedSeats = async () => {
    if (selectedSeats.length === 0) return
    if (submitLock.current) return

    submitLock.current = true
    setSubmittingKey('renew-seats')
    const completedKeys: string[] = []

    try {
      for (const exchange of (['BINANCE', 'OKX', 'GATE'] as const)) {
        const seatIds = selectedSeats.filter(item => item.exchange === exchange).map(item => item.id)

        if (seatIds.length === 0) continue
        const intentKey = seatIntentKey('RENEWAL', exchange, seatIds)
        const order = await createSeatOrder({ request_id: requestIdForIntent(intentKey), kind: 'RENEWAL', exchange, quantity: seatIds.length, seat_ids: seatIds })

        if (order.status !== 'GRANTED') throw new Error(`席位尚未发放：${order.status}`)
        completedKeys.push(intentKey)
      }

      await refreshSeatState()
      completedKeys.forEach(key => sessionStorage.removeItem(key))
      toast.success(`已模拟续费 ${selectedSeats.length} 个席位（未实际扣款）`)
      setSelectedSeatIds([])
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '模拟续费失败，部分订单可能已成功')
    } finally {
      await refreshSeatState().catch(() => undefined)
      setSubmittingKey(null)
      submitLock.current = false
    }
  }

  const renewOneSeat = async (id: string) => {
    if (submitLock.current) return

    const seat = seats.find(item => item.id === id)

    if (!seat) return
    submitLock.current = true
    const intentKey = seatIntentKey('RENEWAL', seat.exchange, [id])

    setSubmittingKey(`renew-seat-${id}`)

    try {
      const order = await createSeatOrder({ request_id: requestIdForIntent(intentKey), kind: 'RENEWAL', exchange: seat.exchange, quantity: 1, seat_ids: [id] })

      if (order.status !== 'GRANTED') throw new Error(`席位尚未发放：${order.status}`)
      await refreshSeatState()
      sessionStorage.removeItem(intentKey)
      toast.success(`已模拟续费 1 席 · ${exchangeMeta(seat.exchange).label}（未实际扣款）`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '模拟续费失败')
    } finally {
      setSubmittingKey(null)
      submitLock.current = false
    }
  }

  const purchaseIp = async () => {
    setSubmittingKey('ip')

    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      const expiresAt = addMonths(formatDate(startOfToday()), 1)
      const created: ProxyIp[] = []

      for (let i = 0; i < ipQty; i += 1) {
        const packId = `pack-${Date.now()}-${i}`
        const base = 50 + ips.length + created.length

        created.push(
          {
            id: `${packId}-h1`,
            ip: `203.0.113.${base}`,
            hostId: 1,
            source: 'addon',
            packId,
            expiresAt
          },
          {
            id: `${packId}-h2`,
            ip: `198.51.100.${base}`,
            hostId: 2,
            source: 'addon',
            packId,
            expiresAt
          }
        )
      }

      setIps(prev => [...prev, ...created])
      toast.success(
        `已加购代理 IP × ${ipQty} 份（共 ${ipQty * IP_PER_PACK} 条），扣 ${ipQty * IP_PACK_PRICE_USDT} USDT（演示）`
      )
      setIpQty(1)
    } finally {
      setSubmittingKey(null)
    }
  }

  const renewIpPack = async (packId: string) => {
    const members = ips.filter(item => item.packId === packId)

    if (members.length === 0 || !members[0]?.expiresAt) return

    setSubmittingKey(`renew-ip-${packId}`)

    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      const nextExpires = addMonths(members[0].expiresAt, 1)

      setIps(prev =>
        prev.map(item => (item.packId === packId ? { ...item, expiresAt: nextExpires } : item))
      )
      toast.success(`已续费代理 IP 1 份（2 条）一个月，扣 ${IP_PACK_PRICE_USDT} USDT（演示）`)
    } finally {
      setSubmittingKey(null)
    }
  }

  if (!seatStateReady) {
    return <div className='p-6 text-sm'>{seatStateError ? `席位读取失败：${seatStateError}` : '正在读取席位权益…'}</div>
  }

  return (
    <div className='flex h-full flex-col gap-7 overflow-y-auto p-4 lg:p-6'>
      <div className='flex flex-col gap-2'>
        <h2 className='text-2xl font-bold tracking-tight'>用量与加购</h2>
        <p className='text-muted-foreground text-sm'>
          每个加购席位独立计费：加购永远买 1 个月；续费在下方单独处理，互不影响。
        </p>
      </div>

      <Card className='border-border/50 gap-0 overflow-hidden border-primary/15 py-0 shadow-sm'>
        <CardHeader
          className={cn(
            'flex flex-col gap-2 border-b px-3 py-2.5 !pb-2.5 md:flex-row md:items-center md:justify-between',
            VIP_HEADER_CLASS
          )}
        >
          <div className='space-y-0.5'>
            <CardTitle className='flex items-center gap-1.5 text-sm'>
              <ShieldCheck className='size-3.5 text-primary' />
              工作室 VIP 准入
            </CardTitle>
            <CardDescription className='text-xs'>
              会员在 CopyApes 跟单系统侧购买与续费；带单系统仅校验资格。
            </CardDescription>
          </div>
          <div className='flex flex-wrap items-center gap-2'>
            {studioVip.active ? (
              <Badge className='h-5 gap-1 border-0 bg-emerald-600/15 px-1.5 text-[10px] text-emerald-700 hover:bg-emerald-600/15 dark:text-emerald-400'>
                <span className='size-1.5 rounded-full bg-emerald-500' />
                已开通
              </Badge>
            ) : (
              <Badge variant='destructive' className='h-5 px-1.5 text-[10px]'>
                未开通
              </Badge>
            )}
            <span className='text-muted-foreground text-xs'>到期 {studioVip.expiresAt}</span>
            <Button
              asChild
              variant='ghost'
              size='sm'
              className='text-primary hover:text-primary h-7 gap-1 px-1.5 text-xs font-medium hover:bg-primary/5'
            >
              <Link href='/dashboard/pricing'>
                续费工作室 VIP
                <ExternalLink className='size-3 opacity-70' />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className='dark:bg-muted/15 grid grid-cols-1 divide-y divide-border/60 p-0 sm:grid-cols-3 sm:divide-x sm:divide-y-0'>
          <Metric label='API 总席位' value={`${totalApiUsed} / ${totalApiCapacity}`} />
          <Metric label='赠送规则' value='每所 4 席' />
          <Metric label='代理 IP' value={`${ips.length} 条（加购 ${addonPackCount} 份）`} />
        </CardContent>
      </Card>

      <section className='space-y-1.5'>
        <div>
          <h3 className='text-sm font-semibold tracking-tight'>交易所 API 席位</h3>
          <p className='text-muted-foreground mt-0.5 text-xs'>
            当前仅支持模拟购买与续费，不会实际扣款；展示价格为原型参考价，订单金额以服务端冻结价为准。每席独立计算 1 个月有效期。
          </p>
        </div>
        <div className='grid items-stretch gap-2 lg:grid-cols-3'>
          {exchanges.map(item => {
            const addonSeats = seatsByExchange[item.exchange]
            const capacity = item.giftSlots + item.grantedSlots
            const ratio = capacity === 0 ? 0 : Math.min(100, Math.round((item.usedSlots / capacity) * 100))
            const remaining = Math.max(capacity - item.usedSlots, 0)
            const qty = apiQty[item.exchange]
            const fee = item.unitPriceUsdt * qty
            const busy = submittingKey === `api-${item.exchange}`

            const nearest = addonSeats
              .map(seat => seat.expiresAt)
              .sort()[0]

            return (
              <Card
                key={item.exchange}
                className='border-border/50 flex h-full flex-col gap-0 overflow-hidden py-0 shadow-sm transition-colors hover:border-border'
              >
                <CardHeader
                  className={cn(
                    'shrink-0 gap-0 space-y-0 border-b px-3 py-2 !pb-2 items-center',
                    SECTION_HEADER_CLASS
                  )}
                >
                  <div className='flex w-full items-center justify-between gap-2'>
                    <div className='flex items-center gap-1.5'>
                      <span className='flex size-6 shrink-0 items-center justify-center rounded-md bg-white/95 p-1 shadow-sm dark:bg-white/90'>
                        <img src={item.logo} alt={item.label} className='size-full object-contain' />
                      </span>
                      <div className='min-w-0'>
                        <CardTitle className='text-sm leading-none'>{item.label}</CardTitle>
                        <CardDescription className='mt-0.5 text-[11px] leading-none'>
                          {item.unitPriceUsdt} USDT / 席 / 月
                        </CardDescription>
                      </div>
                    </div>
                    <Badge
                      variant={remaining === 0 ? 'destructive' : 'secondary'}
                      className={cn(
                        'h-5 shrink-0 px-1.5 text-[10px]',
                        remaining === 0 ? '' : 'border-border/60 bg-muted/40'
                      )}
                    >
                      剩余 {remaining}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className='dark:bg-muted/10 flex flex-1 flex-col space-y-2 px-3 py-2.5'>
                  <div className='flex items-end justify-between'>
                    <p className='text-lg font-semibold tabular-nums tracking-tight leading-none'>
                      {item.usedSlots}
                      <span className='text-muted-foreground text-xs font-medium'> / {capacity}</span>
                    </p>
                    <p className='text-muted-foreground text-[11px]'>{ratio}%</p>
                  </div>
                  <Progress value={ratio} className='h-1.5' />
                  <div className='text-muted-foreground grid grid-cols-2 gap-1 text-[11px]'>
                    <span>赠送 {item.giftSlots}</span>
                    <span className='text-right'>额外额度 {item.grantedSlots}</span>
                  </div>
                  <p className='text-muted-foreground mt-auto text-[10px]'>
                    {nearest ? `最近到期 ${nearest}` : '暂无加购席位'}
                  </p>
                </CardContent>

                <CardFooter className='border-border/60 mt-auto flex-row items-center gap-2 border-t bg-card px-3 py-2 !pt-2 dark:bg-transparent'>
                  <div className='flex h-7 shrink-0 items-center gap-1.5'>
                    <Button
                      type='button'
                      size='icon'
                      variant='outline'
                      className='size-7'
                      onClick={() => adjustApiQty(item.exchange, -1)}
                    >
                      <Minus className='size-3.5' />
                    </Button>
                    <span className='min-w-6 text-center text-sm font-semibold tabular-nums'>{qty}</span>
                    <Button
                      type='button'
                      size='icon'
                      variant='outline'
                      className='size-7'
                      onClick={() => adjustApiQty(item.exchange, 1)}
                    >
                      <Plus className='size-3.5' />
                    </Button>
                  </div>
                  <Button
                    type='button'
                    size='sm'
                    className='h-7 min-w-0 flex-1 px-2 text-xs'
                    disabled={submittingKey !== null}
                    onClick={() => void purchaseApi(item.exchange)}
                  >
                    {busy ? '提交中…' : `模拟加购 · ${fee}U`}
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      </section>

      <section className='space-y-1.5'>
        <div>
          <h3 className='text-sm font-semibold tracking-tight'>加购席位续费</h3>
          <p className='text-muted-foreground mt-0.5 text-xs'>
            逐条独立到期。可单条续 1 个月，或勾选批量续费；未勾选的不受影响。
          </p>
        </div>

        <Card className='border-border/50 gap-0 overflow-hidden py-0 shadow-sm'>
          <CardHeader
            className={cn(
              'flex flex-col gap-2 border-b px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between',
              SECTION_HEADER_CLASS
            )}
          >
            <div>
              <CardTitle className='text-sm'>待续费席位</CardTitle>
              <CardDescription className='text-xs'>
                共 {sortedSeats.length} 个加购席位
                {selectedSeats.length > 0 ? ` · 已选 ${selectedSeats.length}` : ''}
                {sortedSeats.length > 0
                  ? ` · 第 ${safeSeatPage + 1}/${seatPageCount} 页`
                  : ''}
              </CardDescription>
            </div>
            <div className='flex flex-wrap items-center gap-2'>
              <div className='flex items-center gap-1 rounded-md border border-border/60 p-0.5'>
                {([10, 20, 30, 40, 50] as const).map(size => (
                  <button
                    key={size}
                    type='button'
                    onClick={() => changeSeatPageSize(size)}
                    className={cn(
                      'h-6 rounded px-1.5 text-[10px] font-semibold transition-colors',
                      seatPageSize === size
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {size}/页
                  </button>
                ))}
              </div>
              <label className='text-muted-foreground flex items-center gap-1.5 text-xs'>
                <Checkbox
                  checked={allPageSelected}
                  onCheckedChange={value => toggleAllSeatsOnPage(value === true)}
                  disabled={pagedSeats.length === 0}
                />
                全选本页
              </label>
              <Button
                type='button'
                size='sm'
                variant='outline'
                className={cn(RENEW_BTN_CLASS, 'px-2.5')}
                  disabled={selectedSeats.length === 0 || submittingKey !== null}
                onClick={() => void renewSelectedSeats()}
              >
                {submittingKey === 'renew-seats'
                  ? '续费中…'
                  : `模拟续 1 个月 · ${selectedRenewFee} USDT`}
              </Button>
            </div>
          </CardHeader>

          <CardContent className='dark:bg-muted/10 space-y-1.5 px-3 py-2.5'>
            {sortedSeats.length === 0 ? (
              <p className='text-muted-foreground rounded-md border border-dashed border-border/60 px-3 py-4 text-center text-xs'>
                暂无加购席位。先在上方交易所卡片加购。
              </p>
            ) : (
              <>
                {pagedSeats.map(seat => {
                  const meta = exchangeMeta(seat.exchange)
                  const days = daysUntil(seat.expiresAt)
                  const tone = expiryTone(days)
                  const busy = submittingKey === `renew-seat-${seat.id}`
                  const checked = selectedSeatIds.includes(seat.id)

                  const seatNo =
                    seatsByExchange[seat.exchange].findIndex(item => item.id === seat.id) + 1

                  return (
                    <div
                      key={seat.id}
                      className={cn(
                        'border-border/60 bg-card flex flex-wrap items-center justify-between gap-2 rounded-md border border-l-2 px-2 py-1.5',
                        tone === 'danger' && 'border-l-destructive',
                        tone === 'warn' && 'border-l-amber-500',
                        tone === 'ok' && 'border-l-transparent'
                      )}
                    >
                      <div className='flex min-w-0 items-center gap-2'>
                        <Checkbox
                          checked={checked}
                          onCheckedChange={value => toggleSeat(seat.id, value === true)}
                        />
                        <span className='flex size-5 shrink-0 items-center justify-center rounded bg-white/95 p-0.5 shadow-sm dark:bg-white/90'>
                          <img src={meta.logo} alt={meta.label} className='size-full object-contain' />
                        </span>
                        <div className='min-w-0'>
                          <p className='text-xs font-semibold'>
                            {meta.label} · 席位 {seatNo}
                          </p>
                          <p
                            className={cn(
                              'text-[10px]',
                              tone === 'danger' && 'text-destructive',
                              tone === 'warn' && 'text-amber-700 dark:text-amber-300',
                              tone === 'ok' && 'text-muted-foreground'
                            )}
                          >
                            {expiryLabel(days, seat.expiresAt)}
                          </p>
                        </div>
                      </div>
                      <Button
                        type='button'
                        size='sm'
                        variant='outline'
                        className={cn(RENEW_BTN_CLASS, 'px-2')}
                        disabled={submittingKey !== null}
                        onClick={() => void renewOneSeat(seat.id)}
                      >
                        {busy ? '续费中…' : `续 1 个月 · ${meta.unitPriceUsdt}U`}
                      </Button>
                    </div>
                  )
                })}

                <div className='border-border/60 flex flex-wrap items-center justify-between gap-2 border-t pt-2'>
                  <p className='text-muted-foreground text-[10px]'>
                    显示 {safeSeatPage * seatPageSize + 1}-
                    {Math.min((safeSeatPage + 1) * seatPageSize, sortedSeats.length)} /{' '}
                    {sortedSeats.length}
                  </p>
                  <div className='flex items-center gap-1'>
                    <Button
                      type='button'
                      size='icon'
                      variant='outline'
                      className='size-7'
                      disabled={safeSeatPage <= 0}
                      onClick={() => setSeatPage(Math.max(0, safeSeatPage - 1))}
                    >
                      <ChevronLeft className='size-3.5' />
                    </Button>
                    <span className='text-muted-foreground min-w-14 text-center text-[11px] tabular-nums'>
                      {safeSeatPage + 1} / {seatPageCount}
                    </span>
                    <Button
                      type='button'
                      size='icon'
                      variant='outline'
                      className='size-7'
                      disabled={safeSeatPage >= seatPageCount - 1}
                      onClick={() => setSeatPage(Math.min(seatPageCount - 1, safeSeatPage + 1))}
                    >
                      <ChevronRight className='size-3.5' />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </section>

      <section className='space-y-1.5'>
        <div>
          <h3 className='text-sm font-semibold tracking-tight'>代理 IP</h3>
          <p className='text-muted-foreground mt-0.5 text-xs'>
            增加更多 IP 用于批量交易，减少账号关联性。
          </p>
        </div>

        <Card className='border-border/50 gap-0 overflow-hidden py-0 shadow-sm'>
          <CardHeader
            className={cn(
              'flex flex-col gap-2 border-b px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between',
              SECTION_HEADER_CLASS
            )}
          >
            <div>
              <CardTitle className='text-sm'>已分配代理 IP</CardTitle>
              <CardDescription className='text-xs'>
                当前 {ips.length} 条 · {IP_PACK_PRICE_USDT} USDT / 月 / 份（每份 2 条）
              </CardDescription>
            </div>
            <div className='flex flex-wrap items-center gap-2'>
              <div className='flex items-center gap-1.5'>
                <Button
                  type='button'
                  size='icon'
                  variant='outline'
                  className='size-7'
                  onClick={() => adjustIpQty(-1)}
                >
                  <Minus className='size-3.5' />
                </Button>
                <span className='min-w-6 text-center text-sm font-semibold tabular-nums'>{ipQty}</span>
                <Button
                  type='button'
                  size='icon'
                  variant='outline'
                  className='size-7'
                  onClick={() => adjustIpQty(1)}
                >
                  <Plus className='size-3.5' />
                </Button>
              </div>
              <span className='text-muted-foreground text-[11px] tabular-nums'>
                {ipQty * IP_PACK_PRICE_USDT} USDT · {ipQty * IP_PER_PACK} 条
              </span>
              <Button
                type='button'
                size='sm'
                className='h-7 px-2.5 text-xs'
                disabled={submittingKey === 'ip'}
                onClick={() => void purchaseIp()}
              >
                {submittingKey === 'ip' ? '提交中…' : `加购 ×${ipQty} 份`}
              </Button>
            </div>
          </CardHeader>

          <CardContent className='dark:bg-muted/10 space-y-1.5 px-3 py-2.5'>
            {sortedIpPacks.included.length > 0 ? (
              <div className='rounded-md border border-border/60 bg-muted/30 px-2 py-1.5'>
                <p className='text-muted-foreground mb-1 text-[10px] font-medium'>基础分配 · 不过期</p>
                <div className='flex flex-wrap gap-1.5'>
                  {sortedIpPacks.included.map(item => (
                    <code
                      key={item.id}
                      className='rounded border border-border/50 bg-background px-1.5 py-0.5 font-mono text-[11px] font-semibold tabular-nums'
                    >
                      {item.ip}
                    </code>
                  ))}
                </div>
              </div>
            ) : null}

            {sortedIpPacks.packs.length === 0 ? (
              <p className='text-muted-foreground rounded-md border border-dashed border-border/60 px-3 py-3 text-center text-xs'>
                暂无加购代理 IP。每份 10 USDT，每份 2 条。
              </p>
            ) : (
              sortedIpPacks.packs.map(pack => {
                const days = daysUntil(pack.expiresAt)
                const tone = expiryTone(days)
                const busy = submittingKey === `renew-ip-${pack.packId}`

                return (
                  <div
                    key={pack.packId}
                    className={cn(
                      'border-border/60 bg-card flex flex-wrap items-center justify-between gap-2 rounded-md border border-l-2 px-2 py-1.5',
                      tone === 'danger' && 'border-l-destructive',
                      tone === 'warn' && 'border-l-amber-500',
                      tone === 'ok' && 'border-l-transparent'
                    )}
                  >
                    <div className='min-w-0 space-y-1'>
                      <div className='flex flex-wrap gap-1.5'>
                        {pack.members.map(item => (
                          <code
                            key={item.id}
                            className='rounded border border-border/40 bg-background/80 px-1.5 py-0.5 font-mono text-[11px] font-semibold tabular-nums'
                          >
                            {item.ip}
                          </code>
                        ))}
                      </div>
                      <p
                        className={cn(
                          'text-[10px]',
                          tone === 'danger' && 'text-destructive',
                          tone === 'warn' && 'text-amber-700 dark:text-amber-300',
                          tone === 'ok' && 'text-muted-foreground'
                        )}
                      >
                        加购 1 份 · {expiryLabel(days, pack.expiresAt)}
                      </p>
                    </div>
                    <Button
                      type='button'
                      size='sm'
                      variant='outline'
                      className={cn(RENEW_BTN_CLASS, 'px-2')}
                      disabled={busy}
                      onClick={() => void renewIpPack(pack.packId)}
                    >
                      {busy ? '续费中…' : `续 1 个月 · ${IP_PACK_PRICE_USDT}U`}
                    </Button>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className='bg-card px-3 py-2 dark:bg-transparent'>
      <p className='text-muted-foreground/90 text-[10px] font-medium dark:text-muted-foreground/80'>
        {label}
      </p>
      <p className='text-foreground mt-1 text-xs font-semibold tracking-tight tabular-nums'>{value}</p>
    </div>
  )
}
