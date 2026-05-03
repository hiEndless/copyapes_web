"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const promotedUsers = [
  { username: "1742872378@qq.com", type: "一级邀请", time: "2026-05-03", level: 1 },
  { username: "174****com", type: "二级邀请", time: "2026-05-03", level: 2 },
  { username: "fjunsix@qq.com", type: "一级邀请", time: "2026-05-02", level: 1 },
  { username: "1962358027@qq.com", type: "一级邀请", time: "2026-05-02", level: 1 },
  { username: "2326382223@qq.com", type: "一级邀请", time: "2026-05-02", level: 1 },
  { username: "fju****com", type: "二级邀请", time: "2026-05-02", level: 2 },
]

export function PromotedUsersTab() {
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
              {promotedUsers.map((user, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell>
                    <span 
                      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                        user.level === 1 
                          ? "bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/20" 
                          : "bg-blue-50 text-blue-700 ring-blue-700/10 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/20"
                      }`}
                    >
                      {user.type}
                    </span>
                  </TableCell>
                  <TableCell>{user.time}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}