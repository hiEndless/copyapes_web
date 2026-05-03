"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function InviteCodeTab() {
  return (
    <Card className="border-border/60 rounded-xl">
      <CardHeader>
        <CardTitle>查看代理信息</CardTitle>
        <CardDescription>展示当前代理分成与提现数据。</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="bg-muted/20 rounded-xl border border-border/50 p-4 shadow-sm transition-colors hover:bg-muted/40">
            <p className="text-muted-foreground text-xs font-medium">销售分成比例</p>
            <div className="mt-1.5 flex items-baseline gap-1">
              <span className="text-xl font-semibold tracking-tight">35</span>
              <span className="text-muted-foreground text-xs font-medium">%</span>
            </div>
          </div>
          <div className="bg-muted/20 rounded-xl border border-border/50 p-4 shadow-sm transition-colors hover:bg-muted/40">
            <p className="text-muted-foreground text-xs font-medium">下级分成比例</p>
            <div className="mt-1.5 flex items-baseline gap-1">
              <span className="text-xl font-semibold tracking-tight">12</span>
              <span className="text-muted-foreground text-xs font-medium">%</span>
            </div>
          </div>
          <div className="bg-muted/20 rounded-xl border border-border/50 p-4 shadow-sm transition-colors hover:bg-muted/40">
            <p className="text-muted-foreground text-xs font-medium">已提现</p>
            <div className="mt-1.5 flex items-baseline gap-1">
              <span className="text-xl font-semibold tracking-tight">12,680.00</span>
              <span className="text-muted-foreground text-xs font-medium">USDT</span>
            </div>
          </div>
          <div className="bg-muted/20 rounded-xl border border-border/50 p-4 shadow-sm transition-colors hover:bg-muted/40">
            <p className="text-muted-foreground text-xs font-medium">可提现</p>
            <div className="mt-1.5 flex items-baseline gap-1">
              <span className="text-xl font-semibold tracking-tight">3,240.50</span>
              <span className="text-muted-foreground text-xs font-medium">USDT</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-2">
          <Label htmlFor="invite-code" className="text-sm">邀请码</Label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              id="invite-code"
              placeholder="输入邀请码"
              defaultValue="COPYAPES888"
              className="max-w-sm bg-background"
            />
            <Button className="w-full sm:w-auto">保存修改</Button>
          </div>
        </div>

        <div className="bg-muted/30 rounded-lg border border-dashed px-4 py-3">
          <p className="text-muted-foreground text-xs leading-relaxed">
            邀请码用于伙伴推广展示，可按需修改并保存；其余代理数据系统将自动更新，当前为只读展示。
          </p>
        </div>
      </CardContent>
    </Card>
  )
}