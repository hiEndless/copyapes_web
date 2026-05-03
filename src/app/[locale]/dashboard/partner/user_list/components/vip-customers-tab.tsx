"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const vipCustomers = [
  { username: "root", remaining: "9668" },
  { username: "zs9985", remaining: "11" },
  { username: "472300930@qq.com", remaining: "23" },
  { username: "marco608", remaining: "133" },
  { username: "yhq383308@outlook.com", remaining: "198" },
  { username: "18186428173@163.com", remaining: "280" },
]

export function VipCustomersTab() {
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
                <TableHead className="font-semibold text-primary">剩余VIP时间</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vipCustomers.map((user, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell>{user.remaining}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}