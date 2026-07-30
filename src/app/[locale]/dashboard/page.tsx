'use client'

import { useEffect, useState } from 'react'

import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { settingsApi } from '@/api/settings'
import { TOUR_ANCHORS, tourAnchor } from '@/features/tour/anchors'

const DashboardPage = () => {
  const t = useTranslations('DashboardHome')
  const [notice, setNotice] = useState<string | null>(null)
  const [redeemCode, setRedeemCode] = useState('')
  const [isRedeeming, setIsRedeeming] = useState(false)

  const handleRedeem = async () => {
    if (!redeemCode.trim()) {
      toast.error(t('redeemNeedCode'))

      return
    }

    setIsRedeeming(true)

    try {
      const res = await settingsApi.redeemCode(redeemCode.trim())

      if (res.code === 0) {
        toast.success(res.data || t('redeemSuccess'))
        setRedeemCode('')

        // Refresh entitlement profile after successful redeem
        const profile = await settingsApi.getEntitlementProfile()

        if (profile) {
          localStorage.setItem('entitlementProfile', JSON.stringify(profile))
          window.dispatchEvent(new Event('entitlementProfileUpdated'))
        }
      }
    } catch (error) {
      console.error('Redeem code failed', error)
    } finally {
      setIsRedeeming(false)
    }
  }

  useEffect(() => {
    const handleNoticeUpdate = () => {
      try {
        const noticeStr = localStorage.getItem('noticeInfo')

        if (noticeStr) {
          const noticeData = JSON.parse(noticeStr)

          setNotice(noticeData.notice || null)
        }
      } catch (e) {
        console.error('Failed to parse notice info', e)
      }
    }

    handleNoticeUpdate()

    window.addEventListener('noticeInfoUpdated', handleNoticeUpdate)

    return () => {
      window.removeEventListener('noticeInfoUpdated', handleNoticeUpdate)
    }
  }, [])

  return (
    <div className='grid h-full grid-cols-1 gap-4 p-4 lg:grid-cols-2'>
      <div className='flex flex-col gap-4 lg:col-span-1'>
        {notice && (
          <Card className='gap-3 py-4 shadow-none' {...tourAnchor(TOUR_ANCHORS.homeNotice)}>
            <CardHeader className='px-4 pb-0'>
              <CardTitle className='text-sm'>{t('noticeTitle')}</CardTitle>
            </CardHeader>
            <CardContent className='px-4'>
              <div
                className='text-muted-foreground text-xs leading-relaxed whitespace-pre-wrap'
                dangerouslySetInnerHTML={{ __html: notice }}
              />
            </CardContent>
          </Card>
        )}

        <Card className='gap-3 py-4 shadow-none' {...tourAnchor(TOUR_ANCHORS.homeExchanges)}>
          <CardHeader className='px-4 pb-0'>
            <CardTitle className='flex items-center justify-between text-sm'>{t('exchangeTitle')}</CardTitle>
            <CardDescription className='text-xs'>
              {t.rich('exchangeDesc', {
                rate: chunks => <span className='text-primary font-medium'>{chunks}</span>
              })}
            </CardDescription>
          </CardHeader>
          <CardContent className='px-4 pt-4'>
            <div className='border-border w-full overflow-hidden'>
              <div className='grid w-full grid-cols-3 items-center justify-center'>
                {/* Binance */}
                <div className='group relative isolate flex h-20 w-full items-center justify-center p-2 before:absolute before:top-0 before:-left-1 before:z-0 before:h-screen before:w-px before:content-[""] after:absolute after:-top-1 after:left-0 after:z-0 after:h-px after:w-screen after:content-[""]'>
                  <a
                    target='_blank'
                    rel='noopener noreferrer'
                    className='absolute inset-0 z-10'
                    href='https://www.binance.com/join?ref=COPYAPES'
                  >
                    <span className='sr-only'>Binance</span>
                  </a>
                  <div className='bg-primary/5 pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100'></div>
                  <div className='pointer-events-none absolute inset-0 overflow-hidden'>
                    <div className='via-primary/10 absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent to-transparent transition-transform duration-1000 ease-in-out group-hover:translate-x-full'></div>
                  </div>
                  <div className='pointer-events-none relative flex h-full w-full items-center justify-center transition-transform duration-300 group-hover:scale-105'>
                    <img
                      alt='BINANCE'
                      loading='lazy'
                      width='100'
                      height='28'
                      className='h-6 w-auto object-contain transition-all duration-300'
                      src='/exchanges/binance/logo.svg'
                    />
                  </div>
                </div>

                {/* Bitget */}
                <div className='group relative isolate flex h-20 w-full items-center justify-center p-2 before:absolute before:top-0 before:-left-1 before:z-0 before:h-screen before:w-px before:content-[""] after:absolute after:-top-1 after:left-0 after:z-0 after:h-px after:w-screen after:content-[""]'>
                  <a
                    target='_blank'
                    rel='noopener noreferrer'
                    className='absolute inset-0 z-10'
                    href='https://partner.bitget.cafe/bg/japhe6xs'
                  >
                    <span className='sr-only'>Bitget</span>
                  </a>
                  <div className='bg-primary/5 pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100'></div>
                  <div className='pointer-events-none absolute inset-0 overflow-hidden'>
                    <div className='via-primary/10 absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent to-transparent transition-transform duration-1000 ease-in-out group-hover:translate-x-full'></div>
                  </div>
                  <div className='pointer-events-none relative flex h-full w-full items-center justify-center transition-transform duration-300 group-hover:scale-105'>
                    <img
                      alt='BITGET'
                      loading='lazy'
                      width='100'
                      height='28'
                      className='h-6 w-auto object-contain transition-all duration-300'
                      src='/exchanges/bitget/logo.png'
                    />
                  </div>
                </div>

                {/* OKX */}
                <div className='group relative isolate flex h-20 w-full items-center justify-center p-2 before:absolute before:top-0 before:-left-1 before:z-0 before:h-screen before:w-px before:content-[""] after:absolute after:-top-1 after:left-0 after:z-0 after:h-px after:w-screen after:content-[""]'>
                  <a
                    target='_blank'
                    rel='noopener noreferrer'
                    className='absolute inset-0 z-10'
                    href='https://www.okx.com/join/COPY02'
                  >
                    <span className='sr-only'>OKX</span>
                  </a>
                  <div className='bg-primary/5 pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100'></div>
                  <div className='pointer-events-none absolute inset-0 overflow-hidden'>
                    <div className='via-primary/10 absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent to-transparent transition-transform duration-1000 ease-in-out group-hover:translate-x-full'></div>
                  </div>
                  <div className='pointer-events-none relative flex h-full w-full items-center justify-center transition-transform duration-300 group-hover:scale-105'>
                    <img
                      alt='OKX'
                      loading='lazy'
                      width='100'
                      height='28'
                      className='h-5 w-auto object-contain dark:hidden'
                      src='/exchanges/okx/logo-light.svg'
                    />
                    <img
                      alt='OKX'
                      loading='lazy'
                      width='100'
                      height='28'
                      className='hidden h-6 w-auto object-contain dark:block'
                      src='/exchanges/okx/logo-dark.png'
                    />
                  </div>
                </div>

                {/* Gate */}
                <div className='group relative isolate flex h-20 w-full items-center justify-center p-2 before:absolute before:top-0 before:-left-1 before:z-0 before:h-screen before:w-px before:content-[""] after:absolute after:-top-1 after:left-0 after:z-0 after:h-px after:w-screen after:content-[""]'>
                  <a
                    target='_blank'
                    rel='noopener noreferrer'
                    className='absolute inset-0 z-10'
                    href='https://www.gate.io/share/COPYAPES'
                  >
                    <span className='sr-only'>Gate</span>
                  </a>
                  <div className='bg-primary/5 pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100'></div>
                  <div className='pointer-events-none absolute inset-0 overflow-hidden'>
                    <div className='via-primary/10 absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent to-transparent transition-transform duration-1000 ease-in-out group-hover:translate-x-full'></div>
                  </div>
                  <div className='pointer-events-none relative flex h-full w-full items-center justify-center transition-transform duration-300 group-hover:scale-105'>
                    <img
                      alt='GATE'
                      loading='lazy'
                      width='100'
                      height='28'
                      className='h-6 w-auto object-contain dark:hidden'
                      src='/exchanges/gate/logo.png'
                    />
                    <img
                      alt='GATE'
                      loading='lazy'
                      width='100'
                      height='28'
                      className='hidden h-8 w-auto object-contain dark:block'
                      src='/exchanges/gate/logo-dark.png'
                    />
                  </div>
                </div>

                {/* Weex */}
                <div className='group relative isolate flex h-20 w-full items-center justify-center p-2 before:absolute before:top-0 before:-left-1 before:z-0 before:h-screen before:w-px before:content-[""] after:absolute after:-top-1 after:left-0 after:z-0 after:h-px after:w-screen after:content-[""]'>
                  <a
                    target='_blank'
                    rel='noopener noreferrer'
                    className='absolute inset-0 z-10'
                    href='https://weasexx.online/zh-CN/register?vipCode=copyapes'
                  >
                    <span className='sr-only'>Weex</span>
                  </a>
                  <div className='bg-primary/5 pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100'></div>
                  <div className='pointer-events-none absolute inset-0 overflow-hidden'>
                    <div className='via-primary/10 absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent to-transparent transition-transform duration-1000 ease-in-out group-hover:translate-x-full'></div>
                  </div>
                  <div className='pointer-events-none relative flex h-full w-full items-center justify-center transition-transform duration-300 group-hover:scale-105'>
                    <img
                      alt='WEEX'
                      loading='lazy'
                      width='100'
                      height='20'
                      className='h-5 w-auto object-contain transition-all duration-300'
                      src='/exchanges/weex/weex_logo.png'
                    />
                  </div>
                </div>

                {/* HTX */}
                <div className='group relative isolate flex h-20 w-full items-center justify-center p-2 before:absolute before:top-0 before:-left-1 before:z-0 before:h-screen before:w-px before:content-[""] after:absolute after:-top-1 after:left-0 after:z-0 after:h-px after:w-screen after:content-[""]'>
                  <a
                    target='_blank'
                    rel='noopener noreferrer'
                    className='absolute inset-0 z-10'
                    href='https://www.htx.com.pt/invite/zh-cn/1h?invite_code=copyapes'
                  >
                    <span className='sr-only'>HTX</span>
                  </a>
                  <div className='bg-primary/5 pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100'></div>
                  <div className='pointer-events-none absolute inset-0 overflow-hidden'>
                    <div className='via-primary/10 absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent to-transparent transition-transform duration-1000 ease-in-out group-hover:translate-x-full'></div>
                  </div>
                  <div className='pointer-events-none relative flex h-full w-full items-center justify-center transition-transform duration-300 group-hover:scale-105'>
                    <img
                      alt='HTX'
                      loading='lazy'
                      width='100'
                      height='28'
                      className='h-6 w-auto object-contain dark:hidden'
                      src='/exchanges/htx/logo-light.png'
                    />
                    <img
                      alt='HTX'
                      loading='lazy'
                      width='100'
                      height='28'
                      className='hidden h-6 w-auto object-contain dark:block'
                      src='/exchanges/htx/logo-dark.svg'
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='gap-3 py-4 shadow-none' {...tourAnchor(TOUR_ANCHORS.homeRedeem)}>
          <CardHeader className='px-4 pb-0'>
            <CardTitle className='text-sm'>{t('redeemTitle')}</CardTitle>
            <CardDescription className='text-xs'>{t('redeemDesc')}</CardDescription>
          </CardHeader>
          <CardContent className='flex gap-3 px-4'>
            <Input
              placeholder={t('redeemPlaceholder')}
              className='h-8 flex-1 text-xs'
              value={redeemCode}
              onChange={e => setRedeemCode(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleRedeem()}
            />
            <Button size='sm' className='h-8 text-xs' onClick={handleRedeem} disabled={isRedeeming}>
              {isRedeeming ? t('redeemSubmitting') : t('redeemSubmit')}
            </Button>
          </CardContent>
        </Card>

        <Card className='gap-3 py-4 shadow-none'>
          <CardHeader className='px-4 pb-0'>
            <CardTitle className='text-sm'>{t('disclaimerTitle')}</CardTitle>
          </CardHeader>
          <CardContent className='px-4'>
            <p className='text-muted-foreground text-xs leading-relaxed'>{t('disclaimerBody')}</p>
          </CardContent>
        </Card>
      </div>

      <div className='flex flex-col gap-4 lg:col-span-1'>
        {/* 版本更新公告：暂不国际化，后续迁 MD */}
        <Card className='gap-3 py-4 shadow-none' {...tourAnchor(TOUR_ANCHORS.homeChangelog)}>
          <CardHeader className='px-4 pb-0'>
            <CardTitle className='text-sm color-red-500'>新版本更新公告</CardTitle>
          </CardHeader>
          <CardContent className='px-4'>
            <div className='text-muted-foreground text-xs leading-relaxed'>
              <p>当前版本更新时间：2026-06-10</p>
              <p className='mt-1'>更新内容：</p>
              <ul className='list-inside list-disc'>
                <li>全新产品界面设计</li>
                <li>全新的跟单系统架构，稳定性升级，跟单性能大幅提升</li>
                <li>新增了工作室功能，更适合做自己的私域客户管理</li>
                <li>新增了币安聪明钱跟单任务</li>
              </ul>
              <p className='mt-3 font-medium text-red-500'>注意事项：</p>
              <ul className='list-inside list-disc'>
                <li>此次更新影响面较大，7月之前需要多留意自己的跟单任务状态，避免造成不必要的损失</li>
                <li>如遇问题请及时联系客服，提供跟单任务ID，我们会尽快解决</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className='gap-3 py-4 shadow-none'>
          <CardHeader className='px-4 pb-0'>
            <CardTitle className='text-sm'>{t('sponsorTitle')}</CardTitle>
          </CardHeader>
          <CardContent className='grid grid-cols-2 gap-2 px-4'>
            <a
              href='https://panel.supaboard.cc/#/register?code=tgL9ZBbV'
              target='_blank'
              rel='noopener noreferrer'
              className='block aspect-video w-full overflow-hidden rounded-md border'
            >
              <img src='/sponsor/supaboard.png' alt='Supaboard' className='h-full w-full object-cover' />
            </a>
            <div className='bg-muted flex aspect-video w-full items-center justify-center rounded-md border border-dashed px-2'>
              <span className='text-muted-foreground text-center text-xs leading-tight'>{t('sponsorSlot')}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default DashboardPage
