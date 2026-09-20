'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { ExternalLink, Minus, Plus, ShieldCheck, WalletCards } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

type ExchangeId = 'BINANCE' | 'OKX' | 'GATE'

type ExchangeQuota = {
  exchange: ExchangeId
  label: string
  logo: string
  unitPriceUsdt: number
  giftSlots: number
  purchasedSlots: number
  usedSlots: number
}

type EgressIp = {
  ip: string
  source: 'included' | 'addon'
}

type AddonKind = 'api' | 'ip'

const GIFT_SLOTS_PER_EXCHANGE = 4

const INITIAL_QUOTAS: ExchangeQuota[] = [
  {
    exchange: 'BINANCE',
    label: 'Binance',
    logo: '/exchanges/binance.png',
    unitPriceUsdt: 15,
    giftSlots: GIFT_SLOTS_PER_EXCHANGE,
    purchasedSlots: 0,
    usedSlots: 2
  },
  {
    exchange: 'OKX',
    label: 'OKX',
    logo: '/exchanges/okx.png',
    unitPriceUsdt: 10,
    giftSlots: GIFT_SLOTS_PER_EXCHANGE,
    purchasedSlots: 2,
    usedSlots: 5
  },
  {
    exchange: 'GATE',
    label: 'Gate',
    logo: '/exchanges/gate.png',
    unitPriceUsdt: 10,
    giftSlots: GIFT_SLOTS_PER_EXCHANGE,
    purchasedSlots: 0,
    usedSlots: 1
  }
]

const INITIAL_IPS: EgressIp[] = [
  { ip: '203.0.113.18', source: 'included' },
  { ip: '198.51.100.44', source: 'included' }
]

const IP_UNIT_PRICE_USDT = 20

