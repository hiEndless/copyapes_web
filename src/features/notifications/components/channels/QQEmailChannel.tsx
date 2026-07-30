'use client'

import { useState } from 'react'

import type { UseFormReturn } from 'react-hook-form'

import { Info, Loader2 } from 'lucide-react'
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

const STEP_KEYS = ['1', '2', '3', '4', '5'] as const

export function QQEmailChannel({ form }: ChannelProps) {
  const t = useTranslations('DashboardNotifications')
  const [isValidating, setIsValidating] = useState(false)

  const validateQQMail = async () => {
    const qq = form.getValues('config.qq_email_address')
    const authCode = form.getValues('config.qq_auth_code')

    if (!qq || !authCode) {
      toast.error(t('qqEmail.toast.fillRequired'))

      return
    }

    setIsValidating(true)

    try {
      const response = await request('/qqmail/', {
        method: 'POST',
        body: {
          qq: qq,
          password: authCode
        }
      })

      if (response.code === 0) {
        toast.success(t('qqEmail.toast.validateSuccess'))
      }
    } catch (error) {
      console.error('Failed to validate QQ mail:', error)
    } finally {
      setIsValidating(false)
    }
  }

  return (
    <div className='space-y-4'>
      <h3 className='text-muted-foreground text-sm font-medium tracking-wider uppercase'>{t('qqEmail.sectionTitle')}</h3>

      <Alert variant='default' className='bg-muted/50'>
        <Info className='h-4 w-4' />
        <AlertTitle className='text-sm font-medium'>{t('qqEmail.alertTitle')}</AlertTitle>
        <AlertDescription>
          <ol className='text-muted-foreground mt-2 list-inside list-decimal space-y-1 text-xs'>
            {STEP_KEYS.map(key => (
              <li key={key}>{t(`qqEmail.steps.${key}`)}</li>
            ))}
            <li>
              {t.rich('qqEmail.stepTutorial', {
                link: chunks => (
                  <a
                    href='https://www.jijyun.cn/help/detail/914'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-blue-500 hover:underline'
                  >
                    {chunks}
                  </a>
                )
              })}
            </li>
          </ol>
        </AlertDescription>
      </Alert>

      <div className='grid grid-cols-2 items-start gap-4'>
        <FormField
          control={form.control}
          name='config.qq_email_address'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('qqEmail.qqLabel')}</FormLabel>
              <FormControl>
                <div className='flex items-center'>
                  <Input
                    placeholder={t('qqEmail.qqPlaceholder')}
                    {...field}
                    value={field.value || ''}
                    className=''
                  />
                  <span className='text-muted-foreground inline-flex h-10 items-center px-3 text-md'>
                    @qq.com
                  </span>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='config.qq_auth_code'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('qqEmail.authCodeLabel')}</FormLabel>
              <FormControl>
                <Input placeholder={t('qqEmail.authCodePlaceholder')} {...field} value={field.value || ''} />
              </FormControl>
              <FormDescription className='text-xs'>{t('qqEmail.authCodeDesc')}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className='col-span-2 flex justify-end'>
          <Button type='button' onClick={validateQQMail} disabled={isValidating}>
            {isValidating && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            {t('qqEmail.validate')}
          </Button>
        </div>
      </div>
    </div>
  )
}
