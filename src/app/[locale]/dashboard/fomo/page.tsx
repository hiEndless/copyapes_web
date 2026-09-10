'use client'

import * as React from 'react'

import { ExternalLink, Info, Lock, Search, Sparkles } from 'lucide-react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { MotionPreset } from '@/components/ui/motion-preset'
import { TOUR_ANCHORS, tourAnchor } from '@/features/tour/anchors'
import { CopyTaskConfigSheet } from '../add_task/_components/copy-task-config-sheet'
import { isInvalidUniqueName } from '../add_task/_lib/trader-url'

import { getCookies, searchCookie } from '@/api/cookie'
import type { EntitlementProfileResponse } from '@/api/settings'
import { cn } from '@/lib/utils'

type CookieTrader = {
  id: string
  name: string
  owner?: string
  status: 'active' | 'expired'
  platform: 'okx' | 'binance' | 'fomo' | 'bitget' | 'gate'
}

const FOMO_HOME_URL = 'https://fomo.family'
const EXTENSION_STORE_URL =
  'https://chromewebstore.google.com/detail/copyapes-assistant/affmjifigldmicnbgpghddaneomejmfo?hl=zh-CN'
const FOMO_UUID_RE =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/

function mapCookiePlatform(exchange: unknown): CookieTrader['platform'] {
  const value = String(exchange || '').trim()
  if (value === '1') return 'okx'
  if (value === '2') return 'binance'
  if (value === '99') return 'fomo'
  return 'fomo'
}

function cookieLogoSrc(platform: CookieTrader['platform']) {
  if (platform === 'fomo') return '/exchanges/fomo/logo.svg'
  return `/exchanges/${platform}.png`
}

