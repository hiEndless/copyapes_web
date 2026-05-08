"use client"

import { useMemo, useState } from "react"

import { agentApi, type AdminNoticeAudienceType, type AdminNoticeBroadcastPayload } from "@/api/agent"
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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

type NoticeResultItem = {
  channel: string
  success: boolean
  error_code?: string | null
  error_message?: string | null
}

type NoticeUserResult = {
  user_id: number
  results: NoticeResultItem[]
}

type NoticeSendData = {
  audience_type: string
  target_user_count: number
  sent_count: number
  failed_count: number
  details: NoticeUserResult[]
}

const audienceOptions: { value: AdminNoticeAudienceType; label: string }[] = [
  { value: "all_users", label: "全部用户" },
  { value: "vip_users", label: "VIP/工作室VIP用户" },
  { value: "task_users", label: "有进行中任务的用户" },
  { value: "platform_role_users", label: "按平台+交易员类型定向" },
]

function getAudienceLabel(value: string) {
  const found = audienceOptions.find((item) => item.value === value)
  return found?.label || value
}

function getChannelLabel(channel: string) {
  if (channel === "wx_template") return "微信公众号"
  if (channel === "qq_mail") return "QQ邮箱"
  if (channel === "ding_bot") return "钉钉机器人"
  return channel
}