export default function IncubatorPricingPage() {
  const [quotas, setQuotas] = useState(INITIAL_QUOTAS)
  const [ips, setIps] = useState(INITIAL_IPS)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [addonKind, setAddonKind] = useState<AddonKind>('api')
  const [selectedExchange, setSelectedExchange] = useState<ExchangeId>('BINANCE')
  const [quantity, setQuantity] = useState(1)
  const [submitting, setSubmitting] = useState(false)

  const studioVip = {
    active: true,
    expiresAt: '2026-12-31'
  }

  const selectedQuota = quotas.find(item => item.exchange === selectedExchange) ?? quotas[0]

  const unitPrice = addonKind === 'api' ? selectedQuota.unitPriceUsdt : IP_UNIT_PRICE_USDT
  const subtotal = unitPrice * quantity

  const totalApiCapacity = useMemo(
    () => quotas.reduce((sum, item) => sum + item.giftSlots + item.purchasedSlots, 0),
    [quotas]
  )
  const totalApiUsed = useMemo(() => quotas.reduce((sum, item) => sum + item.usedSlots, 0), [quotas])
  const addonIpCount = ips.filter(item => item.source === 'addon').length

  const openApiAddon = (exchange: ExchangeId) => {
    setAddonKind('api')
    setSelectedExchange(exchange)
    setQuantity(1)
    setSheetOpen(true)
  }

  const openIpAddon = () => {
    setAddonKind('ip')
    setQuantity(1)
    setSheetOpen(true)
  }

  const adjustQuantity = (delta: number) => {
    setQuantity(prev => Math.min(20, Math.max(1, prev + delta)))
  }

  const handlePurchase = async () => {
    setSubmitting(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 600))
      if (addonKind === 'api') {
        setQuotas(prev =>
          prev.map(item =>
            item.exchange === selectedExchange
              ? { ...item, purchasedSlots: item.purchasedSlots + quantity }
              : item
          )
        )
        toast.success(`已加购 ${selectedQuota.label} API 席位 × ${quantity}（演示）`)
      } else {
        const nextIps = Array.from({ length: quantity }, (_, index) => ({
          ip: `203.0.113.${50 + ips.length + index}`,
          source: 'addon' as const
        }))
        setIps(prev => [...prev, ...nextIps])
        toast.success(`已加购出口 IP × ${quantity}（演示）`)
      }
      setSheetOpen(false)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className='flex h-full flex-col gap-6 overflow-y-auto p-4 lg:p-8'>
      <div className='flex flex-col gap-2'>
        <h2 className='text-2xl font-bold tracking-tight'>用量与加购</h2>
        <p className='text-muted-foreground text-sm'>
          养号资格由 CopyApes 工作室 VIP 提供。本页只管理 API 席位与出口 IP，不再销售会员。
        </p>
      </div>

      <Card className='shadow-sm'>
        <CardHeader className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
          <div className='space-y-1.5'>
            <CardTitle className='flex items-center gap-2 text-base'>
              <ShieldCheck className='size-4' />
              工作室 VIP 准入
            </CardTitle>
            <CardDescription>会员在 CopyApes 侧购买与续费；Incubator 仅校验资格。</CardDescription>
          </div>
          <div className='flex flex-wrap items-center gap-2'>
            {studioVip.active ? (
              <Badge className='bg-emerald-600 hover:bg-emerald-600'>已开通</Badge>
            ) : (
              <Badge variant='destructive'>未开通</Badge>
            )}
            <span className='text-muted-foreground text-sm'>到期 {studioVip.expiresAt}</span>
            <Button asChild variant='outline' size='sm' className='gap-1.5'>
              <Link href='/dashboard/pricing'>
                去 CopyApes 续费
                <ExternalLink className='size-3.5' />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className='grid gap-3 sm:grid-cols-3'>
          <Metric label='API 总席位' value={`${totalApiUsed} / ${totalApiCapacity}`} />
          <Metric label='赠送规则' value='每所 4 席' />
          <Metric label='出口 IP' value={`${ips.length} 条（加购 ${addonIpCount}）`} />
        </CardContent>
      </Card>

      <section className='space-y-3'>
        <div>
          <h3 className='text-lg font-semibold tracking-tight'>交易所 API 席位</h3>
          <p className='text-muted-foreground mt-1 text-sm'>
            初始每所赠送 4 个席位。绑定成功占用席位；超额按所加购月租。
          </p>
        </div>
        <div className='grid gap-4 lg:grid-cols-3'>
          {quotas.map(item => {
            const capacity = item.giftSlots + item.purchasedSlots
            const ratio = capacity === 0 ? 0 : Math.min(100, Math.round((item.usedSlots / capacity) * 100))
            const remaining = Math.max(capacity - item.usedSlots, 0)
            return (
              <Card key={item.exchange} className='shadow-sm'>
                <CardHeader className='pb-3'>
                  <div className='flex items-center justify-between gap-2'>
                    <div className='flex items-center gap-2'>
                      <span className='bg-muted flex size-8 items-center justify-center rounded-full p-1.5'>
                        <img src={item.logo} alt={item.label} className='size-full object-contain' />
                      </span>
                      <div>
                        <CardTitle className='text-base'>{item.label}</CardTitle>
                        <CardDescription>{item.unitPriceUsdt} USDT / 席位 / 月</CardDescription>
                      </div>
                    </div>
                    <Badge variant={remaining === 0 ? 'destructive' : 'secondary'}>
                      剩余 {remaining}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className='space-y-3'>
                  <div className='flex items-end justify-between'>
                    <p className='text-2xl font-semibold tabular-nums tracking-tight'>
                      {item.usedSlots}
                      <span className='text-muted-foreground text-sm font-medium'> / {capacity}</span>
                    </p>
                    <p className='text-muted-foreground text-xs'>{ratio}%</p>
                  </div>
                  <Progress value={ratio} className='h-2' />
                  <div className='text-muted-foreground grid grid-cols-2 gap-2 text-xs'>
                    <span>赠送 {item.giftSlots}</span>
                    <span className='text-right'>加购 {item.purchasedSlots}</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type='button' className='w-full' variant='outline' onClick={() => openApiAddon(item.exchange)}>
                    加购席位
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      </section>

      <section className='space-y-3'>
        <div className='flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
          <div>
            <h3 className='text-lg font-semibold tracking-tight'>出口 IP</h3>
            <p className='text-muted-foreground mt-1 text-sm'>
              基于 Scrapoxy 凭据分配。加购可增加出口 IP；当前未承诺按 API 一对一隔离。
            </p>
          </div>
          <Button type='button' onClick={openIpAddon} className='gap-1.5'>
            <WalletCards className='size-4' />
            加购出口 IP
          </Button>
        </div>
        <Card className='shadow-sm'>
          <CardContent className='space-y-3 p-4'>
            <div className='text-muted-foreground flex flex-wrap items-center justify-between gap-2 text-sm'>
              <span>当前已分配 {ips.length} 条 · 加购单价 {IP_UNIT_PRICE_USDT} USDT / 月</span>
            </div>
            <div className='flex flex-wrap gap-2'>
              {ips.map(item => (
                <code
                  key={`${item.ip}-${item.source}`}
                  className={cn(
                    'rounded-md border px-2.5 py-1 font-mono text-[12px] font-semibold tabular-nums',
                    item.source === 'addon'
                      ? 'border-sky-500/30 bg-sky-500/5 text-sky-800 dark:text-sky-200'
                      : 'bg-muted text-foreground'
                  )}
                >
                  {item.ip}
                  {item.source === 'addon' ? ' · 加购' : ''}
                </code>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className='sm:max-w-md'>
          <SheetHeader>
            <SheetTitle>{addonKind === 'api' ? '加购 API 席位' : '加购出口 IP'}</SheetTitle>
            <SheetDescription>
              {addonKind === 'api'
                ? `${selectedQuota.label} · ${selectedQuota.unitPriceUsdt} USDT / 席位 / 月。演示下单，未接支付。`
                : `${IP_UNIT_PRICE_USDT} USDT / 条 / 月。演示下单，未接支付。`}
            </SheetDescription>
          </SheetHeader>

          <div className='flex flex-1 flex-col gap-5 px-4'>
            {addonKind === 'api' ? (
              <div className='space-y-2'>
                <p className='text-muted-foreground text-xs font-semibold'>交易所</p>
                <div className='grid grid-cols-3 gap-2'>
                  {quotas.map(item => (
                    <button
                      key={item.exchange}
                      type='button'
                      onClick={() => setSelectedExchange(item.exchange)}
                      className={cn(
                        'rounded-md border px-2 py-2 text-xs font-semibold transition-colors',
                        selectedExchange === item.exchange
                          ? 'border-primary bg-primary/5 text-foreground'
                          : 'text-muted-foreground hover:bg-muted/60'
                      )}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <div className='space-y-2'>
              <p className='text-muted-foreground text-xs font-semibold'>数量</p>
              <div className='flex items-center gap-3'>
                <Button type='button' size='icon' variant='outline' onClick={() => adjustQuantity(-1)}>
                  <Minus className='size-4' />
                </Button>
                <span className='min-w-10 text-center text-lg font-semibold tabular-nums'>{quantity}</span>
                <Button type='button' size='icon' variant='outline' onClick={() => adjustQuantity(1)}>
                  <Plus className='size-4' />
                </Button>
              </div>
            </div>

            <div className='bg-muted rounded-lg p-3'>
              <div className='flex items-center justify-between text-sm'>
                <span className='text-muted-foreground'>单价</span>
                <span className='tabular-nums'>{unitPrice} USDT</span>
              </div>
              <div className='mt-2 flex items-center justify-between text-sm'>
                <span className='text-muted-foreground'>小计（演示）</span>
                <span className='text-base font-semibold tabular-nums'>{subtotal} USDT</span>
              </div>
            </div>
          </div>

          <SheetFooter>
            <Button type='button' variant='outline' onClick={() => setSheetOpen(false)}>
              取消
            </Button>
            <Button type='button' disabled={submitting} onClick={() => void handlePurchase()}>
              {submitting ? '提交中…' : '确认加购（演示）'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className='bg-muted/50 rounded-lg px-3 py-2.5'>
      <p className='text-muted-foreground text-[11px] font-medium'>{label}</p>
      <p className='mt-1 text-sm font-semibold tracking-tight'>{value}</p>
    </div>
  )
}