export default function FomoPage() {
  const t = useTranslations('DashboardFomo')
  const searchParams = useSearchParams()
  const [myCookies, setMyCookies] = React.useState<CookieTrader[]>([])
  const [uniqueName, setUniqueName] = React.useState('')
  const [traderType] = React.useState('1')
  const [isConfigOpen, setIsConfigOpen] = React.useState(false)

  const [searchQuery, setSearchQuery] = React.useState('')
  const [searchResults, setSearchResults] = React.useState<CookieTrader[] | null>(null)
  const [selectedTrader, setSelectedTrader] = React.useState<CookieTrader | null>(null)
  const [showManualInput, setShowManualInput] = React.useState(false)
  const [manualInput, setManualInput] = React.useState('')
  const [isStudioVip, setIsStudioVip] = React.useState(false)

  const invalidTraderIdText = t('errors.invalidId')

  React.useEffect(() => {
    const syncEntitlementProfile = () => {
      try {
        const stored = localStorage.getItem('entitlementProfile')

        if (!stored) {
          setIsStudioVip(false)
          return
        }

        const profile = JSON.parse(stored) as EntitlementProfileResponse
        setIsStudioVip(Boolean(profile?.is_studio_vip))
      } catch (error) {
        console.error('Failed to parse entitlement profile:', error)
        setIsStudioVip(false)
      }
    }

    syncEntitlementProfile()
    window.addEventListener('entitlementProfileUpdated', syncEntitlementProfile)

    return () => {
      window.removeEventListener('entitlementProfileUpdated', syncEntitlementProfile)
    }
  }, [])

  React.useEffect(() => {
    const projectId = (searchParams.get('projectId') || searchParams.get('portfolioId') || '').trim()

    if (projectId) {
      setUniqueName(projectId)
      setShowManualInput(false)
      setManualInput('')
    }
  }, [searchParams])

  React.useEffect(() => {
    const fetchMyCookies = async () => {
      try {
        const res = await getCookies()

        if (res.code === 0 && Array.isArray(res.data)) {
          const mappedCookies: CookieTrader[] = res.data
            .filter((c: any) => String(c.exchange) === '99')
            .map((c: any) => ({
              id: String(c.curl_id),
              name: c.curl_name,
              status: c.available ? 'active' : 'expired',
              platform: mapCookiePlatform(c.exchange)
            }))

          setMyCookies(mappedCookies)
        }
      } catch (error) {
        console.error('Failed to fetch cookies', error)
      }
    }

    fetchMyCookies()
  }, [])

  React.useEffect(() => {
    const firstActive = myCookies.find(c => c.status === 'active')
    setSelectedTrader(firstActive || null)
  }, [myCookies])

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults(null)
      return
    }

    try {
      const res = await searchCookie(searchQuery)

      if (res.code === 0 && Array.isArray(res.data)) {
        const results: CookieTrader[] = res.data
          .filter((c: any) => String(c.exchange) === '99')
          .map((c: any) => ({
            id: String(c.curl_id),
            name: c.curl_name,
            owner: c.username || t('cookie.anonymousFallback'),
            status: c.available ? 'active' : 'expired',
            platform: mapCookiePlatform(c.exchange)
          }))

        setSearchResults(results)
      } else {
        setSearchResults([])
      }
    } catch (error) {
      console.error('Failed to search cookies', error)
      setSearchResults([])
    }
  }

  const handleCopy = (trader: CookieTrader) => {
    setSelectedTrader(trader)
  }

  const openFomoHome = () => {
    window.open(FOMO_HOME_URL, '_blank', 'noopener,noreferrer')
  }

  const handleManualConfirm = () => {
    const value = manualInput.trim()

    if (!FOMO_UUID_RE.test(value)) {
      setUniqueName(invalidTraderIdText)
      return
    }

    setUniqueName(value)
    setShowManualInput(false)
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
                  <Sparkles className='h-6 w-6' />
                  {t('hero.title')}
                </h2>
                <p className='mb-3 text-sm text-white/70'>{t('hero.subtitle')}</p>
                <div className='flex items-center gap-3 max-sm:flex-wrap max-sm:justify-center'>
                  <a
                    href='https://fomo.family/'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='flex h-8 items-center justify-center rounded-md border border-white/40 bg-transparent px-3 text-xs font-medium text-white sm:h-9 sm:text-sm'
                  >
                    {t('hero.goFomo')}
                  </a>
                  <a
                    href='/dashboard/cookie'
                    rel='noopener noreferrer'
                    className='flex h-8 items-center justify-center rounded-md bg-white px-3 text-xs font-medium text-black/90 sm:h-9 sm:text-sm'
                  >
                    {t('hero.getCookie')}
                  </a>
                </div>
              </div>
              <div className='flex items-center justify-center pb-6 sm:my-auto sm:min-w-40 sm:pb-0'>
                <Image
                  src='/exchanges/fomo.png'
                  alt='Fomo'
                  width={96}
                  height={96}
                  className='h-20 w-20 object-contain sm:h-24 sm:w-24'
                />
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
            <CardContent className='space-y-6'>
              {!isStudioVip ? (
                <Alert className='border-amber-500/40 bg-amber-50 text-amber-900 dark:bg-amber-950/30 dark:text-amber-100'>
                  <Lock className='text-amber-600 dark:text-amber-400' />
                  <AlertDescription className='flex flex-wrap items-center gap-x-2 gap-y-1 text-amber-900 dark:text-amber-100'>
                    <span>{t('page.studioVipHint')}</span>
                    <Button variant='link' className='h-auto p-0 text-amber-700 dark:text-amber-300' asChild>
                      <a href='/dashboard/pricing'>{t('page.upgradeStudioVip')}</a>
                    </Button>
                  </AlertDescription>
                </Alert>
              ) : null}

              <div className='space-y-3'>
                <Label>{t('form.selectExchange')}</Label>
                <div className='grid grid-cols-1 gap-3 sm:gap-4'>
                  <div
                    className={cn(
                      'border-primary bg-primary/5 flex h-16 items-center justify-center rounded-xl border-2 p-3 sm:h-20 sm:p-4'
                    )}
                  >
                    <Image
                      src='/exchanges/fomo/logo.svg'
                      alt='Fomo'
                      width={120}
                      height={40}
                      className='h-8 w-auto object-contain sm:h-10'
                    />
                  </div>
                </div>
                <div className='flex items-start gap-2 rounded-xl bg-blue-600/10 p-3 text-sm text-blue-800/80 dark:text-blue-300/80'>
                  <Info className='mt-0.5 h-4 w-4 shrink-0' />
                  <p className='text-xs text-blue-700/80 dark:text-blue-300/80'>{t('page.copyTip')}</p>
                </div>
              </div>

              <Tabs defaultValue='my-cookie' className='w-full pt-4' {...tourAnchor(TOUR_ANCHORS.cookieTaskSource)}>
                <TabsList className='mb-6 grid w-full grid-cols-2'>
                  <TabsTrigger value='my-cookie'>{t('cookie.myTab')}</TabsTrigger>
                  <TabsTrigger value='search-cookie'>{t('cookie.searchTab')}</TabsTrigger>
                </TabsList>

                <TabsContent value='my-cookie' className='space-y-4'>
                  {myCookies.length > 0 ? (
                    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                      {myCookies.map(cookie => (
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
                                src={cookieLogoSrc(cookie.platform)}
                                alt={cookie.platform}
                                className='h-full w-full object-contain'
                              />
                            </div>
                            <div className='flex-1 overflow-hidden'>
                              <h3 className='truncate text-sm font-semibold'>{cookie.name}</h3>
                              <p className='text-muted-foreground mt-1 text-xs'>
                                {t('cookie.statusLabel')}{' '}
                                <span
                                  className={cn(
                                    'font-medium',
                                    cookie.status === 'active' ? 'text-green-500' : 'text-destructive'
                                  )}
                                >
                                  {cookie.status === 'active' ? t('cookie.statusActive') : t('cookie.statusExpired')}
                                </span>
                              </p>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className='text-muted-foreground rounded-xl border border-dashed py-8 text-center text-sm'>
                      {t('cookie.myEmpty')}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value='search-cookie' className='space-y-4'>
                  <div className='flex items-center gap-2'>
                    <div className='relative flex-1'>
                      <Search className='text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4' />
                      <Input
                        type='text'
                        placeholder={t('cookie.searchPlaceholder')}
                        className='pl-9'
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSearch()}
                      />
                    </div>
                    <Button onClick={handleSearch}>{t('cookie.search')}</Button>
                  </div>

                  <div className='mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2'>
                    {searchResults === null ? (
                      <div className='text-muted-foreground col-span-1 py-8 text-center text-sm sm:col-span-2'>
                        {t('cookie.searchHint')}
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
                                src={cookieLogoSrc(cookie.platform)}
                                alt={cookie.platform}
                                className='h-full w-full object-contain'
                              />
                            </div>
                            <div className='flex-1 overflow-hidden'>
                              <h3 className='truncate text-sm font-semibold'>{cookie.name}</h3>
                              {cookie.owner && (
                                <p className='text-muted-foreground mt-1 text-xs'>
                                  {t('cookie.creatorLabel')} <span className='text-foreground'>{cookie.owner}</span>
                                </p>
                              )}
                              <p className='text-muted-foreground mt-1 text-xs'>
                                {t('cookie.statusLabel')}{' '}
                                <span
                                  className={cn(
                                    'font-medium',
                                    cookie.status === 'active' ? 'text-green-500' : 'text-destructive'
                                  )}
                                >
                                  {cookie.status === 'active' ? t('cookie.statusActive') : t('cookie.statusExpired')}
                                </span>
                              </p>
                            </div>
                          </div>
                        </Card>
                      ))
                    ) : (
                      <div className='text-muted-foreground col-span-1 py-8 text-center text-sm sm:col-span-2'>
                        {t('cookie.searchEmpty')}
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              <div className='space-y-2' {...tourAnchor(TOUR_ANCHORS.cookieTaskTrader)}>
                <Label className='flex items-center gap-1'>
                  <span className='text-destructive'>*</span>
                  {t('form.traderLabel')}
                </Label>

                <div className='space-y-3'>
                  <Input
                    readOnly
                    placeholder={t('form.projectIdPlaceholder')}
                    value={uniqueName}
                    className='bg-muted font-mono'
                  />
                  <div className='flex flex-wrap gap-2'>
                    <Button type='button' onClick={openFomoHome}>
                      <ExternalLink className='mr-2 h-4 w-4' />
                      {t('form.openFomo')}
                    </Button>
                    <Button type='button' variant='outline' asChild>
                      <a href={EXTENSION_STORE_URL} target='_blank' rel='noopener noreferrer'>
                        {t('form.installExtension')}
                      </a>
                    </Button>
                  </div>
                  {!uniqueName ? <p className='text-muted-foreground text-xs'>{t('form.projectIdEmpty')}</p> : null}
                  {!showManualInput ? (
                    <button
                      type='button'
                      className='text-muted-foreground hover:text-foreground text-xs underline-offset-4 hover:underline'
                      onClick={() => setShowManualInput(true)}
                    >
                      {t('form.manualToggle')}
                    </button>
                  ) : (
                    <div className='space-y-2 rounded-lg border border-dashed p-3'>
                      <p className='text-xs text-amber-600 dark:text-amber-500'>{t('form.manualWarning')}</p>
                      <Input
                        placeholder={t('form.manualPlaceholder')}
                        value={manualInput}
                        onChange={e => setManualInput(e.target.value)}
                        className='font-mono'
                      />
                      <div className='flex flex-wrap gap-2'>
                        <Button type='button' size='sm' onClick={handleManualConfirm}>
                          {t('form.manualConfirm')}
                        </Button>
                        <Button
                          type='button'
                          size='sm'
                          variant='ghost'
                          onClick={() => {
                            setShowManualInput(false)
                            setManualInput('')
                          }}
                        >
                          {t('form.manualCancel')}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className='space-y-2' {...tourAnchor(TOUR_ANCHORS.cookieTaskType)}>
                <Label className='flex items-center gap-1'>
                  <span className='text-destructive'>*</span>
                  {t('form.traderTypeLabel')}
                </Label>
                <Select value={traderType} disabled>
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder={t('form.traderTypePlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='1'>{t('traderType.contract')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter className='flex justify-end gap-2' {...tourAnchor(TOUR_ANCHORS.cookieTaskSubmit)}>
              <Button
                disabled={
                  !isStudioVip ||
                  isInvalidUniqueName(uniqueName, [invalidTraderIdText]) ||
                  !FOMO_UUID_RE.test(uniqueName) ||
                  !traderType ||
                  !selectedTrader
                }
                onClick={() => {
                  if (!isStudioVip) return
                  setIsConfigOpen(true)
                }}
              >
                {t('form.submit')}
              </Button>
            </CardFooter>
          </Card>
        </MotionPreset>
      </div>

      <CopyTaskConfigSheet
        isOpen={isConfigOpen && isStudioVip}
        onClose={() => {
          setIsConfigOpen(false)
        }}
        traderId={uniqueName}
        traderName={uniqueName}
        platform='fomo'
        traderPlatform={99}
        roleType={traderType}
        cookieId={selectedTrader?.id}
      />
    </div>
  )
}
