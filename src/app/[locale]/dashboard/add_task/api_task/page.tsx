'use client'

import * as React from 'react'
import { useState } from 'react'

import { Search, Unplug } from 'lucide-react'
import { motion } from 'motion/react'

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { MotionPreset } from '@/components/ui/motion-preset'
import { CopyTaskConfigSheet } from '../_components/copy-task-config-sheet'

type ApiTrader = {
  id: string
  name: string
  owner?: string
  balance: number
  platform: 'okx' | 'binance' | 'bitget' | 'gate'
}

// 模拟的“我的 API”数据
const MY_APIS: ApiTrader[] = [
  { id: 'my-1', name: '我的币安主账户', balance: 12500.5, platform: 'binance' },
  { id: 'my-2', name: 'OKX高频策略专用', balance: 3420.0, platform: 'okx' }
]

// 模拟的“其他用户 API”数据
const OTHER_APIS: ApiTrader[] = [
  { id: 'other-1', name: '加密大猩猩 (稳健)', owner: 'ape***@gmail.com', balance: 150000.0, platform: 'binance' },
  { id: 'other-2', name: '合约狙击手', owner: 'sni***@yahoo.com', balance: 8900.0, platform: 'okx' },
  { id: 'other-3', name: '量化搬砖机器人', owner: 'bot***@outlook.com', balance: 45000.0, platform: 'bitget' },
  { id: 'other-4', name: '现货囤币党', owner: 'hod***@gmail.com', balance: 210000.0, platform: 'gate' }
]

const featureActions = [
  {
    title: '工作室版本可联系客服了解详情',
    href: '#'
  }
]

