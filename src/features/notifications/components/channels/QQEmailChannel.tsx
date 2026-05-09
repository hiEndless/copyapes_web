'use client'

import { useState } from 'react'

import type { UseFormReturn } from 'react-hook-form'

import { Info, Loader2 } from 'lucide-react'
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

const STEPS = [
  '登录 QQ 邮箱，点击左上角的“设置”',
  '切换到“账号”选项卡',
  '找到“POP3/IMAP/SMTP/Exchange/CardDAV/CalDAV服务”部分',
  '开启“POP3/SMTP服务”，根据提示发送短信进行验证',
  '获取系统生成的“授权码”，复制并粘贴到下方输入框',
  <span key='link'>
    图文教程：
    <a
      href='https://www.jijyun.cn/help/detail/914'
      target='_blank'
      rel='noopener noreferrer'
      className='text-blue-500 hover:underline'
    >
      如何开启QQ邮箱SMTP服务？
    </a>
  </span>
]

export function QQEmailChannel({ form }: ChannelProps) {
  const [isValidating, setIsValidating] = useState(false)

  const validateQQMail = async () => {
    const qq = form.getValues('config.qq_email_address')
    const authCode = form.getValues('config.qq_auth_code')

    if (!qq || !authCode) {
      toast.error('请填写 QQ 账号和授权码')

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
        toast.success('邮箱校验成功')
      }
    } catch (error) {
      console.error('校验失败:', error)
    } finally {
      setIsValidating(false)
    }
  }

  return (
    <div className='space-y-4'>
      <h3 className='text-muted-foreground text-sm font-medium tracking-wider uppercase'>QQ 邮箱配置</h3>

      <Alert variant='default' className='bg-muted/50'>
        <Info className='h-4 w-4' />
        <AlertTitle className='text-sm font-medium'>如何获取 QQ 邮箱授权码</AlertTitle>
        <AlertDescription>
          <ol className='text-muted-foreground mt-2 list-inside list-decimal space-y-1 text-xs'>
            {STEPS.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </AlertDescription>
      </Alert>

      <div className='grid grid-cols-2 items-start gap-4'>
        <FormField
          control={form.control}
          name='config.qq_email_address'
          render={({ field }) => (
            <FormItem>
              <FormLabel>QQ 账号</FormLabel>
              <FormControl>
                <div className='flex items-center'>
                  <Input
                    placeholder='12345678'
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
              <FormLabel>授权码</FormLabel>
              <FormControl>
                <Input placeholder='abcdefghijklmnop' {...field} value={field.value || ''} />
              </FormControl>
              <FormDescription className='text-xs'>在 QQ 邮箱 设置 &gt; 账户 &gt; 生成授权码 获取。</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className='col-span-2 flex justify-end'>
          <Button type='button' onClick={validateQQMail} disabled={isValidating}>
            {isValidating && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            校验配置
          </Button>
        </div>
      </div>
    </div>
  )
}
