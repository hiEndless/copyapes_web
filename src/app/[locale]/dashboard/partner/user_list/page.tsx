"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { PromotedUsersTab } from "./components/promoted-users-tab"
import { VipCustomersTab } from "./components/vip-customers-tab"

const userListTabs = [
  {
    value: "promoted-users",
    label: "推广用户",
    title: "查看推广用户",
    description: "展示邀请的用户列表及邀请层级。",
  },
  {
    value: "vip-customers",
    label: "VIP客户",
    title: "查看VIP客户",
    description: "展示邀请的VIP用户及剩余时间。",
  },
] as const

export default function InviteListPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">用户列表</h1>
        <p className="text-muted-foreground text-sm">
          查看和管理通过您的邀请链接注册的用户。
        </p>
      </div>

      <Tabs defaultValue="promoted-users" orientation="vertical" className="flex flex-col md:flex-row gap-6">
        <TabsList className="bg-background h-fit w-full max-w-[220px] flex-col rounded-xl border p-2">
          {userListTabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="w-full justify-start rounded-lg px-4 py-3 text-left data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none dark:data-[state=active]:border-transparent"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="flex-1">
          <TabsContent value="promoted-users" className="mt-0">
            <PromotedUsersTab />
          </TabsContent>

          <TabsContent value="vip-customers" className="mt-0">
            <VipCustomersTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}