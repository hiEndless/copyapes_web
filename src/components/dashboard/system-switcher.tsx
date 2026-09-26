'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Lock } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { readStudioVip } from '@/lib/incubator-auth'
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
  const router = useRouter()
  const [studioVip, setStudioVip] = useState<boolean | null>(null)
  const [lockOpen, setLockOpen] = useState(false)

  useEffect(() => {
    const refresh = () => setStudioVip(readStudioVip())

    refresh()
    window.addEventListener('entitlementProfileUpdated', refresh)
    window.addEventListener('storage', refresh)

    return () => {
      window.removeEventListener('entitlementProfileUpdated', refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [])

  const incubatorLocked = studioVip === false

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
          const locked = item.id === 'incubator' && incubatorLocked

          if (locked) {
            return (
              <button
                key={item.id}
                type='button'
                role='tab'
                aria-selected={isActive}
                aria-disabled='true'
                onClick={() => setLockOpen(true)}
                className={cn(
                  'relative flex items-center justify-center gap-1 rounded-lg px-2 py-2 text-xs font-medium transition-all duration-200',
                  'text-muted-foreground hover:bg-background/80 hover:text-foreground'
                )}
              >
                <Lock className='size-3 shrink-0 opacity-70' aria-hidden />
                <span className='truncate'>{item.label}</span>
              </button>
            )
          }

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

      <Dialog open={lockOpen} onOpenChange={setLockOpen}>
        <DialogContent className='gap-4 p-5 sm:max-w-sm' showCloseButton={false}>
          <DialogHeader className='gap-1.5'>
            <DialogTitle className='text-base'>{t('lockTitle')}</DialogTitle>
            <DialogDescription className='text-xs leading-relaxed'>{t('lockDesc')}</DialogDescription>
          </DialogHeader>
          <DialogFooter className='gap-2 sm:justify-end'>
            <Button type='button' variant='outline' size='sm' onClick={() => setLockOpen(false)}>
              {t('lockCancel')}
            </Button>
            <Button
              type='button'
              size='sm'
              onClick={() => {
                setLockOpen(false)
                router.push('/dashboard/pricing')
              }}
            >
              {t('lockUpgrade')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default SystemSwitcher
