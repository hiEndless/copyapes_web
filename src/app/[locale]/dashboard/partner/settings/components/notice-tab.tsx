"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export function NoticeTab() {
  return (
    <Card className="border-border/60 rounded-xl">
      <CardHeader>
        <CardTitle>编辑公告内容</CardTitle>
        <CardDescription>公告内容将展示给你邀请的用户。</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="notice-content">公告内容</Label>
          <Textarea
            id="notice-content"
            placeholder="输入公告正文"
            defaultValue={
              "1. 五月新注册用户可参与返佣活动。\n2. 伙伴后台数据每日 10 分钟同步一次。\n3. 若推广链接异常，请联系专属客服处理。"
            }
            className="min-h-48"
          />
        </div>

        <div className="flex justify-end">
          <Button>保存公告设置</Button>
        </div>
      </CardContent>
    </Card>
  )
}