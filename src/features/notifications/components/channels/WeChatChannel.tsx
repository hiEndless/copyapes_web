'use client'

import { useState } from 'react'

import type { UseFormReturn } from 'react-hook-form'

import { Info, RefreshCw } from 'lucide-react'
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
  '微信扫码关注服务号『ApePush』',
  '点击下方按钮生成授权码',
  '在服务号聊天窗口输入生成的授权码，完成账号关联'
]

export function WeChatChannel({ form }: ChannelProps) {
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
          toast.success('授权码生成成功')
        } else {
          toast.error('未能获取到授权码')
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
      <h3 className='text-muted-foreground text-sm font-medium tracking-wider uppercase'>微信服务号配置</h3>

      <Alert variant='default' className='bg-muted/50 flex flex-col justify-between gap-4 sm:flex-row sm:items-center'>
        <div>
          <Info className='h-4 w-4' />
          <AlertTitle className='text-sm font-medium'>如何绑定服务号以接收通知</AlertTitle>
          <AlertDescription>
            <ol className='text-muted-foreground mt-2 list-inside list-decimal space-y-1 text-xs'>
              {STEPS.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          </AlertDescription>
        </div>
        <div className='shrink-0 rounded-md border bg-white p-1'>
          <img src='/channel_logo/getqrcode.jpeg' alt='ApePush 二维码' className='h-24 w-24 object-contain' />
        </div>
      </Alert>

      <div className='space-y-4'>
        <FormField
          control={form.control}
          name='config.wechat_auth_code'
          render={({ field }) => (
            <FormItem>
              <FormLabel>授权码</FormLabel>
              <div className='flex gap-3'>
                <FormControl>
                  <Input
                    placeholder='点击右侧按钮生成'
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
                  {authCode ? '重新生成' : '生成授权码'}
                </Button>
              </div>
              <FormDescription>请将此授权码发送给服务号进行绑定验证</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}
