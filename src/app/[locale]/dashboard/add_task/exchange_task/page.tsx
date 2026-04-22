'use client'

import * as React from 'react'

import { Info, UserCheck } from 'lucide-react'
import Image from 'next/image'
import { motion } from 'motion/react'

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { MotionPreset } from '@/components/ui/motion-preset'
import { CopyTaskConfigSheet } from '../_components/copy-task-config-sheet'

import { cn } from '@/lib/utils'

export default function ExchangeTaskPage() {
  const [exchange, setExchange] = React.useState<'okx' | 'binance' | ''>('okx')
  const [traderUrl, setTraderUrl] = React.useState('')
  const [uniqueName, setUniqueName] = React.useState('')
  const [traderType, setTraderType] = React.useState('')
  const [isConfigOpen, setIsConfigOpen] = React.useState(false)

  // 解析交易员主页链接获取 uniqueName
  const handleParseUrl = () => {
    if (!traderUrl.trim()) {
      setUniqueName('')

      return
    }

    try {
      const url = new URL(traderUrl)

      // 简单模拟解析逻辑，实际可根据具体交易所的 URL 结构进行正则或路径拆分
      const segments = url.pathname.split('/').filter(Boolean)

      if (segments.length > 0) {
        // 取最后一段作为 uniqueName 示例
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
    setTraderType('') // 切换交易所时重置交易员类型
  }

  return (
    <div className='flex h-full items-start justify-center overflow-y-auto p-4 lg:p-8'>
      <div className='w-full max-w-2xl space-y-6 pb-20'>
        <MotionPreset fade blur slide={{ direction: 'down' }} delay={0.6} transition={{ duration: 0.5 }}>
          <Card
            className={`overflow-hidden rounded-xl border-none bg-blue-600 bg-[url('https://cdn.shadcnstudio.com/ss-assets/blocks/marketing/download/image-09.png')] bg-cover bg-center p-0 pt-6 shadow-lg sm:pt-8 lg:h-[216px]`}
          >
            <CardContent className='flex gap-6 px-6 max-sm:flex-col max-sm:gap-2 max-sm:text-center sm:px-10'>
              <div className='space-y-3 pb-2 sm:flex-1 sm:pb-8'>
                <h2 className='flex items-center gap-2 text-xl font-bold tracking-tighter text-white max-sm:mx-auto sm:text-xl md:text-xl'>
                  <UserCheck className='h-6 w-6' />
                  交易所自选跟单
                </h2>
                <p className='mb-3 text-sm text-white/70'>
                  只要可以看到交易持仓就可以进行跟单！跟单原版交易所信号最稳定，速度最快！
                </p>
              </div>
              <div className='flex items-center justify-center pb-6 sm:my-auto sm:min-w-56 sm:pb-0'>
                {/* Logo 云布局：移动端一行四列，大屏两行两列错位 */}
                <div className='flex flex-row gap-3 sm:flex-row sm:gap-4'>
                  {/* 第一组：在移动端是前两个，大屏是第一列 */}
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
                  {/* 第二组：在移动端是后两个，大屏是第二列（错位排布） */}
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

        <MotionPreset fade blur slide={{ direction: 'down' }} delay={0.8} transition={{ duration: 0.5 }}>
          <Card>
            <CardHeader>
              <CardTitle>创建交易所跟单任务</CardTitle>
              <CardDescription>配置您的跟单参数，以开始监听并复制目标交易员的策略。</CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
              {/* 1. 选择目标交易所 */}
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

              {/* 交易所延迟提示信息 */}
              {exchange === 'okx' && (
                <div className='flex items-start gap-2 rounded-xl bg-blue-600/10 p-3 text-sm text-blue-800/80 dark:text-blue-300/80'>
                  <Info className='mt-0.5 h-4 w-4 shrink-0' />
                  <div className='flex flex-col gap-1'>
                    <p className='font-semibold'>欧易交易所延迟提示：</p>
                    <p className='mb-2 text-xs text-blue-700/80 dark:text-blue-300/80'>
                      此延迟为交易所官方设置，非跟单工具所导致！
                    </p>
                    <ul className='mt-1 list-inside list-disc space-y-1 text-xs'>
                      <li>
                        <strong>跟单公开带单：</strong>开仓5分钟延迟，加仓、减仓、平仓无延迟
                      </li>
                      <li>
                        <strong>跟单个人交易：</strong>推荐！0延迟！
                      </li>
                    </ul>
                  </div>
                </div>
              )}
              {exchange === 'binance' && (
                <div className='flex items-start gap-2 rounded-xl bg-blue-600/10 p-3 text-sm text-blue-800/80 dark:text-blue-300/80'>
                  <Info className='mt-0.5 h-4 w-4 shrink-0' />
                  <div className='flex flex-col gap-1'>
                    <p className='font-semibold'>币安交易所延迟提示：</p>
                    <p className='mb-2 text-xs text-blue-700/80 dark:text-blue-300/80'>
                      此延迟为交易所官方设置，非跟单工具所导致！
                    </p>
                    <ul className='mt-1 list-inside list-disc space-y-1 text-xs'>
                      <li>
                        <strong>跟单公开实盘：</strong>推荐！0延迟！
                      </li>
                      <li>
                        <strong>跟单隐藏实盘：</strong>开仓、加仓、减仓、平仓均有2分钟延迟
                      </li>
                    </ul>
                  </div>
                </div>
              )}

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

              {/* 3. 选择交易员类型 */}
              {exchange && (
                <div className='space-y-2'>
                  <Label className='flex items-center gap-1'>
                    <span className='text-destructive'>*</span>
                    交易员类型
                  </Label>
                  <Select onValueChange={setTraderType} value={traderType}>
                    <SelectTrigger className='w-full'>
                      <SelectValue placeholder='请选择交易员类型' />
                    </SelectTrigger>
                    <SelectContent>
                      {exchange === 'okx' ? (
                        <>
                          <SelectItem value='1'>合约带单</SelectItem>
                          <SelectItem value='2'>个人概况</SelectItem>
                        </>
                      ) : (
                        <>
                          <SelectItem value='1'>公开带单</SelectItem>
                          <SelectItem value='2'>隐藏带单</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
            <CardFooter className='flex justify-end gap-2'>
              <Button
                disabled={!exchange || !uniqueName || uniqueName === '无效的链接格式' || !traderType}
                onClick={() => setIsConfigOpen(true)}
              >
                创建跟单
              </Button>
            </CardFooter>
          </Card>
        </MotionPreset>
      </div>

      <CopyTaskConfigSheet
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        traderId={uniqueName}
        traderName={uniqueName}
        platform={exchange}
        traderPlatform={exchange === 'binance' ? 2 : 1}
        roleType={traderType}
      />
    </div>
  )
}
