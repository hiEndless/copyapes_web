'use client'

import * as React from 'react'

import { Loader2Icon, RefreshCwIcon, SlidersHorizontalIcon } from 'lucide-react'
import { toast } from 'sonner'

import { getApiList } from '@/api/apiadd'
import { orderApi } from '@/api/order'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

import { ApiKeyPicker } from './api-key-picker'
import { ConfirmOpenDialog, type OpenConfirmSummary } from './confirm-open-dialog'
import { ExchangeLogo } from './exchange-logo'
import { formatUsdtBalance } from './format-balance'
import { listTradingApisFromApiAdd } from './map-api-to-trading-api'
import { SymbolCombobox } from './symbol-combobox'
import type { OpenSide, PositionMarginMode, TradingApiMock } from './types'

function SegmentedTwo<T extends string>({
  value,
  onChange,
  options,
  variant = 'default',
}: {
  value: T
  onChange: (v: T) => void
  options: { value: T; label: string }[]
  variant?: 'default' | 'direction'
}) {
  return (
    <div
      className={cn(
        'grid grid-cols-2 gap-1 rounded-xl border p-1 shadow-inner',
        variant === 'default' ? 'border-border/70 bg-muted/45' : 'border-border/70 bg-muted/30'
      )}
    >
      {options.map(opt => {
        const active = value === opt.value
        const isLong = variant === 'direction' && opt.value === 'long'
        const isShort = variant === 'direction' && opt.value === 'short'

        return (
          <button
            key={opt.value}
            type='button'
            onClick={() => onChange(opt.value)}
            className={cn(
              'rounded-md px-2 py-2 text-xs font-medium transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring',
              active
                ? 'bg-background text-foreground shadow-sm ring-1 ring-black/5 dark:ring-white/10'
                : 'text-muted-foreground hover:text-foreground',
              active && isLong && 'text-emerald-700 dark:text-emerald-400',
              active && isShort && 'text-rose-700 dark:text-rose-400'
            )}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

export function AddPositionsPage() {
  const [apis, setApis] = React.useState<TradingApiMock[]>([])
  const [loading, setLoading] = React.useState(true)
  const [refreshing, setRefreshing] = React.useState(false)
  const [listError, setListError] = React.useState<string | null>(null)

  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [symbol, setSymbol] = React.useState('')
  const [marginMode, setMarginMode] = React.useState<PositionMarginMode>('cross')
  const [side, setSide] = React.useState<OpenSide>('long')
  const [quantity, setQuantity] = React.useState('')
  const [formError, setFormError] = React.useState<string | null>(null)
  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const [pendingSummary, setPendingSummary] = React.useState<OpenConfirmSummary | null>(null)

  const [symbols, setSymbols] = React.useState<string[]>([])
  const [symbolsLoading, setSymbolsLoading] = React.useState(false)
  const [symbolsError, setSymbolsError] = React.useState<string | null>(null)

  const loadApis = React.useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }

    setListError(null)

    try {
      const res = await getApiList()

      if (res.code !== 0 || !Array.isArray(res.data)) {
        throw new Error(res.error || '获取 API 列表失败')
      }

      const mapped = listTradingApisFromApiAdd(res.data)

      setApis(mapped)
    } catch (e) {
      const message = e instanceof Error ? e.message : '获取 API 列表失败'

      setListError(message)
      setApis([])
      toast.error(message)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  React.useEffect(() => {
    void loadApis(false)
  }, [loadApis])

  React.useEffect(() => {
    if (loading) {
      return
    }

    if (apis.length === 0) {
      setSelectedId(null)

      return
    }

    setSelectedId(prev => (prev && apis.some(a => a.id === prev) ? prev : apis[0]!.id))
  }, [apis, loading])

  const selectedApi: TradingApiMock | undefined = React.useMemo(
    () => apis.find(a => a.id === selectedId),
    [apis, selectedId]
  )

  const selectedExchangeKey = selectedApi?.exchangeKey

  React.useEffect(() => {
    if (!selectedExchangeKey || loading) {
      setSymbols([])
      setSymbolsError(null)
      setSymbolsLoading(false)

      return
    }

    let cancelled = false

    setSymbolsLoading(true)
    setSymbolsError(null)

    void (async () => {
      try {
        const res = await orderApi.listSymbols(selectedExchangeKey)

        if (cancelled) {
          return
        }

        if (res.code !== 0 || !res.data || !Array.isArray(res.data.symbols)) {
          setSymbols([])
          setSymbolsError(res.error || '获取交易对失败')

          return
        }

        setSymbols(res.data.symbols)
      } catch {
        if (!cancelled) {
          setSymbols([])
          setSymbolsError('获取交易对失败')
        }
      } finally {
        if (!cancelled) {
          setSymbolsLoading(false)
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [selectedExchangeKey, loading])

  React.useEffect(() => {
    setSymbol('')
    setFormError(null)
  }, [selectedId])

  const openConfirm = () => {
    setFormError(null)

    if (!selectedApi) {
      setFormError('请先选择 API')

      return
    }

    if (!symbol) {
      setFormError('请选择交易对')

      return
    }

    const q = quantity.trim()

    if (!q || Number.isNaN(Number(q)) || Number(q) <= 0) {
      setFormError(`请输入有效的开仓量（${selectedApi.quantityUnit}）`)

      return
    }

    setPendingSummary({
      api: selectedApi,
      symbol,
      marginMode,
      side,
      quantity: q,
      quantityUnit: selectedApi.quantityUnit,
    })
    setConfirmOpen(true)
  }

  const handleConfirmed = async () => {
    if (!pendingSummary) {
      return
    }
    const apiId = Number(pendingSummary.api.id)
    const qty = Number(pendingSummary.quantity)
    if (!Number.isFinite(apiId) || apiId <= 0) {
      toast.error('API 参数无效')
      return
    }
    if (!Number.isFinite(qty) || qty <= 0) {
      toast.error('开仓量无效')
      return
    }

    const res = await orderApi.openSymbol({
      api_id: apiId,
      symbol: pendingSummary.symbol,
      side: pendingSummary.side,
      quantity: qty,
      marginMode: pendingSummary.marginMode,
    })
    if (res.code !== 0) {
      throw new Error(res.error || '开仓失败')
    }
    toast.success('开仓请求已提交')
    setPendingSummary(null)
    setQuantity('')
  }

  const listColumn = (() => {
    if (loading && apis.length === 0) {
      return (
        <Card className='border-border/80 text-[13px] leading-tight shadow-sm'>
          <CardContent className='flex min-h-[200px] flex-col items-center justify-center gap-2 py-10'>
            <Loader2Icon className='text-muted-foreground size-8 animate-spin' />
            <p className='text-muted-foreground text-xs'>加载 API 列表…</p>
          </CardContent>
        </Card>
      )
    }

    if (listError) {
      return (
        <Card className='border-border/80 text-[13px] leading-tight shadow-sm'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-semibold'>无法加载 API</CardTitle>
            <CardDescription className='text-destructive text-xs leading-snug'>{listError}</CardDescription>
          </CardHeader>
          <CardContent className='pt-0'>
            <Button type='button' variant='outline' size='sm' className='h-8 text-xs' onClick={() => void loadApis(true)} disabled={refreshing}>
              <RefreshCwIcon className={cn('mr-1.5 size-3.5', refreshing && 'animate-spin')} />
              重试
            </Button>
          </CardContent>
        </Card>
      )
    }

    if (apis.length === 0) {
      return (
        <Card className='border-border/80 text-[13px] leading-tight shadow-sm'>
          <CardContent className='text-muted-foreground px-4 py-8 text-center text-xs leading-relaxed'>
            暂无可用于手动补仓的 API（需非只读的「交易 / 跟单」权限）。请前往「API 管理」添加或调整权限。
          </CardContent>
        </Card>
      )
    }

    return <ApiKeyPicker apis={apis} selectedId={selectedId} onSelect={setSelectedId} />
  })()

  return (
    <div className='flex h-full flex-col gap-5 overflow-y-auto p-4 pb-8 text-[13px] leading-tight lg:p-6'>
      <div className='flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between'>
        <div className='space-y-2'>
          <h1 className='text-2xl font-semibold tracking-tight'>手动补仓</h1>
          <p className='text-muted-foreground text-sm'>选择交易 API 手动添加仓位（列表来自账户已绑定的交易 API）。</p>
        </div>
        <Button
          type='button'
          variant='outline'
          size='sm'
          className='h-8 shrink-0 gap-1.5 text-xs'
          onClick={() => void loadApis(true)}
          disabled={loading || refreshing}
        >
          <RefreshCwIcon className={cn('size-3.5', refreshing && 'animate-spin')} />
          刷新 API
        </Button>
      </div>

      <div className='grid flex-1 gap-4 lg:grid-cols-[minmax(0,340px)_1fr] lg:items-start lg:gap-5'>
        {listColumn}

        <Card className='overflow-hidden border-border/80 text-[13px] leading-tight shadow-sm'>
          <CardHeader className='border-border/60 from-muted/25 border-b bg-gradient-to-r to-transparent px-4 pb-3 pt-4 sm:px-5'>
            <div className='flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between'>
              <div className='flex min-w-0 items-start gap-2.5'>
                {selectedApi ? (
                  <ExchangeLogo src={selectedApi.logoSrc} alt={selectedApi.exchangeName} size={40} />
                ) : (
                  <div className='bg-muted text-muted-foreground flex size-10 shrink-0 items-center justify-center rounded-lg border'>
                    <SlidersHorizontalIcon className='size-4' />
                  </div>
                )}
                <div className='min-w-0 space-y-0.5'>
                  <CardTitle className='text-base font-semibold tracking-tight'>开仓参数</CardTitle>
                  <CardDescription className='text-muted-foreground text-[11px] leading-snug'>
                    {selectedApi
                      ? `${selectedApi.exchangeName} · ${selectedApi.label}`
                      : loading
                        ? '加载中…'
                        : apis.length === 0
                          ? '无可选 API'
                          : '在左侧选择一个 API 后开始配置'}
                  </CardDescription>
                </div>
              </div>
              {selectedApi ? (
                <div className='text-muted-foreground flex flex-wrap items-center gap-1.5 text-[11px] sm:justify-end'>
                  <span className='bg-background/80 rounded border px-1.5 py-0.5 tabular-nums'>
                    余额{' '}
                    <span className='text-foreground font-medium'>{formatUsdtBalance(selectedApi.balanceUsdt)}</span>
                    <span className='ml-0.5'>USDT</span>
                  </span>
                  <span className='bg-background/80 rounded border px-1.5 py-0.5'>单位 {selectedApi.quantityUnit}</span>
                </div>
              ) : null}
            </div>
          </CardHeader>
          <CardContent className='space-y-0 p-0'>
            <div className='space-y-1 px-4 pt-4 sm:px-5'>
              <Label className='text-muted-foreground text-[10px] font-medium tracking-wide uppercase'>交易对</Label>
              <SymbolCombobox
                symbols={symbols}
                value={symbol}
                onChange={setSymbol}
                disabled={!selectedApi || symbolsLoading || loading}
                placeholder={
                  !selectedApi
                    ? '请先选择 API'
                    : symbolsLoading
                      ? '加载交易对…'
                      : '选择或搜索交易对'
                }
              />
              {symbolsError ? <p className='text-destructive text-[11px] leading-tight'>{symbolsError}</p> : null}
              {selectedApi && !symbolsLoading && !symbolsError && symbols.length === 0 ? (
                <p className='text-muted-foreground text-[11px] leading-tight'>该交易所未返回可用交易对。</p>
              ) : null}
            </div>

            <Separator className='my-4' />

            <div className='grid gap-3 px-4 sm:grid-cols-2 sm:px-5'>
              <div className='space-y-1'>
                <Label className='text-muted-foreground text-[10px] font-medium tracking-wide uppercase'>仓位模式</Label>
                <SegmentedTwo<PositionMarginMode>
                  value={marginMode}
                  onChange={setMarginMode}
                  options={[
                    { value: 'cross', label: '全仓' },
                    { value: 'isolated', label: '逐仓' },
                  ]}
                />
              </div>
              <div className='space-y-1'>
                <Label className='text-muted-foreground text-[10px] font-medium tracking-wide uppercase'>开仓方向</Label>
                <SegmentedTwo<OpenSide>
                  variant='direction'
                  value={side}
                  onChange={setSide}
                  options={[
                    { value: 'long', label: '多' },
                    { value: 'short', label: '空' },
                  ]}
                />
              </div>
            </div>

            <Separator className='my-4' />

            <div className='space-y-1 px-4 sm:px-5'>
              <Label htmlFor='open-qty' className='text-muted-foreground text-[10px] font-medium tracking-wide uppercase'>
                开仓量
                {selectedApi ? (
                  <span className='text-muted-foreground ml-1 font-normal normal-case'>({selectedApi.quantityUnit})</span>
                ) : null}
              </Label>
              <Input
                id='open-qty'
                inputMode='decimal'
                placeholder={selectedApi ? `数量，${selectedApi.quantityUnit}` : '请先选择 API'}
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                disabled={!selectedApi || loading}
                className='h-9 rounded-lg border-border/80 text-[13px] shadow-sm'
              />
            </div>

            <div className='flex flex-col gap-2 px-4 pb-5 pt-6 sm:flex-row sm:items-center sm:justify-between sm:px-5'>
              <div className='min-h-4 flex-1'>
                {formError ? <p className='text-destructive text-xs leading-tight'>{formError}</p> : null}
              </div>
              <Button
                type='button'
                className='h-9 w-full rounded-lg px-4 text-[13px] shadow-sm sm:w-auto sm:min-w-[7.5rem]'
                onClick={openConfirm}
                disabled={!selectedApi || loading}
              >
                开仓
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <ConfirmOpenDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        summary={pendingSummary}
        onConfirm={handleConfirmed}
      />
    </div>
  )
}
