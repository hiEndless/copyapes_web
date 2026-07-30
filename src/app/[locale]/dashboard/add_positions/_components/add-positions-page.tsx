'use client'

import * as React from 'react'

import { Loader2Icon, RefreshCwIcon, SlidersHorizontalIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
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
import { listTradingApisFromApiAdd, UNKNOWN_EXCHANGE_SENTINEL } from './map-api-to-trading-api'
import { SymbolCombobox } from './symbol-combobox'
import type { OpenSide, PositionMarginMode, QuantityUnitLabel, TradingApiMock } from './types'

function formatQuantityUnit(unit: QuantityUnitLabel, t: ReturnType<typeof useTranslations<'DashboardAddPositions'>>) {
  return unit === 'contract' ? t('page.unitContract') : t('page.unitCoin')
}

function formatExchangeName(name: string, t: ReturnType<typeof useTranslations<'DashboardAddPositions'>>) {
  return name === UNKNOWN_EXCHANGE_SENTINEL ? t('page.unknownExchange') : name
}

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
  const t = useTranslations('DashboardAddPositions')
  const [apis, setApis] = React.useState<TradingApiMock[]>([])
  const [loading, setLoading] = React.useState(true)
  const [refreshing, setRefreshing] = React.useState(false)
  const [listError, setListError] = React.useState<string | null>(null)

  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [symbol, setSymbol] = React.useState('')
  const [marginMode, setMarginMode] = React.useState<PositionMarginMode>('cross')
  const [side, setSide] = React.useState<OpenSide>('long')
  const [quantity, setQuantity] = React.useState('')
  const [leverageInput, setLeverageInput] = React.useState('10')
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
        throw new Error(res.error || t('errors.fetchApis'))
      }

      const mapped = listTradingApisFromApiAdd(res.data)

      setApis(mapped)
    } catch (e) {
      const message = e instanceof Error ? e.message : t('errors.fetchApis')

      setListError(message)
      setApis([])
      toast.error(message)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [t])

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
          setSymbolsError(res.error || t('errors.fetchSymbols'))

          return
        }

        setSymbols(res.data.symbols)
      } catch {
        if (!cancelled) {
          setSymbols([])
          setSymbolsError(t('errors.fetchSymbols'))
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
  }, [selectedExchangeKey, loading, t])

  React.useEffect(() => {
    setSymbol('')
    setLeverageInput('10')
    setFormError(null)
  }, [selectedId])

  const openConfirm = () => {
    setFormError(null)

    if (!selectedApi) {
      setFormError(t('errors.needApi'))

      return
    }

    if (!symbol) {
      setFormError(t('errors.needSymbol'))

      return
    }

    const q = quantity.trim()
    const unitLabel = formatQuantityUnit(selectedApi.quantityUnit, t)

    if (!q || Number.isNaN(Number(q)) || Number(q) <= 0) {
      setFormError(t('errors.needQty', { unit: unitLabel }))

      return
    }

    const lev = Number.parseInt(leverageInput.trim(), 10)

    if (!Number.isFinite(lev) || lev < 1 || lev > 125) {
      setFormError(t('errors.needLeverage'))

      return
    }

    setPendingSummary({
      api: selectedApi,
      symbol,
      marginMode,
      side,
      quantity: q,
      quantityUnit: selectedApi.quantityUnit,
      leverage: lev,
    })
    setConfirmOpen(true)
  }

  const handleConfirmed = async (final: OpenConfirmSummary) => {
    const apiId = Number(final.api.id)
    const qty = Number(final.quantity)
    if (!Number.isFinite(apiId) || apiId <= 0) {
      toast.error(t('errors.invalidApi'))
      return
    }
    if (!Number.isFinite(qty) || qty <= 0) {
      toast.error(t('errors.invalidQty'))
      return
    }

    const res = await orderApi.openSymbol({
      api_id: apiId,
      symbol: final.symbol,
      side: final.side,
      quantity: qty,
      marginMode: final.marginMode,
      leverage: final.leverage,
    })
    if (res.code !== 0) {
      throw new Error(res.error || t('errors.openFailed'))
    }
    toast.success(t('toast.openSubmitted'))
    setPendingSummary(null)
    setQuantity('')
    setLeverageInput('10')
  }

  const listColumn = (() => {
    if (loading && apis.length === 0) {
      return (
        <Card className='border-border/80 text-[13px] leading-tight shadow-sm'>
          <CardContent className='flex min-h-[200px] flex-col items-center justify-center gap-2 py-10'>
            <Loader2Icon className='text-muted-foreground size-8 animate-spin' />
            <p className='text-muted-foreground text-xs'>{t('page.loadingApis')}</p>
          </CardContent>
        </Card>
      )
    }

    if (listError) {
      return (
        <Card className='border-border/80 text-[13px] leading-tight shadow-sm'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-semibold'>{t('page.loadApiFailedTitle')}</CardTitle>
            <CardDescription className='text-destructive text-xs leading-snug'>{listError}</CardDescription>
          </CardHeader>
          <CardContent className='pt-0'>
            <Button type='button' variant='outline' size='sm' className='h-8 text-xs' onClick={() => void loadApis(true)} disabled={refreshing}>
              <RefreshCwIcon className={cn('mr-1.5 size-3.5', refreshing && 'animate-spin')} />
              {t('page.retry')}
            </Button>
          </CardContent>
        </Card>
      )
    }

    if (apis.length === 0) {
      return (
        <Card className='border-border/80 text-[13px] leading-tight shadow-sm'>
          <CardContent className='text-muted-foreground px-4 py-8 text-center text-xs leading-relaxed'>
            {t('page.noEligibleApi')}
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
          <h1 className='text-2xl font-semibold tracking-tight'>{t('page.title')}</h1>
          <p className='text-muted-foreground text-sm'>{t('page.subtitle')}</p>
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
          {t('page.refreshApi')}
        </Button>
      </div>

      <div className='grid flex-1 gap-4 lg:grid-cols-[minmax(0,340px)_1fr] lg:items-start lg:gap-5'>
        {listColumn}

        <Card className='overflow-hidden border-border/80 text-[13px] leading-tight shadow-sm'>
          <CardHeader className='border-border/60 from-muted/25 border-b bg-gradient-to-r to-transparent px-4 pb-3 pt-4 sm:px-5'>
            <div className='flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between'>
              <div className='flex min-w-0 items-start gap-2.5'>
                {selectedApi ? (
                  <ExchangeLogo
                    src={selectedApi.logoSrc}
                    alt={formatExchangeName(selectedApi.exchangeName, t)}
                    size={40}
                  />
                ) : (
                  <div className='bg-muted text-muted-foreground flex size-10 shrink-0 items-center justify-center rounded-lg border'>
                    <SlidersHorizontalIcon className='size-4' />
                  </div>
                )}
                <div className='min-w-0 space-y-0.5'>
                  <CardTitle className='text-base font-semibold tracking-tight'>{t('page.paramsTitle')}</CardTitle>
                  <CardDescription className='text-muted-foreground text-[11px] leading-snug'>
                    {selectedApi
                      ? `${formatExchangeName(selectedApi.exchangeName, t)} · ${selectedApi.label}`
                      : loading
                        ? t('page.loading')
                        : apis.length === 0
                          ? t('page.noApi')
                          : t('page.selectApiHint')}
                  </CardDescription>
                </div>
              </div>
              {selectedApi ? (
                <div className='text-muted-foreground flex flex-wrap items-center gap-1.5 text-[11px] sm:justify-end'>
                  <span className='bg-background/80 rounded border px-1.5 py-0.5 tabular-nums'>
                    {t('page.balance')}{' '}
                    <span className='text-foreground font-medium'>{formatUsdtBalance(selectedApi.balanceUsdt)}</span>
                    <span className='ml-0.5'>USDT</span>
                  </span>
                  <span className='bg-background/80 rounded border px-1.5 py-0.5'>
                    {t('page.unit', { unit: formatQuantityUnit(selectedApi.quantityUnit, t) })}
                  </span>
                </div>
              ) : null}
            </div>
          </CardHeader>
          <CardContent className='space-y-0 p-0'>
            <div className='space-y-1 px-4 pt-4 sm:px-5'>
              <div className='flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-3'>
                <div className='min-w-0 flex-1 space-y-1'>
                  <Label className='text-muted-foreground text-[10px] font-medium tracking-wide uppercase'>{t('page.symbol')}</Label>
                  <SymbolCombobox
                    symbols={symbols}
                    value={symbol}
                    onChange={setSymbol}
                    disabled={!selectedApi || symbolsLoading || loading}
                    placeholder={
                      !selectedApi
                        ? t('page.selectApiFirst')
                        : symbolsLoading
                          ? t('page.loadingSymbols')
                          : t('page.pickSymbol')
                    }
                  />
                </div>
                <div className='flex w-full shrink-0 flex-col gap-1 sm:w-[5.25rem]'>
                  <Label
                    htmlFor='add-positions-leverage'
                    className='text-muted-foreground text-[10px] font-medium tracking-wide uppercase'
                  >
                    {t('page.leverage')}
                  </Label>
                  <Input
                    id='add-positions-leverage'
                    inputMode='numeric'
                    min={1}
                    max={125}
                    value={leverageInput}
                    onChange={e => setLeverageInput(e.target.value)}
                    disabled={!selectedApi || loading}
                    className='h-9 rounded-lg border-border/80 text-center font-mono text-[13px] tabular-nums shadow-sm'
                  />
                </div>
              </div>
              {symbolsError ? <p className='text-destructive text-[11px] leading-tight'>{symbolsError}</p> : null}
              {selectedApi && !symbolsLoading && !symbolsError && symbols.length === 0 ? (
                <p className='text-muted-foreground text-[11px] leading-tight'>{t('page.noSymbols')}</p>
              ) : null}
            </div>

            <Separator className='my-4' />

            <div className='grid gap-3 px-4 sm:grid-cols-2 sm:px-5'>
              <div className='space-y-1'>
                <Label className='text-muted-foreground text-[10px] font-medium tracking-wide uppercase'>{t('page.marginMode')}</Label>
                <SegmentedTwo<PositionMarginMode>
                  value={marginMode}
                  onChange={setMarginMode}
                  options={[
                    { value: 'cross', label: t('page.cross') },
                    { value: 'isolated', label: t('page.isolated') },
                  ]}
                />
              </div>
              <div className='space-y-1'>
                <Label className='text-muted-foreground text-[10px] font-medium tracking-wide uppercase'>{t('page.side')}</Label>
                <SegmentedTwo<OpenSide>
                  variant='direction'
                  value={side}
                  onChange={setSide}
                  options={[
                    { value: 'long', label: t('page.long') },
                    { value: 'short', label: t('page.short') },
                  ]}
                />
              </div>
            </div>

            <Separator className='my-4' />

            <div className='space-y-1 px-4 sm:px-5'>
              <Label htmlFor='open-qty' className='text-muted-foreground text-[10px] font-medium tracking-wide uppercase'>
                {t('page.qty')}
                {selectedApi ? (
                  <span className='text-muted-foreground ml-1 font-normal normal-case'>
                    ({formatQuantityUnit(selectedApi.quantityUnit, t)})
                  </span>
                ) : null}
              </Label>
              <Input
                id='open-qty'
                inputMode='decimal'
                placeholder={
                  selectedApi
                    ? t('page.qtyPlaceholder', { unit: formatQuantityUnit(selectedApi.quantityUnit, t) })
                    : t('page.selectApiFirst')
                }
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
                {t('page.open')}
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
