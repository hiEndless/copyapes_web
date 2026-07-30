'use client'

import { useEffect, useMemo, useState } from 'react'

import { AlertCircle, Info } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import ApiDatatable, { type ApiItem } from './_components/api-datatable'
import { ApiAddButton } from './_components/api-add-button'
import { getApiList } from '@/api/apiadd'
import { settingsApi, type EntitlementProfileResponse } from '@/api/settings'
import { TOUR_ANCHORS, tourAnchor } from '@/features/tour/anchors'

export default function ApiPage() {
  const t = useTranslations('DashboardApi')
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
        toast.error(res.error || t('page.fetchFailed'))
      }
    } catch (error) {
      console.error('获取 API 列表出错:', error)
      toast.error(t('page.fetchFailed'))
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
        <h2 className='text-2xl font-bold tracking-tight'>{t('page.title')}</h2>
        <p className='text-muted-foreground text-sm'>{t('page.subtitle')}</p>
      </div>

      <Alert
        className='border-amber-500/30 bg-amber-500/5 text-amber-900 dark:text-amber-200'
        {...tourAnchor(TOUR_ANCHORS.apiIpNotice)}
      >
        <Info className='text-amber-600 dark:text-amber-400' />
        <AlertDescription>{t('page.ipNotice')}</AlertDescription>
      </Alert>

      {isAssetLimitExceeded && (
        <Alert className='border-red-600 bg-red-600 text-white [&>svg]:text-white'>
          <AlertCircle />
          <AlertDescription className='text-white'>
            {t('page.assetLimitExceeded', { amount: totalRealtimeUsdt.toLocaleString() })}
          </AlertDescription>
        </Alert>
      )}

      <Card className='col-span-full shadow-sm' {...tourAnchor(TOUR_ANCHORS.apiList)}>
        <CardHeader className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
          <div className='space-y-1.5'>
            <CardTitle>{t('page.listTitle')}</CardTitle>
            <CardDescription>{t('page.listDesc')}</CardDescription>
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
