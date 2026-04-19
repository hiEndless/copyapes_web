'use client'

import { useState, useEffect } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

export interface GrabTaskConfigSheetProps {
  isOpen: boolean
  onClose: () => void
  traderId: string | null
  traderName?: string
  platform: 'binance' | 'okx' | ''
}

export function GrabTaskConfigSheet({
  isOpen,
  onClose,
  traderId,
  traderName,
  platform
}: GrabTaskConfigSheetProps) {
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
      // 关闭时重置状态
      setMsg('')
      setFollowType('1')
      setCostPerOrder('')
      setInvestAmount('')
      setErrors({})
    }
  }, [isOpen, traderId, platform])

  const fetchTraderData = async () => {
    setIsFetchingData(true)
    setMsg('')
    try {
      // 模拟 API 请求延迟
      await new Promise(resolve => setTimeout(resolve, 500))

      // 模拟返回数据，严格参考 Vue 项目结构
      // const exchangeId = platform === 'okx' ? 1 : 2;
      // const response = await http.post('/api/leader-info/', { uniqueName: traderId, exchange: exchangeId })
      
      const mockResponseData = {
        code: 0,
        data: {
          detail: {
            nicknameTranslate: traderName || traderId || '未知交易员',
            avatarUrl: `/exchanges/${platform}.png`, // 模拟，如果是 binance 默认头像，Vue里会替换
            descTranslate: '专业的加密货币量化交易团队，主打稳健收益。'
          },
          performance: {
            roi: '125.4',
            pnl: '5200.50'
          },
          limit_info: platform === 'okx' ? {
            // OKX 的 limit_info
            fixRatioMinCopyAmount: '100',
            fixRatioMaxCopyAmount: '100000'
          } : {
            // Binance 的 limit_info
            minCostPerOrderAmount: '10',
            maxCostPerOrderAmount: '1000',
            fixAmtMinCopyAmount: '100',
            fixAmtMaxCopyAmount: '50000',
            fixRatioMinCopyAmount: '200',
            fixRatioMaxCopyAmount: '100000'
          }
        },
        msg: ''
      }

      if (mockResponseData.code === 0) {
        const data = mockResponseData.data
        setNickname(data.detail.nicknameTranslate)
        
        let avatar = data.detail.avatarUrl
        if (avatar === 'https://bin.bnbstatic.com/static/images/copytrading/default-avatar.png') {
          avatar = '/images/head/default-avatar.png'
        }
        setAvatarUrl(avatar)
        
        setDesc(data.detail.descTranslate)
        setRoi(data.performance.roi)
        setPnl(data.performance.pnl)

        if (platform === 'okx') {
          setFixRatioMinCopyAmount(data.limit_info.fixRatioMinCopyAmount)
          setRatioDec(`最低${data.limit_info.fixRatioMinCopyAmount}`)
        } else {
          setMinCostPerOrderAmount((data.limit_info as any).minCostPerOrderAmount)
          setMaxCostPerOrderAmount((data.limit_info as any).maxCostPerOrderAmount)
          setFixAmtMinCopyAmount((data.limit_info as any).fixAmtMinCopyAmount)
          setFixAmtMaxCopyAmount((data.limit_info as any).fixAmtMaxCopyAmount)
          setFixRatioMinCopyAmount(data.limit_info.fixRatioMinCopyAmount)
          setFixRatioMaxCopyAmount(data.limit_info.fixRatioMaxCopyAmount)

          setRatioDec(`${data.limit_info.fixRatioMinCopyAmount}~${data.limit_info.fixRatioMaxCopyAmount}`)
          setAmtDec(`${(data.limit_info as any).fixAmtMinCopyAmount}~${(data.limit_info as any).fixAmtMaxCopyAmount}`)
          setPerOrderDec(`${(data.limit_info as any).minCostPerOrderAmount}~${(data.limit_info as any).maxCostPerOrderAmount}`)
        }
      } else {
        setMsg(mockResponseData.msg || '获取数据失败')
      }
    } catch (e) {
      setMsg('网络请求失败，请稍后重试')
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
      newErrors.investAmount = '请输入跟单金额！'
      isValid = false
    } else {
      const investNum = parseFloat(investAmount)
      if (isNaN(investNum) || !isFinite(investNum)) {
        newErrors.investAmount = '请输入有效的数字！'
        isValid = false
      } else if (!/^\d+(\.\d+)?$/.test(investAmount)) {
        newErrors.investAmount = '请输入标准的数字格式，不要包含非数字字符'
        isValid = false
      } else {
        if (platform === 'binance' && followType === '2') {
          // 定额跟单 (Binance)
          if (investNum < parseFloat(fixAmtMinCopyAmount)) {
            newErrors.investAmount = `输入数值必须大于等于${fixAmtMinCopyAmount}`
            isValid = false
          }
        } else {
          // 定比跟单 (OKX 或 Binance)
          if (investNum < parseFloat(fixRatioMinCopyAmount)) {
            newErrors.investAmount = `输入数值必须大于等于${fixRatioMinCopyAmount}`
            isValid = false
          }
        }
      }
    }

    // 验证 costPerOrder (每笔跟单金额) - 仅币安定额跟单
    if (platform === 'binance' && followType === '2') {
      if (!costPerOrder) {
        newErrors.costPerOrder = '请输入每笔跟单金额！'
        isValid = false
      } else {
        const costNum = parseFloat(costPerOrder)
        if (isNaN(costNum) || !isFinite(costNum)) {
          newErrors.costPerOrder = '请输入有效的数字！'
          isValid = false
        } else if (!/^\d+(\.\d+)?$/.test(costPerOrder)) {
          newErrors.costPerOrder = '请输入标准的数字格式，不要包含非数字字符'
          isValid = false
        } else if (costNum < parseFloat(minCostPerOrderAmount)) {
          newErrors.costPerOrder = `输入数值必须大于等于${minCostPerOrderAmount}`
          isValid = false
        }
      }
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsLoading(true)
    try {
      const data = {
        exchange: platform === 'okx' ? 1 : 2,
        uniqueName: traderId,
        nickname: nickname,
        costPerOrder: platform === 'binance' && followType === '2' ? parseFloat(costPerOrder) : 0,
        investAmount: parseFloat(investAmount),
        ...(platform === 'binance' && { follow_type: followType })
      }

      console.log('Submitting Grab Task:', data)
      // await http.post('/api/grabtask/?token=' + localStorage.getItem("token"), data)
      await new Promise(resolve => setTimeout(resolve, 1000))
      onClose()
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={open => !open && onClose()}>
      <SheetContent side='right' className='flex flex-col p-0 sm:max-w-lg'>
        <SheetHeader className='border-b px-6 py-4'>
          <SheetTitle>确认抢位信息</SheetTitle>
          <SheetDescription>
            系统将以秒级频率自动为您抢位，全程通常不超过1秒。一般2-3天内就可以抢到，具体时间取决于带单员空位情况。
          </SheetDescription>
        </SheetHeader>

        <div className='flex-1 overflow-y-auto px-6 py-6'>
          {msg && (
            <div className='mb-6 rounded-md bg-destructive/10 p-3 text-sm text-destructive'>
              {msg}
            </div>
          )}

          {isFetchingData ? (
            <div className='flex h-40 items-center justify-center text-sm text-muted-foreground'>
              加载交易员信息中...
            </div>
          ) : (
            <div className='space-y-6'>
              {/* 交易员信息卡片 */}
              {nickname && (
                <div className='rounded-xl border bg-card p-4 shadow-sm'>
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
                          平台: {platform === 'okx' ? '欧易 OKX' : platform === 'binance' ? '币安 Binance' : platform}
                        </span>
                      </div>
                      <p className='text-sm text-muted-foreground mt-2 line-clamp-2'>
                        {desc || '暂无简介'}
                      </p>
                    </div>
                  </div>
                  
                  <div className='mt-4 grid grid-cols-2 gap-2 rounded-lg border bg-muted/30 p-3 text-center'>
                    <div className='flex flex-col items-center'>
                      <p className='text-xs text-muted-foreground mb-1'>7天盈亏(USDT)</p>
                      <p className={`font-bold text-lg ${parseFloat(pnl) >= 0 ? 'text-[#31bd65]' : 'text-[#eb4b6d]'}`}>
                        {pnl || '-'}
                      </p>
                    </div>
                    <div className='flex flex-col items-center'>
                      <p className='text-xs text-muted-foreground mb-1'>7天收益率</p>
                      <p className={`font-bold text-lg ${parseFloat(roi) >= 0 ? 'text-[#31bd65]' : 'text-[#eb4b6d]'}`}>
                        {roi ? `${roi}%` : '-'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* 合约跟单设置 */}
              <div className='space-y-4 pt-2'>
                <h4 className='font-semibold'>合约跟单设置</h4>
                
                {/* 币安独有：选择定额或定比 */}
                {platform === 'binance' && (
                  <Tabs value={followType} onValueChange={setFollowType} className='w-full'>
                    <TabsList className='grid w-full grid-cols-2'>
                      <TabsTrigger value='1'>定比跟单</TabsTrigger>
                      <TabsTrigger value='2'>定额跟单</TabsTrigger>
                    </TabsList>
                  </Tabs>
                )}

                <div className='rounded-lg bg-muted/50 p-4 space-y-4 text-sm'>
                  {platform === 'binance' && followType === '1' && (
                    <p className='text-muted-foreground'>* 订单将按比例开仓（您的可用保证金余额 / 带单员的可用保证金余额）。</p>
                  )}
                  {platform === 'binance' && followType === '2' && (
                    <p className='text-muted-foreground'>* 每笔订单均使用固定保证金（每单跟单保证金）开仓。</p>
                  )}
                  {platform === 'okx' && (
                    <p className='text-muted-foreground'>跟单金额：专门用于跟随该交易员的总投资金额，将从您的交易账户中隔离占用。</p>
                  )}

                  <div className='space-y-4 pt-2'>
                    {/* 币安 定额跟单：每笔跟单金额 */}
                    {platform === 'binance' && followType === '2' && (
                      <div className='space-y-2'>
                        <Label>每笔跟单金额 (USDT)</Label>
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
                      <Label>跟单金额 (USDT)</Label>
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

        <SheetFooter className='border-t p-6'>
          <Button variant='outline' onClick={onClose} disabled={isLoading}>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading || !!msg || !nickname}>
            {isLoading ? '抢位提交中...' : '开始抢位'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}