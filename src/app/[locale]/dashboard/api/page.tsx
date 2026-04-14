'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import ApiDatatable, { type ApiItem } from './_components/api-datatable'
import { ApiAddButton } from './_components/api-add-button'

const mockData: ApiItem[] = [
  {
    id: 1,
    platform: 'okx',
    api_name: 'OKX 主力跟单账户',
    uid: '458923192',
    usdt: 12500.5,
    created_at: '2025-01-15T14:20:00',
    is_readonly: false,
    status: 1
  },
  {
    id: 2,
    platform: 'binance',
    api_name: 'Binance 带单测试',
    uid: '8839120',
    usdt: 3200.0,
    created_at: '2025-02-10T09:15:30',
    is_readonly: true,
    status: 1
  },
  {
    id: 3,
    platform: 'okx',
    api_name: '已失效账户',
    uid: '2193810',
    usdt: 0,
    created_at: '2024-12-05T18:45:12',
    is_readonly: false,
    status: 0
  }
]

export default function ApiPage() {
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
          <ApiDatatable data={mockData} />
        </CardContent>
      </Card>
    </div>
  )
}
