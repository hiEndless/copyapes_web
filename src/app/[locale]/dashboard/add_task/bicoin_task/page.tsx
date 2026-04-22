'use client'

import * as React from 'react'

import { Info, Search, Loader2 } from 'lucide-react'

import { toast } from 'sonner'

import { getBicoinInfo, updateBicoinInfo, searchBicoinTrader } from '@/api/task'

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { MotionPreset } from '@/components/ui/motion-preset'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CopyTaskConfigSheet } from '../_components/copy-task-config-sheet'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const downloadPlatforms = [
  {
    name: 'App Store',
    icon: (
      <svg
        data-v-10649737=''
        xmlns='http://www.w3.org/2000/svg'
        width='24'
        height='24'
        viewBox='0 0 24 24'
        fill='none'
        className='h-4 w-4 sm:h-5 sm:w-5'
      >
        <path
          data-v-10649737=''
          d='M18.8456 19.5C18.0156 20.74 17.1356 21.95 15.7956 21.97C14.4556 22 14.0256 21.18 12.5056 21.18C10.9756 21.18 10.5056 21.95 9.23559 22C7.92559 22.05 6.93559 20.68 6.09559 19.47C4.38559 17 3.07559 12.45 4.83559 9.39C5.70559 7.87 7.26559 6.91 8.95559 6.88C10.2356 6.86 11.4556 7.75 12.2456 7.75C13.0256 7.75 14.5056 6.68 16.0556 6.84C16.7056 6.87 18.5256 7.1 19.6956 8.82C19.6056 8.88 17.5256 10.1 17.5456 12.63C17.5756 15.65 20.1956 16.66 20.2256 16.67C20.1956 16.74 19.8056 18.11 18.8456 19.5ZM13.1356 3.5C13.8656 2.67 15.0756 2.04 16.0756 2C16.2056 3.17 15.7356 4.35 15.0356 5.19C14.3456 6.04 13.2056 6.7 12.0856 6.61C11.9356 5.46 12.4956 4.26 13.1356 3.5Z'
          fill='black'
        ></path>
      </svg>
    ),
    alt: 'App Store',
    href: 'https://bcoin123.com',
    type: 'svg'
  },
  {
    name: 'Android',
    icon: (
      <svg
        data-v-10649737=''
        xmlns='http://www.w3.org/2000/svg'
        width='24'
        height='24'
        viewBox='0 0 24 24'
        fill='none'
        className='h-4 w-4 sm:h-5 sm:w-5'
      >
        <path
          data-v-10649737=''
          fillRule='evenodd'
          clipRule='evenodd'
          d='M18.447 4.10581C18.684 4.22446 18.8642 4.43234 18.948 4.68379C19.0319 4.93524 19.0124 5.20968 18.894 5.44681L17.72 7.79681C19.0421 8.71754 20.1219 9.94444 20.8671 11.3728C21.6124 12.8012 22.0011 14.3887 22 15.9998V16.9998C22 17.5302 21.7893 18.0389 21.4142 18.414C21.0391 18.7891 20.5304 18.9998 20 18.9998H4C3.46957 18.9998 2.96086 18.7891 2.58579 18.414C2.21072 18.0389 2 17.5302 2 16.9998V15.9998C1.99876 14.3885 2.38736 12.8008 3.13264 11.3723C3.87792 9.9437 4.95776 8.71664 6.28 7.79581L5.106 5.44681C5.04244 5.32893 5.0032 5.19949 4.99061 5.06616C4.97802 4.93283 4.99234 4.79833 5.03273 4.67064C5.07311 4.54295 5.13873 4.42467 5.22569 4.32282C5.31265 4.22098 5.41919 4.13763 5.53897 4.07774C5.65875 4.01785 5.78935 3.98263 5.923 3.97417C6.05666 3.9657 6.19065 3.98418 6.31703 4.02848C6.44341 4.07279 6.55961 4.14204 6.65872 4.2321C6.75783 4.32217 6.83784 4.43123 6.894 4.55281L8.028 6.81981C9.28181 6.27714 10.6338 5.99803 12 5.99981C13.411 5.99981 14.755 6.29181 15.972 6.81981L17.106 4.55281C17.2247 4.3158 17.4325 4.13558 17.684 4.05177C17.9354 3.96795 18.2099 3.98739 18.447 4.10581ZM7.5 11.9998C7.10218 11.9998 6.72065 12.1578 6.43934 12.4391C6.15804 12.7205 6 13.102 6 13.4998C6 13.8976 6.15804 14.2792 6.43934 14.5605C6.72065 14.8418 7.10218 14.9998 7.5 14.9998C7.89783 14.9998 8.27936 14.8418 8.56066 14.5605C8.84197 14.2792 9 13.8976 9 13.4998C9 13.102 8.84197 12.7205 8.56066 12.4391C8.27936 12.1578 7.89783 11.9998 7.5 11.9998ZM16.5 11.9998C16.1022 11.9998 15.7206 12.1578 15.4393 12.4391C15.158 12.7205 15 13.102 15 13.4998C15 13.8976 15.158 14.2792 15.4393 14.5605C15.7206 14.8418 16.1022 14.9998 16.5 14.9998C16.8978 14.9998 17.2794 14.8418 17.5607 14.5605C17.842 14.2792 18 13.8976 18 13.4998C18 13.102 17.842 12.7205 17.5607 12.4391C17.2794 12.1578 16.8978 11.9998 16.5 11.9998Z'
          fill='black'
        ></path>
      </svg>
    ),
    alt: 'Android',
    href: 'https://bcoin123.com',
    type: 'svg'
  }
]

