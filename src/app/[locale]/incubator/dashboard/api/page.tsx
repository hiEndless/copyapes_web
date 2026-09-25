'use client'

import { useEffect, useState } from 'react'

import { toast } from 'sonner'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import ApiDatatable from './_components/api-datatable'
import { ApiAddButton } from './_components/api-add-button'
import { type ApiFormData } from './_components/api-bind-form-step'
import { type ApiItem } from './_mock/apis'
import {
  addIncubatorApiAccount,
  checkIncubatorApiAccountHealth,
  deleteIncubatorApiAccount,
  listIncubatorApiAccounts,
  renameIncubatorApiAccount,
  type IncubatorApiAccount
} from '@/lib/incubator-api-accounts'

function toApiItem(account: IncubatorApiAccount): ApiItem {
  return {
    id: account.id,
    platform: account.exchange.toLowerCase(),
    api_name: account.label,
    uid: account.exchange_uid,
    usdt: account.available_balance == null ? null : Number(account.available_balance),
    create_datetime: account.created_at,
    status: account.status === 'ACTIVE' ? 1 : 0,
    roleType: null,
    flag: account.flag === 1 ? 1 : 0,
    proxyHostId: account.proxy_host_id,
    proxyEgressIp: account.proxy_egress_ip,
    proxyEntitlementStatus: account.proxy_entitlement_status
  }
}

export default function IncubatorApiPage() {
  const [data, setData] = useState<ApiItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listIncubatorApiAccounts()
      .then(items => setData(items.map(toApiItem)))
      .catch(error => toast.error(error instanceof Error ? error.message : 'API 列表加载失败'))
      .finally(() => setLoading(false))
  }, [])

  const handleAdd = async (input: ApiFormData) => {
    const account = await addIncubatorApiAccount({
      exchange: input.exchange.toUpperCase() as IncubatorApiAccount['exchange'],
      label: input.api_label,
      api_key: input.api_key,
      secret_key: input.api_secret,
      passphrase: input.api_passphrase || undefined,
      flag: input.flag
    })

    setData(prev => [toApiItem(account), ...prev])
  }

  const handleRename = async (id: string, label: string) => {
    const account = await renameIncubatorApiAccount(id, label)

    setData(prev => prev.map(item => (item.id === id ? toApiItem(account) : item)))
  }

  const handleHealthCheck = async (id: string) => {
    try {
      const account = await checkIncubatorApiAccountHealth(id)

      setData(prev => prev.map(item => (item.id === id ? toApiItem(account) : item)))
    } catch (error) {
      const accounts = await listIncubatorApiAccounts()

      setData(accounts.map(toApiItem))
      throw error
    }
  }

  const handleDelete = async (id: string) => {
    await deleteIncubatorApiAccount(id)
    setData(prev => prev.filter(item => item.id !== id))
  }

  return (
    <div className='flex h-full flex-col gap-6 overflow-y-auto p-4 lg:p-8'>
      <div className='flex flex-col gap-2'>
        <h2 className='text-2xl font-bold tracking-tight'>API 管理</h2>
        <p className='text-muted-foreground text-sm'>添加和展示养号 API，验证请求统一通过已分配代理访问交易所。</p>
      </div>

      <Card className='col-span-full shadow-sm'>
        <CardHeader className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
          <div className='space-y-1.5'>
            <CardTitle>交易所 API 列表</CardTitle>
            <CardDescription>配置交易所 API 密钥，用于养号项目账号池。</CardDescription>
          </div>
          <ApiAddButton onAdd={handleAdd} />
        </CardHeader>
        <CardContent className='p-0'>
          <ApiDatatable
            data={loading ? [] : data}
            onDelete={handleDelete}
            onRename={handleRename}
            onRefreshBalance={handleHealthCheck}
            actionsEnabled
          />
        </CardContent>
      </Card>
    </div>
  )
}
