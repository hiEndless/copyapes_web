'use client'

import { Check, ChevronDown, Copy, EyeOff, Globe, Loader2Icon, Lock, ShieldCheck, X } from 'lucide-react'
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

const EXCHANGES = [
  { label: 'OKX', value: 'okx', logo: '/exchanges/okx.png' },
  { label: 'Binance', value: 'binance', logo: '/exchanges/binance.png' },
  { label: 'Gate', value: 'gate', logo: '/exchanges/gate.png' },
  { label: 'Bitget', value: 'bitget', logo: '/exchanges/bitget.png' },
  { label: 'WEEX', value: 'weex', logo: '/exchanges/weex.png' }
]

export const EXCHANGES_LOGOS = [
  {
    label: 'OKX',
    value: 'okx',
    logo: '/exchanges/okx/logo-light.svg',
    logoHeight: 12,

    // 字重偏深，提亮 + 降对比
    logoFilter: 'grayscale(1) brightness(1.45) contrast(0.68)'
  },
  {
    label: 'Binance',
    value: 'binance',
    logo: '/exchanges/binance/logo.svg',
    logoHeight: 17,
    logoFilter: 'grayscale(1) brightness(0.62) contrast(1.12)'
  },
  {
    label: 'Gate',
    value: 'gate',
    logo: '/exchanges/gate/logo.png',
    logoHeight: 16,

    // 整体偏深
    logoFilter: 'grayscale(1) brightness(1.3) contrast(0.75)'
  },
  {
    label: 'Bitget',
    value: 'bitget',
    logo: '/exchanges/bitget/logo.png',
    logoHeight: 17,

    // 整体偏浅，压暗 + 提对比
    logoFilter: 'grayscale(1) brightness(0.48) contrast(1.35)'
  },
  {
    label: 'WEEX',
    value: 'weex',
    logo: '/exchanges/weex/weex_logo.png',
    logoHeight: 15,
    logoFilter: 'grayscale(1) brightness(0.65) contrast(1.1)'
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

function getPassphraseLabel(exchange: string) {
  const ex = EXCHANGES.find((item) => item.value === exchange)

  return ex ? `${ex.label} 必填` : `${exchange.toUpperCase()} 必填`
}

export function ApiBindFormStep({
  formData,
  ipWhitelist,
  loading,
  onBack,
  onChange,
  onSubmit
}: ApiBindFormStepProps) {
  const selectedExchange = EXCHANGES.find((ex) => ex.value === formData.exchange)

  const ipList = ipWhitelist
    .split(',')
    .map((ip) => ip.trim())
    .filter(Boolean)

  const copyIpWhitelist = async () => {
    try {
      await navigator.clipboard.writeText(ipWhitelist)
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
          <p className='text-muted-foreground mt-1 text-xs font-medium'>第 2 步 / 共 2 步</p>
        </div>
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
          ← 返回安全说明
        </button>

        <div className='bg-muted/40 mt-2 space-y-3 rounded-lg px-4 py-3.5'>
          <div className='grid grid-cols-3 gap-2'>
            <SecurityBadge icon={ShieldCheck} label='AES-256 加密存储' />
            <SecurityBadge icon={Lock} label='仅合约交易，不可提现' />
            <SecurityBadge icon={EyeOff} label='Secret 永不展示' />
          </div>

          <div className='shadow-[inset_0_1px_0_0_rgba(14,15,12,0.06)] pt-2.5'>
            <p className='text-muted-foreground mb-2.5 text-center text-[10px] font-medium'>
              已支持以下交易所
            </p>
            <div className='grid grid-cols-3 items-center justify-items-center gap-x-2 gap-y-3 sm:grid-cols-5'>
              {EXCHANGES_LOGOS.map((ex) => (
                <div key={ex.value} className='flex h-[18px] w-full items-center justify-center'>
                  <img
                    src={ex.logo}
                    alt={ex.label}
                    title={ex.label}
                    className='max-w-full object-contain'
                    style={{
                      maxHeight: ex.logoHeight,
                      width: 'auto',
                      filter: ex.logoFilter
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

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
                    {formData.exchange === 'okx' && (
                      <span className='bg-primary/10 text-primary shrink-0 rounded px-1.5 py-px text-[9px] font-semibold tracking-wide'>
                        推荐
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
                          推荐
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

          <div>
            <label htmlFor='api_label' className={FIELD_LABEL}>
              备注名称
            </label>
            <Input
              id='api_label'
              placeholder='如：主账户'
              value={formData.api_label}
              onChange={(e) => onChange('api_label', e.target.value)}
              className={FIELD_INPUT}
            />
          </div>
        </div>

        <div>
          <p className={FIELD_LABEL}>API 权限类型</p>
          <div className='flex items-center gap-6'>
            <label className='flex cursor-pointer items-center gap-2'>
              <Checkbox
                checked={formData.is_read_only}
                onCheckedChange={() => onChange('is_read_only', true)}
              />
              <span className='text-[13px] font-medium'>只读 (信号)</span>
            </label>
            <label className='flex cursor-pointer items-center gap-2'>
              <Checkbox
                checked={!formData.is_read_only}
                onCheckedChange={() => onChange('is_read_only', false)}
              />
              <span className='text-[13px] font-medium'>交易 (跟单)</span>
            </label>
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
              Passphrase * ({getPassphraseLabel(formData.exchange)})
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
                请将以上 IP 全部添加到交易所 API Key 的 IP 白名单，缺一不可。
              </p>
              <p className='text-muted-foreground mt-2 text-[11px] font-medium'>
                只读权限的 API 不要绑定 IP 白名单；交易权限的 API 必须绑定。
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

function SecurityBadge({
  icon: Icon,
  label
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  label: string
}) {
  return (
    <div className='flex flex-col items-center gap-1 text-center'>
      <Icon className='size-4 text-emerald-600 dark:text-emerald-500' strokeWidth={2.5} />
      <span className='text-foreground text-[10.5px] font-semibold'>{label}</span>
    </div>
  )
}
