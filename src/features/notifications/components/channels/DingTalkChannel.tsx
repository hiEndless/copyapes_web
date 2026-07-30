'use client';

import { Info } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { UseFormReturn } from 'react-hook-form';

import type { NotificationChannelUpdate } from '../../types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

interface ChannelProps {
  form: UseFormReturn<NotificationChannelUpdate>;
}

const STEP_KEYS = ['1', '2', '3', '4', '5'] as const;

export function DingTalkChannel({ form }: ChannelProps) {
  const t = useTranslations('DashboardNotifications');

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{t('dingtalk.sectionTitle')}</h3>

      <Alert variant="default" className="bg-muted/50">
        <Info className="h-4 w-4" />
        <AlertTitle className="text-sm font-medium">{t('dingtalk.alertTitle')}</AlertTitle>
        <AlertDescription>
          <ol className="mt-2 space-y-1 text-xs text-muted-foreground list-decimal list-inside">
            {STEP_KEYS.map(key => (
              <li key={key}>{t(`dingtalk.steps.${key}`)}</li>
            ))}
          </ol>
        </AlertDescription>
      </Alert>

      <FormField
        control={form.control}
        name="config.dingtalk_webhook"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('dingtalk.webhookLabel')}</FormLabel>
            <FormControl>
              <Input
                placeholder={t('dingtalk.webhookPlaceholder')}
                {...field}
                value={field.value || ''}
                onBlur={(event) => field.onChange(event.target.value.trim())}
              />
            </FormControl>
            <FormDescription>
              {t('dingtalk.webhookDesc')}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="config.dingtalk_secret"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('dingtalk.secretLabel')}</FormLabel>
            <FormControl>
              <Input
                type="password"
                placeholder={t('dingtalk.secretPlaceholder')}
                {...field}
                value={field.value || ''}
                onBlur={(event) => field.onChange(event.target.value.trim())}
              />
            </FormControl>
            <FormDescription>
              {t('dingtalk.secretDesc')}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
