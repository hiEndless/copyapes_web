"use client"

import { useState } from "react"

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
  const [activeTab, setActiveTab] = useState<(typeof userListTabs)[number]["value"]>("promoted-users")
  const activeTabMeta = userListTabs.find((tab) => tab.value === activeTab) ?? userListTabs[0]

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 p-4 sm:gap-6 sm:p-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">用户列表</h1>
        <p className="text-muted-foreground text-sm">
          查看和管理通过您的邀请链接注册的用户。
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as (typeof userListTabs)[number]["value"])}
        orientation="vertical"
        className="flex flex-col gap-4 md:flex-row md:gap-6"
      >
        <TabsList className="bg-background h-fit w-full justify-start gap-1 overflow-x-auto rounded-xl border p-1.5 sm:p-2 md:max-w-[220px] md:flex-col md:overflow-visible">
          {userListTabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="min-w-fit flex-none justify-center rounded-lg px-3 py-2 text-sm data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none dark:data-[state=active]:border-transparent md:w-full md:justify-start md:px-4 md:py-3 md:text-left"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="min-w-0 flex-1">
          <div className="mb-4 space-y-1 px-1 md:px-0">
            <h2 className="text-lg font-semibold">{activeTabMeta.title}</h2>
            <p className="text-muted-foreground text-sm">{activeTabMeta.description}</p>
          </div>

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
