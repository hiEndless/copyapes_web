'use client'

import { useState, useEffect } from 'react'

import { Plus, Cookie, Chrome, Upload, ShieldCheck, HelpCircle, AlertCircle, Edit2, Clock } from 'lucide-react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { getCookies, addOrUpdateCookie, updateCookieName } from '@/api/cookie'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { TOUR_ANCHORS, tourAnchor } from '@/features/tour/anchors'
import { tourSafeDialogProps } from '@/features/tour/dialog-guard'

type CookieItem = {
  curl_id: string | number
  curl_name: string
  exchange: number | string
  available: boolean
  updated_at: string
}

export default function CookiePage() {
  const t = useTranslations('DashboardCookie')
  const [cookies, setCookies] = useState<CookieItem[]>([])
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [newPlatform, setNewPlatform] = useState('2') // 2: Binance, 1: OKX
  const [newCookie, setNewCookie] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const [isEditNameOpen, setIsEditNameOpen] = useState(false)
  const [editingCookie, setEditingCookie] = useState<CookieItem | null>(null)
  const [newCookieName, setNewCookieName] = useState('')

  const exchangeLabel = (exchange: number | string) =>
    String(exchange) === '2' ? t('manual.binance') : t('manual.okx')

  const fetchCookies = async () => {
    setIsLoading(true)

    try {
      const res = await getCookies()

      if (res.code === 0 && Array.isArray(res.data)) {
        setCookies(res.data)
      } else {
        toast.error(res.error || t('toast.fetchFailed'))
      }
    } catch (e) {
      console.error(e)
      toast.error(t('toast.noData'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCookies()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initial load only
  }, [])

  const handleUpload = async () => {
    if (!newCookie) return

    setIsLoading(true)

    try {
      const res = await addOrUpdateCookie({
        exchange: newPlatform,
        curl_text: newCookie
      })

      if (res.code === 0) {
        toast.success(t('toast.uploadSuccess'))
        setNewCookie('')
        setIsUploadOpen(false)
        fetchCookies()
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditName = async () => {
    if (!editingCookie || !newCookieName) return

    setIsLoading(true)

    try {
      const res = await updateCookieName({
        curl_id: editingCookie.curl_id,
        curl_name: newCookieName
      })

      if (res.code === 0) {
        toast.success(t('toast.updateSuccess'))
        setIsEditNameOpen(false)
        setEditingCookie(null)
        setNewCookieName('')
        fetchCookies()
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  const openEditDialog = (cookie: CookieItem) => {
    setEditingCookie(cookie)
    setNewCookieName(cookie.curl_name || '')
    setIsEditNameOpen(true)
  }

  const handleCookieChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value

    if (value.trim().startsWith('curl') || value.includes('-H')) {
      const match = value.match(/-H\s+(['"])[cC]ookie:\s*(.*?)\1/)

      if (match && match[2]) {
        setNewCookie(match[2])

        return
      }

      const unquotedMatch = value.match(/-H\s+[cC]ookie:\s*(\S+)/)

      if (unquotedMatch && unquotedMatch[1]) {
        setNewCookie(unquotedMatch[1])

        return
      }
    }

    setNewCookie(value)
  }

  const browserDownloads = [
    {
      src: '/browser/chrome.svg',
      alt: t('browsers.chromeAlt'),
      label: 'Chrome',
      url: 'https://chromewebstore.google.com/detail/copyapes-assistant/affmjifigldmicnbgpghddaneomejmfo'
    },
    {
      src: '/browser/edge.svg',
      alt: t('browsers.edgeAlt'),
      label: 'Edge',
      url: 'https://xwvmohge80.feishu.cn/docx/OWvbdwKKvo4qpXxRVOAcg40mnub'
    },
    {
      src: '/browser/firefox.svg',
      alt: t('browsers.firefoxAlt'),
      label: 'Firefox',
      url: 'https://xwvmohge80.feishu.cn/docx/OWvbdwKKvo4qpXxRVOAcg40mnub'
    },
    {
      src: '/browser/zip.svg',
      alt: t('browsers.zipAlt'),
      label: t('browsers.zipLabel'),
      url: 'https://xwvmohge80.feishu.cn/docx/OWvbdwKKvo4qpXxRVOAcg40mnub'
    }
  ]

  return (
    <div className='flex h-full flex-col gap-6 overflow-y-auto p-4 lg:p-8'>
      <div className='flex flex-col gap-2'>
        <h2 className='text-2xl font-bold tracking-tight'>{t('page.title')}</h2>
        <p className='text-muted-foreground text-sm'>{t('page.subtitle')}</p>
        <Alert className='border-primary/20 bg-primary/5 text-primary mt-2' {...tourAnchor(TOUR_ANCHORS.cookieNotice)}>
          <AlertCircle className='h-4 w-4' />
          <AlertTitle className='font-semibold'>{t('notice.title')}</AlertTitle>
          <AlertDescription className='text-sm'>{t('notice.body')}</AlertDescription>
        </Alert>
      </div>

      <div className='grid gap-4 md:grid-cols-2'>
        <Card className='shadow-sm' {...tourAnchor(TOUR_ANCHORS.cookiePlugin)}>
          <CardHeader>
            <div className='flex items-center gap-2'>
              <div className='bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg'>
                <Chrome className='text-primary h-5 w-5' />
              </div>
              <CardTitle className='text-lg'>{t('plugin.title')}</CardTitle>
            </div>
            <CardDescription>{t('plugin.desc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div className='group relative inline-flex w-full overflow-hidden rounded-full p-[2px] sm:w-auto'>
                <span
                  aria-hidden
                  className='pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[300%] -translate-x-1/2 -translate-y-1/2 bg-[conic-gradient(from_180deg_at_50%_50%,theme(colors.violet.500),theme(colors.sky.400),theme(colors.violet.500))] opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-hover:animate-[spin_3s_linear_infinite]'
                />
                <span
                  aria-hidden
                  className='pointer-events-none absolute inset-[4px] rounded-full bg-slate-950'
                />
                <Button
                  className='relative z-10 h-12 w-full rounded-full border-0 bg-transparent px-6 text-base font-medium text-white shadow-none hover:bg-transparent sm:w-auto'
                  asChild
                >
                  <a
                    href='https://chromewebstore.google.com/detail/copyapes-assistant/affmjifigldmicnbgpghddaneomejmfo?authuser=0&hl=zh-CN'
                    target='_blank'
                    rel='noreferrer'
                  >
                    <Image
                      src='/browser/chrome.svg'
                      alt={t('browsers.chromeAlt')}
                      width={24}
                      height={24}
                      className='mr-2 h-6 w-6'
                    />
                    {t('plugin.installChrome')}
                  </a>
                </Button>
              </div>

              <div className='flex flex-col gap-3'>
                <p className='text-muted-foreground text-xs'>{t('plugin.supportWays')}</p>
                <div className='flex flex-wrap items-center gap-3'>
                  {browserDownloads.map(item => (
                    <a
                      key={item.label}
                      href={item.url}
                      target='_blank'
                      rel='noreferrer'
                      className='bg-muted/40 hover:bg-muted flex items-center gap-2 rounded-full border px-3 py-2 transition-colors'
                    >
                      <Image src={item.src} alt={item.alt} width={18} height={18} className='h-[18px] w-[18px]' />
                      <span className='text-muted-foreground text-xs'>{item.label}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
            <Accordion type='single' collapsible className='mt-4 w-full'>
              <AccordionItem value='how-to' className='border-none'>
                <AccordionTrigger className='text-primary py-2 text-sm hover:no-underline'>
                  <span className='flex items-center gap-1.5'>
                    <HelpCircle className='h-4 w-4' />
                    {t('plugin.howToTitle')}
                  </span>
                </AccordionTrigger>
                <AccordionContent className='space-y-4 pt-2'>
                  <div className='text-muted-foreground space-y-2'>
                    <p className='text-foreground font-medium mt-2'>{t('plugin.tutorialTitle')}</p>
                    <ol className='space-y-2 text-sm'>
                      <li>
                        {t('plugin.step1Prefix')}
                        <a
                          href='https://xwvmohge80.feishu.cn/docx/OWvbdwKKvo4qpXxRVOAcg40mnub?from=from_copylink'
                          className='text-primary hover:underline'
                          target='_blank'
                        >
                          {t('plugin.step1Link')}
                        </a>
                      </li>
                      <li>{t('plugin.step2')}</li>
                      <li>{t('plugin.step3')}</li>
                    </ol>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        <Card className='shadow-sm' {...tourAnchor(TOUR_ANCHORS.cookieManual)}>
          <CardHeader>
            <div className='flex items-center gap-2'>
              <div className='bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg'>
                <Upload className='text-primary h-5 w-5' />
              </div>
              <CardTitle className='text-lg'>{t('manual.title')}</CardTitle>
            </div>
            <CardDescription>{t('manual.desc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className='text-muted-foreground mb-4 space-y-2 text-sm'>
              <li className='flex items-center gap-2'>
                <ShieldCheck className='h-4 w-4 text-green-500' /> {t('manual.benefit1')}
              </li>
              <li className='flex items-center gap-2'>
                <ShieldCheck className='h-4 w-4 text-green-500' /> {t('manual.benefit2')}
              </li>
              <li className='flex items-center gap-2'>
                <ShieldCheck className='h-4 w-4 text-yellow-500' /> {t('manual.benefit3')}
              </li>
            </ul>
            <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
              <DialogTrigger asChild>
                <Button className='w-full sm:w-auto' variant='outline'>
                  <Plus className='mr-2 h-4 w-4' />
                  {t('manual.uploadButton')}
                </Button>
              </DialogTrigger>
              <DialogContent className='sm:max-w-[425px]' {...tourSafeDialogProps}>
                <DialogHeader>
                  <DialogTitle>{t('manual.dialogTitle')}</DialogTitle>
                  <DialogDescription>{t('manual.dialogDesc')}</DialogDescription>
                </DialogHeader>
                <div className='grid gap-4 py-4'>
                  <div className='grid gap-2'>
                    <Label htmlFor='platform'>{t('manual.platformLabel')}</Label>
                    <Select value={newPlatform} onValueChange={setNewPlatform}>
                      <SelectTrigger id='platform'>
                        <SelectValue placeholder={t('manual.platformPlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='2'>{t('manual.binance')}</SelectItem>
                        <SelectItem value='1'>{t('manual.okx')}</SelectItem>
                        <SelectItem value='bitget'>Bitget</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className='grid gap-2'>
                    <Label htmlFor='cookie'>{t('manual.cookieLabel')}</Label>
                    <Textarea
                      id='cookie'
                      placeholder={t('manual.cookiePlaceholder')}
                      className='h-32 resize-none'
                      value={newCookie}
                      onChange={handleCookieChange}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant='outline' onClick={() => setIsUploadOpen(false)}>
                    {t('manual.cancel')}
                  </Button>
                  <Button onClick={handleUpload} disabled={!newCookie}>
                    {t('manual.save')}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Accordion type='single' collapsible className='mt-4 w-full'>
              <AccordionItem value='how-to' className='border-none'>
                <AccordionTrigger className='text-primary py-2 text-sm hover:no-underline'>
                  <span className='flex items-center gap-1.5'>
                    <HelpCircle className='h-4 w-4' />
                    {t('manual.howToTitle')}
                  </span>
                </AccordionTrigger>
                <AccordionContent className='space-y-4 pt-2'>
                  <div className='text-muted-foreground space-y-2'>
                    <p className='text-foreground font-medium'>{t('manual.guideIntro')}</p>
                    <ol className='list-decimal space-y-1.5 pl-5'>
                      <li>{t('manual.guide1')}</li>
                      <li>
                        <strong>{t('manual.binance')}</strong> {t('manual.guide2Before')}
                        <code className='bg-muted rounded px-1 py-0.5'>positions?portfolioId=xxxxx</code>
                        {t('manual.guide2After')}
                      </li>
                      <li>
                        <strong>{t('manual.okx')}</strong> {t('manual.guide3Before')}
                        <code className='bg-muted rounded px-1 py-0.5'>
                          position-detail?instType=SWAP&amp;uniqueName=xxxxx
                        </code>
                        {t('manual.guide3After')}
                      </li>
                      <li>{t('manual.guide4')}</li>
                      <li>{t('manual.guide5')}</li>
                    </ol>
                    <p className='mt-2 text-xs'>{t('manual.guideOtherBrowsers')}</p>
                  </div>

                  <div className='overflow-hidden rounded-md border'>
                    <Image
                      src='/images/cookie.png'
                      alt={t('manual.exampleAlt')}
                      width={800}
                      height={400}
                      className='h-auto w-full object-cover'
                    />
                  </div>

                  <Alert variant='destructive' className='mt-4 py-2'>
                    <AlertCircle className='h-4 w-4' />
                    <AlertTitle className='text-sm font-semibold'>{t('manual.warningTitle')}</AlertTitle>
                    <AlertDescription className='text-xs'>{t('manual.warningBody')}</AlertDescription>
                  </Alert>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </div>

      <div className='mt-4 flex flex-col gap-4' {...tourAnchor(TOUR_ANCHORS.cookieList)}>
        <h3 className='text-lg font-semibold'>{t('list.title')}</h3>

        {cookies.length === 0 ? (
          <div className='animate-in fade-in-50 flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center'>
            <div className='bg-muted flex h-20 w-20 items-center justify-center rounded-full'>
              <Cookie className='text-muted-foreground h-10 w-10' />
            </div>
            <h3 className='mt-4 text-lg font-semibold'>{t('list.emptyTitle')}</h3>
            <p className='text-muted-foreground mt-2 mb-6 max-w-sm text-sm'>{t('list.emptyDesc')}</p>
            <Button onClick={() => setIsUploadOpen(true)}>
              <Plus className='mr-2 h-4 w-4' />
              {t('list.uploadNow')}
            </Button>
          </div>
        ) : (
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            {cookies.map(cookie => (
              <Card
                key={cookie.curl_id}
                className='group relative flex flex-col overflow-hidden border-border/50 bg-gradient-to-b from-background to-muted/20 shadow-sm transition-all hover:border-primary/20 hover:shadow-md'
              >
                <div
                  className={`absolute inset-x-0 top-0 h-1 w-full ${
                    cookie.available
                      ? 'bg-gradient-to-r from-emerald-400 to-green-500'
                      : 'bg-gradient-to-r from-red-400 to-rose-500'
                  }`}
                />
                <CardHeader>
                  <div className='flex items-start justify-between'>
                    <div className='flex items-center gap-3'>
                      <img
                        src={`/exchanges/${String(cookie.exchange) === '2' ? 'binance' : 'okx'}.png`}
                        alt={String(cookie.exchange) === '2' ? 'Binance' : 'OKX'}
                        className='h-6 w-6 object-contain'
                      />
                      <div className='flex flex-col gap-1'>
                        <CardTitle className='text-sm font-semibold tracking-tight'>
                          {cookie.curl_name || exchangeLabel(cookie.exchange)}
                        </CardTitle>
                        <Badge
                          variant='secondary'
                          className={`w-fit px-1.5 py-0 text-[9px] font-medium ${
                            cookie.available
                              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                              : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'
                          }`}
                        >
                          {cookie.available ? t('list.active') : t('list.inactive')}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-8 w-8 shrink-0 text-muted-foreground opacity-0 transition-opacity hover:bg-primary/10 hover:text-primary group-hover:opacity-100'
                      onClick={() => openEditDialog(cookie)}
                    >
                      <Edit2 className='h-4 w-4' />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className='mt-auto'>
                  <div className='flex items-center gap-1.5 text-[10px] text-muted-foreground'>
                    <Clock className='h-3 w-3' />
                    <span>{t('list.lastUpdated', { time: cookie.updated_at })}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={isEditNameOpen} onOpenChange={setIsEditNameOpen}>
        <DialogContent className='sm:max-w-[425px]' {...tourSafeDialogProps}>
          <DialogHeader>
            <DialogTitle>{t('edit.title')}</DialogTitle>
            <DialogDescription>{t('edit.desc')}</DialogDescription>
          </DialogHeader>
          <div className='grid gap-4 py-4'>
            <div className='grid gap-2'>
              <Label htmlFor='cookieName'>{t('edit.nameLabel')}</Label>
              <Input
                id='cookieName'
                placeholder={t('edit.namePlaceholder')}
                value={newCookieName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCookieName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setIsEditNameOpen(false)}>
              {t('edit.cancel')}
            </Button>
            <Button onClick={handleEditName} disabled={!newCookieName || isLoading}>
              {isLoading ? t('edit.saving') : t('edit.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
