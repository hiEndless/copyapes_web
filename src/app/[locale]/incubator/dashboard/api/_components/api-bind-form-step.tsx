'use client'

import {
  Check,
  ChevronDown,
  Copy,
  Globe,
  Loader2Icon,
  X
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { DialogClose, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { canBindIncubatorDemoApi } from '@/lib/incubator-auth'
import { cn } from '@/lib/utils'

const EXCHANGES = [
  { label: 'OKX', value: 'okx', logo: '/exchanges/okx.png', available: true },
  { label: 'Binance', value: 'binance', logo: '/exchanges/binance.png', available: true },
  { label: 'Gate', value: 'gate', logo: '/exchanges/gate.png', available: true }
]

export interface ApiFormData {
  exchange: string
  api_label: string
  api_key: string
  api_secret: string
  api_passphrase: string
  flag: 0 | 1
}

interface ApiBindFormStepProps {
  formData: ApiFormData
  ipWhitelist: string
  ipLoading?: boolean
  ipError?: string | null
  loading: boolean
  onChange: (field: string, value: string | boolean | 0 | 1) => void
  onSubmit: (e: React.FormEvent) => void
}

const FIELD_LABEL = 'text-muted-foreground mb-1.5 block text-[12px] font-semibold'

const FIELD_INPUT =
  'border-0 bg-muted text-foreground h-11 rounded-md px-4 text-[13px] shadow-none focus-visible:ring-ring/50'

export function ApiBindFormStep({
  formData,
  ipWhitelist,
  ipLoading = false,
  ipError = null,
  loading,
  onChange,
  onSubmit
}: ApiBindFormStepProps) {
  const selectedExchange = EXCHANGES.find((ex) => ex.value === formData.exchange)
  const passphraseExchangeLabel = selectedExchange ? selectedExchange.label : formData.exchange.toUpperCase()
  const allowDemoApi = canBindIncubatorDemoApi()

  const ipList = [
    ...new Set(
      ipWhitelist
        .split(',')
        .map((ip) => ip.trim())
        .filter(Boolean)
    )
  ]

  const copyIpWhitelist = async () => {
    if (!ipList.length) {
      toast.error('暂无出口 IP 可复制')
      return
    }
    try {
      await navigator.clipboard.writeText(ipList.join(','))
      toast.success('已复制到剪贴板')
    } catch {
      toast.error('复制失败')
    }
  }

  return (
    <>
      <DialogHeader className='border-border flex shrink-0 flex-row items-start justify-between gap-2 space-y-0 border-b px-6 py-5 text-left'>
        <div>
          <DialogTitle className='text-[22px] leading-tight font-semibold tracking-tight'>
            绑定 API Key
          </DialogTitle>
        </div>
        <div className='flex shrink-0 items-center gap-1'>
          <DialogClose asChild>
            <Button
              type='button'
              variant='ghost'
              size='icon'
              className='size-8 shrink-0'
              aria-label='关闭'
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
        <div className='grid gap-3 md:grid-cols-2'>
          <div>
            <label htmlFor='exchange' className={FIELD_LABEL}>
              交易所 *
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
                    <span className='truncate'>{selectedExchange?.label ?? '选择交易所'}</span>
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
                    disabled={!ex.available}
                    className={cn('cursor-pointer', !ex.available && 'opacity-60')}
                    onClick={() => {
                      if (!ex.available) return
                      onChange('exchange', ex.value)
                    }}
                  >
                    <div className='flex flex-1 items-center gap-2'>
                      <img src={ex.logo} alt={ex.label} className='size-4 object-contain' />
                      <span>{ex.label}</span>
                      {!ex.available && (
                        <span className='bg-muted text-muted-foreground rounded px-1.5 py-px text-[9px] font-semibold'>
                          待接入
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

          {allowDemoApi ? (
            <div>
              <label className={FIELD_LABEL}>交易环境 *</label>
              <div className='bg-muted grid grid-cols-2 gap-1 rounded-md p-1'>
                {(
                  [
                    { value: 0 as const, label: '实盘' },
                    { value: 1 as const, label: '模拟盘' }
                  ] as const
                ).map(option => (
                  <button
                    key={option.value}
                    type='button'
                    className={cn(
                      'h-9 rounded-md text-[13px] font-semibold transition-colors',
                      formData.flag === option.value
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                    onClick={() => onChange('flag', option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div>
            <label htmlFor='api_label' className={FIELD_LABEL}>
              备注名称 *
            </label>
            <Input
              id='api_label'
              placeholder='如：主账户'
              required
              value={formData.api_label}
              onChange={(e) => onChange('api_label', e.target.value)}
              className={FIELD_INPUT}
            />
          </div>
        </div>

        <div>
          <label htmlFor='api_key' className={FIELD_LABEL}>
            API Key *
          </label>
          <Input
            id='api_key'
            placeholder='输入 API Key'
            required
            value={formData.api_key}
            onChange={(e) => onChange('api_key', e.target.value)}
            className={cn(FIELD_INPUT, 'tabular-nums')}
          />
        </div>

        <div>
          <label htmlFor='api_secret' className={FIELD_LABEL}>
            API Secret *
          </label>
          <Input
            id='api_secret'
            type='password'
            placeholder='输入 API Secret'
            required
            value={formData.api_secret}
            onChange={(e) => onChange('api_secret', e.target.value)}
            className={FIELD_INPUT}
          />
        </div>

        {['okx', 'bitget', 'weex'].includes(formData.exchange) && (
          <div>
            <label htmlFor='api_passphrase' className={FIELD_LABEL}>
              Passphrase * ({passphraseExchangeLabel} 必填)
            </label>
            <Input
              id='api_passphrase'
              type='password'
              placeholder='输入 Passphrase'
              required
              value={formData.api_passphrase}
              onChange={(e) => onChange('api_passphrase', e.target.value)}
              className={FIELD_INPUT}
            />
          </div>
        )}

        <div className='bg-muted rounded-lg p-4'>
          <div className='flex gap-2.5'>
            <div className='bg-primary flex size-8 shrink-0 items-center justify-center rounded-full'>
              <Check className='text-primary-foreground size-4' strokeWidth={3} />
            </div>
            <div className='min-w-0 flex-1'>
              <div className='flex flex-wrap items-center justify-between gap-2'>
                <strong className='text-foreground inline-flex items-center gap-1.5 text-[13px] font-semibold'>
                  <Globe className='size-3.5' strokeWidth={2.5} />
                  IP 白名单
                </strong>
                <button
                  type='button'
                  onClick={copyIpWhitelist}
                  title='复制全部 IP（OKX 用半角逗号分隔，可直接粘贴到交易所白名单输入框）'
                  className='bg-background border-border hover:bg-muted/50 inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-[11px] font-semibold transition-colors'
                >
                  <Copy className='size-3' strokeWidth={2.5} />
                  复制全部（半角逗号）
                </button>
              </div>
              <p className='text-muted-foreground mt-1 text-xs font-medium'>
                把以下 IP 全部添加到交易所 API Key 的「受信任 IP」列表，缺一不可：
              </p>
              <div className='mt-2 flex flex-wrap gap-1.5'>
                {ipLoading ? (
                  <span className='text-muted-foreground inline-flex items-center gap-1.5 text-[11px]'>
                    <Loader2Icon className='size-3.5 animate-spin' />
                    正在加载已分配出口 IP…
                  </span>
                ) : ipList.length > 0 ? (
                  ipList.map((ip) => (
                    <code
                      key={ip}
                      className='bg-background text-foreground rounded-md px-2.5 py-0.5 font-mono text-[11px] font-semibold tabular-nums'
                    >
                      {ip}
                    </code>
                  ))
                ) : (
                  <span className='text-destructive text-[11px] font-medium'>
                    {ipError || '暂无已分配出口 IP'}
                  </span>
                )}
              </div>
              {ipError && ipList.length > 0 ? (
                <p className='text-destructive mt-2 text-[11px] font-medium'>{ipError}</p>
              ) : null}
              <p className='text-muted-foreground/80 mt-2 text-[11px] font-medium'>
                请将以上 IP 全部添加到交易所 API Key 的 IP 白名单，缺一不可。
              </p>
              <p className='mt-2 text-[11px] leading-relaxed font-medium text-amber-600 dark:text-amber-500'>
                IP 可能会发生变化，请关注系统公告，及时更新 IP 白名单。
              </p>
            </div>
          </div>
        </div>

        <div className='flex gap-2 pt-2'>
          <Button
            type='submit'
            disabled={loading}
            className='h-11 flex-1 text-[13px] font-semibold'
          >
            {loading && <Loader2Icon className='mr-2 size-4 animate-spin' />}
            {loading ? '正在绑定...' : '确认绑定'}
          </Button>
          <DialogClose asChild>
            <Button
              type='button'
              variant='secondary'
              className='h-11 px-5 text-[13px] font-semibold'
            >
              取消
            </Button>
          </DialogClose>
        </div>
      </form>
    </>
  )
}
