'use client'

import * as React from 'react'

import Image from 'next/image'
import { ArrowLeft, Activity } from 'lucide-react'
import { toast } from 'sonner'

import { useDashboardRouter as useRouter } from '@/hooks/use-dashboard-router'
import { getTaskDetail, getTraderDetail, stopTask } from '@/api/task'
import { settingsApi } from '@/api/settings'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'

export default function TaskDetailPage({ params }: { params: any }) {
  const router = useRouter()

  // React 19 Next.js Dynamic Route Param API Change
  // unwrapping safely depending on runtime
  const unwrappedParams = React.use(params instanceof Promise ? params : Promise.resolve(params))
  const taskId = unwrappedParams?.id || params?.id

  console.log('当前任务 ID:', taskId)

  const [task, setTask] = React.useState<any>(() => {
    if (typeof window !== 'undefined') {
      const cached = sessionStorage.getItem('current_task')

      if (cached) {
        try {
          const parsed = JSON.parse(cached)


          // 仅当缓存的 id 和当前路由 id 匹配时才使用缓存
          if (String(parsed.id) === String(taskId)) {
            return parsed
          }
        } catch (e) {
          console.error('解析缓存任务失败', e)
        }
      }
    }

    return null
  })

  const [spiderData, setSpiderData] = React.useState<any[]>([])
  const [tradeData, setTradeData] = React.useState<any[]>([])

  // 如果有缓存，初始不显示 loading
  const [loading, setLoading] = React.useState(!task)

  // 为了消除 linter error
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _loading = loading

  React.useEffect(() => {
    if (taskId) {
      loadTaskData()
    }
  }, [taskId])

  const loadTaskData = async () => {
    try {
      if (!task) {
        setLoading(true)
      }

      const [taskRes, traderRes] = await Promise.all([getTaskDetail(taskId), getTraderDetail(taskId)])

      if (taskRes.code === 0) {
        setTask(taskRes.data)


        // 顺便更新一下缓存，保证刷新后还是最新的
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('current_task', JSON.stringify(taskRes.data))
        }
      } else {
        toast.error((taskRes.detail as any) || taskRes.message || '获取任务失败')
        router.push('/dashboard/task_list' as any)
      }

      if (traderRes.code === 0 && traderRes.data) {
        setTradeData(traderRes.data.trade || [])
        setSpiderData(traderRes.data.spider || [])
      }
    } catch (err) {
      console.error(err)
      toast.error('加载失败')
    } finally {
      setLoading(false)
    }
  }

  // 格式化展示值的工具函数
  const getColorClass = (color: string) => {
    if (color === 'SUCCESS' || color === 'green') return 'bg-green-500'
    if (color === 'WARNING' || color === 'danger') return 'bg-red-500'
    if (color === 'INFO' || color === 'primary') return 'bg-blue-500'

    return 'bg-gray-500'
  }

  const getPlatformName = (val: number) => {
    if (val == 1) return 'OKX'
    if (val == 2) return 'Binance'
    if (val == 3) return '币coin'
    if (val == 4) return '热门交易员'
    if (val == 5 || val == 6) return 'API'
    if (val == 7) return 'Binance'
    if (val == 8) return 'OKX'
    if (val == 9) return 'NOF1'
    if (val == 10) return 'HyperLiquid'

    return '未知'
  }

  const getFollowType = () => {
    // Vue 中默认就是 '固定比例' 或者根据业务调整，原 vue 写死为 '固定比例'
    return '固定比例'
  }

  const getRoleType = (roleType: number | string, traderPlatform: number | string) => {
    const rt = String(roleType)
    const tp = String(traderPlatform)

    if (tp === '1' || tp === '6' || tp === '8') {
      // OKX 系列
      if (rt === '1') return '合约带单'
      if (rt === '2') return '个人概况'
    } else if (tp === '2' || tp === '5' || tp === '7') {
      // Binance 系列
      if (rt === '1') return '公开带单'
      if (rt === '2') return '隐藏带单'
      if (rt === '3') return '聪明钱'
    } else if (tp === '3') {
      // 币coin
      if (rt === '1' || rt === '3') return '操作记录'
      if (rt === '2' || rt === '4') return '合约仓位'
    } else if (tp === '9') {
      return 'AI模型'
    } else if (tp === '10') {
      return '钱包地址'
    }

    return '未知'
  }

  const isRunning = task?.status === 1

  const handleTerminateTask = async () => {
    try {
      const res = await stopTask(taskId)

      if (res.code === 0) {
        toast.success('已发起终止跟单请求')
        loadTaskData()

        // 刷新全局权益信息，同步剩余任务额度
        try {
          const profile = await settingsApi.getEntitlementProfile()

          if (profile) {
            localStorage.setItem('entitlementProfile', JSON.stringify(profile))
            window.dispatchEvent(new Event('entitlementProfileUpdated'))
          }
        } catch (err) {
          console.error('Failed to fetch entitlement profile after terminating task:', err)
        }
      } else {
        toast.error((res.detail as any) || res.message || '终止请求失败')
      }
    } catch (error) {
      console.error('终止请求失败:', error)
      toast.error('终止请求失败，请重试')
    }
  }

  // 构建需要展示的参数列表，过滤掉无效/0/空数组的值
  const parameterList = React.useMemo(() => {
    if (!task) return []
    const list: { label: string; value: React.ReactNode }[] = []

    list.push({ label: '跟单平台', value: getPlatformName(task.trader_platform) })
    list.push({ label: '跟单对象', value: (task.label || '').trim() || task.uniqueName })
    list.push({ label: '创建时间', value: task.create_datetime?.replace('T', '  ') })
    list.push({ label: '反向跟单', value: String(task.posSide_set) === '1' ? '否' : '是' })
    list.push({ label: 'API', value: task.api_name })
    list.push({ label: '交易员类型', value: getRoleType(task.role_type, task.trader_platform) })
    list.push({ label: '跟单模式', value: getFollowType() })

    // vue 代码里 f_t 写死为 '固定比例'
    list.push({ label: '智能倍数', value: task.multiple })
    list.push({ label: '投资额', value: task.investment })
    list.push({ label: '对标资金', value: task.benchMark })
    list.push({ label: '杠杆设置', value: String(task.lever_set) === '1' ? '跟随交易员' : task.leverage })

    if (String(task.trade_trigger_mode) === '1') {
      list.push({ label: '单笔止盈', value: String(task.tp_trigger_px) === '0' ? '未设置' : `${task.tp_trigger_px}%` })
      list.push({ label: '单笔止损', value: String(task.sl_trigger_px) === '0' ? '未设置' : `${task.sl_trigger_px}%` })
    }

    if (String(task.first_open_type) === '2') {
      list.push({ label: '区间委托(新开仓)', value: `收益率小于${task.uplRatio}%时跟单` })
    }

    if (String(task.pos_mode) === '1') {
      list.push({ label: '多空策略', value: task.pos_value === 'long' ? '只开多单' : '只开空单' })
    }

    if (String(task.vol24h_mode) === '1') {
      list.push({ label: '24h成交量', value: `只跟排行前${task.vol24h_num}的币种` })
    }

    if (String(task.balance_monitor_mode) === '1') {
      list.push({ label: '带单本金', value: `低于${task.balance_monitor_value}U不跟单` })
    }

    if (String(task.white_list_mode) === '1' && task.white_list && task.white_list.length > 0) {
      list.push({ label: '白名单策略', value: task.white_list.join(', ') })
    }

    if (String(task.black_list_mode) === '1' && task.black_list && task.black_list.length > 0) {
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
      <Card className='overflow-hidden border py-0! shadow-sm'>
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
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant='destructive' size='sm' className='h-7 bg-red-500 text-xs hover:bg-red-600'>
                      终止跟单
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>确认终止跟单？</AlertDialogTitle>
                      <AlertDialogDescription>
                        终止任务不会进行平仓，当前如有持仓，后续请自行平仓。
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>取消</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleTerminateTask}
                        className='bg-red-500 text-white hover:bg-red-600'
                      >
                        确认终止
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
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
                  {spiderData.length > 0 ? (
                    spiderData.map((item, index) => (
                      <div key={index} className='relative pl-6'>
                        <div
                          className={`absolute top-1 -left-[9px] h-4 w-4 rounded-full border-4 border-white dark:border-[#1e1e1e] ${getColorClass(
                            item.color
                          )}`}
                        ></div>
                        <div className='space-y-1'>
                          <p className='text-sm font-bold dark:text-white'>{item.title}</p>
                          <p className='text-muted-foreground text-xs dark:text-zinc-400'>{item.date}</p>
                          <p className='text-muted-foreground mt-2 text-sm dark:text-zinc-300'>{item.description}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className='pl-6 text-sm text-muted-foreground'>暂无数据</div>
                  )}
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
                    {String(task?.posSide_set) === '2' && (
                      <Badge
                        variant='destructive'
                        className='h-5 rounded-sm bg-red-500 px-1.5 text-[10px] hover:bg-red-600'
                      >
                        反向跟单
                      </Badge>
                    )}
                  </h2>
                </div>

                {/* 时间轴容器 */}
                <div className='relative ml-3 space-y-8 border-l-2 border-zinc-700 pb-4'>
                  {tradeData.length > 0 ? (
                    tradeData.map((item, index) => (
                      <div key={index} className='relative pl-6'>
                        <div
                          className={`absolute top-1 -left-[9px] h-4 w-4 rounded-full border-4 border-[#1e1e1e] ${getColorClass(
                            item.color
                          )}`}
                        ></div>
                        <div className='space-y-1'>
                          <p className='text-sm font-bold text-white'>{item.title}</p>
                          <p className='text-xs text-zinc-400'>{item.date}</p>
                          <p className='mt-2 text-sm text-zinc-300'>{item.description}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className='pl-6 text-sm text-zinc-400'>暂无数据</div>
                  )}
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
              {spiderData.length > 0 ? (
                spiderData.map((item, index) => (
                  <div key={index} className='relative pl-6'>
                    <div
                      className={`absolute top-1 -left-[9px] h-4 w-4 rounded-full border-4 border-white dark:border-[#1e1e1e] ${getColorClass(
                        item.color
                      )}`}
                    ></div>
                    <div className='space-y-1'>
                      <p className='text-sm font-bold dark:text-white'>{item.title}</p>
                      <p className='text-muted-foreground text-xs dark:text-zinc-400'>{item.date}</p>
                      <p className='text-muted-foreground mt-2 text-sm dark:text-zinc-300'>{item.description}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className='pl-6 text-sm text-muted-foreground'>暂无数据</div>
              )}
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
                {String(task?.posSide_set) === '2' && (
                  <Badge variant='destructive' className='h-5 rounded-sm bg-red-500 px-1.5 text-[10px] hover:bg-red-600'>
                    反向跟单
                  </Badge>
                )}
              </h2>
            </div>

            {/* 时间轴容器 */}
            <div className='relative ml-3 space-y-8 border-l-2 border-zinc-700 pb-4'>
              {tradeData.length > 0 ? (
                tradeData.map((item, index) => (
                  <div key={index} className='relative pl-6'>
                    <div
                      className={`absolute top-1 -left-[9px] h-4 w-4 rounded-full border-4 border-[#1e1e1e] ${getColorClass(
                        item.color
                      )}`}
                    ></div>
                    <div className='space-y-1'>
                      <p className='text-sm font-bold text-white'>{item.title}</p>
                      <p className='text-xs text-zinc-400'>{item.date}</p>
                      <p className='mt-2 text-sm text-zinc-300'>{item.description}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className='pl-6 text-sm text-zinc-400'>暂无数据</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
