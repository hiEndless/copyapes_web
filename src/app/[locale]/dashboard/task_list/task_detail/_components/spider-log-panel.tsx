'use client'

import * as React from 'react'

import { Activity } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Card, CardContent } from '@/components/ui/card'

import type { TaskLogItem } from '../_lib/types'
import {
  createTaskLogFormatters,
  getActionTagClass,
  getColorClass,
  getSideTagClass
} from '../_lib/task-log-formatters'

type SpiderLogPanelProps = {
  items: TaskLogItem[]
}

export function SpiderLogPanel({ items }: SpiderLogPanelProps) {
  const t = useTranslations('DashboardTaskDetail')
  const formatters = React.useMemo(() => createTaskLogFormatters(t), [t])

  return (
    <Card className='border shadow-sm dark:bg-[#1e1e1e] dark:text-white'>
      <CardContent className='p-6'>
        <div className='mb-6 flex items-center gap-2'>
          <div className='bg-muted dark:bg-muted/20 flex h-8 w-8 items-center justify-center rounded-full'>
            <Activity className='h-4 w-4 dark:text-white' />
          </div>
          <h2 className='text-lg font-bold'>{t('logs.spiderTitle')}</h2>
        </div>

        <div className='border-muted relative ml-3 space-y-8 border-l-2 pb-4 dark:border-zinc-700'>
          {items.length > 0 ? (
            items.map((item, index) => {
              const titleMeta = formatters.formatLogTitleMeta(item)
              return (
                <div key={index} className='relative pl-6'>
                  <div
                    className={`absolute top-1 -left-[9px] h-4 w-4 rounded-full border-4 border-white dark:border-[#1e1e1e] ${getColorClass(
                      item.color
                    )}`}
                  ></div>
                  <div className='space-y-1'>
                    <p className='flex items-center gap-2 text-sm font-bold dark:text-white'>
                      <span>{titleMeta.main}</span>
                      {titleMeta.sideTag ? (
                        <span className={getSideTagClass(titleMeta.sideTag)}>{titleMeta.sideTag}</span>
                      ) : null}
                      {titleMeta.actionTag ? (
                        <span className={getActionTagClass(titleMeta.actionTag)}>
                          {t(`logs.actions.${titleMeta.actionTag}`)}
                        </span>
                      ) : null}
                    </p>
                    <p className='text-muted-foreground text-xs dark:text-zinc-400'>{item.date}</p>
                    <p className='text-muted-foreground mt-2 whitespace-pre-line text-sm dark:text-zinc-300'>
                      {formatters.formatLogDescription(item)}
                    </p>
                  </div>
                </div>
              )
            })
          ) : (
            <div className='pl-6 text-sm text-muted-foreground'>{t('logs.empty')}</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