export function SystemNoticeTab() {
  const [sceneCode, setSceneCode] = useState("SYSTEM_NOTICE")
  const [audienceType, setAudienceType] = useState<AdminNoticeAudienceType>("all_users")
  const [traderPlatform, setTraderPlatform] = useState("1")
  const [roleType, setRoleType] = useState("2")
  const [wxText, setWxText] = useState("")
  const [qqText, setQqText] = useState("")
  const [dingText, setDingText] = useState("")
  const [previewLoading, setPreviewLoading] = useState(false)
  const [sendLoading, setSendLoading] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [preview, setPreview] = useState<{ count: number; ids: number[]; audience: string } | null>(null)
  const [sendData, setSendData] = useState<NoticeSendData | null>(null)

  const needsPlatformRole = audienceType === "platform_role_users"

  const payload: AdminNoticeBroadcastPayload = useMemo(() => {
    const body: AdminNoticeBroadcastPayload = {
      scene_code: (sceneCode || "SYSTEM_NOTICE").trim() || "SYSTEM_NOTICE",
      audience: {
        audience_type: audienceType,
      },
    }
    if (needsPlatformRole) {
      body.audience.trader_platform = Number(traderPlatform || "0")
      body.audience.role_type = Number(roleType || "0")
    }
    if (wxText.trim()) body.wx = { text: wxText }
    if (qqText.trim()) body.qq_mail = { text: qqText }
    if (dingText.trim()) body.ding_bot = { text: dingText }
    return body
  }, [audienceType, dingText, needsPlatformRole, qqText, roleType, sceneCode, traderPlatform, wxText])

  const handlePreview = async () => {
    try {
      setPreviewLoading(true)
      const res = await agentApi.adminNoticePreview(payload)
      if (res.code === 0 && res.data) {
        setPreview({
          count: Number(res.data.estimated_user_count || 0),
          ids: Array.isArray(res.data.sample_user_ids) ? res.data.sample_user_ids : [],
          audience: res.data.audience_type,
        })
      }
    } finally {
      setPreviewLoading(false)
    }
  }

  const loadPreview = async () => {
    const res = await agentApi.adminNoticePreview(payload)
    if (res.code === 0 && res.data) {
      const next = {
        count: Number(res.data.estimated_user_count || 0),
        ids: Array.isArray(res.data.sample_user_ids) ? res.data.sample_user_ids : [],
        audience: res.data.audience_type,
      }
      setPreview(next)
      return next
    }
    return null
  }

  const validateBeforeSubmit = () => {
    if (!wxText.trim() && !qqText.trim() && !dingText.trim()) {
      toast.error("至少填写一个渠道文案")
      return false
    }
    if (wxText.trim() && wxText.trim().length > 20) {
      toast.error("微信公众号文案不能超过20字")
      return false
    }
    if (qqText.trim() && qqText.trim().length > 2000) {
      toast.error("QQ邮箱文案不能超过2000字")
      return false
    }
    if (dingText.trim() && dingText.trim().length > 2000) {
      toast.error("钉钉文案不能超过2000字")
      return false
    }
    if (needsPlatformRole) {
      const platform = Number(traderPlatform || "0")
      const role = Number(roleType || "0")
      if (!Number.isFinite(platform) || platform <= 0) {
        toast.error("平台ID必须为正整数")
        return false
      }
      if (!Number.isFinite(role) || role <= 0) {
        toast.error("交易员类型必须为正整数")
        return false
      }
    }
    return true
  }

  const handleOpenSendConfirm = async () => {
    if (!validateBeforeSubmit()) {
      return
    }
    try {
      setPreviewLoading(true)
      const latestPreview = await loadPreview()
      if (latestPreview) {
        setConfirmOpen(true)
      }
    } finally {
      setPreviewLoading(false)
    }
  }

  const handleConfirmSend = async () => {
    try {
      setSendLoading(true)
      const res = await agentApi.adminNoticeSend(payload)
      if (res.code === 0 && res.data) {
        const data = res.data as NoticeSendData
        setSendData(data)
        setConfirmOpen(false)
        toast.success(`发送完成：成功 ${data.sent_count} / 失败 ${data.failed_count}`)
      }
    } finally {
      setSendLoading(false)
    }
  }

  const channelDrafts = useMemo(() => {
    const rows: { channel: string; text: string }[] = []
    if (wxText.trim()) rows.push({ channel: "微信公众号", text: wxText.trim() })
    if (qqText.trim()) rows.push({ channel: "QQ邮箱", text: qqText.trim() })
    if (dingText.trim()) rows.push({ channel: "钉钉机器人", text: dingText.trim() })
    return rows
  }, [dingText, qqText, wxText])

  const channelSummaryText = useMemo(() => {
    if (channelDrafts.length === 0) return "-"
    return channelDrafts.map((item) => item.channel).join("、")
  }, [channelDrafts])

  const estimatedSendAttempts = useMemo(() => {
    const users = preview?.count ?? 0
    const channels = channelDrafts.length
    if (users <= 0 || channels <= 0) return 0
    return users * channels
  }, [channelDrafts.length, preview?.count])

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
      <Card className="border-border/60 rounded-xl lg:col-span-2">
        <CardHeader>
          <CardTitle>通知配置</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>场景编码</Label>
            <Input value={sceneCode} onChange={(e) => setSceneCode(e.target.value)} placeholder="SYSTEM_NOTICE" />
          </div>

          <div className="space-y-2">
            <Label>受众类型</Label>
            <Select value={audienceType} onValueChange={(v) => setAudienceType(v as AdminNoticeAudienceType)}>
              <SelectTrigger>
                <SelectValue placeholder="选择受众类型" />
              </SelectTrigger>
              <SelectContent>
                {audienceOptions.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {needsPlatformRole && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>平台ID</Label>
                <Input value={traderPlatform} onChange={(e) => setTraderPlatform(e.target.value)} placeholder="1" />
              </div>
              <div className="space-y-2">
                <Label>交易员类型</Label>
                <Input value={roleType} onChange={(e) => setRoleType(e.target.value)} placeholder="2" />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>微信公众号文案（最多20字）</Label>
            <Textarea value={wxText} onChange={(e) => setWxText(e.target.value)} placeholder="请输入微信通知文案" />
            <div className="text-muted-foreground text-xs text-right">{wxText.trim().length}/20</div>
          </div>

          <div className="space-y-2">
            <Label>QQ邮箱文案（最多2000字）</Label>
            <Textarea value={qqText} onChange={(e) => setQqText(e.target.value)} placeholder="请输入QQ邮箱通知文案" />
            <div className="text-muted-foreground text-xs text-right">{qqText.trim().length}/2000</div>
          </div>

          <div className="space-y-2">
            <Label>钉钉文案（最多2000字）</Label>
            <Textarea value={dingText} onChange={(e) => setDingText(e.target.value)} placeholder="请输入钉钉通知文案" />
            <div className="text-muted-foreground text-xs text-right">{dingText.trim().length}/2000</div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={async () => {
                if (!validateBeforeSubmit()) return
                await handlePreview()
              }}
              disabled={previewLoading || sendLoading}
            >
              {previewLoading ? "预览中..." : "预览受众"}
            </Button>
            <Button onClick={handleOpenSendConfirm} disabled={sendLoading || previewLoading}>
              {sendLoading ? "发送中..." : "发送通知"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 rounded-xl lg:col-span-3">
        <CardHeader>
          <CardTitle>发送结果</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {preview && (
            <div className="rounded-lg border p-3 text-sm">
              <div className="mb-1 font-medium">受众预览</div>
              <div className="text-muted-foreground">
                类型：{getAudienceLabel(preview.audience)}，预计触达：{preview.count} 人
              </div>
              <div className="text-muted-foreground mt-1">样例用户：{preview.ids.length ? preview.ids.join(", ") : "-"}</div>
            </div>
          )}

          {sendData ? (
            <>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <Badge variant="secondary">类型：{getAudienceLabel(sendData.audience_type)}</Badge>
                <Badge variant="outline">目标：{sendData.target_user_count}</Badge>
                <Badge className="bg-green-600 text-white hover:bg-green-600">成功：{sendData.sent_count}</Badge>
                <Badge className="bg-red-600 text-white hover:bg-red-600">失败：{sendData.failed_count}</Badge>
              </div>

              <div className="rounded-lg border">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="font-semibold text-primary">用户ID</TableHead>
                      <TableHead className="font-semibold text-primary">渠道</TableHead>
                      <TableHead className="font-semibold text-primary">结果</TableHead>
                      <TableHead className="font-semibold text-primary">错误信息</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sendData.details.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="py-6 text-center text-muted-foreground">
                          暂无发送明细
                        </TableCell>
                      </TableRow>
                    )}
                    {sendData.details.map((userResult) =>
                      userResult.results.map((item, idx) => (
                        <TableRow key={`${userResult.user_id}-${item.channel}-${idx}`}>
                          <TableCell>{userResult.user_id}</TableCell>
                          <TableCell>{getChannelLabel(item.channel)}</TableCell>
                          <TableCell>
                            <Badge className={item.success ? "bg-green-600 text-white hover:bg-green-600" : "bg-red-600 text-white hover:bg-red-600"}>
                              {item.success ? "成功" : "失败"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {item.error_message || item.error_code || "-"}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </>
          ) : (
            <div className="text-muted-foreground text-sm">请先点击“预览受众”或“发送通知”查看结果。</div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认发送系统通知</AlertDialogTitle>
            <AlertDialogDescription>
              请确认受众范围与各渠道文案，确认后将立即发送，不可撤回。
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-2 text-sm">
            <div className="text-muted-foreground">
              受众类型：{getAudienceLabel(preview?.audience || audienceType)}，预计触达：{preview?.count ?? 0} 人
            </div>
            <div className="text-muted-foreground">
              样例用户：{preview?.ids?.length ? preview.ids.join(", ") : "-"}
            </div>
            <div className="text-muted-foreground">触达渠道：{channelSummaryText}</div>
            <div className="text-muted-foreground">预计发送尝试：{estimatedSendAttempts}</div>
            <div className="rounded-md border p-2">
              {channelDrafts.map((item) => (
                <div key={item.channel} className="mb-2 last:mb-0">
                  <div className="font-medium">{item.channel}</div>
                  <div className="text-muted-foreground break-all">
                    {item.text.length > 120 ? `${item.text.slice(0, 120)}...` : item.text}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={sendLoading}>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSend} disabled={sendLoading}>
              {sendLoading ? "发送中..." : "确认发送"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
