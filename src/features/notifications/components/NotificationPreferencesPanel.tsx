'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';

import type { NotificationPreferenceKey, NotificationPreferences } from '../types';

interface PreferenceItem {
  key: NotificationPreferenceKey;
  label: string;
  description: string;
  locked?: boolean;
}

const PREFERENCE_ITEMS: PreferenceItem[] = [
  {
    key: 'cookie_expired',
    label: 'Cookie / API 失效提醒',
    description: '交易所 Cookie、JWT 或 API 失效时通知您',
  },
  {
    key: 'trade_notice',
    label: '交易通知',
    description: '开仓、平仓及交易失败等交易相关通知',
  },
  {
    key: 'task_auto_stop',
    label: '任务自动停止',
    description: '跟单任务因异常自动停止时通知您',
  },
  {
    key: 'system_notice',
    label: '系统通知',
    description: '平台公告、维护提醒等系统消息，不可关闭',
    locked: true,
  },
];

interface NotificationPreferencesPanelProps {
  preferences: NotificationPreferences;
  isUpdating: boolean;
  onToggle: (key: NotificationPreferenceKey, enabled: boolean) => void;
}

export function NotificationPreferencesPanel({
  preferences,
  isUpdating,
  onToggle,
}: NotificationPreferencesPanelProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="px-4 py-3 space-y-0.5">
        <CardTitle className="text-lg">通知类型</CardTitle>
        <CardDescription className="text-xs">
          控制接收哪些类型的通知，对所有已开启渠道统一生效
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 pb-3 pt-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 sm:gap-x-6">
          {PREFERENCE_ITEMS.map((item) => {
            const enabled = preferences[item.key];

            return (
              <div
                key={item.key}
                className="flex items-center justify-between gap-3 py-2 border-b border-border/50 last:border-b-0 sm:[&:nth-last-child(-n+2)]:border-b-0"
              >
                <div className="min-w-0">
                  <div className="font-medium text-sm leading-tight">{item.label}</div>
                  <div className="text-xs text-muted-foreground leading-snug mt-0.5">
                    {item.description}
                  </div>
                </div>
                <Switch
                  checked={enabled}
                  disabled={item.locked || isUpdating}
                  onCheckedChange={(checked) => onToggle(item.key, checked)}
                  className="shrink-0 scale-75"
                />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
