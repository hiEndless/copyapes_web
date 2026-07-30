'use client'

import { useState } from 'react'
import { Loader2Icon } from 'lucide-react'

import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { updateApiName } from '@/api/apiadd'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import type { ApiItem } from './api-datatable'

interface ApiEditLabelDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: ApiItem | null
  onSuccess?: () => void
}

export function ApiEditLabelDialog({ open, onOpenChange, item, onSuccess }: ApiEditLabelDialogProps) {
  const t = useTranslations('DashboardApi')
  const [loading, setLoading] = useState(false)
  const [label, setLabel] = useState('')

  // Sync initial state when modal opens
  if (open && item && label === '' && !loading) {
    setLabel(item.api_name || '')
  }

  const handleClose = () => {
    onOpenChange(false)
    setLabel('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!item) return

    if (!label.trim()) {
      toast.error(t('editLabel.empty'))
      return
    }

    setLoading(true)

    try {
      const res = await updateApiName({ api_id: item.id, api_name: label.trim() })

      if (res.code === 0) {
        toast.success(t('editLabel.success'))
        handleClose()
        onSuccess?.()
      } else {
        toast.error(res.error || t('editLabel.failed'))
      }
    } catch (error) {
      console.error('修改失败:', error)
      toast.error(t('editLabel.failedRetry'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={val => {
        if (!val) handleClose()
        else onOpenChange(val)
      }}
    >
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>{t('editLabel.title')}</DialogTitle>
          <DialogDescription>{t('editLabel.description')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4 pt-2'>
          <div className='space-y-2'>
            <Label htmlFor='edit_api_label'>{t('editLabel.label')}</Label>
            <Input
              id='edit_api_label'
              placeholder={t('editLabel.placeholder')}
              required
              value={label}
              onChange={e => setLabel(e.target.value)}
            />
          </div>

          <DialogFooter className='pt-2'>
            <Button type='button' variant='outline' onClick={handleClose} disabled={loading}>
              {t('common.cancel')}
            </Button>
            <Button type='submit' disabled={loading || label.trim() === ''}>
              {loading && <Loader2Icon className='mr-2 size-4 animate-spin' />}
              {loading ? t('editLabel.saving') : t('editLabel.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
