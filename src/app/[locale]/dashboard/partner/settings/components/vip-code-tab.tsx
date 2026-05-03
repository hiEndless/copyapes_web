"use client"

import { useEffect, useState, useCallback } from "react"

import { agentApi } from "@/api/agent"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function VipCodeTab() {
  const [redeemCodeList, setRedeemCodeList] = useState<any[]>([])
  const [redeemCodeNum, setRedeemCodeNum] = useState<string>("")

  const getRedeemCode = useCallback(async () => {
    try {
      const res = await agentApi.getRedeems()

      if (res.code === 0 && res.data) {
        setRedeemCodeList(res.data)
      }
    } catch (err) {
      console.error(err)
    }
  }, [])

  const createRedeemCode = async () => {
    if (!redeemCodeNum) return

    try {
      const res = await agentApi.createRedeems({ redeem_code_num: Number(redeemCodeNum) })

      if (res.code === 0) {
        setRedeemCodeNum("")
        await getRedeemCode()
      }
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    getRedeemCode()
  }, [getRedeemCode])

  return (
    <div className="flex flex-col gap-6">
      <Card className="border-border/60 rounded-xl">
        <CardHeader>
          <CardTitle>创建7天体验兑换码</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 py-4">
            <Label className="w-20 shrink-0 text-right text-sm font-medium">兑换码个数</Label>
            <Input
              type="number"
              placeholder="eg. 10表示创建10个兑换码"
              value={redeemCodeNum}
              onChange={(e) => setRedeemCodeNum(e.target.value)}
              className="max-w-[280px] bg-background"
            />
            <Button variant="default" className="min-w-24" onClick={createRedeemCode}>创建</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 rounded-xl">
        <CardHeader>
          <CardTitle>兑换码</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="font-semibold text-primary">兑换码</TableHead>
                  <TableHead className="font-semibold text-primary">兑换码类型</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {redeemCodeList.map((item: any, idx: number) => (
                  <TableRow key={idx}>
                    <TableCell>{item.redeem_code}</TableCell>
                    <TableCell>{item.code_type === "30天正式VIP" ? "30天正式VIP" : "7天试用VIP"}</TableCell>
                  </TableRow>
                ))}
                {redeemCodeList.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground py-6">暂无数据</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
