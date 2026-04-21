'use client'

import { useEffect, useState } from 'react'

import { toast } from 'sonner'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import ApiDatatable, { type ApiItem } from './_components/api-datatable'
import { ApiAddButton } from './_components/api-add-button'
import { getApiList } from '@/api/apiadd'

export default function ApiPage() {
  const [data, setData] = useState<ApiItem[]>([])

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

  const getPlatformString = (platformId: number | string) => {
    const p = String(platformId)

    if (p === '1' || p === '6') return 'okx'
    if (p === '2' || p === '5') return 'binance'
    if (p === '9') return 'hyperliquid'
    if (p === '10') return 'bitget'

    return 'okx' // default fallback
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <div className='flex h-full flex-col gap-6 overflow-y-auto p-4 lg:p-8'>
      <div className='flex flex-col gap-2'>
        <h2 className='text-2xl font-bold tracking-tight'>API 管理</h2>
        <p className='text-muted-foreground text-sm'>添加和管理工作室交易员与跟单 API</p>
      </div>

      <Card className='col-span-full shadow-sm'>
        <CardHeader className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
          <div className='space-y-1.5'>
            <CardTitle>交易所 API 列表</CardTitle>
            <CardDescription>配置你的交易所 API 密钥，用于同步带单信号或执行自动跟单。</CardDescription>
          </div>
          <ApiAddButton />
        </CardHeader>
        <CardContent className='p-0'>
          <ApiDatatable data={data} onRefresh={fetchData} />
        </CardContent>
      </Card>
    </div>
  )
}
