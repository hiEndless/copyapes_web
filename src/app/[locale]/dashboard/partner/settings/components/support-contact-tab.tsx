"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function SupportContactTab() {
  return (
    <Card className="border-border/60 rounded-xl">
      <CardHeader>
        <CardTitle>维护客服触达方式</CardTitle>
        <CardDescription>配置 QQ、微信 和 Telegram，确保你邀请的用户可以快速联系到你。</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="support-qq" className="text-sm font-medium">QQ</Label>
            <Input
              id="support-qq"
              placeholder="输入 QQ 号"
              defaultValue="123456789"
              className="bg-background"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="support-wechat" className="text-sm font-medium">微信号</Label>
            <Input
              id="support-wechat"
              placeholder="输入微信号"
              defaultValue="copyapes_support"
              className="bg-background"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="support-telegram" className="text-sm font-medium">Telegram</Label>
            <Input
              id="support-telegram"
              placeholder="输入 Telegram 用户名"
              defaultValue="@copyapes_support"
              className="bg-background max-w-sm"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button className="w-full sm:w-auto">保存联系方式</Button>
        </div>
      </CardContent>
    </Card>
  )
}