"use client"

import { useEffect, useState, useCallback } from "react"

import { agentApi } from "@/api/agent"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function VipCustomersTab() {
  const [myVipsList, setMyVipsList] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const limit = 10

  const getMyVipsInfo = useCallback(async (currentPage: number) => {
    try {
      const offset = (currentPage - 1) * limit
      const res = await agentApi.getMyVips({ limit, offset })

      if (res.code === 0 && res.data) {
        const list = Array.isArray(res.data) ? res.data : res.data.results || []

        setMyVipsList(list)
      }
    } catch (err) {
      console.error(err)
    }
  }, [])

  useEffect(() => {
    getMyVipsInfo(page)
  }, [getMyVipsInfo, page])

  // 辅助函数：计算剩余天数
  // 优先通过 expiresAt (ISO 时间字符串) 计算与当前时间的差值
  // 若无 expiresAt，则回退使用 fallbackDays
  const calcRemainingDays = (expiresAt: string | null | undefined, fallbackDays: number) => {
    if (expiresAt) {
      const expireTime = new Date(expiresAt).getTime()
      const nowTime = Date.now()
      const diff = expireTime - nowTime

      if (diff > 0) {
        return Math.ceil(diff / (1000 * 60 * 60 * 24))
      }

      return 0
    }

    return fallbackDays || 0
  }

  return (
    <Card className="border-border/60 rounded-xl">
      <CardHeader>
        <CardTitle>VIP客户</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="font-semibold text-primary">用户名</TableHead>
                <TableHead className="font-semibold text-primary">剩余VIP时间 (天)</TableHead>
                <TableHead className="font-semibold text-primary">剩余工作室VIP时间 (天)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {myVipsList.map((user: any, idx: number) => {
                const remainingVip = calcRemainingDays(user.vip_expires_at, user.vip_days)
                const remainingStudioVip = calcRemainingDays(user.studio_vip_expires_at, user.studio_vip_days)

                return (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell>
                      {remainingVip > 0 ? (
                        <span className="font-semibold">{remainingVip}</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {remainingStudioVip > 0 ? (
                        <span className="font-semibold">{remainingStudioVip}</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
              {myVipsList.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-6">暂无数据</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-end mt-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              上一页
            </Button>
            <div className="text-sm font-medium px-2">
              第 {page} 页
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={myVipsList.length < limit}
              onClick={() => setPage(p => p + 1)}
            >
              下一页
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