export default function ApiTaskPage() {
  const [selectedTrader, setSelectedTrader] = useState<ApiTrader | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<ApiTrader[] | null>(null)

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults(null)

      return
    }

    const results = OTHER_APIS.filter(api => api.name.toLowerCase().includes(searchQuery.toLowerCase()))

    setSearchResults(results)
  }

  const handleCopy = (trader: ApiTrader) => {
    setSelectedTrader(trader)
  }

  return (
    <div className='flex h-full items-start justify-center overflow-y-auto p-4 lg:p-8'>
      <div className='w-full max-w-2xl space-y-6 pb-20'>
        {/* 顶部 Hero 卡片（复用 exchange_task 的样式，修改文案） */}
        <MotionPreset fade blur slide={{ direction: 'down' }} delay={0.6} transition={{ duration: 0.5 }}>
          <Card
            className={`overflow-hidden rounded-xl border-none bg-blue-600 bg-[url('https://cdn.shadcnstudio.com/ss-assets/blocks/marketing/download/image-09.png')] bg-cover bg-center p-0 pt-6 shadow-lg sm:pt-8 lg:h-[216px]`}
          >
            <CardContent className='flex gap-6 px-6 max-sm:flex-col max-sm:gap-2 max-sm:text-center sm:px-10'>
              <div className='space-y-3 pb-2 sm:flex-1 sm:pb-8'>
                <h2 className='flex items-center gap-2 text-xl font-bold tracking-tighter text-white max-sm:mx-auto max-sm:justify-center sm:text-xl md:text-xl'>
                  <Unplug className='h-6 w-6' /> API 跟单
                </h2>
                <p className='mb-3 text-sm text-white/70'>
                  提交您的交易所 API （只读权限）作为带单信号，可以使用跟单 API
                  进行跟单，0延迟！同时也可以搜索平台其他用户的 API 进行跟单。
                </p>
                <div className='flex items-center gap-3 max-sm:flex-wrap max-sm:justify-center'>
                  {featureActions.map(action => (
                    <a
                      key={action.title}
                      href={action.href}
                      target='_blank'
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
              <CardTitle>创建 API 跟单任务</CardTitle>
              <CardDescription>选择您自己的 API 账号，或者搜索其他用户的公开 API 进行跟单。</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue='my-api' className='w-full'>
                <TabsList className='mb-6 grid w-full grid-cols-2'>
                  <TabsTrigger value='my-api'>我的 API 信号</TabsTrigger>
                  <TabsTrigger value='search-api'>发现 API 信号</TabsTrigger>
                </TabsList>

                {/* 1. 我的 API 列表 */}
                <TabsContent value='my-api' className='space-y-4'>
                  <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                    {MY_APIS.map(api => (
                      <Card
                        key={api.id}
                        className='hover:border-primary/50 flex flex-col justify-between p-4 transition-colors'
                      >
                        <div className='mb-4 flex items-start gap-3'>
                          <div className='bg-muted/50 flex h-10 w-10 shrink-0 items-center justify-center rounded-full p-2'>
                            <img
                              src={`/exchanges/${api.platform}.png`}
                              alt={api.platform}
                              className='h-full w-full object-contain'
                            />
                          </div>
                          <div className='flex-1 overflow-hidden'>
                            <h3 className='truncate text-sm font-semibold'>{api.name}</h3>
                            {api.owner && (
                              <p className='text-muted-foreground mt-1 text-xs'>
                                创建者: <span className='text-foreground'>{api.owner}</span>
                              </p>
                            )}
                            <p className='text-muted-foreground mt-1 text-xs'>
                              余额:{' '}
                              <span className='text-foreground font-medium'>
                                ${api.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </span>
                            </p>
                          </div>
                        </div>
                        <Button className='w-full' disabled={api.platform !== 'okx'} onClick={() => handleCopy(api)}>
                          {api.platform !== 'okx' ? '暂不支持该平台' : '发起跟单'}
                        </Button>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                {/* 2. 发现其他 API (搜索) */}
                <TabsContent value='search-api' className='space-y-4'>
                  <div className='flex items-center gap-2'>
                    <div className='relative flex-1'>
                      <Search className='text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4' />
                      <Input
                        type='text'
                        placeholder='输入 API 名称或关键词搜索...'
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
                        请输入关键词并点击搜索，发现平台其他用户的 API
                      </div>
                    ) : searchResults.length > 0 ? (
                      searchResults.map(api => (
                        <Card
                          key={api.id}
                          className='hover:border-primary/50 flex flex-col justify-between p-4 transition-colors'
                        >
                          <div className='mb-4 flex items-start gap-3'>
                            <div className='bg-muted/50 flex h-10 w-10 shrink-0 items-center justify-center rounded-full p-2'>
                              <img
                                src={`/exchanges/${api.platform}.png`}
                                alt={api.platform}
                                className='h-full w-full object-contain'
                              />
                            </div>
                            <div className='flex-1 overflow-hidden'>
                              <h3 className='truncate text-sm font-semibold'>{api.name}</h3>
                              {api.owner && (
                                <p className='text-muted-foreground mt-1 text-xs'>
                                  拥有者: <span className='text-foreground'>{api.owner}</span>
                                </p>
                              )}
                              <p className='text-muted-foreground mt-1 text-xs'>
                                余额:{' '}
                                <span className='text-foreground font-medium'>
                                  ${api.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </span>
                              </p>
                            </div>
                          </div>
                          <Button className='w-full' disabled={api.platform !== 'okx'} onClick={() => handleCopy(api)}>
                            {api.platform !== 'okx' ? '暂不支持该平台' : '发起跟单'}
                          </Button>
                        </Card>
                      ))
                    ) : (
                      <div className='text-muted-foreground col-span-1 py-8 text-center text-sm sm:col-span-2'>
                        未找到相关 API 信息
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </MotionPreset>
      </div>

      <CopyTaskConfigSheet
        isOpen={!!selectedTrader}
        onClose={() => setSelectedTrader(null)}
        traderId={selectedTrader?.id || ''}
        traderName={selectedTrader?.name || ''}
        platform={selectedTrader?.platform || ''}
        traderPlatform={selectedTrader?.platform === 'binance' ? 5 : 6}
        roleType='api'
      />
    </div>
  )
}
