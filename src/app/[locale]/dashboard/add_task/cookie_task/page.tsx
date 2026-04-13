'use client'

import * as React from 'react'

import { Info, Cookie, Search } from 'lucide-react'
import Image from 'next/image'
import { motion } from 'motion/react'

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { MotionPreset } from '@/components/ui/motion-preset'
import { CopyTaskConfigSheet } from '../_components/copy-task-config-sheet'

import { cn } from '@/lib/utils'

type CookieTrader = {
  id: string
  name: string
  owner?: string
  status: 'active' | 'expired'
  platform: 'okx' | 'binance' | 'bitget' | 'gate'
}

// 模拟的“我的 Cookie”数据
const MY_COOKIES: CookieTrader[] = [
  { id: 'my-1', name: '我的币安主账号 Cookie', status: 'active', platform: 'binance' },
  { id: 'my-2', name: 'OKX高频策略 Cookie', status: 'expired', platform: 'okx' }
]

// 模拟的“其他用户 Cookie”数据
const OTHER_COOKIES: CookieTrader[] = [
  { id: 'other-1', name: '加密大猩猩 (稳健)', owner: 'ape***@gmail.com', status: 'active', platform: 'binance' },
  { id: 'other-2', name: '合约狙击手', owner: 'sni***@yahoo.com', status: 'active', platform: 'okx' },
  { id: 'other-3', name: '量化搬砖机器人', owner: 'bot***@outlook.com', status: 'active', platform: 'bitget' },
  { id: 'other-4', name: '现货囤币党', owner: 'hod***@gmail.com', status: 'active', platform: 'gate' }
]

const featureActions = [
  {
    title: '获取交易所 Cookie',
    href: '/dashboard/cookie'
  }
]

