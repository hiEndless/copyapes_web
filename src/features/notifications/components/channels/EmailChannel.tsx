'use client'

import type { UseFormReturn } from 'react-hook-form'

import type { NotificationChannelUpdate } from '../../types'
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form'
import { Input } from '@/components/ui/input'

interface ChannelProps {
  form: UseFormReturn<NotificationChannelUpdate>
}

export function EmailChannel({ form }: ChannelProps) {
  return (
    <div className='space-y-4'>
      <h3 className='text-muted-foreground text-sm font-medium tracking-wider uppercase'>SMTP 服务器配置</h3>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <FormField
          control={form.control}
          name='config.smtp_host'
          render={({ field }) => (
            <FormItem>
              <FormLabel>SMTP 服务器地址</FormLabel>
              <FormControl>
                <Input placeholder='smtp.example.com' {...field} value={field.value || ''} />
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
              <FormLabel>SMTP 端口</FormLabel>
              <FormControl>
                <Input
                  type='number'
                  placeholder='587'
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
              <FormLabel>用户名</FormLabel>
              <FormControl>
                <Input placeholder='user@example.com' {...field} value={field.value || ''} />
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
              <FormLabel>密码</FormLabel>
              <FormControl>
                <Input type='password' placeholder='••••••••' {...field} value={field.value || ''} />
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
            <FormLabel>发件人地址</FormLabel>
            <FormControl>
              <Input placeholder='notifications@example.com' {...field} value={field.value || ''} />
            </FormControl>
            <FormDescription>作为发件人显示的邮箱地址。</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name='config.email_address'
        render={({ field }) => (
          <FormItem>
            <FormLabel>收件人地址</FormLabel>
            <FormControl>
              <Input placeholder='admin@example.com' {...field} value={field.value || ''} />
            </FormControl>
            <FormDescription>接收通知的邮箱地址。</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
