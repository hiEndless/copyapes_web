"use client"

import { useState } from "react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { LogCleanupTab } from "./_components/log-cleanup-tab"
import { SystemNoticeTab } from "./_components/system-notice-tab"
import { UserManagementTab } from "./_components/user-management-tab"
import { WithdrawalReviewTab } from "./_components/withdrawal-review-tab"

const adminTabs = [
  {
    value: "withdrawal-review",
    label: "提现审核",
    title: "提现审核",
    description: "审核用户提现申请与打款状态。",
  },
  {
    value: "system-notice",
    label: "系统通知",
    title: "系统通知",
    description: "发布与维护全站或定向系统通知。",
  },
  {
    value: "user-management",
    label: "用户信息管理",
    title: "用户信息管理",
    description: "查询与维护用户资料与权限相关字段。",
  },
  {
    value: "log-cleanup",
    label: "系统日志清理",
    title: "系统日志清理",
    description: "按策略清理或归档系统运行日志。",
  },
] as const

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<(typeof adminTabs)[number]["value"]>("withdrawal-review")
  const activeTabMeta = adminTabs.find((tab) => tab.value === activeTab) ?? adminTabs[0]

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 p-4 sm:gap-6 sm:p-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">管理后台</h1>
        <p className="text-muted-foreground text-sm">系统管理与运维入口。</p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as (typeof adminTabs)[number]["value"])}
        orientation="vertical"
        className="flex flex-col gap-4 md:flex-row md:gap-6"
      >
        <TabsList className="bg-background h-fit w-full justify-start gap-1 overflow-x-auto rounded-xl border p-1.5 sm:p-2 md:max-w-[220px] md:flex-col md:overflow-visible">
          {adminTabs.map((tab) => (
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

          <TabsContent value="withdrawal-review" className="mt-0">
            <WithdrawalReviewTab />
          </TabsContent>

          <TabsContent value="system-notice" className="mt-0">
            <SystemNoticeTab />
          </TabsContent>

          <TabsContent value="user-management" className="mt-0">
            <UserManagementTab />
          </TabsContent>

          <TabsContent value="log-cleanup" className="mt-0">
            <LogCleanupTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
