"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const withdrawRecords = [
  { amount: "123456", time: "2023-01-01", status: "success" },
  { amount: "123456", time: "2023-01-01", status: "pending" },
  { amount: "123456", time: "2023-01-01", status: "success" },
]

export function WithdrawTab() {
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
              {withdrawRecords.map((record, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium">{record.amount}</TableCell>
                  <TableCell className="text-muted-foreground">{record.time}</TableCell>
                  <TableCell>
                    <span 
                      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                        record.status === "success" 
                          ? "bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/20" 
                          : "bg-red-50 text-red-700 ring-red-600/10 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/20"
                      }`}
                    >
                      {record.status === "success" ? "成功" : "审核中"}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}