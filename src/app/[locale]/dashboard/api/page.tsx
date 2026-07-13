'use client'

import { useEffect, useMemo, useState } from 'react'

import { AlertCircle, Info } from 'lucide-react'
import { toast } from 'sonner'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import ApiDatatable, { type ApiItem } from './_components/api-datatable'
import { ApiAddButton } from './_components/api-add-button'
import { getApiList } from '@/api/apiadd'
import { settingsApi, type EntitlementProfileResponse } from '@/api/settings'

export default function ApiPage() {
  const [data, setData] = useState<ApiItem[]>([])
  const [assetLimitUsdt, setAssetLimitUsdt] = useState(0)

  const fetchData = async () => {
    try {
      const res = await getApiList()

      if (res.code === 0 && Array.isArray(res.data)) {
        // Map backend platform ID to string keys if needed
        const mappedData = res.data.map((item: any) => ({
          ...item,
          platform: getPlatformString(item.platform)
        }))

        setData(mappedData)
      } else {
        toast.error(res.error || '获取 API 列表失败')
      }
    } catch (error) {
      console.error('获取 API 列表出错:', error)
      toast.error('获取 API 列表失败')
    }
  }

  const handleAddSuccess = async () => {
    // 1. 刷新列表
    fetchData()

    // 2. 刷新全局权益信息，同步剩余 API 额度
    try {
      const profile = await settingsApi.getEntitlementProfile()

      if (profile) {
        localStorage.setItem('entitlementProfile', JSON.stringify(profile))
        window.dispatchEvent(new Event('entitlementProfileUpdated'))
      }
    } catch (err) {
      console.error('Failed to fetch entitlement profile after adding API:', err)
    }
  }

  const getPlatformString = (platformId: number | string) => {
    const p = String(platformId)

    if (p === '1') return 'okx'
    if (p === '2') return 'binance'
    if (p === '3') return 'gate'
    if (p === '4') return 'bitget'
    if (p === '5') return 'weex'
    if (p === '6') return 'htx'

    return 'okx' // default fallback
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    const loadProfile = () => {
      try {
        const stored = localStorage.getItem('entitlementProfile')

        if (stored) {
          const profile = JSON.parse(stored) as EntitlementProfileResponse

          setAssetLimitUsdt(Number(profile.asset_limit_usdt) || 0)
        }
      } catch (e) {
        console.error('Failed to parse entitlement profile', e)
      }
    }

    loadProfile()
    window.addEventListener('entitlementProfileUpdated', loadProfile)

    return () => {
      window.removeEventListener('entitlementProfileUpdated', loadProfile)
    }
  }, [])

  const totalRealtimeUsdt = useMemo(() => {
    return data
      .filter((item) => !item.is_readonly && Number(item.flag ?? 0) === 0)
      .reduce((sum, item) => sum + Number(item.usdt ?? 0), 0)
  }, [data])

  const isAssetLimitExceeded = assetLimitUsdt > 0 && totalRealtimeUsdt >= assetLimitUsdt

  return (
    <div className='flex h-full flex-col gap-6 overflow-y-auto p-4 lg:p-8'>
      <div className='flex flex-col gap-2'>
        <h2 className='text-2xl font-bold tracking-tight'>API 管理</h2>
        <p className='text-muted-foreground text-sm'>添加和管理工作室交易员与跟单 API</p>
      </div>

      <Alert className='border-amber-500/30 bg-amber-500/5 text-amber-900 dark:text-amber-200'>
        <Info className='text-amber-600 dark:text-amber-400' />
        <AlertDescription>
          长期未登录使用，IP 白名单可能发生变化，需要重新在交易所授权 IP 白名单后才能继续使用。点击添加 API 按钮，查看最新 IP 白名单。
        </AlertDescription>
      </Alert>

      {isAssetLimitExceeded && (
        <Alert className='border-red-600 bg-red-600 text-white [&>svg]:text-white'>
          <AlertCircle />
          <AlertDescription className='text-white'>
            累计 API 资金 {totalRealtimeUsdt.toLocaleString()} USDT，已超过最大资金上限，请付费提升账号权限或者将多余资金划转出合约交易账户。
          </AlertDescription>
        </Alert>
      )}

      <Card className='col-span-full shadow-sm'>
        <CardHeader className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
          <div className='space-y-1.5'>
            <CardTitle>交易所 API 列表</CardTitle>
            <CardDescription>配置你的交易所 API 密钥，用于同步带单信号或执行自动跟单。（自动更新周期：10分钟）</CardDescription>
          </div>
          <ApiAddButton onSuccess={handleAddSuccess} />
        </CardHeader>
        <CardContent className='p-0'>
          <ApiDatatable data={data} onRefresh={fetchData} />
        </CardContent>
      </Card>
    </div>
  )
}
