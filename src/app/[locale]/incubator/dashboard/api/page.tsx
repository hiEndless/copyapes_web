'use client'

import { useState } from 'react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import ApiDatatable from './_components/api-datatable'
import { ApiAddButton } from './_components/api-add-button'
import { MOCK_API_LIST, createMockApi, type ApiItem } from './_mock/apis'

export default function IncubatorApiPage() {
  const [data, setData] = useState<ApiItem[]>(MOCK_API_LIST)

  const handleAdd = (input: { exchange: string; api_name: string }) => {
    setData(prev => [createMockApi(input), ...prev])
  }

  const handleDelete = (id: number) => {
    setData(prev => prev.filter(item => item.id !== id))
  }

  const handleRename = (id: number, api_name: string) => {
    setData(prev => prev.map(item => (item.id === id ? { ...item, api_name } : item)))
  }

  const handleRefreshBalance = (id: number) => {
    setData(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, usdt: Number((Math.random() * 2000 + 100).toFixed(4)) }
          : item
      )
    )
  }

  return (
    <div className='flex h-full flex-col gap-6 overflow-y-auto p-4 lg:p-8'>
      <div className='flex flex-col gap-2'>
        <h2 className='text-2xl font-bold tracking-tight'>API 管理</h2>
        <p className='text-muted-foreground text-sm'>添加和管理养号 API（演示数据，未接后端）</p>
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
            data={data}
            onDelete={handleDelete}
            onRename={handleRename}
            onRefreshBalance={handleRefreshBalance}
          />
        </CardContent>
      </Card>
    </div>
  )
}