export default function BicoinTaskPage() {
  const [phone, setPhone] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [isAccountSaved, setIsAccountSaved] = React.useState(false)

  const [searchQuery, setSearchQuery] = React.useState('')
  const [isSearching, setIsSearching] = React.useState(false)
  const [searchResults, setSearchResults] = React.useState<any[]>([])
  const [selectedTrader, setSelectedTrader] = React.useState<any>(null)

  const [traderType, setTraderType] = React.useState('1') // '1' = 操作记录, '2' = 合约仓位
  const [isConfigOpen, setIsConfigOpen] = React.useState(false)

  const handleSaveAccount = async () => {
    if (isAccountSaved) {
      setIsAccountSaved(false)
    } else {
      if (phone && password) {
        setIsSearching(true)

        try {
          const res = await updateBicoinInfo({ phone, password })

          if (res.code === 0) {
            toast.success('币coin账号保存成功')
            setIsAccountSaved(true)
          } else {
            toast.error(res.error || '保存失败')
          }
        } catch (error) {
          console.error(error)
          toast.error('请求失败')
        } finally {
          setIsSearching(false)
        }
      }
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    setIsSearching(true)

    try {
      const res = await searchBicoinTrader({ search_name: searchQuery })

      if (res.code === 0 && Array.isArray(res.data)) {
        setSearchResults(res.data)
      } else {
        toast.error(res.error || '未找到相关交易员')
        setSearchResults([])
      }
    } catch (error) {
      console.error(error)
      toast.error('搜索失败')
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  React.useEffect(() => {
    getBicoinInfo()
      .then(res => {
        if (res.code === 0 && res.data) {
          setPhone((res.data as any).phone || '')
          setPassword((res.data as any).password || '')
          setIsAccountSaved(true)
        }
      })
      .catch(() => {
        // 忽略错误，因为未配置时接口可能返回错误或空
      })
  }, [])

  return (
    <div className='flex h-full items-start justify-center overflow-y-auto p-4 lg:p-8'>
      <div className='flex w-full max-w-2xl flex-col gap-6 pb-20'>
        <MotionPreset fade blur slide={{ direction: 'down' }} delay={0.6} transition={{ duration: 0.5 }}>
          <Card
            className={`overflow-hidden rounded-xl border-none bg-blue-600 bg-[url('https://cdn.shadcnstudio.com/ss-assets/blocks/marketing/download/image-09.png')] bg-cover bg-center p-0 pt-6 shadow-lg sm:pt-8`}
          >
            <CardContent className='flex gap-6 px-6 max-sm:flex-col max-sm:gap-2 max-sm:text-center sm:px-10'>
              <div className='space-y-3 pb-2 sm:flex-1 sm:pb-8'>
                <img src='/exchanges/bicoin/logo-bicoin.png' alt='bicoin logo' className='h-5 w-auto max-sm:mx-auto' />
                <p className='mb-3 text-sm text-white/70'>
                  只要可以看到交易员操作记录或交易持仓就可以进行跟单！注意平台可能会对免费用户进行短时间封号，及时重新注册即可。
                </p>
                <div className='flex items-center gap-3 max-sm:flex-wrap max-sm:justify-center'>
                  {downloadPlatforms.map(platform => (
                    <a
                      key={platform.name}
                      href={platform.href}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='flex w-28 items-center gap-1.5 rounded-md bg-white px-2 py-1.5 sm:w-32 sm:px-2.5 sm:py-2'
                    >
                      {platform.type === 'image' ? (
                        <img
                          src={platform.icon as unknown as string}
                          alt={platform.alt}
                          className='h-4 w-4 sm:h-5 sm:w-5'
                        />
                      ) : (
                        platform.icon
                      )}
                      <div className='flex flex-col items-start'>
                        <p className='text-[9px] leading-3 text-black/70 sm:text-[10px]'>Download on the</p>
                        <p className='text-[11px] leading-4 font-medium text-black/92 sm:text-xs'>{platform.name}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
              <div className='mt-auto flex items-end justify-center max-sm:h-40 max-sm:overflow-hidden sm:min-w-56'>
                <img
                  src='/exchanges/bicoin/phone-bicoin.png'
                  alt='bicoin App Interface'
                  className='w-64 max-sm:translate-y-10 sm:w-56'
                />
              </div>
            </CardContent>
          </Card>
        </MotionPreset>

        <MotionPreset fade blur slide={{ direction: 'down' }} delay={0.8} transition={{ duration: 0.5 }}>
          <Card>
            <CardHeader>
              <CardTitle>创建币Coin跟单任务</CardTitle>
              <CardDescription>关联您的币Coin账号并选择目标交易员</CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
              {/* 延迟提示信息 */}
              <div className='flex items-start gap-2 rounded-xl bg-blue-600/10 p-3 text-sm text-blue-800/80 dark:text-blue-300/80'>
                <Info className='mt-0.5 h-4 w-4 shrink-0' />
                <div className='flex flex-col gap-1'>
                  <p className='font-semibold'>币Coin平台限制提示：</p>
                  <p className='mb-2 text-xs text-blue-700/80 dark:text-blue-300/80'>
                    此延迟由第三方数据平台和获取策略限制所导致，非跟单工具所导致！
                  </p>
                  <p className='text-xs'>
                    币coin的数据有缓存，所以不能做到绝对的秒级延迟。操作记录的跟单速度略快于合约仓位跟单，合约仓位的跟单稳定性高于操作记录跟单。如果交易员的操作记录中有现货交易，或者为买卖模式，则无法跟单，可联系客服处理。
                  </p>
                </div>
              </div>

              {/* 1. 账号关联 */}
              <div className='space-y-3'>
                <Label className='flex items-center gap-1'>
                  <span className='text-destructive'>*</span>
                  关联币coin账号
                </Label>
                <div className='flex flex-col items-end gap-3 sm:flex-row'>
                  <div className='flex w-full flex-col gap-3 sm:flex-1 sm:flex-row'>
                    <div className='flex-1 space-y-1'>
                      <Label className='text-muted-foreground hidden text-xs sm:block'>手机号</Label>
                      <Input
                        placeholder='请输入手机号'
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        disabled={isAccountSaved}
                      />
                    </div>
                    <div className='flex-1 space-y-1'>
                      <Label className='text-muted-foreground hidden text-xs sm:block'>密码</Label>
                      <Input
                        type='password'
                        placeholder='请输入密码'
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        disabled={isAccountSaved}
                      />
                    </div>
                  </div>
                  <Button
                    onClick={handleSaveAccount}
                    variant={isAccountSaved ? 'secondary' : 'default'}
                    className='w-full sm:w-auto'
                  >
                    {isAccountSaved ? '修改' : '确认保存'}
                  </Button>
                </div>
              </div>

              {/* 2. 搜索交易员 */}
              <div className='space-y-3'>
                <Label className='flex items-center gap-1'>
                  <span className='text-destructive'>*</span>
                  选择交易员
                </Label>
                <div className='flex gap-2'>
                  <Input
                    placeholder='输入交易员昵称'
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  />
                  <Button onClick={handleSearch} disabled={isSearching} className='shrink-0'>
                    {isSearching ? <Loader2 className='h-4 w-4 animate-spin' /> : <Search className='h-4 w-4' />}
                  </Button>
                </div>

                {/* 搜索结果列表 */}
                {searchResults.length > 0 && (
                  <div className='rounded-md border'>
                    {searchResults.map((trader, index) => (
                      <div
                        key={trader.leaderId}
                        onClick={() => setSelectedTrader(trader)}
                        className={cn(
                          'hover:bg-muted/50 flex cursor-pointer items-center justify-between p-2.5 transition-colors sm:px-3 sm:py-2.5',
                          index !== searchResults.length - 1 && 'border-b',
                          selectedTrader?.leaderId === trader.leaderId && 'bg-primary/5'
                        )}
                      >
                        {/* 左侧：头像与信息 (对应 slot="leader") */}
                        <div className='flex flex-1 items-center gap-2.5'>
                          <Avatar className='h-8 w-8 rounded-md sm:h-9 sm:w-9'>
                            <AvatarImage src={trader.img} />
                            <AvatarFallback className='rounded-md text-xs'>
                              {trader.leaderName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className='flex flex-col gap-0.5 overflow-hidden'>
                            <h6 className='truncate text-[13px] font-medium sm:text-sm'>{trader.leaderName}</h6>
                            <p className='text-muted-foreground hidden truncate text-[11px] sm:block'>
                              {trader.slogen || '暂无签名'}
                            </p>
                            <div className='flex items-center gap-2 sm:hidden'>
                              <p className='text-muted-foreground flex items-center text-[10px]'>
                                {trader.exchImage && (
                                  <img
                                    src={trader.exchImage}
                                    alt={trader.exchange}
                                    className='mr-1 h-3 w-3 object-contain'
                                  />
                                )}
                                {trader.exchange}
                              </p>
                              <Badge
                                variant='secondary'
                                className={cn(
                                  'h-3.5 px-1 py-0 text-[9px] font-normal',
                                  trader.status === 1
                                    ? 'bg-blue-50 text-blue-600 hover:bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400'
                                    : 'bg-muted text-muted-foreground hover:bg-muted'
                                )}
                              >
                                {trader.statusStr}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {/* 中间与右侧：资金、交易所与状态 (对应 slot="api" 和 slot="info") */}
                        <div className='flex items-center gap-3 sm:gap-6'>
                          {/* 资金 */}
                          <div className='flex w-16 flex-col items-end sm:items-start'>
                            <h6 className='text-[13px] font-medium text-[#31BD65] sm:text-sm'>${trader.balance}</h6>
                          </div>

                          {/* 交易所 */}
                          <div className='hidden w-16 flex-col items-start sm:flex'>
                            <p className='text-muted-foreground flex items-center text-[11px]'>
                              {trader.exchImage && (
                                <img
                                  src={trader.exchImage}
                                  alt={trader.exchange}
                                  className='mr-1 h-3.5 w-3.5 object-contain'
                                />
                              )}
                              {trader.exchange}
                            </p>
                          </div>

                          {/* 状态标签 */}
                          <div className='hidden sm:block'>
                            <Badge
                              variant='secondary'
                              className={cn(
                                'px-1.5 py-0 text-[10px] font-normal',
                                trader.status === 1
                                  ? 'bg-blue-50 text-blue-600 hover:bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400'
                                  : 'bg-muted text-muted-foreground hover:bg-muted'
                              )}
                            >
                              {trader.statusStr}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 3. 交易员类型 */}
              {selectedTrader && (
                <div className='space-y-3'>
                  <Label className='flex items-center gap-1'>
                    <span className='text-destructive'>*</span>
                    跟单数据源
                  </Label>
                  <Select value={traderType} onValueChange={setTraderType}>
                    <SelectTrigger>
                      <SelectValue placeholder='选择跟单数据源' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='1'>操作记录</SelectItem>
                      <SelectItem value='2'>合约仓位</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
            <CardFooter className='flex justify-end'>
              <Button
                disabled={!isAccountSaved || !selectedTrader || !traderType}
                onClick={() => setIsConfigOpen(true)}
              >
                创建跟单
              </Button>
            </CardFooter>
          </Card>
        </MotionPreset>
      </div>

      <CopyTaskConfigSheet
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        traderId={selectedTrader?.leaderId || null}
        traderName={selectedTrader?.leaderName || ''}
        platform={selectedTrader?.exchange?.toLowerCase() === 'binance' ? 'binance' : 'okx'}
        traderPlatform={3}
        roleType={traderType}
        initialBenchMark={selectedTrader?.balance || ''}
      />
    </div>
  )
}
