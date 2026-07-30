'use client';

import { UseFormReturn } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { NotificationChannelUpdate } from '../../types';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

interface ChannelProps {
  form: UseFormReturn<NotificationChannelUpdate>;
}

export function TelegramChannel({ form }: ChannelProps) {
  const t = useTranslations('DashboardNotifications');

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{t('telegram.sectionTitle')}</h3>

      <FormField
        control={form.control}
        name="config.telegram_bot_token"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('telegram.tokenLabel')}</FormLabel>
            <FormControl>
              <Input type="password" placeholder={t('telegram.tokenPlaceholder')} {...field} value={field.value || ''} />
            </FormControl>
            <FormDescription>
              {t.rich('telegram.tokenDesc', {
                link: chunks => (
                  <a href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer" className="underline text-primary">
                    {chunks}
                  </a>
                ),
              })}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="config.channel_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('telegram.chatIdLabel')}</FormLabel>
            <FormControl>
              <Input placeholder={t('telegram.chatIdPlaceholder')} {...field} value={field.value || ''} />
            </FormControl>
            <FormDescription>
              {t('telegram.chatIdDesc')}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
