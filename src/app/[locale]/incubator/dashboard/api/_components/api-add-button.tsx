'use client'

import { useState } from 'react'

import { toast } from 'sonner'
import { PlusIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

import { ApiBindFormStep, type ApiFormData } from './api-bind-form-step'

const EXCHANGE_IP_WHITELIST = process.env.NEXT_PUBLIC_IP_WHITELIST ?? '127.0.0.1'

const INITIAL_FORM_DATA: ApiFormData = {
  exchange: 'binance',
  api_label: '',
  api_key: '',
  api_secret: '',
  api_passphrase: ''
}

export function ApiAddButton({
  onAdd
}: {
  onAdd?: (input: { exchange: string; api_name: string }) => void
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<ApiFormData>(INITIAL_FORM_DATA)

  const resetDialog = () => {
    setFormData(INITIAL_FORM_DATA)
    setLoading(false)
  }

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (!nextOpen) resetDialog()
  }

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.api_label.trim()) {
      toast.error('请填写备注名称')
      return
    }

    if (!formData.api_key.trim() || !formData.api_secret.trim()) {
      toast.error('请填写 API Key 与 Secret')
      return
    }

    setLoading(true)

    try {
      // 演示：本地写入，不请求后端
      await new Promise(resolve => setTimeout(resolve, 300))
      onAdd?.({
        exchange: formData.exchange,
        api_name: formData.api_label.trim()
      })
      toast.success('添加成功')
      setOpen(false)
      resetDialog()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size='sm' className='gap-1.5'>
          <PlusIcon className='size-4' />
          添加 API
        </Button>
      </DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className={cn('flex max-h-[90dvh] flex-col gap-0 overflow-hidden p-0 shadow-none sm:max-w-2xl')}
      >
        <ApiBindFormStep
          formData={formData}
          ipWhitelist={EXCHANGE_IP_WHITELIST}
          loading={loading}
          onChange={handleChange}
          onSubmit={handleSubmit}
        />
      </DialogContent>
    </Dialog>
  )
}
