"use client"

import { useState } from "react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { IncomeTab } from "./components/income-tab"
import { WithdrawManageTab } from "./components/withdraw-manage-tab"
import { WithdrawDetailTab } from "./components/withdraw-detail-tab"

const revenueTabs = [
  {
    value: "withdraw",
    label: "提现管理",
    title: "提现管理",
    description: "提现设置与提现操作。",
  },
  {
    value: "income",
    label: "收益流水",
    title: "查看收益流水",
    description: "展示订单收益的分成记录。",
  },
  {
    value: "withdraw_detail",
    label: "提现明细",
    title: "查看提现明细",
    description: "展示历史提现记录及当前状态。",
  },
] as const

export default function RevenuePage() {
  const [activeTab, setActiveTab] = useState<(typeof revenueTabs)[number]["value"]>("withdraw")
  const activeTabMeta = revenueTabs.find((tab) => tab.value === activeTab) ?? revenueTabs[0]

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 p-4 sm:gap-6 sm:p-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">收益与提现管理</h1>
        <p className="text-muted-foreground text-sm">
          查看您的收益分成明细及提现记录。
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as (typeof revenueTabs)[number]["value"])}
        orientation="vertical"
        className="flex flex-col gap-4 md:flex-row md:gap-6"
      >
        <TabsList className="bg-background h-fit w-full justify-start gap-1 overflow-x-auto rounded-xl border p-1.5 sm:p-2 md:max-w-[220px] md:flex-col md:overflow-visible">
          {revenueTabs.map((tab) => (
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

          <TabsContent value="withdraw" className="mt-0">
            <WithdrawManageTab />
          </TabsContent>
          
          <TabsContent value="income" className="mt-0">
            <IncomeTab />
          </TabsContent>

          <TabsContent value="withdraw_detail" className="mt-0">
            <WithdrawDetailTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
