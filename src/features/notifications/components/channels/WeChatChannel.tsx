'use client'

import { useState } from 'react'

import type { UseFormReturn } from 'react-hook-form'

import { Info, RefreshCw } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { request } from '@/api/request'
import type { NotificationChannelUpdate } from '../../types'
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

interface ChannelProps {
  form: UseFormReturn<NotificationChannelUpdate>
}

const STEP_KEYS = ['1', '2', '3'] as const

export function WeChatChannel({ form }: ChannelProps) {
  const t = useTranslations('DashboardNotifications')
  const [authCode, setAuthCode] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)

  const generateAuthCode = async () => {
    setIsGenerating(true)

    try {
      const response = await request<{ wx_code: string }>('/wx/', { method: 'POST' })

      // request helper 已经兼容了返回格式并拦截了错误，如果 code === 0 说明成功
      if (response.code === 0) {
        // 兼容一下不同的数据结构层级，避免取不到值
        const newCode = response.data?.wx_code || (response as any).wx_code

        if (newCode) {
          setAuthCode(newCode)
          form.setValue('config.wechat_auth_code', newCode, { shouldDirty: true })
          toast.success(t('wechat.toast.generateSuccess'))
        } else {
          toast.error(t('wechat.toast.generateFailed'))
        }
      }
    } catch (error) {
      console.error('Failed to generate auth code:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className='space-y-4'>
      <h3 className='text-muted-foreground text-sm font-medium tracking-wider uppercase'>{t('wechat.sectionTitle')}</h3>

      <Alert variant='default' className='bg-muted/50 flex flex-col justify-between gap-4 sm:flex-row sm:items-center'>
        <div className='grid grid-cols-[calc(var(--spacing)*4)_1fr] items-center gap-x-3 gap-y-0.5'>
          <Info className='h-4 w-4' />
          <AlertTitle className='text-sm font-medium'>{t('wechat.alertTitle')}</AlertTitle>
          <AlertDescription>
            <ol className='text-muted-foreground mt-2 list-inside list-decimal space-y-1 text-xs'>
              {STEP_KEYS.map(key => (
                <li key={key}>{t(`wechat.steps.${key}`)}</li>
              ))}
            </ol>
          </AlertDescription>
        </div>
        <div className='shrink-0 rounded-md border bg-white p-1'>
          <img src='/channel_logo/getqrcode.jpeg' alt={t('wechat.qrAlt')} className='h-24 w-24 object-contain' />
        </div>
      </Alert>

      <div className='space-y-4'>
        <FormField
          control={form.control}
          name='config.wechat_auth_code'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('wechat.authCodeLabel')}</FormLabel>
              <div className='flex gap-3'>
                <FormControl>
                  <Input
                    placeholder={t('wechat.authCodePlaceholder')}
                    {...field}
                    value={authCode || field.value || ''}
                    readOnly
                    className='bg-muted/30 font-mono'
                  />
                </FormControl>
                <Button
                  type='button'
                  variant='secondary'
                  onClick={generateAuthCode}
                  disabled={isGenerating}
                  className='border border-transparent dark:border-input'
                >
                  {isGenerating ? <RefreshCw className='mr-2 h-4 w-4 animate-spin' /> : null}
                  {authCode ? t('wechat.regenerate') : t('wechat.generate')}
                </Button>
              </div>
              <FormDescription>{t('wechat.authCodeDesc')}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}
