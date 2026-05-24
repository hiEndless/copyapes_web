'use client'

import * as React from 'react'

import Image from 'next/image'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

import type { TaskLogItem } from '../_lib/types'
import {
  createTaskLogFormatters,
  getColorClass,
  getResultTagClass,
  getSideTagClass
} from '../_lib/task-log-formatters'

type TradeLogPanelProps = {
  items: TaskLogItem[]
  locale: string
  isReverseFollow: boolean
}

export function TradeLogPanel({ items, locale, isReverseFollow }: TradeLogPanelProps) {
  const formatters = React.useMemo(() => createTaskLogFormatters(locale), [locale])

  return (
    <Card className='border bg-[#1e1e1e] text-white shadow-sm'>
      <CardContent className='p-6'>
        <div className='mb-6 flex items-center gap-3'>
          <div className='flex h-8 w-8 items-center justify-center overflow-hidden rounded-full'>
            <Image src='/site_logo/logo-small.png' alt='Logo' width={32} height={32} />
          </div>
          <h2 className='flex items-center gap-2 text-lg font-bold'>
            跟单猿跟单记录
            {isReverseFollow && (
              <Badge variant='destructive' className='h-5 rounded-sm bg-red-500 px-1.5 text-[10px] hover:bg-red-600'>
                反向跟单
              </Badge>
            )}
          </h2>
        </div>

        <div className='relative ml-3 space-y-8 border-l-2 border-zinc-700 pb-4'>
          {items.length > 0 ? (
            items.map((item, index) => {
              const titleMeta = formatters.formatTradeLogTitleMeta(item)
              return (
                <div key={index} className='relative pl-6'>
                  <div
                    className={`absolute top-1 -left-[9px] h-4 w-4 rounded-full border-4 border-[#1e1e1e] ${getColorClass(
                      item.color
                    )}`}
                  ></div>
                  <div className='space-y-1'>
                    <p className='flex items-center gap-2 text-sm font-bold text-white'>
                      <span>{titleMeta.instId}</span>
                      {titleMeta.side ? (
                        <span className={getSideTagClass(titleMeta.side)}>{titleMeta.side}</span>
                      ) : null}
                      {titleMeta.resultTag ? (
                        <span className={getResultTagClass(titleMeta.resultTag)}>{titleMeta.resultTag}</span>
                      ) : null}
                    </p>
                    <p className='text-xs text-zinc-400'>{item.date}</p>
                    <p className='mt-2 whitespace-pre-line text-sm text-zinc-300'>
                      {formatters.formatTradeLogDescription(item)}
                    </p>
                  </div>
                </div>
              )
            })
          ) : (
            <div className='pl-6 text-sm text-zinc-400'>暂无数据</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
