"use client"

import { useEffect, useState, useCallback } from "react"

import { agentApi } from "@/api/agent"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

function parseMethodSnapshot(raw: unknown): Record<string, unknown> {
  if (raw == null) return {}

  if (typeof raw === "object" && !Array.isArray(raw)) return raw as Record<string, unknown>

  if (typeof raw !== "string") return {}

  try {
    const parsed = JSON.parse(raw) as unknown

    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>
    }
  } catch {
    /* ignore */
  }

  return {}
}

function formatWithdrawChannel(raw: unknown): string {
  const snap = parseMethodSnapshot(raw)
  const keys = Object.keys(snap)

  if (keys.length === 0) return "-"

  const key = keys[0]
  const detail = snap[key]

  if (detail && typeof detail === "object" && detail !== null) {
    const obj = detail as Record<string, unknown>
    const uid = String(obj.uid ?? "").trim()

    if (uid) return `${key}(${uid})`

    const address = String(obj.address ?? "").trim()

    if (address) return `${key}(${address})`
  }

  return key
}

export function WithdrawDetailTab() {
  const [withdrawList, setWithdrawList] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const limit = 10

  const getWithdrawRequests = useCallback(async (currentPage: number) => {
    try {
      const offset = (currentPage - 1) * limit
      const res = await agentApi.getWithdrawRequests({ limit, offset })

      if (res.code === 0 && res.data) {
        const list = Array.isArray(res.data) ? res.data : res.data.results || []

        setWithdrawList(list)
      }
    } catch (err) {
      console.error(err)
    }
  }, [])

  useEffect(() => {
    getWithdrawRequests(page)
  }, [getWithdrawRequests, page])

  const getStatusMeta = (status: number) => {
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
      text: "审核中",
      cls: "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20",
    }
  }

  return (
    <Card className="border-border/60 rounded-xl">
      <CardHeader>
        <CardTitle>提现明细</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="font-semibold text-primary">申请单号</TableHead>
                <TableHead className="font-semibold text-primary">提现渠道</TableHead>
                <TableHead className="font-semibold text-primary">提现金额</TableHead>
                <TableHead className="font-semibold text-primary">提现时间</TableHead>
                <TableHead className="font-semibold text-primary">状态</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {withdrawList.map((record: any, idx: number) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium text-muted-foreground">{record.request_no || "-"}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatWithdrawChannel(record.method_snapshot_json)}
                  </TableCell>
                  <TableCell className="font-medium">{record.amount}</TableCell>
                  <TableCell className="text-muted-foreground">{record.create_datetime?.replace("T", " ").split(".")[0]}</TableCell>
                  <TableCell>
                    {(() => {
                      const statusMeta = getStatusMeta(Number(record.status || 1))

                      return (
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${statusMeta.cls}`}
                    >
                      {statusMeta.text}
                    </span>
                      )
                    })()}
                  </TableCell>
                </TableRow>
              ))}
              {withdrawList.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-6">暂无数据</TableCell>
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
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              上一页
            </Button>
            <div className="px-2 text-sm font-medium">第 {page} 页</div>
            <Button
              variant="outline"
              size="sm"
              disabled={withdrawList.length < limit}
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
