'use client'

import { useState, useEffect } from 'react'

import { toast } from 'sonner'
import { PlusIcon } from 'lucide-react'

import { getIpList, validateApiAdd, addApi } from '@/api/apiadd'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

import { ApiBindFormStep, type ApiFormData } from './api-bind-form-step'
import { ApiRiskDisclosureStep } from './api-risk-disclosure-step'

const EXCHANGE_IP_WHITELIST = process.env.NEXT_PUBLIC_IP_WHITELIST ?? '127.0.0.1'

const INITIAL_FORM_DATA: ApiFormData = {
  exchange: 'okx',
  api_label: '',
  is_read_only: true,
  api_key: '',
  api_secret: '',
  api_passphrase: ''
}

export function ApiAddButton({ onSuccess }: { onSuccess?: () => void }) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<1 | 2>(1)
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState<ApiFormData>(INITIAL_FORM_DATA)
  const [ipWhitelist, setIpWhitelist] = useState<string>(EXCHANGE_IP_WHITELIST)

  useEffect(() => {
    if (open && step === 2) {
      getIpList()
        .then((res) => {
          if (res.code === 0 && Array.isArray(res.data) && res.data.length > 0) {
            const ips = res.data.map((item) => item.ip).join(',')

            setIpWhitelist(ips)
          }
        })
        .catch((err) => {
          console.error('获取 IP 失败', err)
        })
    }
  }, [open, step])

  const resetDialog = () => {
    setStep(1)
    setFormData(INITIAL_FORM_DATA)
    setLoading(false)
  }

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)

    if (!nextOpen) {
      resetDialog()
    }
  }

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let platform = 1

      if (formData.exchange === 'binance') platform = 2
      else if (formData.exchange === 'gate') platform = 3
      else if (formData.exchange === 'bitget') platform = 4
      else if (formData.exchange === 'weex') platform = 5

      const payload = {
        platform,
        flag: 0,
        is_readonly: formData.is_read_only,
        api_name: formData.api_label,
        api_key: formData.api_key,
        secret_key: formData.api_secret,
        passPhrase: formData.api_passphrase
      }

      const validateRes = await validateApiAdd(payload)

      if (validateRes.code !== 0) {
        return
      }

      const addRes = await addApi(payload)

      if (addRes.code !== 0) {
        return
      }

      toast.success('添加成功')
      setOpen(false)
      resetDialog()
      onSuccess?.()
    } catch (error) {
      console.error('添加失败:', error)
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
        className={cn(
          'flex max-h-[90dvh] flex-col gap-0 overflow-hidden p-0 shadow-none sm:max-w-2xl'
        )}
      >
        {step === 1 ? (
          <ApiRiskDisclosureStep onNext={() => setStep(2)} />
        ) : (
          <ApiBindFormStep
            formData={formData}
            ipWhitelist={ipWhitelist}
            loading={loading}
            onBack={() => setStep(1)}
            onChange={handleChange}
            onSubmit={handleSubmit}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
