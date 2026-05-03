"use client"

import { useState } from "react"

import { Pencil, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"

type BindUser = {
  id: string
  account: string
  contact: string
  phone: string
  notes: string
  time: string
}

const initialBindUsers: BindUser[] = [
  { id: "1", account: "xiaoqing2668", contact: "moyong4969", phone: "15655156616", notes: "芝麻40347639", time: "2025-10-06" },
  { id: "2", account: "guokaite", contact: "Xx3Salvation", phone: "15655156616", notes: "芝麻42184900", time: "2025-10-24" },
  { id: "3", account: "441246849@qq.com", contact: "", phone: "15655156616", notes: "bg: 9730512028", time: "2025-11-04" },
  { id: "4", account: "1924244562@qq.com", contact: "微信号：安迪", phone: "", notes: "okx: 788340260148544572，bg: 9730512028", time: "2025-12-20" },
]

export function BindUserTab() {
  const [bindUsers, setBindUsers] = useState<BindUser[]>(initialBindUsers)
  const [editingUser, setEditingUser] = useState<BindUser | null>(null)

  const handleEditSave = () => {
    if (!editingUser) return
    setBindUsers(prev => prev.map(u => u.id === editingUser.id ? editingUser : u))
    setEditingUser(null)
  }

  return (
    <>
      <div className="flex flex-col gap-6">
        <Card className="border-border/60 rounded-xl">
          <CardHeader>
            <CardTitle>绑定返佣用户</CardTitle>
          </CardHeader>
          <CardContent className="max-w-2xl space-y-5">
            <div className="flex items-center gap-4">
              <Label className="w-20 shrink-0 text-right text-sm font-medium">
                <span className="text-destructive mr-1">*</span>账号：
              </Label>
              <Input placeholder="本站账号" className="bg-background" />
            </div>
            <div className="flex items-center gap-4">
              <Label className="w-20 shrink-0 text-right text-sm font-medium">微信/QQ：</Label>
              <Input placeholder="微信/QQ" className="bg-background" />
            </div>
            <div className="flex items-center gap-4">
              <Label className="w-20 shrink-0 text-right text-sm font-medium">手机：</Label>
              <Input placeholder="手机" className="bg-background" />
            </div>
            <div className="flex items-start gap-4">
              <Label className="w-20 shrink-0 text-right text-sm font-medium pt-2.5">备注：</Label>
              <Textarea placeholder="备注" className="bg-background min-h-20" />
            </div>
            <div className="flex gap-4">
              <div className="w-20 shrink-0" />
              <Button variant="default" className="min-w-24">添加</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 rounded-xl">
          <CardHeader>
            <CardTitle>返佣用户管理</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="font-semibold text-primary">账号</TableHead>
                    <TableHead className="font-semibold text-primary">微信/QQ</TableHead>
                    <TableHead className="font-semibold text-primary">手机</TableHead>
                    <TableHead className="font-semibold text-primary">备注</TableHead>
                    <TableHead className="font-semibold text-primary">时间</TableHead>
                    <TableHead className="w-[100px] font-semibold text-primary">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bindUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.account}</TableCell>
                      <TableCell>{user.contact}</TableCell>
                      <TableCell>{user.phone}</TableCell>
                      <TableCell className="whitespace-pre-wrap break-words">{user.notes}</TableCell>
                      <TableCell>{user.time}</TableCell>
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
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
                value={editingUser?.account || ""}
                onChange={(e) => setEditingUser(prev => prev ? { ...prev, account: e.target.value } : null)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-contact" className="text-right">
                微信/QQ
              </Label>
              <Input
                id="edit-contact"
                value={editingUser?.contact || ""}
                onChange={(e) => setEditingUser(prev => prev ? { ...prev, contact: e.target.value } : null)}
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
                value={editingUser?.notes || ""}
                onChange={(e) => setEditingUser(prev => prev ? { ...prev, notes: e.target.value } : null)}
                className="col-span-3 min-h-20"
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