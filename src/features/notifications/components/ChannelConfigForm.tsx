'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { NotificationChannel, NotificationChannelUpdate } from '../types';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Loader2, Save, Send, AlertTriangle } from 'lucide-react';
import { ChannelRegistry } from './ChannelRegistry';
import { CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { TOUR_ANCHORS, tourAnchor } from '@/features/tour/anchors';

interface ChannelConfigFormProps {
  channel: NotificationChannel;
  onSave: (data: NotificationChannelUpdate) => Promise<void>;
  onTest: () => Promise<void>;
  isSaving: boolean;
  isTesting: boolean;
}

export function ChannelConfigForm({ channel, onSave, onTest, isSaving, isTesting }: ChannelConfigFormProps) {
  const t = useTranslations('DashboardNotifications');
  const form = useForm<NotificationChannelUpdate>({
    defaultValues: {
      is_active: channel.is_active,
      config: channel.config || {},
      recipients: channel.recipients || [],
      triggers: channel.triggers || [],
    },
  });

  useEffect(() => {
    form.reset({
      is_active: channel.is_active,
      config: channel.config || {},
      recipients: channel.recipients || [],
      triggers: channel.triggers || [],
    });
  }, [channel, form]);

  const ChannelComponent = ChannelRegistry[channel.channel_type];
  const channelName = t(`channels.${channel.id}`);

  if (!ChannelComponent) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
        <AlertTriangle className="h-8 w-8 mb-2 text-yellow-500 dark:text-yellow-400" />
        <p>{t('form.notFound', { type: channel.channel_type })}</p>
      </div>
    );
  }

  return (
    <Form form={form} onSubmit={form.handleSubmit(onSave)} className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t('form.configTitle', { name: channelName })}</CardTitle>
            <CardDescription>
              {t('form.lastUpdated', { date: new Date(channel.updated_at).toLocaleDateString() })}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="space-y-6 pt-6 flex-1 overflow-y-auto">
        <ChannelComponent form={form} />
      </CardContent>

      <Separator className="mt-auto" />

      <div className="flex items-center justify-between p-6" {...tourAnchor(TOUR_ANCHORS.notifyFormActions)}>
        <Button
          type="button"
          variant="outline"
          onClick={onTest}
          disabled={isTesting || !form.watch('is_active')}
        >
          {isTesting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
          {t('form.test')}
        </Button>

        <Button type="submit" disabled={isSaving}>
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          {t('form.save')}
        </Button>
      </div>
    </Form>
  );
}
