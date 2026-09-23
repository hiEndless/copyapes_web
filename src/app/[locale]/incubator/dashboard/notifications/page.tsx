'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Info, Loader2, Save, Send } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import {
  getIncubatorDingtalkChannel,
  saveIncubatorDingtalkChannel,
  setIncubatorDingtalkEnabled,
  testIncubatorDingtalkChannel,
  type IncubatorDingtalkChannel
} from '@/lib/incubator-notifications'

const DINGTALK_STEPS = [
  '打开钉钉，进入需要接收通知的群聊',
  '点击右上角「...」→ 群设置 → 智能群助手 → 添加机器人',
  '选择「自定义（通过 Webhook 接入自定义服务）」',
  '设置机器人名称，安全设置必须选择「加签」并记录密钥，不要选择关键词',
  '完成后复制 Webhook 地址，粘贴到下方输入框'
] as const

const EMPTY_CHANNEL: IncubatorDingtalkChannel = {
  enabled: false,
  configured: false,
  webhook: '',
  secret: '',
  webhook_hint: '',
  updated_at: null
}

function StatusDot({ enabled }: { enabled: boolean }) {
  return (
    <div className='relative mr-2 flex h-3 w-3'>
      {enabled ? (
        <>
          <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75 dark:bg-green-500' />
          <span className='relative inline-flex h-3 w-3 rounded-full bg-green-500 dark:bg-green-400' />
        </>
      ) : (
        <span className='relative inline-flex h-3 w-3 rounded-full bg-gray-300 dark:bg-gray-600' />
      )}
    </div>
  )
}

