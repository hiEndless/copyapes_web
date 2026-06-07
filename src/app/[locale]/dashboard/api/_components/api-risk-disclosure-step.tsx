'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { DialogClose, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

const RISK_ITEM_COUNT = 7

interface ApiRiskDisclosureStepProps {
  onNext: () => void
}

export function ApiRiskDisclosureStep({ onNext }: ApiRiskDisclosureStepProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [scrolledToBottom, setScrolledToBottom] = useState(false)
  const [agreed, setAgreed] = useState(false)

  const checkScrollBottom = useCallback(() => {
    const el = scrollRef.current

    if (!el) return

    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 8

    if (atBottom) {
      setScrolledToBottom(true)
    }
  }, [])

  useEffect(() => {
    requestAnimationFrame(checkScrollBottom)
  }, [checkScrollBottom])

  const canProceed = scrolledToBottom && agreed

  return (
    <>
      <DialogHeader className='border-border flex shrink-0 flex-row items-start justify-between gap-2 space-y-0 border-b px-6 py-4 text-left'>
        <div>
          <DialogTitle className='text-[17px] leading-tight font-semibold tracking-tight'>
            API Key 安全须知与风险声明
          </DialogTitle>
          <p className='text-muted-foreground mt-1 text-[11.5px] font-medium'>
            第 1 步 / 共 2 步 · {RISK_ITEM_COUNT} 条 · 请滚动阅读全部
          </p>
        </div>
        <DialogClose asChild>
          <Button
            type='button'
            variant='ghost'
            size='icon'
            className='size-8 shrink-0'
            aria-label='关闭'
          >
            <X className='size-4' />
          </Button>
        </DialogClose>
      </DialogHeader>

      <div
        ref={scrollRef}
        onScroll={checkScrollBottom}
        className='min-h-0 flex-1 overflow-y-auto px-6 py-4'
      >
        <RiskItem
          index={1}
          highlight
          title='必须关闭「提现 (Withdraw)」权限'
          content={
            <>
              <p>
                请在交易所的 API 管理页面，<strong>只勾选「读取」+「合约交易」</strong>
                ，千万不要勾选「提现」或「划转/转账」。
              </p>
              <p>
                这是最底层的安全保障。由于 Key 本身不具备提现能力，从物理和机制层面
                <strong>彻底杜绝了资金被非法转移的可能</strong>。
              </p>
              <p className='text-muted-foreground/70 mt-1 text-[10.5px]'>
                各大所 API 管理位置：Binance → 右上角头像 → API 管理；OKX → 左上角账户设置 →
                API；Bitget → 左上角头像 → API 密钥；Gate → 左上角头像 → API；WEEX → 账户设置 →
                API 管理
              </p>
            </>
          }
        />

        <RiskItem
          index={2}
          title='API Secret 以 AES-256-CBC 加密存储'
          content={
            <>
              <p>
                您提交的 API Secret / Passphrase 在存入数据库之前，会用{' '}
                <strong>AES-256-CBC 对称加密算法</strong>
                加密。加密密钥独立存储在 GCP Secret Manager，不写入任何代码仓库、日志或备份。
              </p>
              <p>
                这意味着：即使数据库被全量导出，攻击者只能看到加密后的密文，
                <strong>无密钥无法还原 Secret 明文</strong>。平台员工、运维、开发都
                <strong>无法查看您的 Secret 明文</strong>。
              </p>
            </>
          }
        />

        <RiskItem
          index={3}
          title='跟单引擎仅调用交易类 API，永不触碰本金'
          content={
            <>
              <p>
                本平台的跟单引擎只会调用以下 API：
                <strong>下单 / 撤单 / 查询持仓 / 查询余额 / 设置杠杆</strong>。
              </p>
              <p>
                <strong>永远不会调用</strong>：提现（withdraw）、资金划转（transfer）、API Key
                管理等资金相关 API。
              </p>
              <p>
                系统通过严格的权限隔离机制，仅拦截并执行交易指令。不仅永远不会调用提现、划转等敏感
                API，在系统架构上也<strong>无法绕过交易所的权限体系</strong>。
              </p>
            </>
          }
        />

        <RiskItem
          index={4}
          title='您对 API Key 有 100% 的控制权，随时可撤销'
          content={
            <>
              <p>
                您可在任意时刻，在<strong>交易所</strong>的 API 管理页删除此 API Key（不需要经过本平台）。
                删除后本平台立即失去跟单能力，所有跟单任务自动停止。
              </p>
              <p>
                您也可在本页面编辑标签，或删除当前 API 账户一键解绑。
              </p>
            </>
          }
        />

        <RiskItem
          index={5}
          title='请理解合约交易风险'
          content={
            <>
              <p>
                合约交易是<strong>高风险金融衍生品</strong>，存在以下风险：
              </p>
              <ul className='ml-5 list-disc space-y-0.5'>
                <li>
                  <strong>爆仓风险</strong>：剧烈行情下可能损失全部保证金
                </li>
                <li>
                  <strong>延迟风险</strong>：跟单经信号监控 → 系统处理 → 交易所下单，存在秒级延迟
                </li>
                <li>
                  <strong>策略风险</strong>：交易员过往业绩不代表未来表现
                </li>
                <li>
                  <strong>系统风险</strong>：极端情况下网络、交易所故障可能导致信号漏跟
                </li>
                <li>
                  <strong>人为风险</strong>：交易员可能出现判断失误、情绪化交易或扛单行为
                </li>
              </ul>
              <p className='mt-1'>
                <strong>盈亏由您自行承担</strong>。
              </p>
            </>
          }
        />

        <RiskItem
          index={6}
          title='建议跟单金额不超过账户 50%'
          content={
            <>
              <p>
                跟单使用的是您账户里的保证金，剧烈行情或交易员异常可能导致保证金占用过高。建议：
              </p>
              <ul className='ml-5 list-disc space-y-0.5'>
                <li>
                  <strong>首次跟单</strong>：只分配账户 10%~20% 资金，观察 1 周
                </li>
                <li>
                  <strong>稳定后</strong>：逐步提高至账户 50% 以内
                </li>
                <li>
                  <strong>保留余量</strong>：始终保留 50%+ 空闲保证金，防强平
                </li>
              </ul>
            </>
          }
        />

        <RiskItem
          index={7}
          title='关于数据隐私'
          content={
            <>
              <p>
                本平台<strong>不会</strong>将您的 API Key、持仓、盈亏数据出售或分享给任何第三方。数据仅用于跟单执行、风控、盈亏统计。
              </p>
              <p>
                您在本平台的跟单数据<strong>仅您本人可见</strong>
                ，平台员工未经您授权不访问您的个人数据。
              </p>
            </>
          }
        />
      </div>

      <div className='border-border bg-background shrink-0 border-t px-6 py-3'>
        <div className='mb-2.5 flex flex-wrap items-center'>
          <label
            className={cn(
              'flex items-center gap-2 text-xs select-none transition-opacity',
              scrolledToBottom ? 'cursor-pointer opacity-100' : 'cursor-not-allowed opacity-50'
            )}
          >
            <Checkbox
              checked={agreed}
              disabled={!scrolledToBottom}
              onCheckedChange={(checked) => setAgreed(checked === true)}
            />
            <span className='text-foreground font-medium'>我已阅读并同意上述条款</span>
          </label>
          {!scrolledToBottom && (
            <span className='text-muted-foreground ml-2 text-[10.5px] font-medium'>
              · 请先滚动至底部
            </span>
          )}
        </div>

        <div className='flex gap-2'>
          <Button
            type='button'
            className='h-11 flex-1 text-[13px] font-semibold'
            disabled={!canProceed}
            onClick={onNext}
          >
            下一步：填写 API Key →
          </Button>
          <DialogClose asChild>
            <Button
              type='button'
              variant='secondary'
              className='h-11 px-5 text-[13px] font-semibold'
            >
              取消
            </Button>
          </DialogClose>
        </div>
      </div>
    </>
  )
}

function RiskItem({
  index,
  title,
  content,
  highlight = false
}: {
  index: number
  title: string
  content: React.ReactNode
  highlight?: boolean
}) {
  return (
    <div className='border-border/40 flex gap-3.5 border-b py-3 last:border-b-0'>
      <div
        className={cn(
          'w-[22px] shrink-0 pt-px text-right text-[12.5px] font-bold tabular-nums',
          highlight ? 'text-destructive' : 'text-muted-foreground'
        )}
      >
        {index}.
      </div>
      <div className='flex-1'>
        <div
          className={cn(
            'mb-0.5 text-[12.5px] font-semibold',
            highlight ? 'text-destructive' : 'text-foreground'
          )}
        >
          {title}
        </div>
        <div className='text-muted-foreground space-y-1 text-[11.5px] leading-[1.7]'>{content}</div>
      </div>
    </div>
  )
}
