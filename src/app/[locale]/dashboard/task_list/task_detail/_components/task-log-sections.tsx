'use client'

import { useTranslations } from 'next-intl'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useIsMobile } from '@/hooks/use-mobile'

import type { TaskLogItem } from '../_lib/types'
import { SpiderLogPanel } from './spider-log-panel'
import { TradeLogPanel } from './trade-log-panel'

type TaskLogSectionsProps = {
  spiderData: TaskLogItem[]
  tradeData: TaskLogItem[]
  isReverseFollow: boolean
}

export function TaskLogSections({ spiderData, tradeData, isReverseFollow }: TaskLogSectionsProps) {
  const t = useTranslations('DashboardTaskDetail')
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <Tabs defaultValue='trader' className='w-full'>
        <TabsList className='mb-4 grid w-full grid-cols-2'>
          <TabsTrigger value='trader'>{t('logs.tabs.trader')}</TabsTrigger>
          <TabsTrigger value='follower'>{t('logs.tabs.follower')}</TabsTrigger>
        </TabsList>
        <TabsContent value='trader' className='mt-0'>
          <SpiderLogPanel items={spiderData} />
        </TabsContent>
        <TabsContent value='follower' className='mt-0'>
          <TradeLogPanel items={tradeData} isReverseFollow={isReverseFollow} />
        </TabsContent>
      </Tabs>
    )
  }

  return (
    <div className='grid grid-cols-2 gap-6'>
      <SpiderLogPanel items={spiderData} />
      <TradeLogPanel items={tradeData} isReverseFollow={isReverseFollow} />
    </div>
  )
}
