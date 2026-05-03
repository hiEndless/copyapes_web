'use client'

import { useEffect, useState } from 'react'

import { CheckCircle2, Copy, Gift, Info, Users, Wallet } from 'lucide-react'
import { toast } from 'sonner'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

import { agentApi } from '@/api/agent'
import type { AgentSummaryResponse } from '@/api/agent'

export default function InvitePage() {
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState<AgentSummaryResponse | null>(null)
  const [inviteCode, setInviteCode] = useState('')

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true)

        const [summaryRes, partnerLevelRes] = await Promise.all([
          agentApi.getSummary().catch(() => null),
          agentApi.getPartnerLevel().catch(() => null)
        ])

        if (summaryRes) {
          setSummary(summaryRes)
        } else {
          setSummary({
            invited_users: 0,
            effective_invited_users: 0,
            total_share_amount: 0
          })
        }

        if (partnerLevelRes?.invite_code) {
          setInviteCode(partnerLevelRes.invite_code)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [])

  const copyToClipboard = async (text: string, message: string) => {
    if (!text) {
      toast.error('暂无可复制的邀请码')

      return
    }

    await navigator.clipboard.writeText(text)
    toast.success(message)
  }

  const milestones = [
    { count: 3, reward: 'API 授权资格 +1，跟单任务额度 +1' },
    { count: 5, reward: '账户资金上限提升 1000U' },
    { count: 10, reward: 'API 授权资格 +1，跟单任务额度 +1，账户资金上限提升 1000U' }
  ]

  const effectiveCount = summary?.effective_invited_users || 0
  const progressPercent = Math.min(100, (effectiveCount / 10) * 100)
  const nextMilestone = milestones.find(item => effectiveCount < item.count)

  const stageProgress = (() => {
    if (effectiveCount <= 0) return 0
    if (effectiveCount < 3) return (effectiveCount / 3) * 33.33
    if (effectiveCount < 5) return 33.33 + ((effectiveCount - 3) / 2) * 33.33
    if (effectiveCount < 10) return 66.66 + ((effectiveCount - 5) / 5) * 33.34

    return 100
  })()

  return (
    <div className='flex h-full flex-col gap-4 overflow-y-auto p-3 lg:p-5'>
      <div className='flex flex-col gap-1'>
        <h2 className='text-xl font-semibold tracking-tight'>邀请好友</h2>
        <p className='text-xs text-muted-foreground'>邀请好友注册，解锁额外额度与销售分成</p>
      </div>

      {loading ? (
        <div className='space-y-4'>
          <Skeleton className='h-[260px] w-full' />
          <Skeleton className='h-[260px] w-full' />
        </div>
      ) : (
        <div className='grid gap-4 md:grid-cols-12'>
          <div className='space-y-4 md:col-span-7'>
            <Card className='overflow-hidden border-border/70 shadow-sm'>
              <CardHeader className='space-y-2 pb-3'>
                <CardTitle className='flex items-center gap-2 text-base font-semibold'>
                  <Gift className='h-4 w-4 text-primary' />
                  邀请码与任务奖励
                </CardTitle>
                <CardDescription className='text-xs'>邀请码展示与邀请奖励进度总览</CardDescription>
              </CardHeader>
              <CardContent className='space-y-5'>
                <div className='grid gap-3 sm:grid-cols-[1.15fr_0.85fr]'>
                  <div className='relative overflow-hidden rounded-xl border border-primary/10 bg-gradient-to-br from-primary/[0.10] via-background to-background px-4 py-4'>
                    <div className='absolute -right-6 top-0 h-16 w-16 rounded-full bg-primary/10 blur-2xl' />
                    <div className='relative space-y-2'>
                      <div className='text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground'>
                        我的邀请码
                      </div>
                      <div className='flex items-center gap-2'>
                        <div className='rounded-lg border border-primary/15 bg-background/80 px-3 py-2 text-base font-semibold tracking-[0.3em] text-sm shadow-sm'>
                          {inviteCode || '暂无'}
                        </div>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-8 w-8 rounded-full'
                          onClick={() => copyToClipboard(inviteCode, '邀请码已复制')}
                        >
                          <span className='sr-only'>复制邀请码</span>
                          <Copy className='h-3.5 w-3.5' />
                        </Button>
                      </div>
                      <p className='text-xs leading-5 text-muted-foreground'>
                        邀请好友注册使用，可逐步解锁额外 API 授权、跟单任务额度和账户资金上限奖励（仅适用于免费用户）。
                      </p>
                    </div>
                  </div>

                  <div className='grid grid-cols-2 gap-2'>
                    <div className='rounded-xl border bg-muted/30 px-3 py-3'>
                      <div className='text-[11px] text-muted-foreground'>有效邀请</div>
                      <div className='mt-1 flex items-end gap-1'>
                        <span className='text-lg font-semibold'>{effectiveCount}</span>
                        <span className='pb-0.5 text-[11px] text-muted-foreground'>人</span>
                      </div>
                    </div>
                    <div className='rounded-xl border bg-muted/30 px-3 py-3'>
                      <div className='text-[11px] text-muted-foreground'>累计注册</div>
                      <div className='mt-1 flex items-end gap-1'>
                        <span className='text-lg font-semibold'>{summary?.invited_users || 0}</span>
                        <span className='pb-0.5 text-[11px] text-muted-foreground'>人</span>
                      </div>
                    </div>
                    <div className='col-span-2 rounded-xl border border-dashed bg-background px-3 py-3'>
                      <div className='flex items-center justify-between gap-3'>
                        <div className='flex items-center gap-2 text-[11px] text-muted-foreground'>
                          <Users className='h-3.5 w-3.5 text-primary' />
                          下一阶段
                        </div>
                        <div className='text-[11px] font-medium text-foreground'>
                          {nextMilestone ? `再邀请 ${nextMilestone.count - effectiveCount} 人` : '全部奖励已解锁'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className='space-y-3 rounded-xl border bg-muted/[0.18] p-4'>
                  <div className='flex items-center justify-between gap-3'>
                    <div>
                      <div className='text-xs font-medium text-foreground'>任务进度</div>
                      <div className='mt-1 text-[11px] text-muted-foreground'>
                        关键节点奖励将按有效邀请人数逐步解锁（仅适用于免费用户）
                      </div>
                    </div>
                    <div className='rounded-full border border-primary/15 bg-primary/[0.08] px-2.5 py-1 text-[11px] font-medium text-primary'>
                      {progressPercent.toFixed(0)}%
                    </div>
                  </div>

                  <div className='space-y-4'>
                    <div className='relative px-2'>
                      <div className='absolute left-[10px] right-[10px] top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-border/80 via-border/60 to-border/80' />
                      <div
                        className='absolute left-[10px] top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-primary/80 via-primary/65 to-primary/20 shadow-[0_0_14px_rgba(59,130,246,0.35)] transition-all duration-500'
                        style={{ width: stageProgress <= 0 ? '0%' : `calc(${stageProgress}% - 10px)` }}
                      />
                      <div className='grid grid-cols-3'>
                        {milestones.map(item => {
                          const isCompleted = effectiveCount >= item.count
                          const isCurrentNext = !isCompleted && nextMilestone?.count === item.count

                          return (
                            <div key={item.count} className='flex flex-col items-center'>
                              <div className='relative flex h-8 items-center justify-center'>
                                {isCompleted ? (
                                  <div className='relative h-3 w-3 rounded-full bg-primary shadow-[0_0_14px_rgba(59,130,246,0.35)]' />
                                ) : isCurrentNext ? (
                                  <span className='relative flex h-3 w-3 items-center justify-center'>
                                    <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/70 opacity-75' />
                                    <span className='relative inline-flex h-3 w-3 rounded-full bg-primary shadow-[0_0_18px_rgba(59,130,246,0.4)]' />
                                  </span>
                                ) : (
                                  <div className='relative h-3 w-3 rounded-full bg-muted-foreground/20 shadow-[0_0_0_4px_rgba(255,255,255,0.95)] dark:shadow-[0_0_0_4px_rgba(10,10,10,0.95)]' />
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    <div className='grid grid-cols-3 gap-2'>
                      {milestones.map(item => {
                      const isCompleted = effectiveCount >= item.count
                      const isCurrentNext = !isCompleted && nextMilestone?.count === item.count

                      return (
                        <div
                          key={item.count}
                          className={`rounded-lg px-2 py-1.5 text-center transition-colors ${
                            isCurrentNext ? 'bg-primary/[0.06]' : ''
                          }`}
                        >
                          <div className='text-sm font-semibold text-foreground'>{item.count} 人</div>
                          <div
                            className={`mt-1 text-[11px] ${
                              isCompleted
                                ? 'text-primary'
                                : isCurrentNext
                                  ? 'text-foreground'
                                  : 'text-muted-foreground'
                            }`}
                          >
                            {isCompleted ? '已解锁' : isCurrentNext ? '进行中' : '待完成'}
                          </div>
                        </div>
                      )
                      })}
                    </div>
                  </div>

                  <div className='grid gap-2'>
                    {milestones.map(item => (
                      <div
                        key={item.count}
                        className='flex items-start gap-2 rounded-lg bg-background/70 px-3 py-2'
                      >
                        <div
                          className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                            effectiveCount >= item.count
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          <CheckCircle2 className='h-3 w-3' />
                        </div>
                        <div className='min-w-0'>
                          <div className='text-xs font-medium text-foreground'>有效邀请 {item.count} 人</div>
                          <div className='mt-0.5 text-[11px] leading-5 text-muted-foreground'>{item.reward}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className='space-y-4 md:col-span-5'>
            <Card className='h-full shadow-sm'>
              <CardHeader className='space-y-2 pb-3'>
                <CardTitle className='flex items-center gap-2 text-base font-semibold'>
                  <Wallet className='h-4 w-4 text-primary' />
                  销售分成
                </CardTitle>
                <CardDescription className='text-xs'>邀请用户付费后可累计合作收益</CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='flex flex-col items-center justify-center rounded-xl border border-primary/10 bg-primary/5 py-6'>
                  <div className='text-[11px] font-medium text-muted-foreground'>累计分成收益 (USDT)</div>
                  <div className='mt-2 text-3xl font-semibold tracking-tight text-primary'>
                    {summary?.total_share_amount?.toFixed(2) || '0.00'}
                  </div>
                </div>

                <div className="bg-muted/30 rounded-lg border border-dashed px-4 py-3">
                  <Info className='h-3.5 w-3.5 text-primary inline-block mr-2 text-primary/70 box-content' />
                  <span className="text-muted-foreground text-xs leading-relaxed">
                    开通 年费VIP 或 年费工作室VIP 即可成为正式代理合作伙伴，进行收益提现。
                  </span>
                </div>

                <div className='space-y-3 pt-1'>
                  <h4 className='text-sm font-semibold'>代理合作伙伴权益</h4>
                  <ul className='space-y-2.5'>
                    <li className='flex items-start gap-2'>
                      <div className='mt-0.5 rounded-full bg-green-500/20 p-0.5 text-green-600'>
                        <CheckCircle2 className='h-3 w-3' />
                      </div>
                      <span className='text-xs leading-5 text-muted-foreground'>
                        邀请好友付费可获得高达 <strong className='text-foreground'>40%</strong>~<strong className='text-foreground'>70%</strong> 的高额返佣
                      </span>
                    </li>
                    <li className='flex items-start gap-2'>
                      <div className='mt-0.5 rounded-full bg-green-500/20 p-0.5 text-green-600'>
                        <CheckCircle2 className='h-3 w-3' />
                      </div>
                      <span className='text-xs leading-5 text-muted-foreground'>支持二级代理返佣体系，建立您的推广网络</span>
                    </li>
                    <li className='flex items-start gap-2'>
                      <div className='mt-0.5 rounded-full bg-green-500/20 p-0.5 text-green-600'>
                        <CheckCircle2 className='h-3 w-3' />
                      </div>
                      <span className='text-xs leading-5 text-muted-foreground'>独立专属的代理后台，全方位数据分析与管理</span>
                    </li>
                    <li className='flex items-start gap-2'>
                      <div className='mt-0.5 rounded-full bg-green-500/20 p-0.5 text-green-600'>
                        <CheckCircle2 className='h-3 w-3' />
                      </div>
                      <span className='text-xs leading-5 text-muted-foreground'>可自定义邀请码，方便推广和管理</span>
                    </li>
                    <li className='flex items-start gap-2'>
                      <div className='mt-0.5 rounded-full bg-green-500/20 p-0.5 text-green-600'>
                        <CheckCircle2 className='h-3 w-3' />
                      </div>
                      <span className='text-xs leading-5 text-muted-foreground'>支持交易所返佣绑定验证，可以限制受邀人仅能添加使用返佣 API 进行跟单交易</span>
                    </li>
                    <li className='flex items-start gap-2'>
                      <div className='mt-0.5 rounded-full bg-green-500/20 p-0.5 text-green-600'>
                        <CheckCircle2 className='h-3 w-3' />
                      </div>
                      <span className='text-xs leading-5 text-muted-foreground'>提现秒到账，支持 USDT (TRC20/ERC20) 等网络</span>
                    </li>
                  </ul>
                </div>

                <div className='pt-2'>
                  <Button className='h-9 w-full text-sm' asChild>
                    <a href='/dashboard/pricing'>立即升级开通代理</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
