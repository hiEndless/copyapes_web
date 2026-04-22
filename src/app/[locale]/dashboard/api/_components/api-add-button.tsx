'use client'

import { useState, useEffect } from 'react'

import { PlusIcon, Loader2Icon } from 'lucide-react'

import { getIpList } from '@/api/apiadd'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'

const EXCHANGE_IP_WHITELIST = process.env.NEXT_PUBLIC_IP_WHITELIST ?? '127.0.0.1'

const EXCHANGES = [
  { label: 'OKX', value: 'okx', logo: '/exchanges/okx.png' },
  { label: 'Binance', value: 'binance', logo: '/exchanges/binance.png' },
  { label: 'Gate', value: 'gate', logo: '/exchanges/gate.png' },
  { label: 'Bitget', value: 'bitget', logo: '/exchanges/bitget.png' }
]

export function ApiAddButton({ onSuccess }: { onSuccess?: () => void }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    exchange: 'okx',
    api_label: '',
    is_read_only: true,
    api_key: '',
    api_secret: '',
    api_passphrase: ''
  })

  const [ipWhitelist, setIpWhitelist] = useState<string>(EXCHANGE_IP_WHITELIST)

  useEffect(() => {
    if (open) {
      getIpList()
        .then(res => {
          if (res.code === 0 && Array.isArray(res.data) && res.data.length > 0) {
            const ips = res.data.map(item => item.ip).join(',')
            setIpWhitelist(ips)
          }
        })
        .catch(err => {
          console.error('获取 IP 失败', err)
        })
    }
  }, [open])

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // 模拟 API 请求
      console.log('提交的 API 数据:', formData)
      await new Promise(resolve => setTimeout(resolve, 1000))

      alert('添加成功')
      setOpen(false)
      setFormData({
        exchange: 'okx',
        api_label: '',
        is_read_only: true,
        api_key: '',
        api_secret: '',
        api_passphrase: ''
      })
      onSuccess?.()
    } catch (error) {
      console.error('添加失败:', error)
      alert('添加失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size='sm' className='gap-1.5'>
          <PlusIcon className='size-4' />
          添加 API
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[460px]'>
        <DialogHeader>
          <DialogTitle>添加交易所 API</DialogTitle>
          <DialogDescription>将您的交易所 API 添加到系统中以进行交易或跟单</DialogDescription>
          <div
            className='text-foreground/90 mt-3 flex gap-2 rounded-lg border-0 bg-amber-50 px-3 py-2 text-xs dark:bg-amber-950/25 dark:text-amber-50/95'
            role='note'
          >
            <span className='shrink-0 text-sm leading-snug select-none' aria-hidden>
              💡
            </span>
            <p className='min-w-0 leading-relaxed'>
              为了安全起见，请在交易所给交易权限的 API 绑定 IP 白名单（只读权限的 API 不要绑定）：<strong className='font-mono'>{ipWhitelist}</strong>
            </p>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4 pt-2'>
          <div className='space-y-2'>
            <Label htmlFor='exchange'>交易所</Label>
            <Select value={formData.exchange} onValueChange={val => handleChange('exchange', val)}>
              <SelectTrigger id='exchange'>
                <SelectValue placeholder='选择交易所' />
              </SelectTrigger>
              <SelectContent>
                {EXCHANGES.map(ex => (
                  <SelectItem key={ex.value} value={ex.value}>
                    <div className='flex items-center gap-2'>
                      <img src={ex.logo} alt={ex.label} className='size-4 object-contain' />
                      <span>{ex.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='api_label'>标签名称</Label>
            <Input
              id='api_label'
              placeholder='例如: 我的主力账户'
              value={formData.api_label}
              onChange={e => handleChange('api_label', e.target.value)}
            />
          </div>

          <div className='space-y-3'>
            <Label>API 权限类型</Label>
            <div className='flex items-center gap-6'>
              <label className='flex cursor-pointer items-center gap-2'>
                <Checkbox checked={formData.is_read_only} onCheckedChange={() => handleChange('is_read_only', true)} />
                <span className='text-sm font-medium'>只读 (信号)</span>
              </label>
              <label className='flex cursor-pointer items-center gap-2'>
                <Checkbox
                  checked={!formData.is_read_only}
                  onCheckedChange={() => handleChange('is_read_only', false)}
                />
                <span className='text-sm font-medium'>交易 (跟单)</span>
              </label>
            </div>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='api_key'>API Key</Label>
            <Input
              id='api_key'
              placeholder='输入 API Key'
              required
              value={formData.api_key}
              onChange={e => handleChange('api_key', e.target.value)}
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='api_secret'>API Secret</Label>
            <Input
              id='api_secret'
              type='password'
              placeholder='输入 API Secret'
              required
              value={formData.api_secret}
              onChange={e => handleChange('api_secret', e.target.value)}
            />
          </div>

          {['okx', 'bitget'].includes(formData.exchange) && (
            <div className='space-y-2'>
              <Label htmlFor='api_passphrase'>Passphrase</Label>
              <Input
                id='api_passphrase'
                type='password'
                placeholder='输入密码短语 Passphrase'
                required
                value={formData.api_passphrase}
                onChange={e => handleChange('api_passphrase', e.target.value)}
              />
            </div>
          )}

          <DialogFooter className='pt-2'>
            <Button type='submit' disabled={loading} className='w-full sm:w-auto'>
              {loading && <Loader2Icon className='mr-2 size-4 animate-spin' />}
              {loading ? '正在添加...' : '确认添加'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
