"use client"

import { useEffect, useState, useCallback } from "react"

import { agentApi } from "@/api/agent"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function PromotedUsersTab() {
  const [inviteList, setInviteList] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const limit = 10

  const getInviteInfo = useCallback(async (currentPage: number) => {
    try {
      const offset = (currentPage - 1) * limit
      const res = await agentApi.getInviteInfo({ limit, offset })

      if (res.code === 0 && res.data) {
        const list = Array.isArray(res.data) ? res.data : res.data.results || []

        setInviteList(list)
      }
    } catch (err) {
      console.error(err)
    }
  }, [])

  useEffect(() => {
    getInviteInfo(page)
  }, [getInviteInfo, page])

  return (
    <Card className="border-border/60 rounded-xl">
      <CardHeader>
        <CardTitle>推广用户</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="font-semibold text-primary">用户名</TableHead>
                <TableHead className="font-semibold text-primary">邀请类型</TableHead>
                <TableHead className="font-semibold text-primary">邀请时间</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inviteList.map((user: any, idx: number) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                        user.invite_type === "一级邀请"
                          ? "bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/20"
                          : "bg-blue-50 text-blue-700 ring-blue-700/10 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/20"
                      }`}
                    >
                      {user.invite_type === "一级邀请" || user.invite_type === "二级邀请" ? user.invite_type : user.invite_type || "未知层级"}
                    </span>
                  </TableCell>
                  <TableCell>{user.invite_time?.replace('T', ' ').split('.')[0]}</TableCell>
                </TableRow>
              ))}
              {inviteList.length === 0 && (
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
              disabled={inviteList.length < limit}
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
