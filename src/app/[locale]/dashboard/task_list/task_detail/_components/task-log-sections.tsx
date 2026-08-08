'use client'

import { useTranslations } from 'next-intl'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useIsMobile } from '@/hooks/use-mobile'

import type { TaskLogItem, TaskLogMeta } from '../_lib/types'
import { SpiderLogPanel } from './spider-log-panel'
import { TradeLogPanel } from './trade-log-panel'

type TaskLogSectionsProps = {
  spiderData: TaskLogItem[]
  tradeData: TaskLogItem[]
  logMeta?: TaskLogMeta | null
  isReverseFollow: boolean
}

export function TaskLogSections({ spiderData, tradeData, logMeta, isReverseFollow }: TaskLogSectionsProps) {
  const t = useTranslations('DashboardTaskDetail')
  const isMobile = useIsMobile()
  const shouldShowLimitHint = Boolean(logMeta?.truncated)
  const limit = Number(logMeta?.limit || 100)
  const limitHint = shouldShowLimitHint ? (
    <div className='mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200'>
      {t('logs.limitHint', { limit })}
    </div>
  ) : null

  if (isMobile) {
    return (
      <Tabs defaultValue='trader' className='w-full'>
        {limitHint}
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
    <>
      {limitHint}
      <div className='grid grid-cols-2 gap-6'>
        <SpiderLogPanel items={spiderData} />
        <TradeLogPanel items={tradeData} isReverseFollow={isReverseFollow} />
      </div>
    </>
  )
}
