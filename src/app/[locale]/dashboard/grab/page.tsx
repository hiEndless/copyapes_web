'use client'

import * as React from 'react'

import { Zap, History, Loader2, StopCircle, CheckCircle2, XCircle, Info } from 'lucide-react'
import Image from 'next/image'
import { motion } from 'motion/react'

import { toast } from 'sonner'

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MotionPreset } from '@/components/ui/motion-preset'
import { GrabTaskConfigSheet } from './_components/grab-task-config-sheet'
import { getGrabTaskList, stopGrabTask } from '@/api/task'
import { getCookies } from '@/api/cookie'

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

import { cn } from '@/lib/utils'

type CookieTrader = {
  id: string
  name: string
  status: 'active' | 'expired'
  platform: 'okx' | 'binance' | 'bitget' | 'gate'
}

type GrabTask = {
  id: string
  exchange: number // 1: okx, 2: binance
  nickname: string
  uniqueName: string
  follow_type: string
  status: number // 1: 进行中, 0: 结束
  info: string // 成功/失败信息
  created_at: string
}

const featureActions = [
  {
    title: '获取交易所 Cookie',
    href: '/dashboard/cookie'
  }
]

export default function GrabPage() {
  const [exchange, setExchange] = React.useState<'okx' | 'binance' | ''>('okx')
  const [traderUrl, setTraderUrl] = React.useState('')
  const [uniqueName, setUniqueName] = React.useState('')
  const [isConfigOpen, setIsConfigOpen] = React.useState(false)

  const [selectedTrader, setSelectedTrader] = React.useState<CookieTrader | null>(null)
  const [myCookies, setMyCookies] = React.useState<CookieTrader[]>([])

  // 抢位任务状态
  const [tasks, setTasks] = React.useState<GrabTask[]>([])
  const [stoppingTaskId, setStoppingTaskId] = React.useState<string | null>(null)

  const fetchTasks = async () => {
    try {
      const res = await getGrabTaskList()
      if (res.code === 0 && Array.isArray(res.data)) {
        // 这里进行数据的映射和兼容处理，如果需要
        const mappedTasks = res.data.map(item => ({
          ...item,
          id: String(item.id),
          created_at: item.created_at || item.create_datetime // 兼容后端返回不同时间字段的情况
        }))
        setTasks(mappedTasks)
      }
    } catch (error) {
      console.error('获取抢位任务失败:', error)
    }
  }

  const fetchCookies = async () => {
    try {
      const res = await getCookies()
      if (res.code === 0 && Array.isArray(res.data)) {
        const mappedCookies: CookieTrader[] = res.data.map(c => ({
          id: String(c.id),
          name: c.curl_name,
          status: c.available ? 'active' : 'expired',
          platform: c.exchange === 2 ? 'binance' : c.exchange === 1 ? 'okx' : 'bitget'
        }))
        setMyCookies(mappedCookies)
      }
    } catch (error) {
      console.error('获取 Cookie 失败:', error)
    }
  }

  React.useEffect(() => {
    fetchTasks()
    fetchCookies()
  }, [])

  // 获取当前交易所的我自己的 Cookie
  const currentMyCookie = myCookies.find(c => c.platform === exchange)

  React.useEffect(() => {
    if (currentMyCookie && currentMyCookie.status === 'active') {
      setSelectedTrader(currentMyCookie)
    } else {
      setSelectedTrader(null)
    }
  }, [currentMyCookie])

  // 解析交易员主页链接获取 uniqueName
  const handleParseUrl = () => {
    if (!traderUrl.trim()) {
      setUniqueName('')

      return
    }

    try {
      const url = new URL(traderUrl)
      const segments = url.pathname.split('/').filter(Boolean)

      if (segments.length > 0) {
        setUniqueName(segments[segments.length - 1])
      } else {
        setUniqueName('')
      }
    } catch {
      setUniqueName('无效的链接格式')
    }
  }

  const handleExchangeChange = (value: 'okx' | 'binance') => {
    setExchange(value)
  }

  const handleStopTask = async (taskId: string) => {
    try {
      const res = await stopGrabTask(taskId)
      if (res.code === 0) {
        toast.success('已终止抢位任务')
        // 刷新列表
        fetchTasks()
      } else {
        toast.error(res.error || '终止失败')
      }
    } catch (error) {
      console.error(error)
      toast.error('请求失败')
    } finally {
      setStoppingTaskId(null)
    }
  }

  const activeTasks = tasks.filter(t => t.status === 1)

  const historyTasks = tasks
    .filter(t => t.status === 0)

    // 根据需求，只展示最近的 10 个历史任务，并根据创建时间排序 (假设 created_at 格式可比较)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10)

  return (
    <div className='flex h-full items-start justify-center overflow-y-auto p-4 lg:p-8'>
      <div className='w-full max-w-2xl space-y-6 pb-20'>
        <MotionPreset fade blur slide={{ direction: 'down' }} delay={0.2} transition={{ duration: 0.5 }}>
          <Card
            className={`overflow-hidden rounded-xl border-none bg-blue-600 bg-[url('https://cdn.shadcnstudio.com/ss-assets/blocks/marketing/download/image-09.png')] bg-cover bg-center p-0 pt-6 shadow-lg sm:pt-8 lg:h-[216px]`}
          >
            <CardContent className='flex gap-6 px-6 max-sm:flex-col max-sm:gap-2 max-sm:text-center sm:px-10'>
              <div className='space-y-3 pb-2 sm:flex-1 sm:pb-8'>
                <h2 className='flex items-center gap-2 text-xl font-bold tracking-tighter text-white max-sm:mx-auto sm:text-xl md:text-xl'>
                  <Zap className='h-6 w-6' fill='currentColor' />
                  跟单抢位
                </h2>
                <p className='mb-3 text-sm text-white/70'>
                  当热门交易员满员时，使用抢位功能可以自动监控并第一时间为您抢占跟单名额。此功能需要配合交易所的 Cookie
                  使用。
                </p>
                <div className='flex items-center gap-3 max-sm:flex-wrap max-sm:justify-center'>
                  {featureActions.map(action => (
                    <a
                      key={action.title}
                      href={action.href}
                      rel='noopener noreferrer'
                      className='flex h-8 items-center justify-center rounded-md bg-white px-3 text-xs font-medium text-black/90 sm:h-9 sm:text-sm'
                    >
                      {action.title}
                    </a>
                  ))}
                </div>
              </div>
              <div className='flex items-center justify-center pb-6 sm:my-auto sm:min-w-56 sm:pb-0'>
                {/* Logo 云布局：移动端一行四列，大屏两行两列错位 */}
                <div className='flex flex-row gap-3 sm:flex-row sm:gap-4'>
                  {/* 第一组 */}
                  <div className='flex flex-row gap-3 sm:flex-col sm:gap-4'>
                    <motion.div
                      className='flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-blue-600 shadow-lg backdrop-blur-sm sm:h-14 sm:w-14'
                      animate={{ scale: [1, 1.08, 1], y: [0, -5, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <img
                        src='/exchanges/binance.png'
                        alt='binance'
                        className='object-over h-full w-full transition-all duration-300 hover:scale-110 sm:h-10 sm:w-10'
                      />
                    </motion.div>
                    <motion.div
                      className='flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-white shadow-lg backdrop-blur-sm sm:h-14 sm:w-14'
                      animate={{ scale: [1, 1.08, 1], y: [0, 5, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <img
                        src='/exchanges/okx.png'
                        alt='okx'
                        className='h-full w-full object-cover transition-all duration-300 hover:scale-110'
                      />
                    </motion.div>
                  </div>
                  {/* 第二组（错位排布） */}
                  <div className='flex flex-row gap-3 sm:mt-8 sm:flex-col sm:gap-4'>
                    <motion.div
                      className='flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-white shadow-lg backdrop-blur-sm sm:h-14 sm:w-14'
                      animate={{ scale: [1, 1.08, 1], y: [0, 5, 0] }}
                      transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <img
                        src='/exchanges/bitget.png'
                        alt='bitget'
                        className='h-full w-full object-cover transition-all duration-300 hover:scale-110'
                      />
                    </motion.div>
                    <motion.div
                      className='flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-white shadow-lg backdrop-blur-sm sm:h-14 sm:w-14'
                      animate={{ scale: [1, 1.08, 1], y: [0, -5, 0] }}
                      transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <img
                        src='/exchanges/gate.png'
                        alt='gate'
                        className='h-full w-full object-cover transition-all duration-300 hover:scale-110'
                      />
                    </motion.div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </MotionPreset>

        {/* 正在进行中的抢位任务 */}
        {activeTasks.length > 0 && (
          <MotionPreset fade blur slide={{ direction: 'down' }} delay={0.4} transition={{ duration: 0.5 }}>
            <div className='flex flex-col gap-3'>
              <div className='flex items-center justify-between px-1'>
                <h3 className='flex items-center gap-2 text-base font-semibold text-blue-600 dark:text-blue-400'>
                  <Loader2 className='h-4 w-4 animate-spin' />
                  进行中的抢位任务
                  <Badge
                    variant='secondary'
                    className='ml-1 bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/40 dark:text-blue-300'
                  >
                    {activeTasks.length}
                  </Badge>
                </h3>
              </div>
              <div className='grid gap-3 sm:grid-cols-2'>
                {activeTasks.map(task => (
                  <div
                    key={task.id}
                    className='group bg-card relative flex flex-col justify-between overflow-hidden rounded-xl border p-4 shadow-sm transition-all hover:shadow-md'
                  >
                    {/* 背景光晕效果 */}
                    <div className='absolute -top-4 -right-4 h-24 w-24 rounded-full bg-blue-500/10 blur-2xl transition-all group-hover:bg-blue-500/20'></div>

                    <div className='relative z-10 flex items-start justify-between gap-3'>
                      <div className='flex items-center gap-3'>
                        <div className='bg-background relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border p-2 shadow-sm'>
                          <img
                            src={`/exchanges/${task.exchange === 1 ? 'okx' : 'binance'}.png`}
                            alt={task.exchange === 1 ? 'okx' : 'binance'}
                            className='h-full w-full object-contain'
                          />
                          <div className='bg-background absolute -right-1 -bottom-1 flex h-3.5 w-3.5 items-center justify-center rounded-full'>
                            <span className='h-2 w-2 animate-pulse rounded-full bg-blue-500'></span>
                          </div>
                        </div>
                        <div className='flex flex-col'>
                          <h4 className='text-foreground line-clamp-1 text-sm font-medium'>{task.nickname}</h4>
                          <span className='text-muted-foreground mt-0.5 text-[11px]'>{task.follow_type}</span>
                        </div>
                      </div>

                      <AlertDialog
                        open={stoppingTaskId === task.id}
                        onOpenChange={open => !open && setStoppingTaskId(null)}
                      >
                        <AlertDialogTrigger asChild>
                          <Button
                            variant='ghost'
                            size='icon'
                            className='text-muted-foreground hover:bg-destructive/10 hover:text-destructive h-8 w-8 shrink-0'
                            onClick={() => setStoppingTaskId(task.id)}
                            title='终止抢位'
                          >
                            <StopCircle className='h-4 w-4' />
                            <span className='sr-only'>终止抢位</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>确认终止抢位任务？</AlertDialogTitle>
                            <AlertDialogDescription>
                              您确定要终止对交易员{' '}
                              <span className='text-foreground font-semibold'>{task.nickname}</span>{' '}
                              的抢位吗？终止后您将失去排队位置。
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>取消</AlertDialogCancel>
                            <AlertDialogAction
                              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
                              onClick={() => handleStopTask(task.id)}
                            >
                              确认终止
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>

                    <div className='relative z-10 mt-4 flex items-center justify-between border-t pt-3'>
                      <div className='text-muted-foreground flex items-center gap-1.5 text-xs'>
                        <History className='h-3.5 w-3.5' />
                        <span>{new Date(task.created_at).toLocaleDateString()}</span>
                      </div>
                      <Badge
                        variant='outline'
                        className='border-blue-200 bg-blue-50 text-[10px] font-normal text-blue-600 dark:border-blue-900/50 dark:bg-blue-900/20 dark:text-blue-400'
                      >
                        正在抢位中...
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </MotionPreset>
        )}

        {/* 创建抢位任务表单 */}
        <MotionPreset fade blur slide={{ direction: 'down' }} delay={0.6} transition={{ duration: 0.5 }}>
          <Card>
            <CardHeader>
              <CardTitle>创建抢位任务</CardTitle>
              <CardDescription>配置您的抢位参数，以开始监控目标交易员的名额。</CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
              {/* 0. 选择目标交易所 */}
              <div className='space-y-3'>
                <Label>选择目标交易所</Label>
                <div className='grid grid-cols-2 gap-3 sm:gap-4'>
                  <button
                    type='button'
                    onClick={() => handleExchangeChange('okx')}
                    className={cn(
                      'hover:bg-muted/50 flex h-16 items-center justify-center rounded-xl border-2 p-3 transition-all sm:h-20 sm:p-4',
                      exchange === 'okx'
                        ? 'border-primary bg-primary/5'
                        : 'bg-muted/30 hover:border-primary/20 border-transparent'
                    )}
                  >
                    <Image
                      src='/exchanges/okx/logo-light.svg'
                      alt='OKX'
                      width={100}
                      height={32}
                      className='h-5 w-auto object-contain sm:h-6 dark:hidden'
                    />
                    <Image
                      src='/exchanges/okx/logo-dark.png'
                      alt='OKX'
                      width={100}
                      height={32}
                      className='hidden h-6 w-auto object-contain sm:h-7 dark:block'
                    />
                  </button>

                  <button
                    type='button'
                    onClick={() => handleExchangeChange('binance')}
                    className={cn(
                      'hover:bg-muted/50 flex h-16 items-center justify-center rounded-xl border-2 p-3 transition-all sm:h-20 sm:p-4',
                      exchange === 'binance'
                        ? 'border-primary bg-primary/5'
                        : 'bg-muted/30 hover:border-primary/20 border-transparent'
                    )}
                  >
                    <Image
                      src='/exchanges/binance/logo.svg'
                      alt='Binance'
                      width={100}
                      height={32}
                      className='h-6 w-auto object-contain sm:h-7'
                    />
                  </button>
                </div>
              </div>

              {/* 1. 显示当前交易所的 Cookie 状态 */}
              <div className='space-y-3 pt-2'>
                <Label>我的 Cookie 状态</Label>
                {currentMyCookie ? (
                  <div
                    className={cn(
                      'relative flex flex-col justify-between rounded-xl border p-4 transition-colors',
                      selectedTrader?.id === currentMyCookie.id ? 'border-primary bg-primary/5' : ''
                    )}
                  >
                    <div className='flex items-start gap-3'>
                      <div className='bg-muted/50 flex h-10 w-10 shrink-0 items-center justify-center rounded-full p-2'>
                        <img
                          src={`/exchanges/${currentMyCookie.platform}.png`}
                          alt={currentMyCookie.platform}
                          className='h-full w-full object-contain'
                        />
                      </div>
                      <div className='flex-1 overflow-hidden'>
                        <h3 className='truncate text-sm font-semibold'>{currentMyCookie.name}</h3>
                        <p className='text-muted-foreground mt-1 text-xs'>
                          状态:{' '}
                          <span
                            className={cn(
                              'font-medium',
                              currentMyCookie.status === 'active' ? 'text-green-500' : 'text-destructive'
                            )}
                          >
                            {currentMyCookie.status === 'active' ? '有效' : '已失效'}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className='text-muted-foreground rounded-xl border border-dashed py-8 text-center text-sm'>
                    未找到您在 {exchange === 'okx' ? '欧易' : exchange === 'binance' ? '币安' : exchange} 的
                    Cookie，请先前往添加
                  </div>
                )}
              </div>

              {/* 2. 提交交易员主页地址 */}
              <div className='space-y-2'>
                <Label className='flex items-center gap-1'>
                  <span className='text-destructive'>*</span>
                  交易员主页链接
                </Label>
                <div className='flex gap-2'>
                  <Input
                    placeholder='请输入交易员主页链接 (例如 https://...)'
                    value={traderUrl}
                    onChange={e => setTraderUrl(e.target.value)}
                  />
                  <Button
                    onClick={handleParseUrl}
                    className='dark:bg-secondary dark:text-secondary-foreground dark:hover:bg-secondary/80 dark:border-border dark:border'
                    variant='secondary'
                  >
                    解析
                  </Button>
                </div>
              </div>

              {/* 解析出的 UniqueName */}
              {uniqueName && (
                <div className='space-y-2'>
                  <Label className='flex items-center gap-1'>
                    <span className='text-destructive'>*</span>
                    交易员 （ UID 或 带单项目 ID）
                  </Label>
                  <Input value={uniqueName} readOnly className='bg-muted' />
                </div>
              )}
            </CardContent>
            <CardFooter className='flex justify-end gap-2'>
              <Button
                disabled={
                  !exchange ||
                  !uniqueName ||
                  uniqueName === '无效的链接格式' ||
                  !selectedTrader ||
                  selectedTrader.status !== 'active'
                }
                onClick={() => setIsConfigOpen(true)}
              >
                进入下一步
              </Button>
            </CardFooter>
          </Card>
        </MotionPreset>

        {/* 历史抢位任务 */}
        {historyTasks.length > 0 && (
          <MotionPreset fade blur slide={{ direction: 'down' }} delay={0.8} transition={{ duration: 0.5 }}>
            <div className='flex flex-col gap-3'>
              <div className='flex items-center justify-between px-1'>
                <h3 className='flex items-center gap-2 text-base font-semibold'>
                  <History className='text-muted-foreground h-4 w-4' />
                  历史抢位任务
                  <span className='text-muted-foreground ml-1 text-xs font-normal'>(只展示最近10条抢位任务)</span>
                </h3>
              </div>
              <div className='grid gap-3 sm:grid-cols-2'>
                {historyTasks.map(task => (
                  <div
                    key={task.id}
                    className='group bg-card relative flex flex-col justify-between overflow-hidden rounded-xl border p-4 shadow-sm transition-all hover:shadow-md'
                  >
                    <div className='relative z-10 flex items-start justify-between gap-3'>
                      <div className='flex items-center gap-3'>
                        <div className='bg-muted/50 relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border p-2'>
                          <img
                            src={`/exchanges/${task.exchange === 1 ? 'okx' : 'binance'}.png`}
                            alt={task.exchange === 1 ? 'okx' : 'binance'}
                            className='h-full w-full object-contain opacity-80'
                          />
                        </div>
                        <div className='flex flex-col'>
                          <h4 className='text-foreground line-clamp-1 text-sm font-medium'>{task.nickname}</h4>
                          <span className='text-muted-foreground mt-0.5 text-[11px]'>{task.follow_type}</span>
                        </div>
                      </div>

                      {task.info === '成功' ? (
                        <Badge
                          variant='outline'
                          className='shrink-0 border-green-500/20 bg-green-500/10 text-green-600 dark:bg-green-500/5'
                        >
                          <CheckCircle2 className='mr-1 h-3 w-3' />
                          成功
                        </Badge>
                      ) : (
                        <Badge
                          variant='outline'
                          className='border-destructive/20 bg-destructive/10 text-destructive dark:bg-destructive/5 shrink-0'
                        >
                          <XCircle className='mr-1 h-3 w-3' />
                          失败
                        </Badge>
                      )}
                    </div>

                    <div className='relative z-10 mt-4 flex flex-col gap-2 border-t pt-3'>
                      <div className='flex items-center justify-between text-xs'>
                        <span className='text-muted-foreground'>创建时间</span>
                        <span>{new Date(task.created_at).toLocaleString()}</span>
                      </div>

                      {task.info !== '成功' && task.info && (
                        <div className='bg-destructive/5 text-destructive/90 flex items-start gap-1.5 rounded-md p-2 text-xs'>
                          <Info className='mt-0.5 h-3.5 w-3.5 shrink-0' />
                          <span>{task.info}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </MotionPreset>
        )}
      </div>

      <GrabTaskConfigSheet
        isOpen={isConfigOpen}
        onClose={() => {
          setIsConfigOpen(false)
        }}
        traderId={uniqueName}
        traderName={uniqueName}
        platform={exchange}
      />
    </div>
  )
}
