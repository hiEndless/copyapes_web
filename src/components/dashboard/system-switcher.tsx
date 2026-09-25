'use client'

import Link from 'next/link'

import { useTranslations } from 'next-intl'

import { cn } from '@/lib/utils'

export type DashboardSystem = 'copy' | 'incubator'

const SYSTEM_HREFS: Record<DashboardSystem, string> = {
  copy: '/dashboard',
  incubator: '/incubator/dashboard/board'
}

type SystemSwitcherProps = {
  active: DashboardSystem
  className?: string
}

const SystemSwitcher = ({ active, className }: SystemSwitcherProps) => {
  const t = useTranslations('DashboardShell.systemSwitch')

  const items: { id: DashboardSystem; label: string; href: string }[] = [
    { id: 'copy', label: t('copy'), href: SYSTEM_HREFS.copy },
    { id: 'incubator', label: t('incubator'), href: SYSTEM_HREFS.incubator }
  ]

  return (
    <>
      <div
        className={cn(
          'border-border/80 bg-muted/70 grid w-full grid-cols-2 gap-1 rounded-xl border p-1 shadow-inner group-data-[collapsible=icon]:hidden',
          className
        )}
        role='tablist'
        aria-label={t('label')}
      >
        {items.map(item => {
          const isActive = item.id === active

          return (
            <Link
              key={item.id}
              href={item.href}
              role='tab'
              aria-selected={isActive}
              className={cn(
                'relative flex items-center justify-center rounded-lg px-2 py-2 text-xs font-medium transition-all duration-200',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm ring-1 ring-primary/30'
                  : 'text-muted-foreground hover:bg-background/80 hover:text-foreground'
              )}
            >
              <span className='truncate'>{item.label}</span>
            </Link>
          )
        })}
      </div>

    </>
  )
}

export default SystemSwitcher
