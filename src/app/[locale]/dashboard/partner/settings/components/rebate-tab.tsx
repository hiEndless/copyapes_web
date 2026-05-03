"use client"

import { useEffect, useState, useCallback } from "react"

import { agentApi } from "@/api/agent"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function RebateTab() {
  const [binance, setBinance] = useState<any>(null)

  const [okxApi, setOkxApi] = useState<any[]>([])
  const [gateApi, setGateApi] = useState<any[]>([])
  const [bitgetApi, setBitgetApi] = useState<any[]>([])

  const [okxName, setOkxName] = useState<any>(null)
  const [gateName, setGateName] = useState<any>(null)
  const [bitgetName, setBitgetName] = useState<any>(null)

  const [bnList, setBnList] = useState<any[]>([])
  const [bnListTime, setBnListTime] = useState("")
  const [bnUid, setBnUid] = useState("")

  const [page, setPage] = useState(1)
  const limit = 10

  const getExchange = useCallback(async () => {
    try {
      const res = await agentApi.getRebateExchange()

      if (res.code === 0 && res.data) {
        setOkxName(res.data.okx)
        setBinance(res.data.binance)
        setGateName(res.data.gate)
        setBitgetName(res.data.bitget)
      }
    } catch (err) {
      console.error(err)
    }
  }, [])

  const submitExchange = async () => {
    try {
      const okx_id = okxApi.find((o: any) => o.api_name === okxName)?.id || null
      const gate_id = gateApi.find((o: any) => o.api_name === gateName)?.id || null
      const bitget_id = bitgetApi.find((o: any) => o.api_name === bitgetName)?.id || null

      await agentApi.updateRebateExchange({
        okx_id,
        gate_id,
        bitget_id,
      })
    } catch (err) {
      console.error(err)
    }
  }

  const getOKX = useCallback(async () => {
    try {
      const res = await agentApi.getRebateOkx()

      if (res.code === 0 && res.data) setOkxApi(res.data)
    } catch (err) {
      console.error(err)
    }
  }, [])

  const getGate = useCallback(async () => {
    try {
      const res = await agentApi.getRebateGate()

      if (res.code === 0 && res.data) setGateApi(res.data)
    } catch (err) {
      console.error(err)
    }
  }, [])

  const getBitget = useCallback(async () => {
    try {
      const res = await agentApi.getRebateBitget()

      if (res.code === 0 && res.data) setBitgetApi(res.data)
    } catch (err) {
      console.error(err)
    }
  }, [])

  const getBnList = useCallback(async (currentPage: number) => {
    try {
      const offset = (currentPage - 1) * limit
      const res = await agentApi.getBnInvite({ limit, offset })

      if (res.code === 0 && res.data) {
        setBnList(res.data.user_list || res.data.results?.user_list || [])

        if (res.data.update_datetime) {
          setBnListTime(res.data.update_datetime.replace('T', ' ').split('.')[0])
        }
      }
    } catch (err) {
      console.error(err)
    }
  }, [])

  const putBnList = async () => {
    try {
      const res = await agentApi.updateBnInvite({ bn_uid: bnUid })

      if (res.code === 0 && res.data) {
        getBnList(page)
        setBnUid("")
      }
    } catch (err) {
      console.error(err)
    }
  }

  const postBnList = async () => {
    try {
      const res = await agentApi.createBnInvite()

      if (res.code === 0 && res.data) {
        getBnList(page)
      }
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    getExchange()
    getOKX()
    getGate()
    getBitget()
  }, [getExchange, getOKX, getGate, getBitget])

  useEffect(() => {
    getBnList(page)
  }, [getBnList, page])

  return (
    <div className="flex flex-col gap-6">
      <Card className="border-border/60 rounded-xl">
        <CardHeader>
          <CardTitle>设置返佣账号</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Label className="w-12 shrink-0 text-sm font-medium">欧易</Label>
            <Select value={okxName ? String(okxName) : undefined} onValueChange={(val) => setOkxName(val)}>
              <SelectTrigger className="flex-1 bg-background">
                <SelectValue placeholder={okxApi.length === 0 ? "请先添加返佣账号" : "选择返佣账号"} />
              </SelectTrigger>
              <SelectContent>
                {okxApi.map((option: any) => (
                  <SelectItem key={option.id} value={option.api_name}>{option.api_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="default" onClick={submitExchange}>确认</Button>
          </div>

          <div className="flex items-center gap-4">
            <Label className="w-12 shrink-0 text-sm font-medium">大门</Label>
            <Select value={gateName ? String(gateName) : undefined} onValueChange={(val) => setGateName(val)}>
              <SelectTrigger className="flex-1 bg-background">
                <SelectValue placeholder={gateApi.length === 0 ? "请先添加返佣账号" : "选择返佣账号"} />
              </SelectTrigger>
              <SelectContent>
                {gateApi.map((option: any) => (
                  <SelectItem key={option.id} value={option.api_name}>{option.api_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="default" onClick={submitExchange}>确认</Button>
          </div>

          <div className="flex items-center gap-4">
            <Label className="w-12 shrink-0 text-sm font-medium">Bitget</Label>
            <Select value={bitgetName ? String(bitgetName) : undefined} onValueChange={(val) => setBitgetName(val)}>
              <SelectTrigger className="flex-1 bg-background">
                <SelectValue placeholder={bitgetApi.length === 0 ? "请先添加返佣账号" : "选择返佣账号"} />
              </SelectTrigger>
              <SelectContent>
                {bitgetApi.map((option: any) => (
                  <SelectItem key={option.id} value={option.api_name}>{option.api_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="default" onClick={submitExchange}>确认</Button>
          </div>

          <div className="flex items-center gap-4">
            <Label className="w-12 shrink-0 text-sm font-medium">币安</Label>
            <Input
              value={binance || "请添加币安cookie后使用"}
              className="flex-1 bg-muted/50"
              readOnly
            />
            <Button variant="default" onClick={postBnList}>更新</Button>
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
              <Input
                placeholder="手动添加uid"
                value={bnUid}
                onChange={(e) => setBnUid(e.target.value)}
                className="bg-background"
              />
            </div>
            <Button onClick={putBnList}>添加</Button>
          </div>

          <p className="text-muted-foreground text-xs">* 最近更新时间：{bnListTime}</p>

          <div className="rounded-lg border">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="font-semibold text-primary">币安Uid</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bnList.map((item: any, idx: number) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{item.uid}</TableCell>
                  </TableRow>
                ))}
                {bnList.length === 0 && (
                  <TableRow>
                    <TableCell className="text-center text-muted-foreground py-6">暂无数据</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-end">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                上一页
              </Button>
              <div className="text-sm font-medium px-2">
                第 {page} 页
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={bnList.length < limit}
                onClick={() => setPage(p => p + 1)}
              >
                下一页
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
