"use client"

import { useEffect, useState, useCallback } from "react"

import { agentApi } from "@/api/agent"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function InviteCodeTab() {
  const [inviteCode, setInviteCode] = useState("")
  const [savedInviteCode, setSavedInviteCode] = useState("")
  const [firstRatio, setFirstRatio] = useState(0)
  const [secondRatio, setSecondRatio] = useState(0)
  const [withdrawAmount, setWithdrawAmount] = useState(0)
  const [remainAmount, setRemainAmount] = useState(0)
  const [isSaving, setIsSaving] = useState(false)

  const getLevel = useCallback(async () => {
    try {
      const res = await agentApi.getPartnerLevel()

      if (res) {
        setInviteCode(res.invite_code)
        setSavedInviteCode(res.invite_code)
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

  const trimmedInviteCode = inviteCode.trim()
  const hasChanged = trimmedInviteCode !== savedInviteCode
  const inviteCodePattern = /^[A-Za-z0-9_-]{4,32}$/

  const inviteCodeError =
    trimmedInviteCode.length === 0
      ? "请输入邀请码"
      : inviteCodePattern.test(trimmedInviteCode)
        ? ""
        : "邀请码需为 4-32 位，仅支持字母、数字、下划线和短横线"

  const handleSaveInviteCode = async () => {
    if (inviteCodeError || !hasChanged || isSaving) {
      return
    }

    setIsSaving(true)

    try {
      const res = await agentApi.updateInviteCode({ invite_code: trimmedInviteCode })

      if (res.code === 0 && res.data) {
        setInviteCode(res.data.invite_code)
        setSavedInviteCode(res.data.invite_code)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card className="border-border/60 rounded-xl">
      <CardHeader>
        <CardTitle>查看代理信息</CardTitle>
        <CardDescription>展示当前代理分成、提现数据，并支持自定义邀请码。</CardDescription>
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

          <div className="bg-muted/30 rounded-lg border border-dashed px-4 py-3">
            <p className="text-muted-foreground text-xs leading-relaxed">
              邀请码唯一，允许保持为当前值；修改成功后将立即更新当前展示值，其余代理数据系统会自动刷新。
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              id="invite-code"
              placeholder="输入邀请码"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              className="max-w-sm bg-background"
            />
            <Button
              className="w-full sm:w-auto"
              onClick={handleSaveInviteCode}
              disabled={isSaving || !hasChanged || !!inviteCodeError}
            >
              {isSaving ? "保存中..." : "保存修改"}
            </Button>
          </div>
          <p className="text-muted-foreground text-xs">
            {inviteCodeError || "邀请码长度为 4-32 位，仅支持字母、数字、下划线和短横线。"}
          </p>
        </div>

      </CardContent>
    </Card>
  )
}
