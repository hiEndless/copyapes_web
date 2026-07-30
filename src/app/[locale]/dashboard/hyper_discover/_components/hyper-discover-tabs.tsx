'use client'

import { useTranslations } from 'next-intl'

import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { HotAddressDiscover } from './hot-address-discover'
import { TwitterKolDiscover } from './twitter-kol-discover'

export function HyperDiscoverTabs() {
  const t = useTranslations('DashboardHyperKol')

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between'>
        <div className='space-y-2'>
          <h1 className='text-2xl font-bold tracking-tight'>{t('page.title')}</h1>
          <p className='text-muted-foreground max-w-2xl text-sm'>{t('page.subtitle')}</p>
        </div>

        <div className='flex flex-wrap gap-2'>
          <Badge variant='secondary'>Hyperliquid</Badge>
          <Badge variant='outline'>{t('badges.hotAddresses')}</Badge>
          <Badge variant='outline'>{t('badges.twitterKols')}</Badge>
        </div>
      </div>

      <Tabs defaultValue='hot-addresses' className='gap-6'>
        <TabsList className='grid w-full grid-cols-2 sm:w-[320px]'>
          <TabsTrigger value='hot-addresses'>{t('tabs.hotAddresses')}</TabsTrigger>
          <TabsTrigger value='twitter-kols'>{t('tabs.twitterKols')}</TabsTrigger>
        </TabsList>

        <TabsContent value='hot-addresses' className='mt-0'>
          <HotAddressDiscover />
        </TabsContent>

        <TabsContent value='twitter-kols' className='mt-0'>
          <TwitterKolDiscover />
        </TabsContent>
      </Tabs>
    </div>
  )
}
