"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const incomeRecords = [
  { orderId: "20260502194654306901000017364883", userId: "1736", price: "40", paid: "40", fee: "2%", revenue: "15.68", time: "2026-05-02 19:46:54" },
  { orderId: "20260502194654306901000017364883", userId: "1736", price: "40", paid: "40", fee: "2%", revenue: "7.84", time: "2026-05-02 19:46:54" },
  { orderId: "20260502194230083100000018206549", userId: "1820", price: "40", paid: "40", fee: "2%", revenue: "15.68", time: "2026-05-02 19:42:30" },
  { orderId: "20260502194230083100000018206549", userId: "1820", price: "40", paid: "40", fee: "2%", revenue: "7.84", time: "2026-05-02 19:42:30" },
  { orderId: "20260501212219461981000017898863", userId: "1789", price: "40", paid: "40", fee: "2%", revenue: "15.68", time: "2026-05-01 21:22:19" },
  { orderId: "20260501212219461981000017898863", userId: "1789", price: "40", paid: "40", fee: "2%", revenue: "7.84", time: "2026-05-01 21:22:19" },
]

export function IncomeTab() {
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
              {incomeRecords.map((record, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium text-muted-foreground">{record.orderId}</TableCell>
                  <TableCell>{record.userId}</TableCell>
                  <TableCell>{record.price}</TableCell>
                  <TableCell>{record.paid}</TableCell>
                  <TableCell>{record.fee}</TableCell>
                  <TableCell>{record.revenue}</TableCell>
                  <TableCell className="text-muted-foreground">{record.time}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}