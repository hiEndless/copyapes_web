'use client'

import { useEffect, useState, type ReactNode } from 'react'

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
  markIncubatorSsoConsent,
  readStudioVip
} from '@/lib/incubator-auth'

type GatePhase = 'checking' | 'need_auth' | 'allowed'

const IncubatorAccessGuard = ({ children }: { children: ReactNode }) => {
  const router = useRouter()
  const t = useTranslations('DashboardShell.systemSwitch')
  const [phase, setPhase] = useState<GatePhase>('checking')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let redirected = false
    let cancelled = false

    const redirectHome = () => {
      if (redirected || cancelled) return
      redirected = true
      router.replace('/dashboard')
    }

    const enforce = async (isStudioVip: boolean | null) => {
      if (cancelled) return

      if (isStudioVip === null) return

      if (!isStudioVip) {
        toast.error(t('lockDesc'))
        redirectHome()

        return
      }

      if (hasIncubatorSsoConsent()) {
        setPhase('allowed')

        return
      }

      setPhase('need_auth')
    }

    void enforce(readStudioVip())

    const onProfileUpdated = () => {
      void enforce(readStudioVip())
    }

    window.addEventListener('entitlementProfileUpdated', onProfileUpdated)

    const timer = window.setTimeout(() => {
      const current = readStudioVip()

      void enforce(current === null ? false : current)
    }, 1200)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
      window.removeEventListener('entitlementProfileUpdated', onProfileUpdated)
    }
  }, [router, t])

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
    return <>{children}</>
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
