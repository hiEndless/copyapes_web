"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function RebateTab() {
  return (
    <div className="flex flex-col gap-6">
      <Card className="border-border/60 rounded-xl">
        <CardHeader>
          <CardTitle>设置返佣账号</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Label className="w-12 shrink-0 text-sm font-medium">欧易</Label>
            <Select defaultValue="okx-main">
              <SelectTrigger className="flex-1 bg-background">
                <SelectValue placeholder="选择返佣账号" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="okx-main">okx主返佣</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="default">确认</Button>
          </div>

          <div className="flex items-center gap-4">
            <Label className="w-12 shrink-0 text-sm font-medium">大门</Label>
            <Select defaultValue="gate-main">
              <SelectTrigger className="flex-1 bg-background">
                <SelectValue placeholder="选择返佣账号" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gate-main">gate返佣</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="default">确认</Button>
          </div>

          <div className="flex items-center gap-4">
            <Label className="w-12 shrink-0 text-sm font-medium">Bitget</Label>
            <Select defaultValue="bg-main">
              <SelectTrigger className="flex-1 bg-background">
                <SelectValue placeholder="选择返佣账号" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bg-main">bg返佣</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="default">确认</Button>
          </div>

          <div className="flex items-center gap-4">
            <Label className="w-12 shrink-0 text-sm font-medium">币安</Label>
            <Input
              defaultValue="rootbn"
              className="flex-1 bg-muted/50"
              readOnly
            />
            <Button variant="default">更新</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 rounded-xl">
        <CardHeader>
          <CardTitle>币安返佣用户列表</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-end gap-3">
            <div className="flex-1 space-y-2">
              <Label className="text-sm font-medium">币安下级 uid</Label>
              <Input placeholder="手动添加uid" className="bg-background" />
            </div>
            <Button>添加</Button>
          </div>

          <p className="text-muted-foreground text-xs">* 最近更新时间：2026-02-09 21:54:00</p>

          <div className="rounded-lg border">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="font-semibold text-primary">币安Uid</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">1214933032</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">1214933033</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">1214933034</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-end">
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" className="h-8 w-8" disabled>&lt;</Button>
              <Button variant="outline" size="icon" className="bg-primary/10 text-primary border-primary/20 h-8 w-8">1</Button>
              <Button variant="outline" size="icon" className="h-8 w-8">&gt;</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}