'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

import Link from 'next/link'
import { toast } from 'sonner'
import { ChevronLeft, ChevronRight, ExternalLink, Minus, Plus, ShieldCheck } from 'lucide-react'

import { useIncubatorStudioAccess } from '@/components/dashboard/incubator-access-guard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { createProxyPackOrder, listProxyPacks } from '@/lib/incubator-proxy-packs'
import { createSeatOrder, listPurchasedSeats, listSeatSnapshots } from '@/lib/incubator-seats'

import {
  IncubatorPaymentDialog,
  type IncubatorPaymentProof,
} from './incubator-payment-dialog'

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

type PendingSeatPay =
  | {
      mode: 'PURCHASE'
      exchange: ExchangeId
      quantity: number
      amountUsdt: number
      intentKey: string
      submittingKey: string
    }
  | {
      mode: 'RENEWAL'
      exchange: ExchangeId
      seatIds: string[]
      amountUsdt: number
      intentKey: string
      submittingKey: string
      clearSelection: boolean
    }

type ProxyIp = {
  id: string
  ip: string
  hostId: 1 | 2
  source: 'included' | 'addon'

  /** 加购按「份」成对分配，同 pack 共到期、共续费 */
  packId: string | null
  expiresAt: string | null
  enabled: boolean
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

const EMPTY_QTY: Record<ExchangeId, number> = {
  BINANCE: 1,
  OKX: 1,
  GATE: 1
}

function startOfToday() {
  const today = new Date()

  today.setHours(0, 0, 0, 0)

  return today
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
  const { canCreateOrStart } = useIncubatorStudioAccess()
  const [exchanges, setExchanges] = useState(EXCHANGES)
  const [seats, setSeats] = useState<AddonSeat[]>([])
  const [seatStateReady, setSeatStateReady] = useState(false)
  const [seatStateError, setSeatStateError] = useState<string | null>(null)
  const [ips, setIps] = useState<ProxyIp[]>([])
  const [proxyStateReady, setProxyStateReady] = useState(false)
  const [proxyStateError, setProxyStateError] = useState<string | null>(null)
  const [apiQty, setApiQty] = useState(EMPTY_QTY)
  const [ipQty, setIpQty] = useState(1)
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([])
  const [seatPageSize, setSeatPageSize] = useState<10 | 20 | 30 | 40 | 50>(10)
  const [seatPage, setSeatPage] = useState(0)
  const [submittingKey, setSubmittingKey] = useState<string | null>(null)
  const [pendingSeatPay, setPendingSeatPay] = useState<PendingSeatPay | null>(null)
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

  const refreshProxyState = async () => {
    const listing = await listProxyPacks()

    const included: ProxyIp[] = listing.included.map(item => ({
      id: `included-${item.host_id}`, ip: item.ip, hostId: item.host_id as 1 | 2,
      source: 'included', packId: null, expiresAt: null, enabled: true,
    }))

    const addons: ProxyIp[] = listing.packs.flatMap(pack => pack.members.map(member => ({
      id: `${pack.pack_id}-${member.host_id}`, ip: member.ip,
      hostId: member.host_id as 1 | 2, source: 'addon' as const,
      packId: pack.pack_id, expiresAt: pack.expires_at.slice(0, 10), enabled: member.enabled,
    })))

    setIps([...included, ...addons])
    setProxyStateReady(true)
    setProxyStateError(null)
  }

  useEffect(() => {
    void refreshSeatState().catch(error => setSeatStateError(error instanceof Error ? error.message : '席位读取失败'))
    void refreshProxyState().catch(error => setProxyStateError(error instanceof Error ? error.message : '代理包读取失败'))
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
    setIpQty(prev => Math.min(20, Math.max(1, prev + delta)))
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

  const purchaseApi = (exchange: ExchangeId) => {
    if (!canCreateOrStart || submitLock.current || pendingSeatPay) return

    const qty = apiQty[exchange]
    const meta = exchangeMeta(exchange)
    const intentKey = seatIntentKey('PURCHASE', exchange, [String(qty)])

    setPendingSeatPay({
      mode: 'PURCHASE',
      exchange,
      quantity: qty,
      amountUsdt: meta.unitPriceUsdt * qty,
      intentKey,
      submittingKey: `api-${exchange}`,
    })
  }

  const renewSelectedSeats = () => {
    if (!canCreateOrStart || selectedSeats.length === 0 || submitLock.current || pendingSeatPay) return

    const exchanges = [...new Set(selectedSeats.map(item => item.exchange))]

    if (exchanges.length > 1) {
      toast.error('批量续费请选择同一交易所席位（转账号只能认领一次）')
      return
    }

    const exchange = exchanges[0]
    if (!exchange) return
    const seatIds = selectedSeats.map(item => item.id)
    const intentKey = seatIntentKey('RENEWAL', exchange, seatIds)

    setPendingSeatPay({
      mode: 'RENEWAL',
      exchange,
      seatIds,
      amountUsdt: selectedRenewFee,
      intentKey,
      submittingKey: 'renew-seats',
      clearSelection: true,
    })
  }

  const renewOneSeat = (id: string) => {
    if (!canCreateOrStart || submitLock.current || pendingSeatPay) return

    const seat = seats.find(item => item.id === id)

    if (!seat) return

    const intentKey = seatIntentKey('RENEWAL', seat.exchange, [id])
    const meta = exchangeMeta(seat.exchange)

    setPendingSeatPay({
      mode: 'RENEWAL',
      exchange: seat.exchange,
      seatIds: [id],
      amountUsdt: meta.unitPriceUsdt,
      intentKey,
      submittingKey: `renew-seat-${id}`,
      clearSelection: false,
    })
  }

  const confirmSeatPayment = async (proof: IncubatorPaymentProof) => {
    if (!pendingSeatPay || submitLock.current) return

    submitLock.current = true
    setSubmittingKey(pendingSeatPay.submittingKey)

    try {
      const order =
        pendingSeatPay.mode === 'PURCHASE'
          ? await createSeatOrder({
              request_id: requestIdForIntent(pendingSeatPay.intentKey),
              kind: 'PURCHASE',
              exchange: pendingSeatPay.exchange,
              quantity: pendingSeatPay.quantity,
              payment_external_ref: proof.externalRef,
              payment_pay_type: proof.payType,
            })
          : await createSeatOrder({
              request_id: requestIdForIntent(pendingSeatPay.intentKey),
              kind: 'RENEWAL',
              exchange: pendingSeatPay.exchange,
              quantity: pendingSeatPay.seatIds.length,
              seat_ids: pendingSeatPay.seatIds,
              payment_external_ref: proof.externalRef,
              payment_pay_type: proof.payType,
            })

      if (order.status !== 'GRANTED') throw new Error(`席位尚未发放：${order.status}`)

      await refreshSeatState()
      sessionStorage.removeItem(pendingSeatPay.intentKey)

      if (pendingSeatPay.mode === 'PURCHASE') {
        const meta = exchangeMeta(pendingSeatPay.exchange)
        toast.success(`已加购 ${meta.label} × ${pendingSeatPay.quantity}`)
        setApiQty(prev => ({ ...prev, [pendingSeatPay.exchange]: 1 }))
      } else {
        toast.success(
          pendingSeatPay.seatIds.length === 1
            ? `已续费 1 席 · ${exchangeMeta(pendingSeatPay.exchange).label}`
            : `已续费 ${pendingSeatPay.seatIds.length} 个席位`,
        )
        if (pendingSeatPay.clearSelection) setSelectedSeatIds([])
      }

      setPendingSeatPay(null)
    } catch (error) {
      await refreshSeatState().catch(() => undefined)
      throw error
    } finally {
      setSubmittingKey(null)
      submitLock.current = false
    }
  }

  const purchaseIp = async () => {
    if (!canCreateOrStart || submitLock.current) return

    submitLock.current = true
    const intentKey = `incubator-proxy-pack-intent:PURCHASE:${ipQty}`

    setSubmittingKey('ip')

    try {
      const order = await createProxyPackOrder({
        request_id: requestIdForIntent(intentKey), kind: 'PURCHASE', quantity: ipQty,
      })

      if (order.status !== 'GRANTED') throw new Error(`代理包尚未发放：${order.status}`)
      await refreshProxyState()
      sessionStorage.removeItem(intentKey)
      toast.success(`已模拟分配代理 IP × ${ipQty} 份（共 ${ipQty * IP_PER_PACK} 条，未实际扣款）`)
      setIpQty(1)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '模拟分配代理 IP 失败')
    } finally {
      setSubmittingKey(null)
      submitLock.current = false
    }
  }

  const renewIpPack = async (packId: string) => {
    if (!canCreateOrStart || submitLock.current) return

    const members = ips.filter(item => item.packId === packId)

    if (members.length === 0 || !members[0]?.expiresAt) return
    submitLock.current = true
    const intentKey = `incubator-proxy-pack-intent:RENEWAL:${packId}`

    setSubmittingKey(`renew-ip-${packId}`)

    try {
      const order = await createProxyPackOrder({
        request_id: requestIdForIntent(intentKey), kind: 'RENEWAL', quantity: 1, pack_ids: [packId],
      })

      if (order.status !== 'GRANTED') throw new Error(`代理包尚未续费：${order.status}`)
      await refreshProxyState()
      sessionStorage.removeItem(intentKey)
      toast.success('代理 IP 包已模拟续期 1 个月（未实际扣款）')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '模拟续费代理包失败')
    } finally {
      setSubmittingKey(null)
      submitLock.current = false
    }
  }

  if (!seatStateReady || !proxyStateReady) {
    const error = seatStateError || proxyStateError

    return <div className='p-6 text-sm'>{error ? `权益读取失败：${error}` : '正在读取权益…'}</div>
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
            席位加购/续费需完成 USDT 转账并填写凭证；展示价为参考，订单金额以服务端冻结价为准。每席独立计算 1 个月有效期。
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
                    disabled={submittingKey !== null || !canCreateOrStart}
                    onClick={() => void purchaseApi(item.exchange)}
                  >
                    {busy ? '提交中…' : `加购 · ${fee}U`}
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
                  disabled={selectedSeats.length === 0 || submittingKey !== null || !canCreateOrStart}
                onClick={() => void renewSelectedSeats()}
              >
                {submittingKey === 'renew-seats'
                  ? '续费中…'
                  : `续 1 个月 · ${selectedRenewFee} USDT`}
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
                        disabled={submittingKey !== null || !canCreateOrStart}
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
            当前仅模拟分配与续费，不会实际扣款。IP 包已入权益账本；新增 API 选择加购 IP 的能力将在下一阶段接入。
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
                当前展示 {ips.length} 条 · 参考价 {IP_PACK_PRICE_USDT} USDT / 月 / 份（每份 2 条）
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
                disabled={submittingKey !== null || !canCreateOrStart}
                onClick={() => void purchaseIp()}
              >
                {submittingKey === 'ip' ? '提交中…' : `模拟加购 ×${ipQty} 份`}
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
                      disabled={submittingKey !== null || !canCreateOrStart || pack.members.some(item => !item.enabled)}
                      onClick={() => void renewIpPack(pack.packId)}
                    >
                      {busy ? '续费中…' : `模拟续 1 个月 · ${IP_PACK_PRICE_USDT}U`}
                    </Button>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>
      </section>

      <IncubatorPaymentDialog
        open={pendingSeatPay !== null}
        onOpenChange={open => {
          if (!open && submittingKey === null) setPendingSeatPay(null)
        }}
        amountUsdt={pendingSeatPay?.amountUsdt ?? 0}
        title={pendingSeatPay?.mode === 'RENEWAL' ? '席位续费支付' : '席位加购支付'}
        submitting={submittingKey !== null && pendingSeatPay !== null}
        onConfirm={confirmSeatPayment}
      />
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
