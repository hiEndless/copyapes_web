'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Lock } from 'lucide-react'

import type { EntitlementProfileResponse } from '@/api/settings'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
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

const readStudioVip = () => {
  try {
    const stored = localStorage.getItem('entitlementProfile')

    if (!stored) return false

    const profile = JSON.parse(stored) as EntitlementProfileResponse

    return Boolean(profile?.is_studio_vip)
  } catch {
    return false
  }
}

const SystemSwitcher = ({ active, className }: SystemSwitcherProps) => {
  const t = useTranslations('DashboardShell.systemSwitch')
  const router = useRouter()
  const [isStudioVip, setIsStudioVip] = useState(false)
  const [lockDialogOpen, setLockDialogOpen] = useState(false)

  useEffect(() => {
    const sync = () => setIsStudioVip(readStudioVip())

    sync()
    window.addEventListener('entitlementProfileUpdated', sync)

    return () => {
      window.removeEventListener('entitlementProfileUpdated', sync)
    }
  }, [])

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
          const isIncubatorLocked = item.id === 'incubator' && !isStudioVip

          if (isIncubatorLocked) {
            return (
              <button
                key={item.id}
                type='button'
                role='tab'
                aria-selected={isActive}
                aria-disabled
                onClick={() => setLockDialogOpen(true)}
                className={cn(
                  'relative flex items-center justify-center gap-1 rounded-lg px-2 py-2 text-xs font-medium transition-all duration-200',
                  'text-muted-foreground hover:bg-background/80 hover:text-foreground'
                )}
              >
                <span className='truncate'>{item.label}</span>
                <Lock className='size-3 shrink-0 opacity-70' />
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

      <AlertDialog open={lockDialogOpen} onOpenChange={setLockDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('lockTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('lockDesc')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('lockCancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={() => router.push('/dashboard/pricing')}>
              {t('lockUpgrade')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default SystemSwitcher
