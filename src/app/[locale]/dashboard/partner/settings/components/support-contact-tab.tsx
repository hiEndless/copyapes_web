"use client"

import { useEffect, useState, useCallback } from "react"

import { agentApi } from "@/api/agent"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function SupportContactTab() {
  const [wx, setWx] = useState("")
  const [telegram, setTelegram] = useState("")
  const [qq, setQq] = useState("")
  
  const getPartnerSet = useCallback(async () => {
    try {
      const res = await agentApi.getPartnerSet()

      if (res.code === 0 && res.data) {
        setWx(res.data.wx)
        setTelegram(res.data.telegram)
        setQq(res.data.qq)
      }
    } catch (err) {
      console.error(err)
    }
  }, [])

  const updatePartnerSet = async () => {
    try {
      await agentApi.updatePartnerSet({ wx, telegram, qq })
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    getPartnerSet()
  }, [getPartnerSet])

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
              value={qq}
              onChange={(e) => setQq(e.target.value)}
              className="bg-background"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="support-wechat" className="text-sm font-medium">微信号</Label>
            <Input
              id="support-wechat"
              placeholder="输入微信号"
              value={wx}
              onChange={(e) => setWx(e.target.value)}
              className="bg-background"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="support-telegram" className="text-sm font-medium">Telegram</Label>
            <Input
              id="support-telegram"
              placeholder="输入 Telegram 用户名"
              value={telegram}
              onChange={(e) => setTelegram(e.target.value)}
              className="bg-background max-w-sm"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button className="w-full sm:w-auto" onClick={updatePartnerSet}>保存联系方式</Button>
        </div>
      </CardContent>
    </Card>
  )
}
