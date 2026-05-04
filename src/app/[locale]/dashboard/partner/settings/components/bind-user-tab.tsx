"use client"

import { useEffect, useState, useCallback } from "react"

import { Pencil, Trash2 } from "lucide-react"

import { agentApi } from "@/api/agent"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"

type BindUser = {
  id?: string
  username: string
  wx_qq: string
  phone: string
  other: string
  create_datetime: string
}

export function BindUserTab() {
  const [bindUsers, setBindUsers] = useState<BindUser[]>([])
  const [editingUser, setEditingUser] = useState<BindUser | null>(null)
  const [page, setPage] = useState(1)
  const limit = 10

  const [addForm, setAddForm] = useState({
    username: "",
    wx_qq: "",
    phone: "",
    other: ""
  })

  const getRebateUsers = useCallback(async (currentPage: number) => {
    try {
      const offset = (currentPage - 1) * limit
      const res = await agentApi.getInviteUsers({ limit, offset })

      if (res.code === 0 && res.data) {
        const list = Array.isArray(res.data) ? res.data : res.data.results || []

        setBindUsers(list)
      }
    } catch (err) {
      console.error(err)
    }
  }, [])

  const handleAdd = async () => {
    if (!addForm.username) return

    try {
      const res = await agentApi.addInviteUser(addForm)

      if (res.code === 0 && res.data) {
        setPage(1)
        getRebateUsers(1)
        setAddForm({ username: "", wx_qq: "", phone: "", other: "" })
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (username: string) => {
    try {
      const res = await agentApi.deleteInviteUser({ username })

      if (res.code === 0 && res.data) {
        getRebateUsers(page)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleEditSave = async () => {
    if (!editingUser) return

    try {
      const res = await agentApi.updateInviteUser(editingUser)

      if (res.code === 0 && res.data) {
        getRebateUsers(page)
        setEditingUser(null)
      }
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    getRebateUsers(page)
  }, [getRebateUsers, page])

  return (
    <>
      <div className="flex w-full flex-col gap-6">
        <Card className="border-border/60 w-full rounded-xl">
          <CardHeader>
            <CardTitle>绑定返佣用户</CardTitle>
          </CardHeader>
          <CardContent className="w-full space-y-5">
            <div className="bg-muted/30 rounded-lg border border-dashed px-4 py-3">
              <p className="text-sm font-medium">绑定说明：</p>
              <ul className="text-muted-foreground mt-2 list-disc space-y-1 pl-5 text-xs leading-relaxed">
                <li>只能绑定自己邀请的用户为返佣用户。</li>
                <li>绑定前请联系该用户终止所有跟单任务，否则无法绑定。</li>
                <li>绑定成功后，该用户已添加的 API 将被删除，后续只能添加在你名下的交易所返佣账号 API。</li>
                <li>绑定成功后，该用户可享专属返佣 VIP 半价优惠。</li>
                <li>解除绑定后，该用户可添加任意交易所 API，VIP 价格恢复原价。</li>
              </ul>
            </div>
            <div className="flex items-center gap-4">
              <Label className="w-20 shrink-0 text-right text-sm font-medium">
                <span className="text-destructive mr-1">*</span>账号：
              </Label>
              <Input
                placeholder="本站账号"
                value={addForm.username}
                onChange={(e) => setAddForm(prev => ({ ...prev, username: e.target.value }))}
                className="bg-background"
              />
            </div>
            <div className="flex items-center gap-4">
              <Label className="w-20 shrink-0 text-right text-sm font-medium">社交账号：</Label>
              <Input
                placeholder="社交账号"
                value={addForm.wx_qq}
                onChange={(e) => setAddForm(prev => ({ ...prev, wx_qq: e.target.value }))}
                className="bg-background"
              />
            </div>
            <div className="flex items-center gap-4">
              <Label className="w-20 shrink-0 text-right text-sm font-medium">手机：</Label>
              <Input
                placeholder="手机"
                value={addForm.phone}
                onChange={(e) => setAddForm(prev => ({ ...prev, phone: e.target.value }))}
                className="bg-background"
              />
            </div>
            <div className="flex items-start gap-4">
              <Label className="w-20 shrink-0 text-right text-sm font-medium pt-2.5">备注：</Label>
              <Textarea
                placeholder="备注"
                value={addForm.other}
                onChange={(e) => setAddForm(prev => ({ ...prev, other: e.target.value }))}
                className="bg-background min-h-20 whitespace-pre-wrap"
              />
            </div>
            <div className="flex gap-4">
              <div className="w-20 shrink-0" />
              <Button variant="default" className="min-w-24" onClick={handleAdd}>添加</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 w-full rounded-xl">
          <CardHeader>
            <CardTitle>返佣用户管理</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="font-semibold text-primary">账号</TableHead>
                    <TableHead className="font-semibold text-primary">社交账号</TableHead>
                    <TableHead className="font-semibold text-primary">手机</TableHead>
                    <TableHead className="font-semibold text-primary">备注</TableHead>
                    <TableHead className="font-semibold text-primary">时间</TableHead>
                    <TableHead className="w-[100px] font-semibold text-primary">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bindUsers.map((user, idx) => (
                    <TableRow key={user.id || idx}>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.wx_qq}</TableCell>
                      <TableCell>{user.phone}</TableCell>
                      <TableCell className="break-words">
                        {user.other?.split('\n').map((line, i) => (
                          <div key={i}>
                            {line.match(/.{1,20}/g)?.map((chunk, j) => (
                              <div key={j}>{chunk}</div>
                            ))}
                          </div>
                        ))}
                      </TableCell>
                      <TableCell>{user.create_datetime?.replace('T', ' ').split('.')[0]}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                            onClick={() => setEditingUser(user)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDelete(user.username)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {bindUsers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-6">暂无数据</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-end mt-4">
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
                  disabled={bindUsers.length < limit}
                  onClick={() => setPage(p => p + 1)}
                >
                  下一页
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>修改返佣用户</DialogTitle>
            <DialogDescription>
              修改当前绑定的用户信息。
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-account" className="text-right">
                账号
              </Label>
              <Input
                id="edit-account"
                value={editingUser?.username || ""}
                onChange={(e) => setEditingUser(prev => prev ? { ...prev, username: e.target.value } : null)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-contact" className="text-right">
                微信/QQ
              </Label>
              <Input
                id="edit-contact"
                value={editingUser?.wx_qq || ""}
                onChange={(e) => setEditingUser(prev => prev ? { ...prev, wx_qq: e.target.value } : null)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-phone" className="text-right">
                手机
              </Label>
              <Input
                id="edit-phone"
                value={editingUser?.phone || ""}
                onChange={(e) => setEditingUser(prev => prev ? { ...prev, phone: e.target.value } : null)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="edit-notes" className="text-right pt-2.5">
                备注
              </Label>
              <Textarea
                id="edit-notes"
                value={editingUser?.other || ""}
                onChange={(e) => setEditingUser(prev => prev ? { ...prev, other: e.target.value } : null)}
                className="col-span-3 min-h-20 whitespace-pre-wrap"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>取消</Button>
            <Button onClick={handleEditSave}>保存修改</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
