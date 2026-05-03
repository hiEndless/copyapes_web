"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { IncomeTab } from "./components/income-tab"
import { WithdrawTab } from "./components/withdraw-tab"

const revenueTabs = [
  {
    value: "income",
    label: "收益流水",
    title: "查看收益流水",
    description: "展示订单收益的分成记录。",
  },
  {
    value: "withdraw",
    label: "提现明细",
    title: "查看提现明细",
    description: "展示历史提现记录及当前状态。",
  },
] as const

export default function RevenuePage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">流水管理</h1>
        <p className="text-muted-foreground text-sm">
          查看您的收益分成明细及提现记录。
        </p>
      </div>

      <Tabs defaultValue="income" orientation="vertical" className="flex flex-col md:flex-row gap-6">
        <TabsList className="bg-background h-fit w-full max-w-[220px] flex-col rounded-xl border p-2">
          {revenueTabs.map((tab) => (
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
          <TabsContent value="income" className="mt-0">
            <IncomeTab />
          </TabsContent>

          <TabsContent value="withdraw" className="mt-0">
            <WithdrawTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}