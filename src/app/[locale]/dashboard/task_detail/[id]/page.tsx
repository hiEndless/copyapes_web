'use client'

import * as React from 'react'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, Activity } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function TaskDetailPage() {
  const router = useRouter()

  // 模拟从父组件/接口获取的任务数据，此处用 state 模拟以演示逻辑
  const [task] = React.useState<any>({
    id: 766,
    benchMark: 0.0,
    pnl: 0.0,
    multiple: 1.0,
    reduce_ratio: 0.0,
    posSide_set: 1,
    create_datetime: '2025-01-16 20:33:14',
    ip_id: 3,
    pos_mode: 0,
    black_list: [],
    follow_type: 2,
    first_order_set: 1,
    fast_mode: 1,
    pos_value: '',
    balance_monitor_mode: 0,
    sums: 0.0,
    status: 1,
    trade_trigger_mode: 0,
    vol24h_mode: 0,
    api_id: 17,
    ratio: 0.0,
    private_set: 0,
    sl_trigger_px: 0.0,
    vol24h_num: null,
    balance_monitor_value: 0.0,
    uniqueName: 'Cryptoxn(隐毒素)',
    lever_set: 2,
    user_id: 1,
    tp_trigger_px: 0.0,
    white_list_mode: 0,
    deleted: false,
    role_type: 1,
    leverage: 10,
    first_open_type: 1,
    white_list: [],
    trader_platform: 4,
    investment: 200.0,
    uplRatio: 0.0,
    black_list_mode: 0,
    flag: 1,
    api_name: 'ok模拟2'
  })

  // 格式化展示值的工具函数
  const getPlatformName = (val: number) => {
    const map: Record<number, string> = { 1: 'OKX', 2: 'Binance', 3: '币coin', 4: '热门 KOL' }

    return map[val] || '未知'
  }

  const getFollowType = (val: number) => {
    return val === 1 ? '固定比例开仓' : val === 2 ? '智能跟单' : '自定义'
  }

  const getRoleType = (val: number) => {
    return val === 1 ? '带单项目' : val === 2 ? '隐藏实盘' : '公开实盘'
  }

  const isRunning = task.status === 1

  // 构建需要展示的参数列表，过滤掉无效/0/空数组的值
  const parameterList = React.useMemo(() => {
    const list: { label: string; value: React.ReactNode }[] = []

    list.push({ label: '跟单平台', value: getPlatformName(task.trader_platform) })
    list.push({ label: '跟单对象', value: task.uniqueName })
    list.push({ label: '创建时间', value: task.create_datetime })
    list.push({ label: '反向跟单', value: task.posSide_set === 1 ? '否' : '是' })
    list.push({ label: 'API', value: task.api_name })
    list.push({ label: '交易员类型', value: getRoleType(task.role_type) })
    list.push({ label: '跟单模式', value: getFollowType(task.follow_type) })

    if (task.follow_type === 2) {
      list.push({ label: '智能倍数', value: task.multiple })
      list.push({ label: '投资额', value: task.investment })

      // 假设平台 1 (OKX) 且类型 2 时不展示对标资金
      if (!(task.trader_platform === 1 && task.role_type === 2)) {
        list.push({ label: '对标资金', value: task.benchMark })
      }
    }

    list.push({ label: '杠杆设置', value: task.lever_set === 1 ? '跟随交易员' : task.leverage })

    if (task.trade_trigger_mode === 1) {
      if (task.tp_trigger_px !== 0) list.push({ label: '单笔止盈', value: `${task.tp_trigger_px}%` })
      if (task.sl_trigger_px !== 0) list.push({ label: '单笔止损', value: `${task.sl_trigger_px}%` })
    }

    if (task.first_open_type === 2 && task.uplRatio) {
      list.push({ label: '区间委托(新开仓)', value: `收益率小于${task.uplRatio}%时跟单` })
    }

    if (task.pos_mode === 1 && task.pos_value) {
      list.push({ label: '多空策略', value: task.pos_value === 'long' ? '只开多单' : '只开空单' })
    }

    if (task.vol24h_mode === 1 && task.vol24h_num) {
      list.push({ label: '24h成交量', value: `只跟排行前${task.vol24h_num}的币种` })
    }

    if (task.balance_monitor_mode === 1 && task.balance_monitor_value) {
      list.push({ label: '带单本金', value: `低于${task.balance_monitor_value}U不跟单` })
    }

    if (task.white_list_mode === 1 && task.white_list && task.white_list.length > 0) {
      list.push({ label: '白名单策略', value: task.white_list.join(', ') })
    }

    if (task.black_list_mode === 1 && task.black_list && task.black_list.length > 0) {
      list.push({ label: '黑名单策略', value: task.black_list.join(', ') })
    }

    return list
  }, [task])

  return (
    <div className='bg-muted/20 dark:bg-background flex h-full flex-col gap-6 overflow-y-auto p-4 lg:p-8'>
      {/* 头部导航 */}
      <div className='flex items-center gap-4'>
        <Button variant='outline' size='icon' onClick={() => router.back()} className='h-8 w-8 rounded-full'>
          <ArrowLeft className='h-4 w-4' />
        </Button>
        <h2 className='text-lg font-semibold tracking-tight'>任务详情</h2>
      </div>

      {/* 上半部分：任务参数（表格形式卡片） */}
      <Card className='overflow-hidden border shadow-sm'>
        <div className='bg-border grid grid-cols-1 gap-[1px] md:grid-cols-4'>
          {parameterList.map((item, index) => (
            <div key={index} className='dark:bg-background flex items-stretch bg-white'>
              <div className='bg-muted/50 flex w-24 shrink-0 items-center border-r p-4'>
                <span className='text-muted-foreground text-xs'>{item.label}</span>
              </div>
              <div className='flex flex-1 items-center p-4'>
                <span className='truncate text-xs font-medium'>{item.value}</span>
              </div>
            </div>
          ))}

          {/* 补充空余的网格单元格以保持表格边框对齐 */}
          {Array.from({ length: (4 - (parameterList.length % 4)) % 4 }).map((_, index) => (
            <div key={`empty-${index}`} className='dark:bg-background flex items-stretch bg-white'>
              <div className='bg-muted/50 flex w-24 shrink-0 items-center border-r p-4'></div>
              <div className='flex flex-1 items-center p-4'></div>
            </div>
          ))}

          {/* 任务状态（固定占据最后一行整行） */}
          <div className='dark:bg-background flex items-stretch bg-white md:col-span-4'>
            <div className='bg-muted/50 flex w-24 shrink-0 items-center border-r p-4'>
              <span className='text-muted-foreground text-xs'>任务状态</span>
            </div>
            <div className='flex flex-1 items-center gap-4 p-4'>
              <div className='flex items-center gap-1.5'>
                {isRunning ? (
                  <span className='relative flex h-2.5 w-2.5'>
                    <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75'></span>
                    <span className='relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500'></span>
                  </span>
                ) : (
                  <span className='relative flex h-2.5 w-2.5'>
                    <span className='bg-muted-foreground relative inline-flex h-2.5 w-2.5 rounded-full'></span>
                  </span>
                )}
                <span className='ml-1 text-sm font-medium'>{isRunning ? 'Running' : 'Stop'}</span>
              </div>
              {isRunning && (
                <Button variant='destructive' size='sm' className='h-7 bg-red-500 text-xs hover:bg-red-600'>
                  终止跟单
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* 下半部分：时间轴区域 */}
      <div className='block md:hidden'>
        <Tabs defaultValue='trader' className='w-full'>
          <TabsList className='mb-4 grid w-full grid-cols-2'>
            <TabsTrigger value='trader'>交易记录</TabsTrigger>
            <TabsTrigger value='follower'>跟单记录</TabsTrigger>
          </TabsList>
          <TabsContent value='trader' className='mt-0'>
            <Card className='border shadow-sm dark:bg-[#1e1e1e] dark:text-white'>
              <CardContent className='p-6'>
                <div className='mb-6 flex items-center gap-2'>
                  <div className='bg-muted dark:bg-muted/20 flex h-8 w-8 items-center justify-center rounded-full'>
                    <Activity className='h-4 w-4 dark:text-white' />
                  </div>
                  <h2 className='text-lg font-bold'>交易员交易记录</h2>
                </div>

                {/* 时间轴容器 */}
                <div className='border-muted relative ml-3 space-y-8 border-l-2 pb-4 dark:border-zinc-700'>
                  {/* 事件项 1 */}
                  <div className='relative pl-6'>
                    <div className='absolute top-1 -left-[9px] h-4 w-4 rounded-full border-4 border-white bg-green-500 dark:border-[#1e1e1e]'></div>
                    <div className='space-y-1'>
                      <p className='text-sm font-bold dark:text-white'>交易员{task.uniqueName}进行了平仓操作</p>
                      <p className='text-muted-foreground text-xs dark:text-zinc-400'>2026-04-13 23:35:00</p>
                      <p className='text-muted-foreground mt-2 text-sm dark:text-zinc-300'>
                        品种: ETH-USDT-SWAP, 方向: <span className='text-foreground dark:text-white'>long</span>
                      </p>
                    </div>
                  </div>

                  {/* 事件项 2 */}
                  <div className='relative pl-6'>
                    <div className='absolute top-1 -left-[9px] h-4 w-4 rounded-full border-4 border-white bg-green-500 dark:border-[#1e1e1e]'></div>
                    <div className='space-y-1'>
                      <p className='text-sm font-bold dark:text-white'>交易员{task.uniqueName}进行了平仓操作</p>
                      <p className='text-muted-foreground text-xs dark:text-zinc-400'>2026-04-13 23:32:46</p>
                      <p className='text-muted-foreground mt-2 text-sm dark:text-zinc-300'>
                        品种: 币安人生-USDT-SWAP, 方向: <span className='text-foreground dark:text-white'>short</span>
                      </p>
                    </div>
                  </div>

                  {/* 事件项 3 */}
                  <div className='relative pl-6'>
                    <div className='absolute top-1 -left-[9px] h-4 w-4 rounded-full border-4 border-white bg-green-500 dark:border-[#1e1e1e]'></div>
                    <div className='space-y-1'>
                      <p className='text-sm font-bold dark:text-white'>交易员{task.uniqueName}进行了开仓操作</p>
                      <p className='text-muted-foreground text-xs dark:text-zinc-400'>2026-04-13 23:32:20</p>
                      <p className='text-muted-foreground mt-2 text-sm dark:text-zinc-300'>
                        品种: 币安人生-USDT-SWAP, 方向: <span className='text-foreground dark:text-white'>short</span>
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value='follower' className='mt-0'>
            <Card className='border bg-[#1e1e1e] text-white shadow-sm'>
              <CardContent className='p-6'>
                <div className='mb-6 flex items-center gap-3'>
                  <div className='flex h-8 w-8 items-center justify-center overflow-hidden rounded-full'>
                    <Image src='/site_logo/logo-small.png' alt='Logo' width={32} height={32} />
                  </div>
                  <h2 className='flex items-center gap-2 text-lg font-bold'>
                    跟单猿跟单记录
                    <Badge
                      variant='destructive'
                      className='h-5 rounded-sm bg-red-500 px-1.5 text-[10px] hover:bg-red-600'
                    >
                      反向跟单
                    </Badge>
                  </h2>
                </div>

                {/* 时间轴容器 */}
                <div className='relative ml-3 space-y-8 border-l-2 border-zinc-700 pb-4'>
                  {/* 事件项 1 */}
                  <div className='relative pl-6'>
                    <div className='absolute top-1 -left-[9px] h-4 w-4 rounded-full border-4 border-[#1e1e1e] bg-green-500'></div>
                    <div className='space-y-1'>
                      <p className='text-sm font-bold text-white'>进行Gate.io平仓操作</p>
                      <p className='text-xs text-zinc-400'>2026-04-13 23:35:01</p>
                      <p className='mt-2 text-sm text-zinc-300'>
                        品种: ETH_USDT, 平仓量: 44.0张, 方向: <span className='text-white'>SHORT</span>
                      </p>
                    </div>
                  </div>

                  {/* 事件项 2（失败） */}
                  <div className='relative pl-6'>
                    <div className='absolute top-1 -left-[9px] h-4 w-4 rounded-full border-4 border-[#1e1e1e] bg-red-500'></div>
                    <div className='space-y-1'>
                      <p className='text-sm font-bold text-white'>交易失败</p>
                      <p className='text-xs text-zinc-400'>2026-04-13 23:35:01</p>
                      <p className='mt-2 text-sm text-zinc-300'>ETH_USDT没有可平仓位</p>
                    </div>
                  </div>

                  {/* 事件项 3 */}
                  <div className='relative pl-6'>
                    <div className='absolute top-1 -left-[9px] h-4 w-4 rounded-full border-4 border-[#1e1e1e] bg-green-500'></div>
                    <div className='space-y-1'>
                      <p className='text-sm font-bold text-white'>进行Gate.io平仓操作</p>
                      <p className='text-xs text-zinc-400'>2026-04-13 23:32:47</p>
                      <p className='mt-2 text-sm text-zinc-300'>
                        品种: 币安人生_USDT, 平仓量: 57.0张, 方向: <span className='text-white'>LONG</span>
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <div className='hidden grid-cols-1 gap-6 md:grid md:grid-cols-2'>
        {/* 左侧：交易员交易记录 */}
        <Card className='border shadow-sm dark:bg-[#1e1e1e] dark:text-white'>
          <CardContent className='p-6'>
            <div className='mb-6 flex items-center gap-2'>
              <div className='bg-muted dark:bg-muted/20 flex h-8 w-8 items-center justify-center rounded-full'>
                <Activity className='h-4 w-4 dark:text-white' />
              </div>
              <h2 className='text-lg font-bold'>交易员交易记录</h2>
            </div>

            {/* 时间轴容器 */}
            <div className='border-muted relative ml-3 space-y-8 border-l-2 pb-4 dark:border-zinc-700'>
              {/* 事件项 1 */}
              <div className='relative pl-6'>
                <div className='absolute top-1 -left-[9px] h-4 w-4 rounded-full border-4 border-white bg-green-500 dark:border-[#1e1e1e]'></div>
                <div className='space-y-1'>
                  <p className='text-sm font-bold dark:text-white'>交易员{task.uniqueName}进行了平仓操作</p>
                  <p className='text-muted-foreground text-xs dark:text-zinc-400'>2026-04-13 23:35:00</p>
                  <p className='text-muted-foreground mt-2 text-sm dark:text-zinc-300'>
                    品种: ETH-USDT-SWAP, 方向: <span className='text-foreground dark:text-white'>long</span>
                  </p>
                </div>
              </div>

              {/* 事件项 2 */}
              <div className='relative pl-6'>
                <div className='absolute top-1 -left-[9px] h-4 w-4 rounded-full border-4 border-white bg-green-500 dark:border-[#1e1e1e]'></div>
                <div className='space-y-1'>
                  <p className='text-sm font-bold dark:text-white'>交易员{task.uniqueName}进行了平仓操作</p>
                  <p className='text-muted-foreground text-xs dark:text-zinc-400'>2026-04-13 23:32:46</p>
                  <p className='text-muted-foreground mt-2 text-sm dark:text-zinc-300'>
                    品种: 币安人生-USDT-SWAP, 方向: <span className='text-foreground dark:text-white'>short</span>
                  </p>
                </div>
              </div>

              {/* 事件项 3 */}
              <div className='relative pl-6'>
                <div className='absolute top-1 -left-[9px] h-4 w-4 rounded-full border-4 border-white bg-green-500 dark:border-[#1e1e1e]'></div>
                <div className='space-y-1'>
                  <p className='text-sm font-bold dark:text-white'>交易员{task.uniqueName}进行了开仓操作</p>
                  <p className='text-muted-foreground text-xs dark:text-zinc-400'>2026-04-13 23:32:20</p>
                  <p className='text-muted-foreground mt-2 text-sm dark:text-zinc-300'>
                    品种: 币安人生-USDT-SWAP, 方向: <span className='text-foreground dark:text-white'>short</span>
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 右侧：跟单猿跟单记录（暗色主题） */}
        <Card className='border bg-[#1e1e1e] text-white shadow-sm'>
          <CardContent className='p-6'>
            <div className='mb-6 flex items-center gap-3'>
              <div className='flex h-8 w-8 items-center justify-center overflow-hidden rounded-full'>
                <Image src='/site_logo/logo-small.png' alt='Logo' width={32} height={32} />
              </div>
              <h2 className='flex items-center gap-2 text-lg font-bold'>
                跟单猿跟单记录
                <Badge variant='destructive' className='h-5 rounded-sm bg-red-500 px-1.5 text-[10px] hover:bg-red-600'>
                  反向跟单
                </Badge>
              </h2>
            </div>

            {/* 时间轴容器 */}
            <div className='relative ml-3 space-y-8 border-l-2 border-zinc-700 pb-4'>
              {/* 事件项 1 */}
              <div className='relative pl-6'>
                <div className='absolute top-1 -left-[9px] h-4 w-4 rounded-full border-4 border-[#1e1e1e] bg-green-500'></div>
                <div className='space-y-1'>
                  <p className='text-sm font-bold text-white'>进行Gate.io平仓操作</p>
                  <p className='text-xs text-zinc-400'>2026-04-13 23:35:01</p>
                  <p className='mt-2 text-sm text-zinc-300'>
                    品种: ETH_USDT, 平仓量: 44.0张, 方向: <span className='text-white'>SHORT</span>
                  </p>
                </div>
              </div>

              {/* 事件项 2（失败） */}
              <div className='relative pl-6'>
                <div className='absolute top-1 -left-[9px] h-4 w-4 rounded-full border-4 border-[#1e1e1e] bg-red-500'></div>
                <div className='space-y-1'>
                  <p className='text-sm font-bold text-white'>交易失败</p>
                  <p className='text-xs text-zinc-400'>2026-04-13 23:35:01</p>
                  <p className='mt-2 text-sm text-zinc-300'>ETH_USDT没有可平仓位</p>
                </div>
              </div>

              {/* 事件项 3 */}
              <div className='relative pl-6'>
                <div className='absolute top-1 -left-[9px] h-4 w-4 rounded-full border-4 border-[#1e1e1e] bg-green-500'></div>
                <div className='space-y-1'>
                  <p className='text-sm font-bold text-white'>进行Gate.io平仓操作</p>
                  <p className='text-xs text-zinc-400'>2026-04-13 23:32:47</p>
                  <p className='mt-2 text-sm text-zinc-300'>
                    品种: 币安人生_USDT, 平仓量: 57.0张, 方向: <span className='text-white'>LONG</span>
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
