'use client'

import { useEffect, useState } from 'react'
import { Loader2Icon } from 'lucide-react'

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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import type { ApiItem } from '../_mock/apis'

interface ApiEditLabelDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: ApiItem | null
  onSave?: (id: number, api_name: string) => void
}

export function ApiEditLabelDialog({ open, onOpenChange, item, onSave }: ApiEditLabelDialogProps) {
  const [loading, setLoading] = useState(false)
  const [label, setLabel] = useState('')

  useEffect(() => {
    if (open && item) {
      setLabel(item.api_name || '')
    }
    if (!open) {
      setLabel('')
      setLoading(false)
    }
  }, [open, item])

  const handleClose = () => {
    onOpenChange(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!item) return

    if (!label.trim()) {
      toast.error('标签名称不能为空')
      return
    }

    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 200))
    onSave?.(item.id, label.trim())
    toast.success('修改成功')
    handleClose()
    setLoading(false)
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
          <DialogTitle>修改 API 标签</DialogTitle>
          <DialogDescription>为该交易所 API 设置一个更容易识别的名称。</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4 pt-2'>
          <div className='space-y-2'>
            <Label htmlFor='edit_api_label'>标签名称</Label>
            <Input
              id='edit_api_label'
              placeholder='例如: 我的主力账户'
              required
              value={label}
              onChange={e => setLabel(e.target.value)}
            />
          </div>

          <DialogFooter className='pt-2'>
            <Button type='button' variant='outline' onClick={handleClose} disabled={loading}>
              取消
            </Button>
            <Button type='submit' disabled={loading || label.trim() === ''}>
              {loading && <Loader2Icon className='mr-2 size-4 animate-spin' />}
              {loading ? '保存中...' : '保存'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
