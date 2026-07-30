'use client'

import type { UseFormReturn } from 'react-hook-form'
import { useTranslations } from 'next-intl'

import type { NotificationChannelUpdate } from '../../types'
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form'
import { Input } from '@/components/ui/input'

interface ChannelProps {
  form: UseFormReturn<NotificationChannelUpdate>
}

export function EmailChannel({ form }: ChannelProps) {
  const t = useTranslations('DashboardNotifications')

  return (
    <div className='space-y-4'>
      <h3 className='text-muted-foreground text-sm font-medium tracking-wider uppercase'>{t('email.sectionTitle')}</h3>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <FormField
          control={form.control}
          name='config.smtp_host'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('email.smtpHostLabel')}</FormLabel>
              <FormControl>
                <Input placeholder={t('email.smtpHostPlaceholder')} {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='config.smtp_port'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('email.smtpPortLabel')}</FormLabel>
              <FormControl>
                <Input
                  type='number'
                  placeholder={t('email.smtpPortPlaceholder')}
                  {...field}
                  value={field.value || ''}
                  onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <FormField
          control={form.control}
          name='config.smtp_username'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('email.usernameLabel')}</FormLabel>
              <FormControl>
                <Input placeholder={t('email.usernamePlaceholder')} {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='config.smtp_password'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('email.passwordLabel')}</FormLabel>
              <FormControl>
                <Input type='password' placeholder={t('email.passwordPlaceholder')} {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name='config.email_from'
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('email.fromLabel')}</FormLabel>
            <FormControl>
              <Input placeholder={t('email.fromPlaceholder')} {...field} value={field.value || ''} />
            </FormControl>
            <FormDescription>{t('email.fromDesc')}</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name='config.email_address'
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('email.toLabel')}</FormLabel>
            <FormControl>
              <Input placeholder={t('email.toPlaceholder')} {...field} value={field.value || ''} />
            </FormControl>
            <FormDescription>{t('email.toDesc')}</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
