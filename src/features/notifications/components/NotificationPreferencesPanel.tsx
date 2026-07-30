'use client';

import { useTranslations } from 'next-intl';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { TOUR_ANCHORS, tourAnchor } from '@/features/tour/anchors';

import type { NotificationPreferenceKey, NotificationPreferences } from '../types';

const PREFERENCE_ITEMS: Array<{
  key: NotificationPreferenceKey;
  locked?: boolean;
}> = [
  { key: 'cookie_expired' },
  { key: 'trade_notice' },
  { key: 'task_auto_stop' },
  { key: 'system_notice', locked: true },
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
  const t = useTranslations('DashboardNotifications');

  return (
    <Card className="shadow-sm" {...tourAnchor(TOUR_ANCHORS.notifyPreferences)}>
      <CardHeader className="px-4 py-3 space-y-0.5">
        <CardTitle className="text-lg">{t('preferences.title')}</CardTitle>
        <CardDescription className="text-xs">
          {t('preferences.desc')}
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
                  <div className="font-medium text-sm leading-tight">
                    {t(`preferences.items.${item.key}.label`)}
                  </div>
                  <div className="text-xs text-muted-foreground leading-snug mt-0.5">
                    {t(`preferences.items.${item.key}.description`)}
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
