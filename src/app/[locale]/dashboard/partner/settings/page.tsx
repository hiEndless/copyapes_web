"use client"

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
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">代理设置</h1>
        <p className="text-muted-foreground text-sm">
          管理代理设置配置。
        </p>
      </div>

      <Tabs defaultValue="invite-code" orientation="vertical" className="flex flex-col md:flex-row gap-6">
        <TabsList className="bg-background h-fit w-full max-w-[220px] flex-col rounded-xl border p-2">
          {settingTabs.map((tab) => (
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
