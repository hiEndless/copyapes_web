"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

import { agentApi } from "@/api/agent"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type WithdrawItem = {
  id: number
  request_no: string
  user_id: number
  username: string
  method_snapshot_json: Record<string, any> | string | null
  amount: number
  status: number
  admin_note?: string
  create_datetime?: string
  processed_at?: string
}

function getStatusMeta(status: number) {
  if (status === 2) {
    return {
      text: "已确认",
      cls: "bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/20",
    }
  }
  if (status === 3) {
    return {
      text: "已驳回",
      cls: "bg-red-50 text-red-700 ring-red-600/10 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/20",
    }
  }
  return {
    text: "待审核",
    cls: "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20",
  }
}

function parseMethodChannel(raw: WithdrawItem["method_snapshot_json"]) {
  if (!raw) return "-"
  let payload: Record<string, any> | null = null

  if (typeof raw === "string") {
    try {
      payload = JSON.parse(raw)
    } catch {
      return "-"
    }
  } else if (typeof raw === "object") {
    payload = raw
  }

  if (!payload) return "-"
  return Object.keys(payload)[0] || "-"
}

function parseMethodDetail(raw: WithdrawItem["method_snapshot_json"]) {
  if (!raw) return "-"
  let payload: Record<string, any> | null = null

  if (typeof raw === "string") {
    try {
      payload = JSON.parse(raw)
    } catch {
      return "-"
    }
  } else if (typeof raw === "object") {
    payload = raw
  }

  if (!payload) return "-"
  const channel = Object.keys(payload)[0]
  if (!channel) return "-"
  const conf = payload[channel] || {}

  if (channel === "trc20") {
    return conf.address ? `地址：${conf.address}` : "-"
  }
  if (channel === "okx" || channel === "binance") {
    return conf.uid ? `UID：${conf.uid}` : "-"
  }
  return JSON.stringify(conf)
}

export function WithdrawalReviewTab() {
  const [list, setList] = useState<WithdrawItem[]>([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [processingId, setProcessingId] = useState<number | null>(null)
  const [noteDraft, setNoteDraft] = useState<Record<number, string>>({})
  const limit = 10

  const loadData = useCallback(async (currentPage: number) => {
    setLoading(true)
    try {
      const offset = (currentPage - 1) * limit
      const res = await agentApi.adminGetWithdrawRequests({ limit, offset })
      if (res.code === 0 && res.data) {
        const rows = Array.isArray(res.data) ? res.data : res.data.results || []
        setList(rows)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData(page)
  }, [loadData, page])

  const canNextPage = useMemo(() => list.length >= limit, [list.length])

  const handleApprove = async (id: number) => {
    try {
      setProcessingId(id)
      const res = await agentApi.adminApproveWithdrawRequest(id, {
        admin_note: noteDraft[id] || "",
      })
      if (res.code === 0) {
        await loadData(page)
      }
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (id: number) => {
    try {
      setProcessingId(id)
      const res = await agentApi.adminRejectWithdrawRequest(id, {
        admin_note: noteDraft[id] || "",
      })
      if (res.code === 0) {
        await loadData(page)
      }
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <Card className="border-border/60 rounded-xl">
      <CardHeader>
        <CardTitle>提现审核</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="font-semibold text-primary">申请单号</TableHead>
                <TableHead className="font-semibold text-primary">用户</TableHead>
                <TableHead className="font-semibold text-primary">渠道</TableHead>
                <TableHead className="font-semibold text-primary">渠道信息</TableHead>
                <TableHead className="font-semibold text-primary">金额</TableHead>
                <TableHead className="font-semibold text-primary">申请时间</TableHead>
                <TableHead className="font-semibold text-primary">状态</TableHead>
                <TableHead className="font-semibold text-primary">审核备注</TableHead>
                <TableHead className="font-semibold text-primary">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((row) => {
                const statusMeta = getStatusMeta(Number(row.status || 1))
                const isPending = Number(row.status || 1) === 1
                const isProcessing = processingId === row.id
                const canOperate = isPending && !isProcessing

                return (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium text-muted-foreground">{row.request_no || "-"}</TableCell>
                    <TableCell>{row.username ? `${row.username} (#${row.user_id})` : `#${row.user_id}`}</TableCell>
                    <TableCell>{parseMethodChannel(row.method_snapshot_json)}</TableCell>
                    <TableCell className="max-w-[280px] break-all text-muted-foreground">
                      {parseMethodDetail(row.method_snapshot_json)}
                    </TableCell>
                    <TableCell>{Number(row.amount || 0).toFixed(2)} USDT</TableCell>
                    <TableCell className="text-muted-foreground">
                      {row.create_datetime?.replace("T", " ").split(".")[0] || "-"}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${statusMeta.cls}`}>
                        {statusMeta.text}
                      </span>
                    </TableCell>
                    <TableCell className="min-w-[180px]">
                      <Input
                        placeholder="可选：审核备注"
                        value={noteDraft[row.id] ?? row.admin_note ?? ""}
                        onChange={(e) =>
                          setNoteDraft((prev) => ({
                            ...prev,
                            [row.id]: e.target.value,
                          }))
                        }
                        disabled={!isPending || isProcessing}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" disabled={!canOperate} onClick={() => handleApprove(row.id)}>
                          {isProcessing ? "处理中..." : "通过"}
                        </Button>
                        <Button size="sm" variant="destructive" disabled={!canOperate} onClick={() => handleReject(row.id)}>
                          驳回
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
              {list.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={9} className="py-6 text-center text-muted-foreground">
                    暂无数据
                  </TableCell>
                </TableRow>
              )}
              {loading && (
                <TableRow>
                  <TableCell colSpan={9} className="py-6 text-center text-muted-foreground">
                    加载中...
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 flex justify-end">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              上一页
            </Button>
            <div className="px-2 text-sm font-medium">第 {page} 页</div>
            <Button
              variant="outline"
              size="sm"
              disabled={!canNextPage || loading}
              onClick={() => setPage((p) => p + 1)}
            >
              下一页
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
