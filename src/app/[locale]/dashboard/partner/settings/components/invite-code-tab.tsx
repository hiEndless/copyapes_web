"use client"

import { useEffect, useState, useCallback } from "react"

import { agentApi } from "@/api/agent"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function InviteCodeTab() {
  const [inviteCode, setInviteCode] = useState("")
  const [firstRatio, setFirstRatio] = useState(0)
  const [secondRatio, setSecondRatio] = useState(0)
  const [withdrawAmount, setWithdrawAmount] = useState(0)
  const [remainAmount, setRemainAmount] = useState(0)

  const getLevel = useCallback(async () => {
    try {
      const res = await agentApi.getPartnerLevel()

      if (res) {
        setInviteCode(res.invite_code)
        setFirstRatio(res.first_ratio)
        setSecondRatio(res.second_ratio)
      }
    } catch (err) {
      console.error(err)
    }
  }, [])

  const getCommissions = useCallback(async () => {
    try {
      const res = await agentApi.getCommissions()

      if (res.code === 0 && res.data) {
        setWithdrawAmount(res.data.withdraw_amount)
        setRemainAmount(res.data.remain_amount)
      }
    } catch (err) {
      console.error(err)
    }
  }, [])

  useEffect(() => {
    getLevel()
    getCommissions()
  }, [getLevel, getCommissions])

  return (
    <Card className="border-border/60 rounded-xl">
      <CardHeader>
        <CardTitle>查看代理信息</CardTitle>
        <CardDescription>展示当前代理分成与提现数据。</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="bg-muted/20 rounded-xl border border-border/50 p-4 shadow-sm transition-colors hover:bg-muted/40">
            <p className="text-muted-foreground text-xs font-medium">销售分成比例</p>
            <div className="mt-1.5 flex items-baseline gap-1">
              <span className="text-xl font-semibold tracking-tight">{firstRatio * 100}</span>
              <span className="text-muted-foreground text-xs font-medium">%</span>
            </div>
          </div>
          <div className="bg-muted/20 rounded-xl border border-border/50 p-4 shadow-sm transition-colors hover:bg-muted/40">
            <p className="text-muted-foreground text-xs font-medium">下级分成比例</p>
            <div className="mt-1.5 flex items-baseline gap-1">
              <span className="text-xl font-semibold tracking-tight">{secondRatio * 100}</span>
              <span className="text-muted-foreground text-xs font-medium">%</span>
            </div>
          </div>
          <div className="bg-muted/20 rounded-xl border border-border/50 p-4 shadow-sm transition-colors hover:bg-muted/40">
            <p className="text-muted-foreground text-xs font-medium">已提现</p>
            <div className="mt-1.5 flex items-baseline gap-1">
              <span className="text-xl font-semibold tracking-tight">{withdrawAmount}</span>
              <span className="text-muted-foreground text-xs font-medium">USDT</span>
            </div>
          </div>
          <div className="bg-muted/20 rounded-xl border border-border/50 p-4 shadow-sm transition-colors hover:bg-muted/40">
            <p className="text-muted-foreground text-xs font-medium">可提现</p>
            <div className="mt-1.5 flex items-baseline gap-1">
              <span className="text-xl font-semibold tracking-tight">{remainAmount}</span>
              <span className="text-muted-foreground text-xs font-medium">USDT</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-2">
          <Label htmlFor="invite-code" className="text-sm">邀请码</Label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              id="invite-code"
              placeholder="输入邀请码"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              className="max-w-sm bg-background"
              readOnly
            />
            <Button className="w-full sm:w-auto" disabled>保存修改</Button>
          </div>
        </div>

        <div className="bg-muted/30 rounded-lg border border-dashed px-4 py-3">
          <p className="text-muted-foreground text-xs leading-relaxed">
            邀请码用于伙伴推广展示，可按需修改并保存；其余代理数据系统将自动更新，当前为只读展示。
          </p>
        </div>
      </CardContent>
    </Card>
  )
}