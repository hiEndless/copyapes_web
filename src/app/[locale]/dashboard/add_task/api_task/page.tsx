'use client'
import { useState } from 'react'
import { CopyTaskConfigSheet } from '../_components/copy-task-config-sheet'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch';

export default function ApiTaskPage() {
  const [selectedTraderId, setSelectedTraderId] = useState<string | null>(null)

  return (
    <div className='flex h-full flex-col items-center justify-center gap-4'>
      <h1 className='text-2xl font-semibold'>API 跟单平台</h1>

      {/* 假设这是你的交易员列表卡片中的跟单按钮 */}
      <Button onClick={() => setSelectedTraderId('3887627985594221568')}>跟单 某交易员</Button>

      {/* 挂载统一的跟单抽屉组件 */}
      <CopyTaskConfigSheet
        isOpen={!!selectedTraderId}
        onClose={() => setSelectedTraderId(null)}
        traderId={selectedTraderId}
        traderName='加密大猩猩'
        platform='binance' // 传入当前平台名称，内部会自动做逻辑差异化处理
      />
      <Switch />
    </div>
  )
}
