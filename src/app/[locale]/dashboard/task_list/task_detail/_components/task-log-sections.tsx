'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import type { TaskLogItem } from '../_lib/types'
import { SpiderLogPanel } from './spider-log-panel'
import { TradeLogPanel } from './trade-log-panel'

type TaskLogSectionsProps = {
  spiderData: TaskLogItem[]
  tradeData: TaskLogItem[]
  locale: string
  isReverseFollow: boolean
}

export function TaskLogSections({ spiderData, tradeData, locale, isReverseFollow }: TaskLogSectionsProps) {
  return (
    <>
      <div className='block md:hidden'>
        <Tabs defaultValue='trader' className='w-full'>
          <TabsList className='mb-4 grid w-full grid-cols-2'>
            <TabsTrigger value='trader'>交易记录</TabsTrigger>
            <TabsTrigger value='follower'>跟单记录</TabsTrigger>
          </TabsList>
          <TabsContent value='trader' className='mt-0'>
            <SpiderLogPanel items={spiderData} locale={locale} />
          </TabsContent>
          <TabsContent value='follower' className='mt-0'>
            <TradeLogPanel items={tradeData} locale={locale} isReverseFollow={isReverseFollow} />
          </TabsContent>
        </Tabs>
      </div>

      <div className='hidden grid-cols-1 gap-6 md:grid md:grid-cols-2'>
        <SpiderLogPanel items={spiderData} locale={locale} />
        <TradeLogPanel items={tradeData} locale={locale} isReverseFollow={isReverseFollow} />
      </div>
    </>
  )
}
