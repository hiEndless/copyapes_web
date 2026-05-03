"use client"

import { useEffect, useState, useCallback } from "react"

import { agentApi } from "@/api/agent"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function IncomeTab() {
  const [buyOrderList, setBuyOrderList] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const limit = 10

  const getRevenue = useCallback(async (currentPage: number) => {
    try {
      const offset = (currentPage - 1) * limit
      const res = await agentApi.getRevenue({ limit, offset })

      if (res.code === 0 && res.data) {
        const list = Array.isArray(res.data) ? res.data : res.data.results || []

        setBuyOrderList(list)
      }
    } catch (err) {
      console.error(err)
    }
  }, [])

  useEffect(() => {
    getRevenue(page)
  }, [getRevenue, page])

  return (
    <Card className="border-border/60 rounded-xl">
      <CardHeader>
        <CardTitle>收益流水</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="font-semibold text-primary">订单ID</TableHead>
                <TableHead className="font-semibold text-primary">用户ID</TableHead>
                <TableHead className="font-semibold text-primary">销售定价</TableHead>
                <TableHead className="font-semibold text-primary">订单实付</TableHead>
                <TableHead className="font-semibold text-primary">支付手续费</TableHead>
                <TableHead className="font-semibold text-primary">收益分成</TableHead>
                <TableHead className="font-semibold text-primary">购买时间</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {buyOrderList.map((record: any, idx: number) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium text-muted-foreground">{record.order_id}</TableCell>
                  <TableCell>{record.user_id}</TableCell>
                  <TableCell>{record.price}</TableCell>
                  <TableCell>{record.order_price}</TableCell>
                  <TableCell>{record.rate || "2%"}</TableCell>
                  <TableCell>{record.amount}</TableCell>
                  <TableCell className="text-muted-foreground">{record.time?.replace('T', ' ').split('.')[0]}</TableCell>
                </TableRow>
              ))}
              {buyOrderList.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-6">暂无数据</TableCell>
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
              disabled={buyOrderList.length < limit}
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
