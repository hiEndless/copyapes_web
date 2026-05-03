"use client"

import { useEffect, useState, useCallback } from "react"

import { agentApi } from "@/api/agent"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function WithdrawTab() {
  const [withdrawList, setWithdrawList] = useState<any[]>([])

  const getCommissions = useCallback(async () => {
    try {
      const res = await agentApi.getCommissions()

      if (res.code === 0 && res.data) {
        setWithdrawList(res.data.withdraw_list || [])
      }
    } catch (err) {
      console.error(err)
    }
  }, [])

  useEffect(() => {
    getCommissions()
  }, [getCommissions])

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
                <TableHead className="font-semibold text-primary">提现金额</TableHead>
                <TableHead className="font-semibold text-primary">提现时间</TableHead>
                <TableHead className="font-semibold text-primary">状态</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {withdrawList.map((record: any, idx: number) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium">{record.amount}</TableCell>
                  <TableCell className="text-muted-foreground">{record.create_datetime?.replace('T', ' ').split('.')[0]}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                        record.status === 1
                          ? "bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/20"
                          : "bg-red-50 text-red-700 ring-red-600/10 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/20"
                      }`}
                    >
                      {record.status === 1 ? "成功" : "审核中"}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
              {withdrawList.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-6">暂无数据</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
