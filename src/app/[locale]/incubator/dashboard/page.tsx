'use client'

import { useTranslations } from 'next-intl'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const IncubatorDashboardPage = () => {
  const t = useTranslations('IncubatorDashboardHome')

  return (
    <div className='grid h-full grid-cols-1 gap-4 p-4 lg:grid-cols-2'>
      <div className='flex flex-col gap-4 lg:col-span-1'>
        <Card className='gap-3 py-4 shadow-none'>
          <CardHeader className='px-4 pb-0'>
            <CardTitle className='text-sm'>{t('welcomeTitle')}</CardTitle>
            <CardDescription className='text-xs'>{t('welcomeDesc')}</CardDescription>
          </CardHeader>
          <CardContent className='px-4'>
            <p className='text-muted-foreground text-xs leading-relaxed'>{t('welcomeBody')}</p>
          </CardContent>
        </Card>

        <Card className='gap-3 py-4 shadow-none'>
          <CardHeader className='px-4 pb-0'>
            <CardTitle className='text-sm'>{t('statusTitle')}</CardTitle>
            <CardDescription className='text-xs'>{t('statusDesc')}</CardDescription>
          </CardHeader>
          <CardContent className='px-4'>
            <p className='text-muted-foreground text-xs leading-relaxed'>{t('statusBody')}</p>
          </CardContent>
        </Card>
      </div>

      <div className='flex flex-col gap-4 lg:col-span-1'>
        <Card className='gap-3 py-4 shadow-none'>
          <CardHeader className='px-4 pb-0'>
            <CardTitle className='text-sm'>{t('guideTitle')}</CardTitle>
          </CardHeader>
          <CardContent className='px-4'>
            <div className='text-muted-foreground text-xs leading-relaxed'>
              <p>{t('guideIntro')}</p>
              <ul className='mt-2 list-inside list-disc'>
                <li>{t('guideItem1')}</li>
                <li>{t('guideItem2')}</li>
                <li>{t('guideItem3')}</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default IncubatorDashboardPage
