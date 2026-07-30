'use client'

import type { ComponentType, CSSProperties } from 'react'
import { useEffect, useState } from 'react'

import { useTheme } from 'next-themes'
import { useTranslations } from 'next-intl'

import {
  Check,
  ChevronDown,
  CircleHelpIcon,
  Copy,
  EyeOff,
  Globe,
  Loader2Icon,
  Lock,
  ShieldCheck,
  X
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { DialogClose, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { TOUR_ANCHORS, tourAnchor } from '@/features/tour/anchors'
import { TOUR_IDS } from '@/features/tour/registry'
import { useTour } from '@/features/tour/tour-provider'

const EXCHANGES = [
  { label: 'OKX', value: 'okx', logo: '/exchanges/okx.png' },
  { label: 'Binance', value: 'binance', logo: '/exchanges/binance.png' },
  { label: 'Gate', value: 'gate', logo: '/exchanges/gate.png' },
  { label: 'Bitget', value: 'bitget', logo: '/exchanges/bitget.png' },
  { label: 'WEEX', value: 'weex', logo: '/exchanges/weex.png' },
  { label: 'HTX', value: 'htx', logo: '/exchanges/htx.svg' }
]

export const EXCHANGES_LOGOS = [
  {
    label: 'OKX',
    value: 'okx',
    logo: '/exchanges/okx/logo-light.svg',
    logoDark: '/exchanges/okx/logo-dark.png',
    logoHeight: 12,
    logoHeightDark: 15,

    // 浅色背景：字重偏深
    logoFilter: 'grayscale(1) brightness(1.45) contrast(0.68)',

    // 深色背景：使用浅色版 logo，轻微压亮
    logoFilterDark: 'grayscale(1) brightness(1.08) contrast(0.88)'
  },
  {
    label: 'Binance',
    value: 'binance',
    logo: '/exchanges/binance/logo.svg',
    logoDark: '/exchanges/binance/logo.svg',
    logoHeight: 17,
    logoHeightDark: 14,
    logoFilter: 'grayscale(1) brightness(0.62) contrast(1.12)',
    logoFilterDark: 'grayscale(1) brightness(0.9) contrast(0.92)'
  },
  {
    label: 'Gate',
    value: 'gate',
    logo: '/exchanges/gate/logo.png',
    logoDark: '/exchanges/gate/logo-dark.png',
    logoHeight: 16,
    logoHeightDark: 20,

    // 浅色背景：整体偏深
    logoFilter: 'grayscale(1) brightness(1.3) contrast(0.75)',
    logoFilterDark: 'grayscale(1) brightness(1.05) contrast(0.86)'
  },
  {
    label: 'Bitget',
    value: 'bitget',
    logo: '/exchanges/bitget/logo.png',
    logoDark: '/exchanges/bitget/logo.png',
    logoHeight: 17,
    logoHeightDark: 14,

    // 浅色背景：整体偏浅
    logoFilter: 'grayscale(1) brightness(0.48) contrast(1.35)',
    logoFilterDark: 'grayscale(1) brightness(1.08) contrast(0.9)'
  },
  {
    label: 'WEEX',
    value: 'weex',
    logo: '/exchanges/weex/weex_logo.png',
    logoDark: '/exchanges/weex/weex_logo.png',
    logoHeight: 14,
    logoHeightDark: 13,
    logoFilter: 'grayscale(1) brightness(0.65) contrast(1.1)',

    // 深色背景：原图偏亮，压暗
    logoFilterDark: 'grayscale(1) brightness(0.55) contrast(1.08)'
  },
  {
    label: 'HTX',
    value: 'htx',
    logo: '/exchanges/htx/logo-light.png',
    logoDark: '/exchanges/htx/logo-dark.svg',
    logoHeight: 17,
    logoHeightDark: 14,
    logoFilter: 'grayscale(1) brightness(0.62) contrast(1.1)',
    logoFilterDark: 'grayscale(1) brightness(1.05) contrast(0.9)'
  }
] as const

export interface ApiFormData {
  exchange: string
  api_label: string
  is_read_only: boolean
  api_key: string
  api_secret: string
  api_passphrase: string
}

interface ApiBindFormStepProps {
  formData: ApiFormData
  ipWhitelist: string
  loading: boolean
  onBack: () => void
  onChange: (field: string, value: string | boolean) => void
  onSubmit: (e: React.FormEvent) => void
}

const FIELD_LABEL = 'text-muted-foreground mb-1.5 block text-[12px] font-semibold'

const FIELD_INPUT =
  'border-0 bg-muted text-foreground h-11 rounded-md px-4 text-[13px] shadow-none focus-visible:ring-ring/50'

export function ApiBindFormStep({
  formData,
  ipWhitelist,
  loading,
  onBack,
  onChange,
  onSubmit
}: ApiBindFormStepProps) {
  const t = useTranslations('DashboardApi')
  const { startTourById } = useTour()
  const selectedExchange = EXCHANGES.find((ex) => ex.value === formData.exchange)
  const passphraseExchangeLabel = selectedExchange ? selectedExchange.label : formData.exchange.toUpperCase()

  const ipList = [
    ...new Set(
      ipWhitelist
        .split(',')
        .map((ip) => ip.trim())
        .filter(Boolean)
    )
  ]

  const copyIpWhitelist = async () => {
    try {
      await navigator.clipboard.writeText(ipWhitelist)
      toast.success(t('bind.toasts.copySuccess'))
    } catch {
      toast.error(t('bind.toasts.copyFailed'))
    }
  }

  return (
    <>
      <DialogHeader className='border-border flex shrink-0 flex-row items-start justify-between gap-2 space-y-0 border-b px-6 py-5 text-left'>
        <div>
          <DialogTitle className='text-[22px] leading-tight font-semibold tracking-tight'>
            {t('bind.title')}
          </DialogTitle>
          <p className='text-muted-foreground mt-1 text-xs font-medium'>{t('bind.stepHint', { current: 2, total: 2 })}</p>
        </div>
        <div className='flex shrink-0 items-center gap-1'>
          <Button
            type='button'
            variant='ghost'
            size='sm'
            className='h-8 gap-1.5 px-2 text-xs font-semibold'
            onClick={() => startTourById(TOUR_IDS.apiFormGuide)}
          >
            <CircleHelpIcon className='size-4' />
            {t('bind.formGuide')}
          </Button>
          <DialogClose asChild>
            <Button
              type='button'
              variant='ghost'
              size='icon'
              className='size-8 shrink-0'
              aria-label={t('common.close')}
            >
              <X className='size-4' />
            </Button>
          </DialogClose>
        </div>
      </DialogHeader>

      <form
        onSubmit={onSubmit}
        className='min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-5'
      >
        <button
          type='button'
          onClick={onBack}
          className='text-muted-foreground hover:text-foreground text-xs font-semibold transition-colors'
        >
          {t('bind.back')}
        </button>

        <div className='bg-muted/40 mt-2 space-y-3 rounded-lg px-4 py-3.5'>
          <div className='grid grid-cols-3 gap-2'>
            <SecurityBadge icon={ShieldCheck} label={t('bind.securityBadges.encryption')} />
            <SecurityBadge icon={Lock} label={t('bind.securityBadges.noWithdraw')} />
            <SecurityBadge icon={EyeOff} label={t('bind.securityBadges.secretHidden')} />
          </div>

          <div className='shadow-[inset_0_1px_0_0_rgba(14,15,12,0.06)] pt-2.5'>
            <p className='text-muted-foreground mb-2.5 text-center text-[10px] font-medium'>
              {t('bind.supportedExchanges')}
            </p>
            <div className='grid grid-cols-3 items-center justify-items-center gap-x-2 gap-y-3'>
              {EXCHANGES_LOGOS.map((ex) => (
                <div key={ex.value} className='flex w-full items-center justify-center'>
                  <ExchangeShowcaseLogo ex={ex} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className='grid gap-3 md:grid-cols-2'>
          <div {...tourAnchor(TOUR_ANCHORS.apiFormExchange)}>
            <label htmlFor='exchange' className={FIELD_LABEL}>
              {t('bind.fields.exchange')}
            </label>
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <button
                  type='button'
                  id='exchange'
                  className='border-0 bg-muted text-foreground flex h-11 w-full items-center justify-between gap-2 rounded-md px-4 text-[13px] font-semibold shadow-none outline-none focus-visible:ring-2 focus-visible:ring-ring/40'
                >
                  <span className='inline-flex min-w-0 items-center gap-2'>
                    {selectedExchange && (
                      <img
                        src={selectedExchange.logo}
                        alt=''
                        className='size-3.5 object-contain'
                      />
                    )}
                    <span className='truncate'>{selectedExchange?.label ?? t('bind.fields.exchangePlaceholder')}</span>
                    {formData.exchange === 'okx' && (
                      <span className='bg-primary/10 text-primary shrink-0 rounded px-1.5 py-px text-[9px] font-semibold tracking-wide'>
                        {t('common.recommended')}
                      </span>
                    )}
                  </span>
                  <ChevronDown className='size-4 shrink-0 opacity-50' />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align='start'
                sideOffset={4}
                className='z-[100] min-w-[var(--radix-dropdown-menu-trigger-width)]'
              >
                {EXCHANGES.map((ex) => (
                  <DropdownMenuItem
                    key={ex.value}
                    className='cursor-pointer'
                    onClick={() => onChange('exchange', ex.value)}
                  >
                    <div className='flex flex-1 items-center gap-2'>
                      <img src={ex.logo} alt={ex.label} className='size-4 object-contain' />
                      <span>{ex.label}</span>
                      {ex.value === 'okx' && (
                        <span className='bg-primary/10 text-primary rounded px-1.5 py-px text-[9px] font-semibold'>
                          {t('common.recommended')}
                        </span>
                      )}
                    </div>
                    {formData.exchange === ex.value && (
                      <Check className='ml-auto size-4 shrink-0' />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div {...tourAnchor(TOUR_ANCHORS.apiFormLabel)}>
            <label htmlFor='api_label' className={FIELD_LABEL}>
              {t('bind.fields.label')}
            </label>
            <Input
              id='api_label'
              placeholder={t('bind.fields.labelPlaceholder')}
              required
              value={formData.api_label}
              onChange={(e) => onChange('api_label', e.target.value)}
              className={FIELD_INPUT}
            />
          </div>
        </div>

        <div {...tourAnchor(TOUR_ANCHORS.apiFormPermission)}>
          <p className={FIELD_LABEL}>{t('bind.fields.permissionType')}</p>
          <div className='flex items-center gap-6'>
            <label className='flex cursor-pointer items-center gap-2'>
              <Checkbox
                checked={formData.is_read_only}
                onCheckedChange={() => onChange('is_read_only', true)}
              />
              <span className='text-[13px] font-medium'>{t('bind.fields.readOnly')}</span>
            </label>
            <label className='flex cursor-pointer items-center gap-2'>
              <Checkbox
                checked={!formData.is_read_only}
                onCheckedChange={() => onChange('is_read_only', false)}
              />
              <span className='text-[13px] font-medium'>{t('bind.fields.trade')}</span>
            </label>
          </div>
        </div>

        <div {...tourAnchor(TOUR_ANCHORS.apiFormKey)}>
          <label htmlFor='api_key' className={FIELD_LABEL}>
            {t('bind.fields.apiKey')}
          </label>
          <Input
            id='api_key'
            placeholder={t('bind.fields.apiKeyPlaceholder')}
            required
            value={formData.api_key}
            onChange={(e) => onChange('api_key', e.target.value)}
            className={cn(FIELD_INPUT, 'tabular-nums')}
          />
        </div>

        <div {...tourAnchor(TOUR_ANCHORS.apiFormSecret)}>
          <label htmlFor='api_secret' className={FIELD_LABEL}>
            {t('bind.fields.apiSecret')}
          </label>
          <Input
            id='api_secret'
            type='password'
            placeholder={t('bind.fields.apiSecretPlaceholder')}
            required
            value={formData.api_secret}
            onChange={(e) => onChange('api_secret', e.target.value)}
            className={FIELD_INPUT}
          />
        </div>

        {['okx', 'bitget', 'weex'].includes(formData.exchange) && (
          <div>
            <label htmlFor='api_passphrase' className={FIELD_LABEL}>
              {t('bind.fields.passphrase', {
                exchangeRequired: t('bind.fields.exchangeRequired', { exchange: passphraseExchangeLabel })
              })}
            </label>
            <Input
              id='api_passphrase'
              type='password'
              placeholder={t('bind.fields.passphrasePlaceholder')}
              required
              value={formData.api_passphrase}
              onChange={(e) => onChange('api_passphrase', e.target.value)}
              className={FIELD_INPUT}
            />
          </div>
        )}

        <div className='bg-muted rounded-lg p-4' {...tourAnchor(TOUR_ANCHORS.apiFormIpWhitelist)}>
          <div className='flex gap-2.5'>
            <div className='bg-primary flex size-8 shrink-0 items-center justify-center rounded-full'>
              <Check className='text-primary-foreground size-4' strokeWidth={3} />
            </div>
            <div className='min-w-0 flex-1'>
              <div className='flex flex-wrap items-center justify-between gap-2'>
                <strong className='text-foreground inline-flex items-center gap-1.5 text-[13px] font-semibold'>
                  <Globe className='size-3.5' strokeWidth={2.5} />
                  {t('bind.ipWhitelist.title')}
                </strong>
                <button
                  type='button'
                  onClick={copyIpWhitelist}
                  title={t('bind.ipWhitelist.copyAllTitle')}
                  className='bg-background border-border hover:bg-muted/50 inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-[11px] font-semibold transition-colors'
                >
                  <Copy className='size-3' strokeWidth={2.5} />
                  {t('bind.ipWhitelist.copyAll')}
                </button>
              </div>
              <p className='text-muted-foreground mt-1 text-xs font-medium'>
                {t('bind.ipWhitelist.instruction1')}
              </p>
              <div className='mt-2 flex flex-wrap gap-1.5'>
                {ipList.map((ip) => (
                  <code
                    key={ip}
                    className='bg-background text-foreground rounded-md px-2.5 py-0.5 font-mono text-[11px] font-semibold tabular-nums'
                  >
                    {ip}
                  </code>
                ))}
              </div>
              <p className='text-muted-foreground/80 mt-2 text-[11px] font-medium'>
                {t('bind.ipWhitelist.instruction2')}
              </p>
              <p className='text-muted-foreground mt-2 text-[11px] font-medium'>
                {t('bind.ipWhitelist.readOnlyNote')}
              </p>
              <p className='mt-2 text-[11px] leading-relaxed font-medium text-amber-600 dark:text-amber-500'>
                {t('bind.ipWhitelist.changeWarning')}
              </p>
            </div>
          </div>
        </div>

        <div className='flex gap-2 pt-2' {...tourAnchor(TOUR_ANCHORS.apiFormSubmit)}>
          <Button
            type='submit'
            disabled={loading}
            className='h-11 flex-1 text-[13px] font-semibold'
          >
            {loading && <Loader2Icon className='mr-2 size-4 animate-spin' />}
            {loading ? t('bind.submitting') : t('bind.submit')}
          </Button>
          <DialogClose asChild>
            <Button
              type='button'
              variant='secondary'
              className='h-11 px-5 text-[13px] font-semibold'
            >
              {t('common.cancel')}
            </Button>
          </DialogClose>
        </div>
      </form>
    </>
  )
}

function ExchangeShowcaseLogo({ ex }: { ex: (typeof EXCHANGES_LOGOS)[number] }) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = mounted && resolvedTheme === 'dark'
  const src = isDark ? ex.logoDark : ex.logo
  const height = isDark ? ex.logoHeightDark : ex.logoHeight
  const filter = isDark ? ex.logoFilterDark : ex.logoFilter

  const imgStyle: CSSProperties = {
    height,
    width: 'auto',
    maxWidth: '100%',
    filter
  }

  return (
    <img
      src={src}
      alt={ex.label}
      title={ex.label}
      className='max-w-full object-contain object-center'
      style={imgStyle}
    />
  )
}

function SecurityBadge({
  icon: Icon,
  label
}: {
  icon: ComponentType<{ className?: string; strokeWidth?: number }>
  label: string
}) {
  return (
    <div className='flex flex-col items-center gap-1 text-center'>
      <Icon className='size-4 text-emerald-600 dark:text-emerald-500' strokeWidth={2.5} />
      <span className='text-foreground text-[10.5px] font-semibold'>{label}</span>
    </div>
  )
}