export default function IncubatorNotificationsPage() {
  const [config, setConfig] = useState<IncubatorDingtalkChannel>(EMPTY_CHANNEL)
  const [draftWebhook, setDraftWebhook] = useState('')
  const [draftSecret, setDraftSecret] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)

  const applyChannel = (channel: IncubatorDingtalkChannel) => {
    setConfig(channel)
    setDraftWebhook(channel.webhook || '')
    setDraftSecret(channel.secret || '')
  }

  useEffect(() => {
    let cancelled = false
    getIncubatorDingtalkChannel()
      .then(channel => {
        if (!cancelled) applyChannel(channel)
      })
      .catch(error => {
        if (!cancelled) toast.error(error instanceof Error ? error.message : '钉钉配置读取失败')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const handleToggle = async (enabled: boolean) => {
    if (enabled && !config.configured) {
      toast.error('请先保存 Webhook 配置后再开启')
      return
    }
    setSaving(true)
    try {
      applyChannel(await setIncubatorDingtalkEnabled(enabled))
      toast.success(enabled ? '已开启钉钉通知' : '已关闭钉钉通知')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '钉钉开关保存失败')
    } finally {
      setSaving(false)
    }
  }

  const handleSave = async () => {
    const webhook = draftWebhook.trim()
    const secret = draftSecret.trim()
    if (!webhook) {
      toast.error('请填写 Webhook 地址')
      return
    }
    if (!secret) {
      toast.error('请填写签名密钥')
      return
    }

    setSaving(true)
    try {
      applyChannel(await saveIncubatorDingtalkChannel(webhook, secret))
      toast.success('钉钉配置已保存')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '钉钉配置保存失败')
    } finally {
      setSaving(false)
    }
  }

  const handleTest = async () => {
    if (!config.enabled) {
      toast.error('请先开启并保存钉钉通知')
      return
    }

    setTesting(true)
    try {
      await testIncubatorDingtalkChannel()
      toast.success('测试消息已发送')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '测试消息发送失败')
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className='flex h-full flex-col gap-4 overflow-y-auto p-4 lg:p-6'>
      <div className='flex flex-col gap-2'>
        <h2 className='text-2xl font-bold tracking-tight'>消息通知</h2>
        <p className='text-muted-foreground text-sm'>
          当前仅支持钉钉机器人。配置后可用于项目状态、轮次变更等告警。
        </p>
      </div>

      <div className='flex min-h-[560px] flex-col gap-4 md:flex-row'>
        <Card className='h-fit w-full shadow-sm md:w-[30%]'>
          <CardHeader className='px-4 py-3'>
            <CardTitle className='text-base'>通知渠道</CardTitle>
            <CardDescription className='text-xs'>选择要配置的渠道</CardDescription>
          </CardHeader>
          <CardContent className='p-2 pt-0'>
            <div
              className={cn(
                'bg-accent text-accent-foreground flex items-center justify-between rounded-lg p-3 shadow-sm'
              )}
            >
              <div className='flex min-w-0 items-center gap-3'>
                <StatusDot enabled={config.enabled} />
                <span className='bg-background flex size-8 shrink-0 items-center justify-center rounded-md border p-1'>
                  <img src='/channel_logo/dingding.svg' alt='钉钉' className='size-full object-contain' />
                </span>
                <div className='min-w-0'>
                  <p className='truncate text-sm font-medium'>钉钉机器人</p>
                  <p className='text-muted-foreground text-[11px]'>
                    {config.enabled ? '已开启' : '未开启'}
                  </p>
                </div>
              </div>
              <div onClick={event => event.stopPropagation()}>
                <Switch
                  checked={config.enabled}
                  disabled={loading || saving}
                  onCheckedChange={checked => void handleToggle(checked)}
                  className='scale-75'
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='flex w-full flex-col shadow-sm md:w-[70%]'>
          <CardHeader className='px-4 py-3'>
            <CardTitle className='text-base'>钉钉机器人 配置</CardTitle>
            <CardDescription className='text-xs'>
              {config.updated_at ? `最近更新 ${new Date(config.updated_at).toLocaleDateString('zh-CN')}` : '尚未配置'}
            </CardDescription>
          </CardHeader>

          <CardContent className='flex flex-1 flex-col gap-4 border-t px-4 py-4'>
            <div className='space-y-3'>
              <p className='text-muted-foreground text-xs font-medium tracking-wider uppercase'>
                钉钉机器人配置
              </p>

              <Alert className='bg-muted/50'>
                <Info className='size-4' />
                <AlertTitle className='text-sm font-medium'>如何创建钉钉机器人</AlertTitle>
                <AlertDescription>
                  <ol className='text-muted-foreground mt-2 list-inside list-decimal space-y-1 text-xs'>
                    {DINGTALK_STEPS.map(step => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                </AlertDescription>
              </Alert>

              <div className='space-y-1.5'>
                <Label htmlFor='ding-webhook'>Webhook 地址</Label>
                <Input
                  id='ding-webhook'
                  placeholder='https://oapi.dingtalk.com/robot/send?access_token=...'
                  value={draftWebhook}
                  onChange={event => setDraftWebhook(event.target.value)}
                  onBlur={event => setDraftWebhook(event.target.value.trim())}
                />
                <p className='text-muted-foreground text-xs'>从钉钉群的机器人设置中复制 Webhook 地址。</p>
              </div>

              <div className='space-y-1.5'>
                <Label htmlFor='ding-secret'>签名密钥</Label>
                <Input
                  id='ding-secret'
                  placeholder='SEC...'
                  value={draftSecret}
                  onChange={event => setDraftSecret(event.target.value)}
                  onBlur={event => setDraftSecret(event.target.value.trim())}
                />
                <p className='text-muted-foreground text-xs'>安全设置选择「加签」，请在此粘贴密钥。</p>
              </div>
            </div>

            <div className='mt-auto flex items-center justify-between border-t pt-4'>
              <Button
                type='button'
                variant='outline'
                size='sm'
                className='h-8 gap-1.5'
                disabled={testing || loading || !config.enabled}
                onClick={() => void handleTest()}
              >
                {testing ? <Loader2 className='size-3.5 animate-spin' /> : <Send className='size-3.5' />}
                测试连接
              </Button>
              <Button
                type='button'
                size='sm'
                className='h-8 gap-1.5'
                disabled={saving || loading}
                onClick={() => void handleSave()}
              >
                {saving ? <Loader2 className='size-3.5 animate-spin' /> : <Save className='size-3.5' />}
                保存配置
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
