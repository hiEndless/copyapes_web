"use client"

import { useState } from "react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { BindUserTab } from "./components/bind-user-tab"
import { InviteCodeTab } from "./components/invite-code-tab"
import { NoticeTab } from "./components/notice-tab"
import { RebateTab } from "./components/rebate-tab"
import { SupportContactTab } from "./components/support-contact-tab"
import { VipCodeTab } from "./components/vip-code-tab"

const settingTabs = [
  {
    value: "invite-code",
    label: "代理信息",
    title: "查看代理信息",
    description: "展示当前代理分成与提现数据。",
  },
  {
    value: "rebate",
    label: "返佣设置",
    title: "返佣账号与明细",
    description: "设置各交易所返佣账号，并管理币安下级 UID 列表。",
  },
  {
    value: "bind-user",
    label: "绑定返佣客户",
    title: "绑定与管理返佣客户",
    description: "将本站账号与返佣联系方式进行绑定，方便管理客户信息。",
  },
  {
    value: "vip-code",
    label: "VIP体验码",
    title: "VIP体验码管理",
    description: "创建并管理用于分发的VIP体验兑换码。",
  },
  {
    value: "support-contact",
    label: "客服联系方式",
    title: "维护客服触达方式",
    description: "配置 QQ、微信 和 Telegram，确保你邀请的用户可以快速联系到你。",
  },
  {
    value: "notice",
    label: "公告设置",
    title: "编辑公告内容",
    description: "公告内容将展示给你邀请的用户。",
  },
] as const

export default function PartnerSettingsPage() {
  const [activeTab, setActiveTab] = useState<(typeof settingTabs)[number]["value"]>("invite-code")
  const activeTabMeta = settingTabs.find((tab) => tab.value === activeTab) ?? settingTabs[0]

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 p-4 sm:gap-6 sm:p-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">代理设置</h1>
        <p className="text-muted-foreground text-sm">
          管理代理设置配置。
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as (typeof settingTabs)[number]["value"])}
        orientation="vertical"
        className="flex flex-col gap-4 md:flex-row md:gap-6"
      >
        <TabsList className="bg-background h-fit w-full justify-start gap-1 overflow-x-auto rounded-xl border p-1.5 sm:p-2 md:max-w-[220px] md:flex-col md:overflow-visible">
          {settingTabs.map((tab) => (
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

          <TabsContent value="invite-code" className="mt-0">
            <InviteCodeTab />
          </TabsContent>

          <TabsContent value="rebate" className="mt-0">
            <RebateTab />
          </TabsContent>

          <TabsContent value="bind-user" className="mt-0">
            <BindUserTab />
          </TabsContent>

          <TabsContent value="vip-code" className="mt-0">
            <VipCodeTab />
          </TabsContent>

          <TabsContent value="support-contact" className="mt-0">
            <SupportContactTab />
          </TabsContent>

          <TabsContent value="notice" className="mt-0">
            <NoticeTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
