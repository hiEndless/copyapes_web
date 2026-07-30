'use client'

import * as React from 'react'
import { useState, useEffect } from 'react'

import { Search, Unplug } from 'lucide-react'
import { motion } from 'motion/react'
import { useTranslations } from 'next-intl'

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MotionPreset } from '@/components/ui/motion-preset'
import { TOUR_ANCHORS, tourAnchor } from '@/features/tour/anchors'
import { searchApi } from '@/api/apiadd'
import { getApiOptions } from '@/api/task'
import { CopyTaskConfigSheet } from '../_components/copy-task-config-sheet'

type ApiTrader = {
  id: string
  name: string
  owner?: string
  balance: number
  platform: 'okx' | 'binance' | 'bitget' | 'gate' | 'weex'
  isDemo?: boolean
}

export default function ApiTaskPage() {
  const t = useTranslations('DashboardApiTask')
  const [selectedTrader, setSelectedTrader] = useState<ApiTrader | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<ApiTrader[] | null>(null)
  const [myApis, setMyApis] = useState<ApiTrader[]>([])
  const [isLoadingMyApis, setIsLoadingMyApis] = useState(false)

  useEffect(() => {
    fetchMyApis()
  }, [])

  const fetchMyApis = async () => {
    setIsLoadingMyApis(true)

    try {
      const res = await getApiOptions()

      if (res.code === 0 && Array.isArray(res.data)) {
        // 只筛选出只读 API (is_readonly === 1)
        const readonlyApis = res.data.filter((api: any) => api.is_readonly === true)

        const formattedApis: ApiTrader[] = readonlyApis.map((c: any) => {
          const p = String(c.exchange ?? c.platform)
          let platform: ApiTrader['platform'] = 'okx'

          if (p === '1') platform = 'okx'
          if (p === '2') platform = 'binance'
          if (p === '3') platform = 'gate'
          if (p === '4') platform = 'bitget'
          if (p === '5') platform = 'weex'

          return {
            id: String(c.id), // 注意：如果是自己的API，通常使用 id 或者 api_id
            name: c.name || c.api_name,
            owner: c.username || t('list.meFallback'),
            balance: c.usdt || 0,
            platform,
            isDemo: String(c.flag) === '1'
          }
        })

        setMyApis(formattedApis)
      }
    } catch (error) {
      console.error('Failed to fetch my apis', error)
    } finally {
      setIsLoadingMyApis(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults(null)

      return
    }

    try {
      const res = await searchApi(searchQuery)

      if (res.code === 0 && Array.isArray(res.data)) {
        const results: ApiTrader[] = res.data.map((c: any) => {
          const p = String(c.exchange)
          let platform: ApiTrader['platform'] = 'okx'

          if (p === '1') platform = 'okx'
          if (p === '2') platform = 'binance'
          if (p === '3') platform = 'gate'
          if (p === '4') platform = 'bitget'
          if (p === '5') platform = 'weex'

          return {
            id: String(c.api_id),
            name: c.api_name,
            owner: c.username || t('list.anonymousFallback'),
            balance: c.usdt || 0,
            platform,
            isDemo: String(c.flag) === '1'
          }
        })

        setSearchResults(results)
      } else {
        setSearchResults([])
      }
    } catch (error) {
      console.error('Failed to search apis', error)
      setSearchResults([])
    }
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
                  <Unplug className='h-6 w-6' /> {t('hero.title')}
                </h2>
                <p className='mb-3 text-sm text-white/70'>{t('hero.subtitle')}</p>
                <div className='flex items-center gap-3 max-sm:flex-wrap max-sm:justify-center'>
                  <a
                    href='#'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='flex h-8 items-center justify-center rounded-md bg-white px-3 text-xs font-medium text-black/90 sm:h-9 sm:text-sm'
                  >
                    {t('hero.contactSupport')}
                  </a>
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
              <CardTitle>{t('card.title')}</CardTitle>
              <CardDescription>{t('card.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue='my-api' className='w-full'>
                <TabsList className='mb-6 grid w-full grid-cols-2' {...tourAnchor(TOUR_ANCHORS.apiTaskTabs)}>
                  <TabsTrigger value='my-api'>{t('tabs.myApi')}</TabsTrigger>
                  <TabsTrigger value='search-api'>{t('tabs.searchApi')}</TabsTrigger>
                </TabsList>

                {/* 1. 我的 API 列表 */}
                <TabsContent value='my-api' className='space-y-4' {...tourAnchor(TOUR_ANCHORS.apiTaskMyList)}>
                  {isLoadingMyApis ? (
                    <div className='text-muted-foreground py-8 text-center text-sm'>{t('list.loading')}</div>
                  ) : myApis.length > 0 ? (
                    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                      {myApis.map(api => (
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
                              <div className='flex items-center gap-2 overflow-hidden'>
                                <h3 className='truncate text-sm font-semibold'>{api.name}</h3>
                                {api.isDemo && (
                                  <Badge
                                    variant='secondary'
                                    className='shrink-0 rounded-sm border-none bg-amber-500/10 text-[10px] text-amber-600 dark:text-amber-400'
                                  >
                                    {t('list.demoBadge')}
                                  </Badge>
                                )}
                              </div>
                              {api.owner && (
                                <p className='text-muted-foreground mt-1 text-xs'>
                                  {t('list.creatorLabel')} <span className='text-foreground'>{api.owner}</span>
                                </p>
                              )}
                              <p className='text-muted-foreground mt-1 text-xs'>
                                {t('list.balanceLabel')}{' '}
                                <span className='text-foreground font-medium'>
                                  ${api.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </span>
                              </p>
                            </div>
                          </div>
                          {/* <Button className='w-full' disabled={api.platform !== 'okx' && api.platform !== 'binance'} onClick={() => handleCopy(api)}> */}
                          <Button className='w-full' disabled={api.platform !== 'okx'} onClick={() => handleCopy(api)}>
                            {/* {api.platform !== 'okx' && api.platform !== 'binance' ? '暂不支持该平台' : '发起跟单'} */}
                            {api.platform !== 'okx' ? t('list.unsupported') : t('list.follow')}
                          </Button>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className='text-muted-foreground py-8 text-center text-sm'>{t('list.myEmpty')}</div>
                  )}
                </TabsContent>

                {/* 2. 发现其他 API (搜索) */}
                <TabsContent value='search-api' className='space-y-4'>
                  <div className='flex items-center gap-2'>
                    <div className='relative flex-1'>
                      <Search className='text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4' />
                      <Input
                        type='text'
                        placeholder={t('search.placeholder')}
                        className='pl-9'
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSearch()}
                      />
                    </div>
                    <Button onClick={handleSearch}>{t('search.button')}</Button>
                  </div>

                  <div className='mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2'>
                    {searchResults === null ? (
                      <div className='text-muted-foreground col-span-1 py-8 text-center text-sm sm:col-span-2'>
                        {t('search.hint')}
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
                              <div className='flex items-center gap-2 overflow-hidden'>
                                <h3 className='truncate text-sm font-semibold'>{api.name}</h3>
                                {api.isDemo && (
                                  <Badge
                                    variant='secondary'
                                    className='shrink-0 rounded-sm border-none bg-amber-500/10 text-[10px] text-amber-600 dark:text-amber-400'
                                  >
                                    {t('list.demoBadge')}
                                  </Badge>
                                )}
                              </div>
                              {api.owner && (
                                <p className='text-muted-foreground mt-1 text-xs'>
                                  {t('list.ownerLabel')} <span className='text-foreground'>{api.owner}</span>
                                </p>
                              )}
                              <p className='text-muted-foreground mt-1 text-xs'>
                                {t('list.balanceLabel')}{' '}
                                <span className='text-foreground font-medium'>
                                  ${api.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </span>
                              </p>
                            </div>
                          </div>
                          <Button className='w-full' disabled={api.platform !== 'okx'} onClick={() => handleCopy(api)}>
                            {api.platform !== 'okx' ? t('list.unsupported') : t('list.follow')}
                          </Button>
                        </Card>
                      ))
                    ) : (
                      <div className='text-muted-foreground col-span-1 py-8 text-center text-sm sm:col-span-2'>
                        {t('search.empty')}
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
        roleType='1'
      />
    </div>
  )
}
