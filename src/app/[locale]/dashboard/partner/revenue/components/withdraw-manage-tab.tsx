"use client"

import { useCallback, useEffect, useState } from "react"

import { toast } from "sonner"

import { agentApi } from "@/api/agent"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const withdrawMethodOptions = [
  { value: "trc20", label: "TRC20（钱包地址）" },
  { value: "binance", label: "币安内部转账（UID）" },
  { value: "okx", label: "欧意内部转账（UID）" },
] as const

export function WithdrawManageTab() {
  const [loading, setLoading] = useState(false)
  const [trc20Address, setTrc20Address] = useState("")
  const [binanceUid, setBinanceUid] = useState("")
  const [okxUid, setOkxUid] = useState("")
  const [withdrawMethod, setWithdrawMethod] = useState<(typeof withdrawMethodOptions)[number]["value"]>("trc20")
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false)
  const [submittingWithdraw, setSubmittingWithdraw] = useState(false)
  const [savingMethod, setSavingMethod] = useState(false)
  const [withdrawableAmount, setWithdrawableAmount] = useState(0)
  const [withdrawnAmount, setWithdrawnAmount] = useState(0)
  const canWithdraw = withdrawableAmount >= 50

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [methodRes, summaryRes] = await Promise.all([
        agentApi.getWithdrawMethod(),
        agentApi.getWithdrawSummary(),
      ])

      if (methodRes.code === 0 && methodRes.data) {
        const payload = methodRes.data.payload_json || {}
        setTrc20Address(payload?.trc20?.address || "")
        setBinanceUid(payload?.binance?.uid || "")
        setOkxUid(payload?.okx?.uid || "")
      }
      if (summaryRes.code === 0 && summaryRes.data) {
        setWithdrawableAmount(Number(summaryRes.data.available_amount || 0))
        setWithdrawnAmount(Number(summaryRes.data.withdraw_amount || 0))
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleSaveMethod = async () => {
    setSavingMethod(true)
    try {
      const payloadJson = {
        trc20: { address: trc20Address.trim() },
        binance: { uid: binanceUid.trim() },
        okx: { uid: okxUid.trim() },
      }
      const res = await agentApi.saveWithdrawMethod({ payload_json: payloadJson })

      if (res.code === 0) {
        toast.success("提现渠道设置已保存")
        await loadData()
      }
    } finally {
      setSavingMethod(false)
    }
  }

  const handleConfirmWithdraw = async () => {
    if (!canWithdraw) return

    try {
      setSubmittingWithdraw(true)
      const res = await agentApi.createWithdrawRequest({ channel: withdrawMethod })

      if (res.code === 0) {
        toast.success("提现申请已提交")
        setWithdrawDialogOpen(false)
        await loadData()
      }
    } finally {
      setSubmittingWithdraw(false)
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
      <Card className="border-border/60 rounded-xl">
        <CardHeader>
          <CardTitle>提现渠道设置</CardTitle>
          <CardDescription>维护提现渠道信息，提现时可直接选择已配置渠道。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="withdraw-trc20-address">TRC20 钱包地址</Label>
            <Input
              id="withdraw-trc20-address"
              placeholder="请输入 TRC20 钱包地址"
              value={trc20Address}
              onChange={(e) => setTrc20Address(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="withdraw-binance-uid">币安 UID</Label>
            <Input
              id="withdraw-binance-uid"
              placeholder="请输入币安 UID"
              value={binanceUid}
              onChange={(e) => setBinanceUid(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="withdraw-okx-uid">欧意 UID</Label>
            <Input
              id="withdraw-okx-uid"
              placeholder="请输入欧意 UID"
              value={okxUid}
              onChange={(e) => setOkxUid(e.target.value)}
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button
              className="w-full sm:w-auto"
              onClick={handleSaveMethod}
              disabled={savingMethod}
            >
              {savingMethod ? "保存中..." : "保存渠道设置"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 rounded-xl">
        <CardHeader>
          <CardTitle>提现</CardTitle>
          <CardDescription>选择提现方式并提交提现申请。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="bg-muted/20 rounded-xl border border-border/50 p-4 shadow-sm transition-colors hover:bg-muted/40">
              <p className="text-muted-foreground text-xs font-medium">可提现</p>
              <div className="mt-1.5 flex items-baseline gap-1">
                <span className="text-xl font-semibold tracking-tight">{withdrawableAmount.toFixed(2)}</span>
                <span className="text-muted-foreground text-xs font-medium">USDT</span>
              </div>
            </div>
            <div className="bg-muted/20 rounded-xl border border-border/50 p-4 shadow-sm transition-colors hover:bg-muted/40">
              <p className="text-muted-foreground text-xs font-medium">已提现</p>
              <div className="mt-1.5 flex items-baseline gap-1">
                <span className="text-xl font-semibold tracking-tight">{withdrawnAmount.toFixed(2)}</span>
                <span className="text-muted-foreground text-xs font-medium">USDT</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-sm text-muted-foreground">
            提现说明：每次提现需大于 50 USDT。
          </div>
          {loading && (
            <div className="text-xs text-muted-foreground">数据加载中...</div>
          )}

          <div className="space-y-2">
            <Label htmlFor="withdraw-method">提现方式</Label>
            <Select value={withdrawMethod} onValueChange={(value) => setWithdrawMethod(value as (typeof withdrawMethodOptions)[number]["value"])}>
              <SelectTrigger id="withdraw-method" className="w-full">
                <SelectValue placeholder="请选择提现方式" />
              </SelectTrigger>
              <SelectContent>
                {withdrawMethodOptions.map((method) => (
                  <SelectItem key={method.value} value={method.value}>
                    {method.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              className="w-full sm:w-auto"
              disabled={!canWithdraw}
              onClick={() => setWithdrawDialogOpen(true)}
            >
              {canWithdraw ? "申请全额提现" : "可提现资金不足 50 USDT"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={withdrawDialogOpen} onOpenChange={setWithdrawDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认提交提现申请</AlertDialogTitle>
            <AlertDialogDescription>
              提现申请成功后，将在3个工作日内完成。超时请联系客服处理。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submittingWithdraw}>取消</AlertDialogCancel>
            <AlertDialogAction
              disabled={submittingWithdraw}
              onClick={(e) => {
                e.preventDefault()
                handleConfirmWithdraw()
              }}
            >
              {submittingWithdraw ? "提交中..." : "确认提交"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
