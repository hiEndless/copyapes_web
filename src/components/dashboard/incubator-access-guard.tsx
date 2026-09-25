'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  hasIncubatorSsoConsent,
  loginIncubatorSso,
  markIncubatorSsoConsent
} from '@/lib/incubator-auth'
import { canCreateOrStart, parseStudioAccess, type StudioAccessStatus } from '@/lib/incubator-studio-access'

type GatePhase = 'checking' | 'need_auth' | 'allowed'

const StudioAccessContext = createContext<{ status: StudioAccessStatus | null; canCreateOrStart: boolean }>({
  status: null,
  canCreateOrStart: false
})

export const useIncubatorStudioAccess = () => useContext(StudioAccessContext)

const IncubatorAccessGuard = ({ children }: { children: ReactNode }) => {
  const router = useRouter()
  const t = useTranslations('DashboardShell.systemSwitch')
  const [phase, setPhase] = useState<GatePhase>('checking')
  const [submitting, setSubmitting] = useState(false)
  const [accessStatus, setAccessStatus] = useState<StudioAccessStatus | null>(null)

  useEffect(() => {
    setPhase(hasIncubatorSsoConsent() ? 'allowed' : 'need_auth')
  }, [])

  useEffect(() => {
    if (phase !== 'allowed') return
    const controller = new AbortController()
    let inFlight = false

    const refresh = async () => {
      if (inFlight) return
      inFlight = true

      try {
        const token = localStorage.getItem('token')

        if (!token) throw new Error('studio_access_token_missing')

        const response = await fetch('/api/incubator/entitlements/access', {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
          cache: 'no-store'
        })

        if (!response.ok) throw new Error('studio_access_unavailable')
        const status = parseStudioAccess(await response.json())

        if (!controller.signal.aborted) setAccessStatus(status)
      } catch {
        if (!controller.signal.aborted) setAccessStatus('UNAVAILABLE')
      } finally {
        inFlight = false
      }
    }

    void refresh()
    const timer = window.setInterval(() => void refresh(), 60_000)

    window.addEventListener('focus', refresh)

    return () => {
      controller.abort()
      window.clearInterval(timer)
      window.removeEventListener('focus', refresh)
    }
  }, [phase])

  const handleCancel = () => {
    router.replace('/dashboard')
  }

  const handleAuthorize = async () => {
    if (submitting) return

    setSubmitting(true)

    try {
      const result = await loginIncubatorSso()

      markIncubatorSsoConsent({
        user_id: result.user_id,
        workspace_id: result.workspace_id,
        profile_version: result.profile_version
      })

      if (result.disposition === 'created') {
        toast.success(t('authSuccessCreated'))
      } else {
        toast.success(t('authSuccess'))
      }

      setPhase('allowed')
    } catch (error) {
      console.error('Incubator SSO login failed', error)
      toast.error(t('authFailed'))
    } finally {
      setSubmitting(false)
    }
  }

  if (phase === 'allowed') {
    return <StudioAccessContext.Provider value={{
      status: accessStatus,
      canCreateOrStart: canCreateOrStart(accessStatus)
    }}>
      {accessStatus === null && <div role='status' className='mb-3 rounded-md border border-border/60 p-3 text-sm'>{t('checkingAccess')}</div>}
      {accessStatus === 'INACTIVE' && <div role='alert' className='mb-3 rounded-md border border-amber-500/40 p-3 text-sm'>{t('expiredReadOnly')}</div>}
      {accessStatus === 'UNAVAILABLE' && <div role='alert' className='mb-3 rounded-md border border-amber-500/40 p-3 text-sm'>{t('accessUnavailable')}</div>}
      {children}
    </StudioAccessContext.Provider>
  }

  return (
    <>
      <Dialog
        open={phase === 'need_auth'}
        onOpenChange={open => {
          if (!open && !submitting) handleCancel()
        }}
      >
        <DialogContent className='gap-4 p-5 sm:max-w-sm' showCloseButton={false}>
          <DialogHeader className='gap-1.5'>
            <DialogTitle className='text-base'>{t('authTitle')}</DialogTitle>
            <DialogDescription className='text-xs leading-relaxed'>{t('authDesc')}</DialogDescription>
          </DialogHeader>

          <ul className='text-muted-foreground list-outside list-disc space-y-2 pl-4 text-xs leading-relaxed'>
            <li>{t('authPoint1')}</li>
            <li>{t('authPoint2')}</li>
            <li>{t('authPoint3')}</li>
          </ul>

          <DialogFooter className='gap-2 sm:justify-end'>
            <Button type='button' variant='outline' size='sm' onClick={handleCancel} disabled={submitting}>
              {t('authCancel')}
            </Button>
            <Button type='button' size='sm' onClick={() => void handleAuthorize()} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className='size-3.5 animate-spin' />
                  {t('authSubmitting')}
                </>
              ) : (
                t('authConfirm')
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default IncubatorAccessGuard
