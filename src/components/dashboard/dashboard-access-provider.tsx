'use client'

import { createContext, useContext, useEffect, useState, useSyncExternalStore, type ReactNode } from 'react'

import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'

import { request } from '@/api/request'
import { createDashboardAccessStore, dashboardRoleForPath, EMPTY_DASHBOARD_ACCESS, type DashboardAccessSnapshot } from '@/lib/dashboard-access'

const AccessContext = createContext<DashboardAccessSnapshot>(EMPTY_DASHBOARD_ACCESS)
const browserToken = () => typeof window === 'undefined' ? '' : localStorage.getItem('token') || ''

export function DashboardAccessProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [store] = useState(createDashboardAccessStore)
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot, () => EMPTY_DASHBOARD_ACCESS)
  const identity = JSON.stringify([pathname, browserToken()])

  useEffect(() => {
    const refresh = () => {
      const token = browserToken()

      store.invalidate()
      void store.verify(JSON.stringify([pathname, token]), () => token
        ? request('/auth/dashboard-access/', { method: 'GET', cache: 'no-store', silent: true })
        : Promise.resolve(null))
    }

    const onStorage = (event: StorageEvent) => {
      if (event.key === null || event.key === 'token' || event.key === 'userInfo') refresh()
    }

    refresh()
    window.addEventListener('focus', refresh)
    window.addEventListener('storage', onStorage)
    window.addEventListener('userInfoUpdated', refresh)

    return () => {
      window.removeEventListener('focus', refresh)
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('userInfoUpdated', refresh)
      store.invalidate()
    }
  }, [pathname, store])

  const verified = snapshot.identity === identity ? snapshot : EMPTY_DASHBOARD_ACCESS

  return <AccessContext.Provider value={verified}>{children}</AccessContext.Provider>
}

export const useDashboardAccess = () => useContext(AccessContext)

export function DashboardRouteGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const access = useDashboardAccess()
  const t = useTranslations('DashboardAccess')
  const role = dashboardRoleForPath(pathname)

  if (!role) return children
  if (access.status === 'checking') return <p role='status'>{t('checking')}</p>
  if (access.status !== 'ready' || !access.roles[role]) return <p role='alert'>{t('denied')}</p>

  return children
}
