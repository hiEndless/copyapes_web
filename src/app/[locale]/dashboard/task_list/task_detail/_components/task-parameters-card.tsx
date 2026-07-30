'use client'

import { useTranslations } from 'next-intl'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'

import type { TaskParameterItem } from '../_lib/types'

type TaskParametersCardProps = {
  parameterList: TaskParameterItem[]
  isRunning: boolean
  onTerminate: () => void
}

export function TaskParametersCard({ parameterList, isRunning, onTerminate }: TaskParametersCardProps) {
  const t = useTranslations('DashboardTaskDetail')

  return (
    <Card className='overflow-hidden border py-0! shadow-sm'>
      <div className='bg-border grid grid-cols-1 gap-[1px] md:grid-cols-4'>
        {parameterList.map((item, index) => (
          <div key={index} className='dark:bg-background flex items-stretch bg-white'>
            <div className='bg-muted/50 flex w-24 shrink-0 items-center border-r p-4'>
              <span className='text-muted-foreground text-xs'>{item.label}</span>
            </div>
            <div className='flex flex-1 items-center p-4'>
              <span className='truncate text-xs font-medium'>{item.value}</span>
            </div>
          </div>
        ))}

        {Array.from({ length: (4 - (parameterList.length % 4)) % 4 }).map((_, index) => (
          <div key={`empty-${index}`} className='dark:bg-background flex items-stretch bg-white'>
            <div className='bg-muted/50 flex w-24 shrink-0 items-center border-r p-4'></div>
            <div className='flex flex-1 items-center p-4'></div>
          </div>
        ))}

        <div className='dark:bg-background flex items-stretch bg-white md:col-span-4'>
          <div className='bg-muted/50 flex w-24 shrink-0 items-center border-r p-4'>
            <span className='text-muted-foreground text-xs'>{t('params.labels.status')}</span>
          </div>
          <div className='flex flex-1 items-center gap-4 p-4'>
            <div className='flex items-center gap-1.5'>
              {isRunning ? (
                <span className='relative flex h-2.5 w-2.5'>
                  <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75'></span>
                  <span className='relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500'></span>
                </span>
              ) : (
                <span className='relative flex h-2.5 w-2.5'>
                  <span className='bg-muted-foreground relative inline-flex h-2.5 w-2.5 rounded-full'></span>
                </span>
              )}
              <span className='ml-1 text-sm font-medium'>
                {isRunning ? t('params.status.running') : t('params.status.stopped')}
              </span>
            </div>
            {isRunning && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant='destructive' size='sm' className='h-7 bg-red-500 text-xs hover:bg-red-600'>
                    {t('params.terminate.button')}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t('params.terminate.title')}</AlertDialogTitle>
                    <AlertDialogDescription>{t('params.terminate.desc')}</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t('params.terminate.cancel')}</AlertDialogCancel>
                    <AlertDialogAction onClick={onTerminate} className='bg-red-500 text-white hover:bg-red-600'>
                      {t('params.terminate.confirm')}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
