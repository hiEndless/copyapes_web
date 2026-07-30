'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { CircleHelp } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createGrabTask, getLeaderInfo } from '@/api/task'
import { TOUR_ANCHORS, tourAnchor } from '@/features/tour/anchors'
import { tourSafeDialogProps } from '@/features/tour/dialog-guard'
import { TOUR_IDS } from '@/features/tour/registry'
import { useTour } from '@/features/tour/tour-provider'

export interface GrabTaskConfigSheetProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  traderId: string | null
  traderName?: string
  platform: 'binance' | 'okx' | ''
}

const toStr = (value: string | number | undefined | null) =>
  value === undefined || value === null ? '' : String(value)

export function GrabTaskConfigSheet({
  isOpen,
  onClose,
  onSuccess,
  traderId,
  traderName,
  platform
}: GrabTaskConfigSheetProps) {
  const t = useTranslations('DashboardGrab')
  const { startTourById } = useTour()
  const [isLoading, setIsLoading] = useState(false)
  const [isFetchingData, setIsFetchingData] = useState(false)

  // 交易员详情数据 (参考 Vue 项目的数据结构)
  const [nickname, setNickname] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [desc, setDesc] = useState('')
  const [roi, setRoi] = useState('')
  const [pnl, setPnl] = useState('')
  const [msg, setMsg] = useState('')

  // 抢位参数限制数据
  const [minCostPerOrderAmount, setMinCostPerOrderAmount] = useState('')
  const [maxCostPerOrderAmount, setMaxCostPerOrderAmount] = useState('')
  const [fixAmtMinCopyAmount, setFixAmtMinCopyAmount] = useState('')
  const [fixAmtMaxCopyAmount, setFixAmtMaxCopyAmount] = useState('')
  const [fixRatioMinCopyAmount, setFixRatioMinCopyAmount] = useState('')
  const [fixRatioMaxCopyAmount, setFixRatioMaxCopyAmount] = useState('')

  // 表单数据
  const [followType, setFollowType] = useState('1') // '1': 定比跟单, '2': 定额跟单 (币安专用)
  const [costPerOrder, setCostPerOrder] = useState('')
  const [investAmount, setInvestAmount] = useState('')

  // Placeholder 提示
  const [ratioDec, setRatioDec] = useState('0')
  const [perOrderDec, setPerOrderDec] = useState('0')
  const [amtDec, setAmtDec] = useState('0')

  // 表单验证错误
  const [errors, setErrors] = useState<{ costPerOrder?: string; investAmount?: string }>({})

  // 模拟请求接口获取交易员信息
  useEffect(() => {
    if (isOpen && traderId && platform) {
      fetchTraderData()
    } else if (!isOpen) {
      setMsg('')
      setNickname('')
      setAvatarUrl('')
      setDesc('')
      setRoi('')
      setPnl('')
      setFollowType('1')
      setCostPerOrder('')
      setInvestAmount('')
      setErrors({})
    }
  }, [isOpen, traderId, platform])

  const fetchTraderData = async () => {
    if (!traderId || !platform) return

    setIsFetchingData(true)
    setMsg('')
    try {
      const exchange = platform === 'okx' ? 1 : 2
      const res = await getLeaderInfo({ uniqueName: traderId, exchange })

      if (res.code === 0 && res.data) {
        const data = res.data
        setNickname(data.detail?.nicknameTranslate || traderName || traderId || t('config.unknownTrader'))

        let avatar = data.detail?.avatarUrl || `/exchanges/${platform}.png`
        if (avatar === 'https://bin.bnbstatic.com/static/images/copytrading/default-avatar.png') {
          avatar = '/images/head/default-avatar.png'
        }
        setAvatarUrl(avatar)

        setDesc(data.detail?.descTranslate || '')
        setRoi(toStr(data.performance?.roi))
        setPnl(toStr(data.performance?.pnl))

        const limit = data.limit_info || {}
        if (platform === 'okx') {
          const minRatio = toStr(limit.fixRatioMinCopyAmount)
          setFixRatioMinCopyAmount(minRatio)
          setRatioDec(t('config.minPlaceholder', { min: minRatio }))
        } else {
          const minCost = toStr(limit.minCostPerOrderAmount)
          const maxCost = toStr(limit.maxCostPerOrderAmount)
          const minAmt = toStr(limit.fixAmtMinCopyAmount)
          const maxAmt = toStr(limit.fixAmtMaxCopyAmount)
          const minRatio = toStr(limit.fixRatioMinCopyAmount)
          const maxRatio = toStr(limit.fixRatioMaxCopyAmount)

          setMinCostPerOrderAmount(minCost)
          setMaxCostPerOrderAmount(maxCost)
          setFixAmtMinCopyAmount(minAmt)
          setFixAmtMaxCopyAmount(maxAmt)
          setFixRatioMinCopyAmount(minRatio)
          setFixRatioMaxCopyAmount(maxRatio)

          setRatioDec(`${minRatio}~${maxRatio}`)
          setAmtDec(`${minAmt}~${maxAmt}`)
          setPerOrderDec(`${minCost}~${maxCost}`)
        }
      } else {
        setMsg(res.msg || res.error || t('config.fetchFailed'))
      }
    } catch (e) {
      setMsg(t('config.networkFailed'))
      console.error(e)
    } finally {
      setIsFetchingData(false)
    }
  }

  // 表单验证逻辑 (参考 Vue 验证规则)
  const validateForm = () => {
    let isValid = true
    const newErrors: { costPerOrder?: string; investAmount?: string } = {}

    // 验证 investAmount (跟单金额)
    if (!investAmount) {
      newErrors.investAmount = t('config.errors.investRequired')
      isValid = false
    } else {
      const investNum = parseFloat(investAmount)
      if (isNaN(investNum) || !isFinite(investNum)) {
        newErrors.investAmount = t('config.errors.invalidNumber')
        isValid = false
      } else if (!/^\d+(\.\d+)?$/.test(investAmount)) {
        newErrors.investAmount = t('config.errors.invalidFormat')
        isValid = false
      } else {
        if (platform === 'binance' && followType === '2') {
          // 定额跟单 (Binance)
          if (investNum < parseFloat(fixAmtMinCopyAmount)) {
            newErrors.investAmount = t('config.errors.minValue', { min: fixAmtMinCopyAmount })
            isValid = false
          }
        } else {
          // 定比跟单 (OKX 或 Binance)
          if (investNum < parseFloat(fixRatioMinCopyAmount)) {
            newErrors.investAmount = t('config.errors.minValue', { min: fixRatioMinCopyAmount })
            isValid = false
          }
        }
      }
    }

    // 验证 costPerOrder (每笔跟单金额) - 仅币安定额跟单
    if (platform === 'binance' && followType === '2') {
      if (!costPerOrder) {
        newErrors.costPerOrder = t('config.errors.costRequired')
        isValid = false
      } else {
        const costNum = parseFloat(costPerOrder)
        if (isNaN(costNum) || !isFinite(costNum)) {
          newErrors.costPerOrder = t('config.errors.invalidNumber')
          isValid = false
        } else if (!/^\d+(\.\d+)?$/.test(costPerOrder)) {
          newErrors.costPerOrder = t('config.errors.invalidFormat')
          isValid = false
        } else if (costNum < parseFloat(minCostPerOrderAmount)) {
          newErrors.costPerOrder = t('config.errors.minValue', { min: minCostPerOrderAmount })
          isValid = false
        }
      }
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = async () => {
    if (!validateForm() || !traderId || !platform) return

    setIsLoading(true)
    try {
      const res = await createGrabTask({
        exchange: platform === 'okx' ? 1 : 2,
        uniqueName: traderId,
        nickname: nickname || traderName || traderId,
        follow_type: platform === 'binance' ? parseInt(followType, 10) : 1,
        costPerOrder: platform === 'binance' && followType === '2' ? parseFloat(costPerOrder) : 0,
        investAmount: parseFloat(investAmount)
      })

      if (res.code === 0) {
        toast.success(t('toast.createSuccess'))
        onSuccess?.()
        onClose()
      } else {
        toast.error(res.error || res.msg || t('toast.createFailed'))
      }
    } catch (e) {
      console.error(e)
      toast.error(t('toast.requestFailed'))
    } finally {
      setIsLoading(false)
    }
  }

  const platformName =
    platform === 'okx'
      ? t('config.platformOkx')
      : platform === 'binance'
        ? t('config.platformBinance')
        : platform

  return (
    <Sheet open={isOpen} onOpenChange={open => !open && onClose()}>
      <SheetContent side='right' className='flex flex-col p-0 sm:max-w-lg' {...tourSafeDialogProps}>
        <SheetHeader className='border-b px-6 py-4'>
          <div className='flex items-start justify-between gap-2 pr-6'>
            <div className='min-w-0'>
              <SheetTitle>{t('config.title')}</SheetTitle>
              <SheetDescription>{t('config.desc')}</SheetDescription>
            </div>
            <Button
              type='button'
              variant='ghost'
              size='sm'
              className='h-8 shrink-0 gap-1.5 px-2 text-xs font-semibold'
              onClick={() => startTourById(TOUR_IDS.grabConfigGuide)}
            >
              <CircleHelp className='size-4' />
              {t('config.guide')}
            </Button>
          </div>
        </SheetHeader>

        <div className='flex-1 overflow-y-auto px-6 py-6'>
          {msg && (
            <div className='mb-6 rounded-md bg-destructive/10 p-3 text-sm text-destructive'>
              {msg}
            </div>
          )}

          {isFetchingData ? (
            <div className='flex h-40 items-center justify-center text-sm text-muted-foreground'>
              {t('config.loading')}
            </div>
          ) : (
            <div className='space-y-6'>
              {/* 交易员信息卡片 */}
              {nickname && (
                <div className='rounded-xl border bg-card p-4 shadow-sm' {...tourAnchor(TOUR_ANCHORS.grabTraderInfo)}>
                  <div className='flex items-start gap-4'>
                    <div className='h-16 w-16 shrink-0 overflow-hidden rounded-xl border bg-muted shadow-sm'>
                      <img
                        src={avatarUrl}
                        alt={nickname}
                        className='h-full w-full object-cover'
                      />
                    </div>
                    <div className='flex-1 space-y-1'>
                      <h3 className='font-semibold text-lg'>{nickname}</h3>
                      <div className='flex items-center gap-3 text-xs text-muted-foreground'>
                        <span className='flex items-center gap-1'>
                          <span className='inline-block h-2 w-2 rounded-full bg-green-500'></span>
                          {t('config.platform', { name: platformName })}
                        </span>
                      </div>
                      <p className='text-sm text-muted-foreground mt-2 line-clamp-2'>
                        {desc || t('config.noDesc')}
                      </p>
                    </div>
                  </div>
                  
                  <div className='mt-4 grid grid-cols-2 gap-2 rounded-lg border bg-muted/30 p-3 text-center'>
                    <div className='flex flex-col items-center'>
                      <p className='text-xs text-muted-foreground mb-1'>{t('config.pnl7d')}</p>
                      <p className={`font-bold text-lg ${parseFloat(pnl) >= 0 ? 'text-[#31bd65]' : 'text-[#eb4b6d]'}`}>
                        {pnl || '-'}
                      </p>
                    </div>
                    <div className='flex flex-col items-center'>
                      <p className='text-xs text-muted-foreground mb-1'>{t('config.roi7d')}</p>
                      <p className={`font-bold text-lg ${parseFloat(roi) >= 0 ? 'text-[#31bd65]' : 'text-[#eb4b6d]'}`}>
                        {roi ? `${roi}%` : '-'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* 合约跟单设置 */}
              <div className='space-y-4 pt-2' {...tourAnchor(TOUR_ANCHORS.grabAmount)}>
                <h4 className='font-semibold'>{t('config.contractSettings')}</h4>
                
                {/* 币安独有：选择定额或定比 */}
                {platform === 'binance' && (
                  <Tabs value={followType} onValueChange={setFollowType} className='w-full'>
                    <TabsList className='grid w-full grid-cols-2'>
                      <TabsTrigger value='1'>{t('config.ratioFollow')}</TabsTrigger>
                      <TabsTrigger value='2'>{t('config.fixedFollow')}</TabsTrigger>
                    </TabsList>
                  </Tabs>
                )}

                <div className='rounded-lg bg-muted/50 p-4 space-y-4 text-sm'>
                  {platform === 'binance' && followType === '1' && (
                    <p className='text-muted-foreground'>{t('config.ratioHint')}</p>
                  )}
                  {platform === 'binance' && followType === '2' && (
                    <p className='text-muted-foreground'>{t('config.fixedHint')}</p>
                  )}
                  {platform === 'okx' && (
                    <p className='text-muted-foreground'>{t('config.okxHint')}</p>
                  )}

                  <div className='space-y-4 pt-2'>
                    {/* 币安 定额跟单：每笔跟单金额 */}
                    {platform === 'binance' && followType === '2' && (
                      <div className='space-y-2'>
                        <Label>{t('config.costPerOrder')}</Label>
                        <Input 
                          placeholder={perOrderDec}
                          value={costPerOrder}
                          onChange={(e) => setCostPerOrder(e.target.value)}
                          className={errors.costPerOrder ? 'border-destructive' : ''}
                        />
                        {errors.costPerOrder && <p className='text-xs text-destructive'>{errors.costPerOrder}</p>}
                      </div>
                    )}

                    {/* 跟单金额 */}
                    <div className='space-y-2'>
                      <Label>{t('config.investAmount')}</Label>
                      <Input 
                        placeholder={platform === 'binance' && followType === '2' ? amtDec : ratioDec}
                        value={investAmount}
                        onChange={(e) => setInvestAmount(e.target.value)}
                        className={errors.investAmount ? 'border-destructive' : ''}
                      />
                      {errors.investAmount && <p className='text-xs text-destructive'>{errors.investAmount}</p>}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>

        <SheetFooter className='border-t p-6' {...tourAnchor(TOUR_ANCHORS.grabStart)}>
          <Button variant='outline' onClick={onClose} disabled={isLoading}>
            {t('config.cancel')}
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading || !!msg || !nickname}>
            {isLoading ? t('config.submitting') : t('config.start')}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
