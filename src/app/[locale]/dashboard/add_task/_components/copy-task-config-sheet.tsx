'use client'

import { useState, useEffect } from 'react'

import { useRouter } from 'next/navigation'

import { toast } from 'sonner'

import { CircleHelp } from 'lucide-react'

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

import { getApiOptions, getTraderBalance, addTask } from '@/api/task'

// --- Utility Component for Tags ---
function TagInput({
  tags,
  onChange,
  placeholder
}: {
  tags: string[]
  onChange: (tags: string[]) => void
  placeholder: string
}) {
  const [inputValue, setInputValue] = useState('')

  const commitInput = () => {
    const parsedTags = inputValue
      .split(/[,，\n]+/)
      .map(tag => tag.trim().toUpperCase())
      .filter(Boolean)

    if (parsedTags.length === 0) {
      setInputValue('')

      return
    }

    const mergedTags = [...tags]

    parsedTags.forEach(tag => {
      if (!mergedTags.includes(tag)) {
        mergedTags.push(tag)
      }
    })

    if (mergedTags.length !== tags.length) {
      onChange(mergedTags)
    }

    setInputValue('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      commitInput()
    }
  }

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter(tag => tag !== tagToRemove))
  }

  return (
    <div className='flex flex-col gap-2'>
      <div className='mb-1 flex flex-wrap gap-2'>
        {tags.map(tag => (
          <span
            key={tag}
            className='border-primary/20 bg-primary/10 text-primary inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium'
          >
            {tag}
            <button
              type='button'
              onClick={() => removeTag(tag)}
              className='text-primary/70 hover:text-destructive ml-1 focus:outline-none'
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <Input
        value={inputValue}
        onChange={e => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={commitInput}
        placeholder={placeholder + ' (按回车添加，批量添加时请用英文逗号分隔)'}
      />
    </div>
  )
}

export interface CopyTaskConfigSheetProps {
  isOpen: boolean
  onClose: () => void
  traderId: string | null
  traderName?: string
  platform: 'binance' | 'okx' | 'cookie' | 'exchange' | 'hyper' | 'hot' | string
  traderPlatform?: number | string // 交易员平台 ID (1: OKX, 2: Binance, 3: 币coin, 4: 热门, 5: Cookie, 6: API, 7: 币安带单, 8: OKX带单, 9: Hyperliquid, 10: Bitget)
  roleType?: string // 交易员实盘类型，由上一级页面传入
  cookieId?: string
}

export function CopyTaskConfigSheet({
  isOpen,
  onClose,
  traderId,
  traderName,
  platform,
  traderPlatform,
  roleType,
  cookieId
}: CopyTaskConfigSheetProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [apiOptions, setApiOptions] = useState<any[]>([])
  const [user, setUser] = useState('')

  const mappedRoleType = roleType || '1'

  const hideFollowLeverage =
    String(traderPlatform) === '4' ||
    (String(traderPlatform) === '3' && mappedRoleType === '1') ||
    (String(traderPlatform) === '2' && mappedRoleType === '2')

  // Form State
  const [formData, setFormData] = useState({
    api_id: '',
    follow_type: '2', // 固定比例
    benchMark: '',
    investment: '',
    lever_set: hideFollowLeverage ? 2 : 1,
    leverage: '',
    first_open_type: 1,
    uplRatio: '0',
    first_order_set: 1
  })

  // Toggle Switches State
  const [toggles, setToggles] = useState({
    multiple_visible: false,
    multiple: '1',
    posSide_set_visible: false,
    fast_mode_visible: true,
    trade_trigger_visible: false,
    tp_trigger_px: '0',
    sl_trigger_px: '0',
    pos_visible: false,
    pos_value: 'long',
    vol24h_visible: false,
    vol24h_num: '0',
    balance_monitor_visible: false,
    balance_monitor_value: '0',
    white_list_visible: false,
    white_list: [] as string[],
    black_list_visible: false,
    black_list: [] as string[]
  })

  // Load APIs
  useEffect(() => {
    if (isOpen) {
      getApiOptions().then(res => {
        if (res.code === 0 && Array.isArray(res.data)) {
          if (res.data.length > 0) {
            setUser(res.data[0].user)
          }

          const validApis = res.data.filter((item: any) => item.is_readonly === false)

          setApiOptions(validApis)

          // 默认选中第一个可用的 API
          if (validApis.length > 0 && !formData.api_id) {
            setFormData(prev => ({ ...prev, api_id: String(validApis[0].id) }))
          }
        }
      })
    }
  }, [isOpen, formData.api_id])

  // Effect to reset/init form when traderId changes
  useEffect(() => {
    if (isOpen && traderId) {
      setFormData(prev => ({
        ...prev,
        lever_set: hideFollowLeverage ? 2 : 1
      }))
    }
  }, [isOpen, traderId, platform, hideFollowLeverage])

  const updateForm = (key: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  const updateToggle = (key: keyof typeof toggles, value: any) => {
    setToggles(prev => ({ ...prev, [key]: value }))
  }

  const fetchBenchMark = async () => {
    if (!traderPlatform || !traderId) return

    const res = await getTraderBalance({
      trader_platform: traderPlatform,
      role_type: roleType || '1',
      uniqueName: traderId
    })

    if (res.code === 0) {
      updateForm('benchMark', res.data)
      toast.success(res.message || '获取成功')
    } else {
      toast.error(res.error || '获取预估本金失败')
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)

    try {
      const payload = {
        trader_platform: traderPlatform,
        uniqueName: traderPlatform === 7 || traderPlatform === 8 ? `${traderId}-${cookieId || ''}` : traderId,
        api: formData.api_id,
        follow_type: formData.follow_type,
        multiple: toggles.multiple_visible ? toggles.multiple : '1',
        sums: '0',
        ratio: '0',
        lever_set: String(formData.lever_set),
        leverage: String(formData.lever_set) === '2' && formData.leverage ? formData.leverage : '1',
        first_open_type: String(formData.first_open_type),
        uplRatio: formData.uplRatio,
        first_order_set: String(formData.first_order_set),
        posSide_set: toggles.posSide_set_visible ? '2' : '1',
        user,
        role_type: mappedRoleType,
        reduce_ratio: '0',
        fast_mode: toggles.fast_mode_visible ? '1' : '0',
        benchMark: formData.benchMark,
        investment: formData.investment,
        trade_trigger_mode: toggles.trade_trigger_visible ? '1' : '0',
        sl_trigger_px: toggles.sl_trigger_px,
        tp_trigger_px: toggles.tp_trigger_px,
        pos_mode: toggles.pos_visible ? '1' : '0',
        pos_value: toggles.pos_value,
        vol24h_mode: toggles.vol24h_visible ? '1' : '0',
        vol24h_num: toggles.vol24h_num,
        balance_monitor_mode: toggles.balance_monitor_visible ? '1' : '0',
        balance_monitor_value: toggles.balance_monitor_value,
        white_list_mode: toggles.white_list_visible ? '1' : '0',
        white_list: toggles.white_list,
        black_list_mode: toggles.black_list_visible ? '1' : '0',
        black_list: toggles.black_list
      }

      console.log('Submitting Task Config:', payload)
      const res = await addTask(payload)

      if (res.code === 0) {
        toast.success('创建成功')
        onClose()
        router.push('/dashboard/task_list')
      } else {
        // request method automatically handles toast
        setIsLoading(false)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  const allCopyApi = ['binance', 'okx', 'cookie', 'hyper'].includes(platform)

  return (
    <Sheet open={isOpen} onOpenChange={open => !open && onClose()}>
      <SheetContent side='right' className='flex flex-col p-0 sm:max-w-lg'>
        <SheetHeader className='px-6 pt-6 pb-2'>
          <SheetTitle>
            跟单配置 - <span>{traderName || traderId}</span>
          </SheetTitle>
          <SheetDescription>配置详细的跟单参数</SheetDescription>
        </SheetHeader>

        {/* tab选择：基础设置（默认）和高级设置 */}

        <Tabs defaultValue='basic' className='flex h-full flex-1 flex-col overflow-hidden'>
          <div className='px-6'>
            <TabsList className='grid w-full grid-cols-2'>
              <TabsTrigger value='basic'>基础设置</TabsTrigger>
              <TabsTrigger value='advanced'>高级设置</TabsTrigger>
            </TabsList>
          </div>

          <div className='flex-1 overflow-y-auto px-6 py-4'>
            <TabsContent value='basic' className='mt-0 space-y-6'>
              {/* 选择跟单 API */}
              <div>
                <div className='mb-2 text-sm font-medium'>选择你的跟单 API</div>
                <div className='flex flex-wrap gap-2'>
                  {apiOptions.map(api => {
                    const active = formData.api_id === api.id

                    return (
                      <button
                        key={api.id}
                        type='button'
                        className={`rounded-md border px-3 py-2 text-left transition-colors ${
                          active ? 'border-primary bg-primary text-primary-foreground' : 'hover:bg-muted'
                        }`}
                        onClick={() => updateForm('api_id', api.id)}
                      >
                        <div className='flex items-center gap-2'>
                          <span
                            className={`text-xs font-medium ${active ? 'text-primary-foreground' : 'text-foreground'}`}
                          >
                            {api.api_name || `API ${api.id}`}
                          </span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* 跟单模式 */}
              <div className='space-y-2'>
                <label className='mb-2 block text-sm font-medium'>跟单模式</label>
                <div className='flex items-center gap-4'>
                  <label className='flex cursor-pointer items-center gap-2'>
                    <Checkbox
                      checked={formData.follow_type === '2'}
                      onCheckedChange={checked => {
                        if (checked) updateForm('follow_type', '2')
                      }}
                    />
                    <div className='flex items-center gap-1'>
                      <span className='text-sm'>固定比例</span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <CircleHelp className='text-muted-foreground h-4 w-4' />
                          </TooltipTrigger>
                          <TooltipContent className='max-w-[240px]'>
                            <p>
                              跟单比例 = 跟单投资额 / 对标交易员本金 ×
                              倍数。跟单投资额只用于计算交易比例，不代表实际使用资金上限。
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </label>
                </div>
              </div>

              {/* 倍投模式 */}
              {formData.follow_type === '2' && (
                <div className='bg-muted/20 rounded-md border p-3'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-1'>
                      <div className='text-sm font-medium'>倍投模式 (可选)</div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <CircleHelp className='text-muted-foreground h-4 w-4' />
                          </TooltipTrigger>
                          <TooltipContent className='max-w-[240px]'>
                            <p>
                              在基础的跟单比例上，额外再乘以此倍数。例如：如果原本按比例应开仓 10 USDT，设置倍投为 2
                              后，实际开仓将变为 20
                              USDT。只适用于经常小金额高杠杆交易的交易员，避免因为交易员开仓量过低，导致无法跟单。
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Switch
                      checked={toggles.multiple_visible}
                      onCheckedChange={(val: boolean) => updateToggle('multiple_visible', val)}
                    />
                  </div>
                  {toggles.multiple_visible && (
                    <div className='animate-in fade-in mt-4 space-y-2'>
                      <label className='mb-2 block text-sm font-medium'>加倍倍数 (默认为1)</label>
                      <Input
                        type='number'
                        min='1'
                        value={toggles.multiple}
                        onChange={e => updateToggle('multiple', e.target.value)}
                        placeholder='eg. 2'
                      />
                      <p className='mt-1 text-xs font-medium text-red-500'>
                        如果跟单的交易员经常满仓交易，请不要使用此功能！
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* 本金与投资额 */}
              <div className='space-y-4'>
                <div className='space-y-2'>
                  <label className='mb-2 block text-sm font-medium'>交易员本金对标 (USDT)</label>
                  <div className='flex gap-2'>
                    <Input
                      value={formData.benchMark}
                      onChange={e => updateForm('benchMark', e.target.value)}
                      placeholder='>100'
                    />
                    <Button variant='secondary' className='px-3' onClick={fetchBenchMark}>
                      自动获取
                    </Button>
                  </div>
                </div>

                {formData.follow_type === '2' && (
                  <div className='space-y-2'>
                    <label className='mb-2 block text-sm font-medium'>投资额 (USDT)</label>
                    <Input
                      value={formData.investment}
                      onChange={e => updateForm('investment', e.target.value)}
                      placeholder='>100'
                    />
                  </div>
                )}
              </div>

              {/* 杠杆模式 */}
              <div className='space-y-2'>
                <label className='mb-2 block text-sm font-medium'>杠杆模式</label>
                <div className='flex items-center gap-4'>
                  {!hideFollowLeverage && (
                    <label className='flex cursor-pointer items-center gap-2'>
                      <Checkbox
                        checked={formData.lever_set === 1}
                        onCheckedChange={checked => {
                          if (checked) updateForm('lever_set', 1)
                        }}
                      />
                      <span className='text-sm'>跟随交易员</span>
                    </label>
                  )}
                  <label className='flex cursor-pointer items-center gap-2'>
                    <Checkbox
                      checked={formData.lever_set === 2}
                      onCheckedChange={checked => {
                        if (checked) updateForm('lever_set', 2)
                      }}
                    />
                    <div className='flex items-center gap-1'>
                      <span className='text-sm'>自定义杠杆</span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <CircleHelp className='text-muted-foreground h-4 w-4' />
                          </TooltipTrigger>
                          <TooltipContent className='max-w-[240px]'>
                            <p>
                              交易所对新账号有风控保护，有时候无法跟随交易员开同样的高杠杆。调整杠杆不会影响实际的交易量，只会影响保证金占用。固定使用您自己设置的杠杆倍数进行跟单，不跟随交易员的杠杆变化。
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </label>
                </div>
              </div>

              {formData.lever_set === 2 && (
                <div className='animate-in fade-in space-y-2'>
                  <label className='mb-2 block text-sm font-medium'>杠杆数值</label>
                  <Input
                    type='number'
                    min='1'
                    max='75'
                    value={formData.leverage}
                    onChange={e => updateForm('leverage', e.target.value)}
                    placeholder='1至75整数（建议10到20，以免有的币种不支持高杠杆）'
                  />
                </div>
              )}

              {/* 开仓模式 */}
              <div className='space-y-2'>
                <label className='mb-2 block text-sm font-medium'>开仓模式</label>
                <div className='flex items-center gap-4'>
                  <label className='flex cursor-pointer items-center gap-2'>
                    <Checkbox
                      checked={formData.first_open_type === 1}
                      onCheckedChange={checked => {
                        if (checked) updateForm('first_open_type', 1)
                      }}
                    />
                    <span className='text-sm'>当前市价</span>
                  </label>
                  <label className='flex cursor-pointer items-center gap-2'>
                    <Checkbox
                      checked={formData.first_open_type === 2}
                      onCheckedChange={checked => {
                        if (checked) updateForm('first_open_type', 2)
                      }}
                    />
                    <div className='flex items-center gap-1'>
                      <span className='text-sm'>区间委托</span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <CircleHelp className='text-muted-foreground h-4 w-4' />
                          </TooltipTrigger>
                          <TooltipContent className='max-w-[240px]'>
                            <p>
                              当交易员收益率在设定区间内时才会开仓，避免在高位或低位盲目追单，有效控制首单滑点和建仓风险。不论交易员在此之前补仓多少次，当条件达成时会一次性一起按比例复制总仓位。区间限价开仓只在交易员新开仓时生效，加仓时不生效。
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </label>
                </div>
              </div>

              {formData.first_open_type === 2 && (
                <div className='animate-in fade-in space-y-2'>
                  <label className='mb-2 block text-sm font-medium'>交易员收益区间 (%)</label>
                  <Input
                    value={formData.uplRatio}
                    onChange={e => updateForm('uplRatio', e.target.value)}
                    placeholder='eg. 5'
                  />
                  <p className='text-muted-foreground text-xs'>交易员收益率小于5%时开仓</p>
                </div>
              )}

              {/* 首单交易设置 */}
              <div className='space-y-2'>
                <label className='mb-2 block text-sm font-medium'>首单交易设置</label>
                <div className='flex flex-col gap-2'>
                  <label className='flex cursor-pointer items-center gap-2'>
                    <Checkbox
                      checked={formData.first_order_set === 1}
                      onCheckedChange={checked => {
                        if (checked) updateForm('first_order_set', 1)
                      }}
                    />
                    <span className='text-sm'>仅复制新开仓</span>
                  </label>
                  <label
                    className={`flex items-center gap-2 ${!allCopyApi ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                  >
                    <Checkbox
                      checked={formData.first_order_set === 2}
                      disabled={!allCopyApi}
                      onCheckedChange={checked => {
                        if (checked) updateForm('first_order_set', 2)
                      }}
                    />
                    <span className='text-sm'>复制当前持仓</span>
                  </label>
                  <label
                    className={`flex items-center gap-2 ${!allCopyApi ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                  >
                    <Checkbox
                      checked={formData.first_order_set === 3}
                      disabled={!allCopyApi}
                      onCheckedChange={checked => {
                        if (checked) updateForm('first_order_set', 3)
                      }}
                    />
                    <span className='text-sm'>仅复制当前亏损仓位</span>
                  </label>
                </div>
              </div>
            </TabsContent>

            <TabsContent value='advanced' className='mt-0 space-y-4'>
              <div className='flex items-center justify-between rounded-md border p-3'>
                <div className='text-sm font-medium'>反向跟单</div>
                <Switch
                  checked={toggles.posSide_set_visible}
                  onCheckedChange={(v: boolean) => updateToggle('posSide_set_visible', v)}
                />
              </div>

              <div className='flex items-center justify-between rounded-md border p-3'>
                <div className='text-sm font-medium'>极速跟单</div>
                <Switch
                  checked={toggles.fast_mode_visible}
                  onCheckedChange={(v: boolean) => updateToggle('fast_mode_visible', v)}
                />
              </div>

              <div className='rounded-md border p-3'>
                <div className='flex items-center justify-between'>
                  <div className='text-sm font-medium'>交易止盈止损</div>
                  <Switch
                    checked={toggles.trade_trigger_visible}
                    onCheckedChange={(v: boolean) => updateToggle('trade_trigger_visible', v)}
                  />
                </div>
                {toggles.trade_trigger_visible && (
                  <div className='animate-in fade-in mt-4 grid grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <label className='text-sm font-medium'>止盈百分比</label>
                      <Input
                        value={toggles.tp_trigger_px}
                        onChange={e => updateToggle('tp_trigger_px', e.target.value)}
                        placeholder='20'
                      />
                    </div>
                    <div className='space-y-2'>
                      <label className='text-sm font-medium'>止损百分比</label>
                      <Input
                        value={toggles.sl_trigger_px}
                        onChange={e => updateToggle('sl_trigger_px', e.target.value)}
                        placeholder='20'
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className='rounded-md border p-3'>
                <div className='flex items-center justify-between'>
                  <div className='text-sm font-medium'>多空开仓策略</div>
                  <Switch
                    checked={toggles.pos_visible}
                    onCheckedChange={(v: boolean) => updateToggle('pos_visible', v)}
                  />
                </div>
                {toggles.pos_visible && (
                  <div className='animate-in fade-in mt-4 flex items-center gap-4'>
                    <label className='flex cursor-pointer items-center gap-2'>
                      <Checkbox
                        checked={toggles.pos_value === 'long'}
                        onCheckedChange={checked => {
                          if (checked) updateToggle('pos_value', 'long')
                        }}
                      />
                      <span className='text-sm'>只跟多单</span>
                    </label>
                    <label className='flex cursor-pointer items-center gap-2'>
                      <Checkbox
                        checked={toggles.pos_value === 'short'}
                        onCheckedChange={checked => {
                          if (checked) updateToggle('pos_value', 'short')
                        }}
                      />
                      <span className='text-sm'>只跟空单</span>
                    </label>
                  </div>
                )}
              </div>

              <div className='rounded-md border p-3'>
                <div className='flex items-center justify-between'>
                  <div className='text-sm font-medium'>24h排行榜跟单</div>
                  <Switch
                    checked={toggles.vol24h_visible}
                    onCheckedChange={(v: boolean) => updateToggle('vol24h_visible', v)}
                  />
                </div>
                {toggles.vol24h_visible && (
                  <div className='animate-in fade-in mt-4 space-y-2'>
                    <label className='text-sm font-medium'>榜单排名</label>
                    <Input
                      value={toggles.vol24h_num}
                      onChange={e => updateToggle('vol24h_num', e.target.value)}
                      placeholder='eg. 20（只跟前20）'
                    />
                  </div>
                )}
              </div>

              <div className='rounded-md border p-3'>
                <div className='flex items-center justify-between'>
                  <div className='text-sm font-medium'>交易员本金监控</div>
                  <Switch
                    checked={toggles.balance_monitor_visible}
                    onCheckedChange={(v: boolean) => updateToggle('balance_monitor_visible', v)}
                  />
                </div>
                {toggles.balance_monitor_visible && (
                  <div className='animate-in fade-in mt-4 space-y-2'>
                    <label className='text-sm font-medium'>最低本金金额</label>
                    <Input
                      value={toggles.balance_monitor_value}
                      onChange={e => updateToggle('balance_monitor_value', e.target.value)}
                      placeholder='eg. 2000'
                    />
                  </div>
                )}
              </div>

              <div className='rounded-md border p-3'>
                <div className='flex items-center justify-between'>
                  <div className='text-sm font-medium'>跟单币种白名单</div>
                  <Switch
                    checked={toggles.white_list_visible}
                    onCheckedChange={(v: boolean) => updateToggle('white_list_visible', v)}
                  />
                </div>
                {toggles.white_list_visible && (
                  <div className='animate-in fade-in mt-4 space-y-2'>
                    <label className='text-sm font-medium'>输入允许跟单的币种</label>
                    <TagInput
                      tags={toggles.white_list}
                      onChange={tags => updateToggle('white_list', tags)}
                      placeholder='eg. BTC'
                    />
                  </div>
                )}
              </div>

              <div className='rounded-md border p-3'>
                <div className='flex items-center justify-between'>
                  <div className='text-sm font-medium'>跟单币种黑名单</div>
                  <Switch
                    checked={toggles.black_list_visible}
                    onCheckedChange={(val: boolean) => updateToggle('black_list_visible', val)}
                  />
                </div>
                {toggles.black_list_visible && (
                  <div className='animate-in fade-in mt-4 space-y-2'>
                    <label className='text-sm font-medium'>输入禁止跟单的币种</label>
                    <TagInput
                      tags={toggles.black_list}
                      onChange={tags => updateToggle('black_list', tags)}
                      placeholder='eg. DOGE'
                    />
                  </div>
                )}
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <SheetFooter className='bg-background/95 supports-[backdrop-filter]:bg-background/60 shrink-0 border-t p-4 backdrop-blur'>
          <Button variant='outline' onClick={onClose} disabled={isLoading}>
            取消
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              isLoading ||
              !formData.api_id ||
              !formData.investment ||
              (formData.lever_set === 2 && !formData.leverage)
            }
          >
            {isLoading ? '提交中...' : '立即跟单'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
