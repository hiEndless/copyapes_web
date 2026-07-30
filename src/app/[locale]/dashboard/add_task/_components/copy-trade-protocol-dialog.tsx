'use client'

import { useTranslations } from 'next-intl'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'

const PROTOCOL_SECTION_IDS = ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8', 's9'] as const

export function CopyTradeProtocolDialog({
  open,
  onOpenChange
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const t = useTranslations('DashboardCopyTaskConfig.protocol')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='flex max-h-[85vh] flex-col gap-0 sm:max-w-2xl'>
        <DialogHeader className='shrink-0 pb-4'>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription className='text-left text-sm leading-relaxed'>{t('intro')}</DialogDescription>
        </DialogHeader>
        <div className='text-muted-foreground min-h-0 flex-1 space-y-4 overflow-y-auto pr-1 text-sm leading-relaxed'>
          {PROTOCOL_SECTION_IDS.map(id => {
            const items = t.raw(`sections.${id}.items`) as string[] | undefined

            return (
              <section key={id}>
                <h3 className='text-foreground mb-2 font-medium'>{t(`sections.${id}.title`)}</h3>
                {Array.isArray(items) && items.length > 0 ? (
                  <ol className='list-decimal space-y-2 pl-5'>
                    {items.map((item, index) => (
                      <li key={`${id}-${index}`}>{item}</li>
                    ))}
                  </ol>
                ) : null}
              </section>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}