export default function CookieTaskPage() {
  const [exchange, setExchange] = React.useState<'okx' | 'binance' | ''>('okx')
  const [traderUrl, setTraderUrl] = React.useState('')
  const [uniqueName, setUniqueName] = React.useState('')
  const [traderType, setTraderType] = React.useState('')
  const [isConfigOpen, setIsConfigOpen] = React.useState(false)

  const [searchQuery, setSearchQuery] = React.useState('')
  const [searchResults, setSearchResults] = React.useState<CookieTrader[] | null>(null)
  const [selectedTrader, setSelectedTrader] = React.useState<CookieTrader | null>(null)

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults(null)

      return
    }

    const results = OTHER_COOKIES.filter(cookie => cookie.name.toLowerCase().includes(searchQuery.toLowerCase()))

    setSearchResults(results)
  }

  const handleCopy = (trader: CookieTrader) => {
    setSelectedTrader(trader)
  }

  // 获取当前交易所的我自己的 Cookie
  const currentMyCookie = MY_COOKIES.find(c => c.platform === exchange)

  React.useEffect(() => {
    if (currentMyCookie && currentMyCookie.status === 'active') {
      setSelectedTrader(currentMyCookie)
    } else {
      setSelectedTrader(null)
    }
  }, [currentMyCookie])

  // 解析交易员主页链接获取 uniqueName
  const handleParseUrl = () => {
    if (!traderUrl.trim()) {
      setUniqueName('')

      return
    }

    try {
      const url = new URL(traderUrl)

      // 简单模拟解析逻辑，实际可根据具体交易所的 URL 结构进行正则或路径拆分
      const segments = url.pathname.split('/').filter(Boolean)

      if (segments.length > 0) {
        // 取最后一段作为 uniqueName 示例
        setUniqueName(segments[segments.length - 1])
      } else {
        setUniqueName('')
      }
    } catch {
      setUniqueName('无效的链接格式')
    }
  }

  const handleExchangeChange = (value: 'okx' | 'binance') => {
    setExchange(value)
    setTraderType('') // 切换交易所时重置交易员类型
  }

  return (
    <div className='flex h-full items-start justify-center overflow-y-auto p-4 lg:p-8'>
      <div className='w-full max-w-2xl space-y-6 pb-20'>
        <MotionPreset fade blur slide={{ direction: 'down' }} delay={0.6} transition={{ duration: 0.5 }}>
          <Card
            className={`overflow-hidden rounded-xl border-none bg-blue-600 bg-[url('https://cdn.shadcnstudio.com/ss-assets/blocks/marketing/download/image-09.png')] bg-cover bg-center p-0 pt-6 shadow-lg sm:pt-8 lg:h-[216px]`}
          >
            <CardContent className='flex gap-6 px-6 max-sm:flex-col max-sm:gap-2 max-sm:text-center sm:px-10'>
              <div className='space-y-3 pb-2 sm:flex-1 sm:pb-8'>
                <h2 className='flex items-center gap-2 text-xl font-bold tracking-tighter text-white max-sm:mx-auto sm:text-xl md:text-xl'>
                  <Cookie className='h-6 w-6' />
                  Cookie 跟单
                </h2>
                <p className='mb-3 text-sm text-white/70'>
                  针对需要在交易所进行跟单后才能看到实时仓位变化的交易员，以及需要登录交易所账号才能看到持仓信息的交易员，使用交易所的
                  Cookie 可以实现0延迟跟单。
                </p>
                <div className='flex items-center gap-3 max-sm:flex-wrap max-sm:justify-center'>
                  {featureActions.map(action => (
                    <a
                      key={action.title}
                      href={action.href}
                      rel='noopener noreferrer'
                      className='flex h-8 items-center justify-center rounded-md bg-white px-3 text-xs font-medium text-black/90 sm:h-9 sm:text-sm'
                    >
                      {action.title}
                    </a>
                  ))}
                </div>
              </div>
              <div className='flex items-center justify-center pb-6 sm:my-auto sm:min-w-56 sm:pb-0'>
                {/* Logo 云布局：移动端一行四列，大屏两行两列错位 */}
                <div className='flex flex-row gap-3 sm:flex-row sm:gap-4'>
                  {/* 第一组：在移动端是前两个，大屏是第一列 */}
                  <div className='flex flex-row gap-3 sm:flex-col sm:gap-4'>
                    <motion.div
                      className='flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-blue-600 shadow-lg backdrop-blur-sm sm:h-14 sm:w-14'
                      animate={{ scale: [1, 1.08, 1], y: [0, -5, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <img
                        src='/exchanges/binance.png'
                        alt='binance'
                        className='object-over h-full w-full transition-all duration-300 hover:scale-110 sm:h-10 sm:w-10'
                      />
                    </motion.div>
                    <motion.div
                      className='flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-white shadow-lg backdrop-blur-sm sm:h-14 sm:w-14'
                      animate={{ scale: [1, 1.08, 1], y: [0, 5, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <img
                        src='/exchanges/okx.png'
                        alt='okx'
                        className='h-full w-full object-cover transition-all duration-300 hover:scale-110'
                      />
                    </motion.div>
                  </div>
                  {/* 第二组：在移动端是后两个，大屏是第二列（错位排布） */}
                  <div className='flex flex-row gap-3 sm:mt-8 sm:flex-col sm:gap-4'>
                    <motion.div
                      className='flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-white shadow-lg backdrop-blur-sm sm:h-14 sm:w-14'
                      animate={{ scale: [1, 1.08, 1], y: [0, 5, 0] }}
                      transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <img
                        src='/exchanges/bitget.png'
                        alt='bitget'
                        className='h-full w-full object-cover transition-all duration-300 hover:scale-110'
                      />
                    </motion.div>
                    <motion.div
                      className='flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-white shadow-lg backdrop-blur-sm sm:h-14 sm:w-14'
                      animate={{ scale: [1, 1.08, 1], y: [0, -5, 0] }}
                      transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <img
                        src='/exchanges/gate.png'
                        alt='gate'
                        className='h-full w-full object-cover transition-all duration-300 hover:scale-110'
                      />
                    </motion.div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </MotionPreset>

        <MotionPreset fade blur slide={{ direction: 'down' }} delay={0.8} transition={{ duration: 0.5 }}>
          <Card>
            <CardHeader>
              <CardTitle>创建交易所跟单任务</CardTitle>
              <CardDescription>配置您的跟单参数，以开始监听并复制目标交易员的策略。</CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
              {/* 0. 选择目标交易所 */}
              <div className='space-y-3'>
                <Label>选择目标交易所</Label>
                <div className='grid grid-cols-2 gap-3 sm:gap-4'>
                  <button
                    type='button'
                    onClick={() => handleExchangeChange('okx')}
                    className={cn(
                      'hover:bg-muted/50 flex h-16 items-center justify-center rounded-xl border-2 p-3 transition-all sm:h-20 sm:p-4',
                      exchange === 'okx'
                        ? 'border-primary bg-primary/5'
                        : 'bg-muted/30 hover:border-primary/20 border-transparent'
                    )}
                  >
                    <Image
                      src='/exchanges/okx/logo-light.svg'
                      alt='OKX'
                      width={100}
                      height={32}
                      className='h-5 w-auto object-contain sm:h-6 dark:hidden'
                    />
                    <Image
                      src='/exchanges/okx/logo-dark.png'
                      alt='OKX'
                      width={100}
                      height={32}
                      className='hidden h-6 w-auto object-contain sm:h-7 dark:block'
                    />
                  </button>

                  <button
                    type='button'
                    onClick={() => handleExchangeChange('binance')}
                    className={cn(
                      'hover:bg-muted/50 flex h-16 items-center justify-center rounded-xl border-2 p-3 transition-all sm:h-20 sm:p-4',
                      exchange === 'binance'
                        ? 'border-primary bg-primary/5'
                        : 'bg-muted/30 hover:border-primary/20 border-transparent'
                    )}
                  >
                    <Image
                      src='/exchanges/binance/logo.svg'
                      alt='Binance'
                      width={100}
                      height={32}
                      className='h-6 w-auto object-contain sm:h-7'
                    />
                  </button>
                </div>
              </div>

              {/* 交易所延迟提示信息 */}
              {/* {exchange === 'okx' && (
                <div className='flex items-start gap-2 rounded-xl bg-blue-600/10 p-3 text-sm text-blue-800/80 dark:text-blue-300/80'>
                  <Info className='mt-0.5 h-4 w-4 shrink-0' />
                  <div className='flex flex-col gap-1'>
                    <p className='mb-2 font-semibold'>欧易交易所 有效期提示：</p>
                    <p className='mt-1 text-xs'>
                      官方 Cookie 有效期为长期，建议每周更新一次，以免突然失效导致任务失败终止。
                    </p>
                  </div>
                </div>
              )}
              {exchange === 'binance' && (
                <div className='flex items-start gap-2 rounded-xl bg-blue-600/10 p-3 text-sm text-blue-800/80 dark:text-blue-300/80'>
                  <Info className='mt-0.5 h-4 w-4 shrink-0' />
                  <div className='flex flex-col gap-1'>
                    <p className='mb-2 font-semibold'>币安交易所 Cookie 有效期提示：</p>
                    <p className='mt-1 text-xs'>
                      官方 Cookie 有效期为5天，建议每4天更新一次，否则可能会导致任务失败终止。
                    </p>
                  </div>
                </div>
              )} */}

              {/* 1. 选择目标交易所的 Cookie */}
              <Tabs defaultValue='my-cookie' className='w-full pt-4'>
                <TabsList className='mb-6 grid w-full grid-cols-2'>
                  <TabsTrigger value='my-cookie'>我的 Cookie</TabsTrigger>
                  <TabsTrigger value='search-cookie'>发现 Cookie</TabsTrigger>
                </TabsList>

                {/* 1. 我的 Cookie */}
                <TabsContent value='my-cookie' className='space-y-4'>
                  {currentMyCookie ? (
                    <Card
                      className={cn(
                        'relative flex cursor-pointer flex-col justify-between p-4 transition-colors',
                        currentMyCookie.status === 'active'
                          ? 'hover:border-primary/50'
                          : 'cursor-not-allowed opacity-60',
                        selectedTrader?.id === currentMyCookie.id ? 'border-primary bg-primary/5' : ''
                      )}
                      onClick={() => {
                        if (currentMyCookie.status === 'active') {
                          handleCopy(currentMyCookie)
                        }
                      }}
                    >
                      <div className='flex items-start gap-3'>
                        <div className='bg-muted/50 flex h-10 w-10 shrink-0 items-center justify-center rounded-full p-2'>
                          <img
                            src={`/exchanges/${currentMyCookie.platform}.png`}
                            alt={currentMyCookie.platform}
                            className='h-full w-full object-contain'
                          />
                        </div>
                        <div className='flex-1 overflow-hidden'>
                          <h3 className='truncate text-sm font-semibold'>{currentMyCookie.name}</h3>
                          <p className='text-muted-foreground mt-1 text-xs'>
                            状态:{' '}
                            <span
                              className={cn(
                                'font-medium',
                                currentMyCookie.status === 'active' ? 'text-green-500' : 'text-destructive'
                              )}
                            >
                              {currentMyCookie.status === 'active' ? '有效' : '已失效'}
                            </span>
                          </p>
                        </div>
                      </div>
                    </Card>
                  ) : (
                    <div className='text-muted-foreground py-8 text-center text-sm'>
                      未找到您在 {exchange === 'okx' ? '欧易' : exchange === 'binance' ? '币安' : exchange} 的
                      Cookie，请先前往添加
                    </div>
                  )}
                </TabsContent>

                {/* 2. 发现其他 Cookie (搜索) */}
                <TabsContent value='search-cookie' className='space-y-4'>
                  <div className='flex items-center gap-2'>
                    <div className='relative flex-1'>
                      <Search className='text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4' />
                      <Input
                        type='text'
                        placeholder='输入 Cookie 名称或关键词搜索...'
                        className='pl-9'
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSearch()}
                      />
                    </div>
                    <Button onClick={handleSearch}>搜索</Button>
                  </div>

                  <div className='mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2'>
                    {searchResults === null ? (
                      <div className='text-muted-foreground col-span-1 py-8 text-center text-sm sm:col-span-2'>
                        请输入关键词并点击搜索，发现平台其他用户的 Cookie 信号
                      </div>
                    ) : searchResults.length > 0 ? (
                      searchResults.map(cookie => (
                        <Card
                          key={cookie.id}
                          className={cn(
                            'relative flex cursor-pointer flex-col justify-between p-4 transition-colors',
                            cookie.status === 'active' ? 'hover:border-primary/50' : 'cursor-not-allowed opacity-60',
                            selectedTrader?.id === cookie.id ? 'border-primary bg-primary/5' : ''
                          )}
                          onClick={() => {
                            if (cookie.status === 'active') {
                              handleCopy(cookie)
                            }
                          }}
                        >
                          <div className='flex items-start gap-3'>
                            <div className='bg-muted/50 flex h-10 w-10 shrink-0 items-center justify-center rounded-full p-2'>
                              <img
                                src={`/exchanges/${cookie.platform}.png`}
                                alt={cookie.platform}
                                className='h-full w-full object-contain'
                              />
                            </div>
                            <div className='flex-1 overflow-hidden'>
                              <h3 className='truncate text-sm font-semibold'>{cookie.name}</h3>
                              {cookie.owner && (
                                <p className='text-muted-foreground mt-1 text-xs'>
                                  创建者: <span className='text-foreground'>{cookie.owner}</span>
                                </p>
                              )}
                              <p className='text-muted-foreground mt-1 text-xs'>
                                状态:{' '}
                                <span
                                  className={cn(
                                    'font-medium',
                                    cookie.status === 'active' ? 'text-green-500' : 'text-destructive'
                                  )}
                                >
                                  {cookie.status === 'active' ? '有效' : '已失效'}
                                </span>
                              </p>
                            </div>
                          </div>
                        </Card>
                      ))
                    ) : (
                      <div className='text-muted-foreground col-span-1 py-8 text-center text-sm sm:col-span-2'>
                        未找到相关 Cookie 信号
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              {/* 2. 提交交易员主页地址 */}
              <div className='space-y-2'>
                <Label className='flex items-center gap-1'>
                  <span className='text-destructive'>*</span>
                  交易员主页链接
                </Label>
                <div className='flex gap-2'>
                  <Input
                    placeholder='请输入交易员主页链接 (例如 https://...)'
                    value={traderUrl}
                    onChange={e => setTraderUrl(e.target.value)}
                  />
                  <Button
                    onClick={handleParseUrl}
                    className='dark:bg-secondary dark:text-secondary-foreground dark:hover:bg-secondary/80 dark:border-border dark:border'
                    variant='secondary'
                  >
                    解析
                  </Button>
                </div>
              </div>

              {/* 解析出的 UniqueName */}
              {uniqueName && (
                <div className='space-y-2'>
                  <Label className='flex items-center gap-1'>
                    <span className='text-destructive'>*</span>
                    交易员 （ UID 或 带单项目 ID）
                  </Label>
                  <Input value={uniqueName} readOnly className='bg-muted' />
                </div>
              )}

              {/* 3. 选择交易员类型 */}
              {exchange && (
                <div className='space-y-2'>
                  <Label className='flex items-center gap-1'>
                    <span className='text-destructive'>*</span>
                    交易员类型
                  </Label>
                  <Select onValueChange={setTraderType} value={traderType}>
                    <SelectTrigger className='w-full'>
                      <SelectValue placeholder='请选择交易员类型' />
                    </SelectTrigger>
                    <SelectContent>
                      {exchange === 'okx' ? (
                        <>
                          <SelectItem value='contract'>合约带单</SelectItem>
                        </>
                      ) : (
                        <>
                          <SelectItem value='public'>带单项目</SelectItem>
                          <SelectItem value='hidden'>聪明钱</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
            <CardFooter className='flex justify-end gap-2'>
              <Button
                disabled={!exchange || !uniqueName || uniqueName === '无效的链接格式' || !traderType || !selectedTrader}
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
        onClose={() => {
          setIsConfigOpen(false)
        }}
        traderId={uniqueName}
        traderName={uniqueName}
        platform={exchange}
        roleType={traderType}
        cookieId={selectedTrader?.id}
      />
    </div>
  )
}
