"use client"

import { useMemo, useState } from "react"

import { agentApi, type AdminUserManagementAuditItem, type AdminUserManagementProfileResponse } from "@/api/agent"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

function tierText(tier: string) {
  if (tier === "studio_vip") return "工作室VIP"
  if (tier === "vip") return "VIP"
  return "免费用户"
}

function formatAuditJson(value: unknown): string {
  let parsed = value
  if (typeof parsed === "string") {
    try {
      parsed = JSON.parse(parsed)
    } catch {
      return String(parsed)
    }
  }
  if (parsed && typeof parsed === "object") {
    return JSON.stringify(parsed, null, 2)
  }
  return String(parsed ?? "")
}

export function UserManagementTab() {
  const [username, setUsername] = useState("")
  const [loadingProfile, setLoadingProfile] = useState(false)
  const [loadingAudit, setLoadingAudit] = useState(false)
  const [updatingIdentity, setUpdatingIdentity] = useState(false)
  const [updatingPermissions, setUpdatingPermissions] = useState(false)
  const [profile, setProfile] = useState<AdminUserManagementProfileResponse | null>(null)
  const [auditItems, setAuditItems] = useState<AdminUserManagementAuditItem[]>([])
  const [auditTotal, setAuditTotal] = useState(0)
  const [auditPage, setAuditPage] = useState(1)
  const auditLimit = 10

  const [identityReason, setIdentityReason] = useState("")
  const [vipDaysDelta, setVipDaysDelta] = useState("0")
  const [studioVipDaysDelta, setStudioVipDaysDelta] = useState("0")
  const [isPartner, setIsPartner] = useState<"unchanged" | "true" | "false">("unchanged")
  const [partnerLevel, setPartnerLevel] = useState("")

  const [permReason, setPermReason] = useState("")
  const [targetTier, setTargetTier] = useState<"auto" | "free" | "vip" | "studio_vip">("auto")
  const [assetLimit, setAssetLimit] = useState("")
  const [apiLimit, setApiLimit] = useState("")
  const [taskLimit, setTaskLimit] = useState("")
  const [batchReason, setBatchReason] = useState("")
  const [batchUserIdsText, setBatchUserIdsText] = useState("")
  const [batchEntitlementType, setBatchEntitlementType] = useState<"vip" | "studio_vip">("vip")
  const [batchDaysDelta, setBatchDaysDelta] = useState("0")
  const [batchPreviewLoading, setBatchPreviewLoading] = useState(false)
  const [batchApplyLoading, setBatchApplyLoading] = useState(false)
  const [batchOtpLoading, setBatchOtpLoading] = useState(false)
  const [batchOtpToken, setBatchOtpToken] = useState("")
  const [batchOtpCode, setBatchOtpCode] = useState("")
  const [batchPreviewData, setBatchPreviewData] = useState<any | null>(null)

  const canNextAuditPage = useMemo(() => auditPage * auditLimit < auditTotal, [auditPage, auditTotal])

  const loadProfile = async (queryName?: string) => {
    const q = (queryName ?? username).trim()
    if (!q) return
    setLoadingProfile(true)
    try {
      const res = await agentApi.adminUserManagementProfile({ username: q })
      if (res.code === 0 && res.data) {
        const data = res.data
        setProfile(data)
        setAssetLimit(String(data.permissions.asset_limit_usdt))
        setApiLimit(String(data.permissions.api_slot_limit))
        setTaskLimit(String(data.permissions.task_slot_limit))
        setTargetTier("auto")
      }
    } finally {
      setLoadingProfile(false)
    }
  }

  const loadAudit = async (page: number, queryName?: string) => {
    const q = (queryName ?? username).trim()
    if (!q) return
    setLoadingAudit(true)
    try {
      const offset = (page - 1) * auditLimit
      const res = await agentApi.adminUserManagementAudit({ username: q, limit: auditLimit, offset })
      if (res.code === 0 && res.data) {
        setAuditItems(Array.isArray(res.data.items) ? res.data.items : [])
        setAuditTotal(Number(res.data.total || 0))
      }
    } finally {
      setLoadingAudit(false)
    }
  }

  const handleSearch = async () => {
    const q = username.trim()
    if (!q) return
    setAuditPage(1)
    await Promise.all([loadProfile(q), loadAudit(1, q)])
  }

  const handleIdentityUpdate = async () => {
    if (!profile || !identityReason.trim()) return
    setUpdatingIdentity(true)
    try {
      const payload: any = {
        username: profile.username,
        reason: identityReason.trim(),
        vip_days_delta: Number(vipDaysDelta || "0"),
        studio_vip_days_delta: Number(studioVipDaysDelta || "0"),
      }
      if (isPartner !== "unchanged") {
        payload.is_partner = isPartner === "true"
      }
      if (partnerLevel.trim() !== "") {
        payload.partner_level = Number(partnerLevel)
      }
      const res = await agentApi.adminUserManagementUpdateIdentity(payload)
      if (res.code === 0) {
        await Promise.all([loadProfile(profile.username), loadAudit(1, profile.username)])
        setAuditPage(1)
      }
    } finally {
      setUpdatingIdentity(false)
    }
  }

  const handlePermissionsUpdate = async () => {
    if (!profile || !permReason.trim()) return
    setUpdatingPermissions(true)
    try {
      const payload: any = {
        username: profile.username,
        reason: permReason.trim(),
        asset_limit_usdt: Number(assetLimit || "0"),
        api_slot_limit: Number(apiLimit || "0"),
        task_slot_limit: Number(taskLimit || "0"),
      }
      if (targetTier !== "auto") {
        payload.target_tier = targetTier
      }
      const res = await agentApi.adminUserManagementUpdatePermissions(payload)
      if (res.code === 0) {
        await Promise.all([loadProfile(profile.username), loadAudit(1, profile.username)])
        setAuditPage(1)
      }
    } finally {
      setUpdatingPermissions(false)
    }
  }

  const parseUserIds = (raw: string): number[] => {
    const txt = raw.trim()
    if (!txt) return []
    try {
      const data = JSON.parse(txt)
      if (!Array.isArray(data)) return []
      return data.map((item) => Number(item)).filter((n) => Number.isInteger(n) && n > 0)
    } catch {
      return []
    }
  }

  const buildBatchPayload = () => {
    return {
      reason: batchReason.trim(),
      user_ids: parseUserIds(batchUserIdsText),
      entitlement_type: batchEntitlementType,
      days_delta: Number(batchDaysDelta || "0"),
    }
  }

  const handleBatchRequestOtp = async () => {
    const payload = buildBatchPayload()
    if (!payload.reason || payload.user_ids.length === 0) return
    setBatchOtpLoading(true)
    try {
      const res = await agentApi.adminUserManagementBatchRequestOtp(payload)
      if (res.code === 0 && res.data?.otp_token) {
        setBatchOtpToken(String(res.data.otp_token))
      }
    } finally {
      setBatchOtpLoading(false)
    }
  }

  const handleBatchPreview = async () => {
    const payload = buildBatchPayload()
    if (!payload.reason) return
    setBatchPreviewLoading(true)
    try {
      const res = await agentApi.adminUserManagementBatchPreview(payload)
      if (res.code === 0 && res.data) {
        setBatchPreviewData(res.data)
      }
    } finally {
      setBatchPreviewLoading(false)
    }
  }

  const handleBatchApply = async () => {
    const base = buildBatchPayload()
    if (!base.reason) return
    setBatchApplyLoading(true)
    try {
      const res = await agentApi.adminUserManagementBatchApply({
        ...base,
        otp_token: batchOtpToken.trim(),
        otp_code: batchOtpCode.trim(),
      })
      if (res.code === 0 && res.data) {
        setBatchPreviewData(res.data)
        if (profile) {
          await Promise.all([loadProfile(profile.username), loadAudit(1, profile.username)])
          setAuditPage(1)
        }
      }
    } finally {
      setBatchApplyLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Card className="border-border/60 rounded-xl">
        <CardHeader>
          <CardTitle>用户查询</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input placeholder="输入用户名" value={username} onChange={(e) => setUsername(e.target.value)} />
            <Button onClick={handleSearch} disabled={loadingProfile || loadingAudit}>
              {loadingProfile || loadingAudit ? "查询中..." : "查询"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 rounded-xl">
        <CardHeader>
          <CardTitle>批量变更（预览/执行）</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label>变更原因（必填）</Label>
            <Input value={batchReason} onChange={(e) => setBatchReason(e.target.value)} placeholder="例如：运营批量调额" />
          </div>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <div className="space-y-2">
              <Label>用户ID数组（JSON）</Label>
              <Input
                value={batchUserIdsText}
                onChange={(e) => setBatchUserIdsText(e.target.value)}
                placeholder="[2,3,4]"
              />
            </div>
            <div className="space-y-2">
              <Label>权益类型</Label>
              <Select value={batchEntitlementType} onValueChange={(v) => setBatchEntitlementType(v as "vip" | "studio_vip")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="vip">vip</SelectItem>
                  <SelectItem value="studio_vip">studio_vip</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>天数增量（可正可负）</Label>
            <Input value={batchDaysDelta} onChange={(e) => setBatchDaysDelta(e.target.value)} placeholder="例如 30 或 -7" />
          </div>
          <div className="text-muted-foreground text-xs">
            批量接口按 user_id 列表处理；权益类型只支持 vip 或 studio_vip。
            </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleBatchPreview} disabled={batchPreviewLoading || !batchReason.trim()}>
              {batchPreviewLoading ? "预览中..." : "批量预览"}
            </Button>
            <Button variant="outline" onClick={handleBatchRequestOtp} disabled={batchOtpLoading || !batchReason.trim()}>
              {batchOtpLoading ? "发送中..." : "获取验证码"}
            </Button>
            <Button onClick={handleBatchApply} disabled={batchApplyLoading || !batchReason.trim() || !batchOtpToken.trim() || !batchOtpCode.trim()}>
              {batchApplyLoading ? "执行中..." : "批量执行"}
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <div className="space-y-2">
              <Label>otp_token</Label>
              <Input value={batchOtpToken} onChange={(e) => setBatchOtpToken(e.target.value)} placeholder="先获取验证码后自动回填" />
            </div>
            <div className="space-y-2">
              <Label>验证码</Label>
              <Input value={batchOtpCode} onChange={(e) => setBatchOtpCode(e.target.value)} placeholder="输入收到的6位验证码" />
            </div>
          </div>
          {batchPreviewData && (
            <div className="rounded-md border bg-muted/30 p-3 text-xs">
              <pre className="whitespace-pre-wrap break-all">{JSON.stringify(batchPreviewData, null, 2)}</pre>
            </div>
          )}
        </CardContent>
      </Card>

      {profile && (
        <>
          <Card className="border-border/60 rounded-xl">
            <CardHeader>
              <CardTitle>用户画像</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              <div>用户：{profile.username}（#{profile.user_id}）</div>
              <div>身份：{tierText(profile.identity.membership_tier)}</div>
              <div>VIP剩余天数：{profile.membership.vip_days}</div>
              <div>工作室VIP剩余天数：{profile.membership.studio_vip_days}</div>
              <div>资金上限：{profile.permissions.asset_limit_usdt}</div>
              <div>API 配额：{profile.permissions.api_slot_used}/{profile.permissions.api_slot_limit}</div>
              <div>任务配额：{profile.permissions.task_slot_used}/{profile.permissions.task_slot_limit}</div>
              <div>合伙人等级：{profile.permissions.partner_level}</div>
              <div>邀请人数：{profile.invitation.invited_user_count}</div>
              <div>可提现余额：{profile.commission.withdrawable_amount}</div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card className="border-border/60 rounded-xl">
              <CardHeader>
                <CardTitle>修改身份</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>VIP天数增量</Label>
                    <Input value={vipDaysDelta} onChange={(e) => setVipDaysDelta(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>工作室VIP天数增量</Label>
                    <Input value={studioVipDaysDelta} onChange={(e) => setStudioVipDaysDelta(e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>是否合伙人</Label>
                    <Select value={isPartner} onValueChange={(v) => setIsPartner(v as any)}>
                      <SelectTrigger><SelectValue placeholder="不修改" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unchanged">不修改</SelectItem>
                        <SelectItem value="true">是</SelectItem>
                        <SelectItem value="false">否</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>合伙人等级（可选）</Label>
                    <Input value={partnerLevel} onChange={(e) => setPartnerLevel(e.target.value)} placeholder="0-10" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>修改原因</Label>
                  <Input value={identityReason} onChange={(e) => setIdentityReason(e.target.value)} placeholder="必填" />
                </div>
                <Button onClick={handleIdentityUpdate} disabled={updatingIdentity || !identityReason.trim()}>
                  {updatingIdentity ? "提交中..." : "提交身份修改"}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border/60 rounded-xl">
              <CardHeader>
                <CardTitle>修改权限</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label>目标身份基线</Label>
                  <Select value={targetTier} onValueChange={(v) => setTargetTier(v as any)}>
                    <SelectTrigger><SelectValue placeholder="按当前身份" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">按当前身份</SelectItem>
                      <SelectItem value="free">free</SelectItem>
                      <SelectItem value="vip">vip</SelectItem>
                      <SelectItem value="studio_vip">studio_vip</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label>资金上限</Label>
                    <Input value={assetLimit} onChange={(e) => setAssetLimit(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>API上限</Label>
                    <Input value={apiLimit} onChange={(e) => setApiLimit(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>任务上限</Label>
                    <Input value={taskLimit} onChange={(e) => setTaskLimit(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>修改原因</Label>
                  <Input value={permReason} onChange={(e) => setPermReason(e.target.value)} placeholder="必填" />
                </div>
                <Button onClick={handlePermissionsUpdate} disabled={updatingPermissions || !permReason.trim()}>
                  {updatingPermissions ? "提交中..." : "提交权限修改"}
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border/60 rounded-xl">
            <CardHeader>
              <CardTitle>审计日志</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead>时间</TableHead>
                      <TableHead>动作</TableHead>
                      <TableHead>管理员</TableHead>
                      <TableHead>原因</TableHead>
                      <TableHead>变更前</TableHead>
                      <TableHead>变更后</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.create_datetime?.replace("T", " ").split(".")[0] || "-"}</TableCell>
                        <TableCell>{item.action_type}</TableCell>
                        <TableCell>#{item.admin_user_id}</TableCell>
                        <TableCell>{item.reason}</TableCell>
                        <TableCell className="max-w-[320px]">
                          <pre className="max-h-32 overflow-auto whitespace-pre-wrap break-all text-xs">{formatAuditJson(item.before || {})}</pre>
                        </TableCell>
                        <TableCell className="max-w-[320px]">
                          <pre className="max-h-32 overflow-auto whitespace-pre-wrap break-all text-xs">{formatAuditJson(item.after || {})}</pre>
                        </TableCell>
                      </TableRow>
                    ))}
                    {auditItems.length === 0 && !loadingAudit && (
                      <TableRow>
                        <TableCell colSpan={6} className="py-6 text-center text-muted-foreground">暂无数据</TableCell>
                      </TableRow>
                    )}
                    {loadingAudit && (
                      <TableRow>
                        <TableCell colSpan={6} className="py-6 text-center text-muted-foreground">加载中...</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-4 flex items-center justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={auditPage <= 1 || loadingAudit}
                  onClick={async () => {
                    const next = Math.max(1, auditPage - 1)
                    setAuditPage(next)
                    await loadAudit(next, profile.username)
                  }}
                >
                  上一页
                </Button>
                <div className="flex h-9 items-center px-2 text-sm">第 {auditPage} 页</div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!canNextAuditPage || loadingAudit}
                  onClick={async () => {
                    const next = auditPage + 1
                    setAuditPage(next)
                    await loadAudit(next, profile.username)
                  }}
                >
                  下一页
                </Button>
              </div>
            </CardContent>
          </Card>

        </>
      )}
    </div>
  )
}
