"use client"

import { useEffect, useState, useCallback } from "react"

import { agentApi } from "@/api/agent"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export function NoticeTab() {
  const [notice, setNotice] = useState("")

  const getPartnerSet = useCallback(async () => {
    try {
      const res = await agentApi.getPartnerSet()

      if (res.code === 0 && res.data) {
        setNotice(res.data.notice || "")
      }
    } catch (err) {
      console.error(err)
    }
  }, [])

  const updatePartnerSet = async () => {
    try {
      await agentApi.updatePartnerSet({ notice })
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
        <CardTitle>编辑公告内容</CardTitle>
        <CardDescription>公告内容将展示给你邀请的用户。</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="notice-content">公告内容</Label>
          <Textarea
            id="notice-content"
            placeholder="输入公告正文"
            value={notice}
            onChange={(e) => setNotice(e.target.value)}
            className="min-h-48"
          />
        </div>

        <div className="flex justify-end">
          <Button onClick={updatePartnerSet}>保存公告设置</Button>
        </div>
      </CardContent>
    </Card>
  )
}