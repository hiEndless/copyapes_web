'use client'

import { useEffect, useState } from 'react'

import { toast } from 'sonner'
import { PlusIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { listIncubatorProxyEgressIps } from '@/lib/incubator-proxy'

import { ApiBindFormStep, type ApiFormData } from './api-bind-form-step'

const INITIAL_FORM_DATA: ApiFormData = {
  exchange: 'binance',
  api_label: '',
  api_key: '',
  api_secret: '',
  api_passphrase: '',
  flag: 0
}

export function ApiAddButton({
  onAdd
}: {
  onAdd: (input: ApiFormData) => Promise<void>
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<ApiFormData>(INITIAL_FORM_DATA)
  const [ipWhitelist, setIpWhitelist] = useState('')
  const [ipLoading, setIpLoading] = useState(false)
  const [ipError, setIpError] = useState<string | null>(null)

  const resetDialog = () => {
    setFormData(INITIAL_FORM_DATA)
    setLoading(false)
    setIpWhitelist('')
    setIpLoading(false)
    setIpError(null)
  }

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (!nextOpen) resetDialog()
  }

  useEffect(() => {
    if (!open) return
    let cancelled = false
    setIpLoading(true)
    setIpError(null)
    listIncubatorProxyEgressIps()
      .then(payload => {
        if (cancelled) return
        setIpWhitelist(payload.egress_ips.join(','))
        if (payload.egress_ips.length === 0) {
          setIpError('尚未分配可用出口 IP，请稍后重试或联系管理员')
        }
      })
      .catch(error => {
        if (cancelled) return
        setIpWhitelist('')
        setIpError(error instanceof Error ? error.message : '出口 IP 加载失败')
      })
      .finally(() => {
        if (!cancelled) setIpLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [open])

  const handleChange = (field: string, value: string | boolean | 0 | 1) => {
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

    if (ipLoading) {
      toast.error('出口 IP 加载中，请稍候')
      return
    }

    if (!ipWhitelist.trim()) {
      toast.error(ipError || '暂无可用出口 IP，无法绑定')
      return
    }

    setLoading(true)

    try {
      await onAdd({ ...formData, api_label: formData.api_label.trim() })
      toast.success('添加成功')
      setOpen(false)
      resetDialog()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '添加失败')
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
          ipWhitelist={ipWhitelist}
          ipLoading={ipLoading}
          ipError={ipError}
          loading={loading}
          onChange={handleChange}
          onSubmit={handleSubmit}
        />
      </DialogContent>
    </Dialog>
  )
}
