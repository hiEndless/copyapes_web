'use client';

import { useState, useEffect } from 'react';

import { AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useLocale, useTranslations } from 'next-intl';

import { request } from '@/api/request';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';

import type {
  NotificationChannel,
  NotificationChannelUpdate,
  NotificationPreferenceKey,
  NotificationPreferences,
} from '@/features/notifications/types';
import { ChannelConfigForm } from '@/features/notifications/components/ChannelConfigForm';
import { ChannelLogo } from '@/features/notifications/components/ChannelLogo';
import { NotificationPreferencesPanel } from '@/features/notifications/components/NotificationPreferencesPanel';
import { TOUR_ANCHORS, tourAnchor } from '@/features/tour/anchors';
import { STATIC_CHANNELS } from './static-channels';

const DEFAULT_PREFERENCES: NotificationPreferences = {
  cookie_expired: true,
  trade_notice: true,
  task_auto_stop: true,
  system_notice: true,
};

const StatusDot = ({ enabled }: { enabled: boolean }) => (
  <div className="relative flex h-3 w-3 mr-2">
    {enabled ? (
      <>
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 dark:bg-green-500 opacity-75" />
        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 dark:bg-green-400" />
      </>
    ) : (
      <span className="relative inline-flex rounded-full h-3 w-3 bg-gray-300 dark:bg-gray-600" />
    )}
  </div>
);

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) return error.message;

  try {
    return JSON.stringify(error);
  } catch {
    return fallback;
  }
}

interface NotificationTestResult {
  success: boolean;
  channel: string;
  error_code?: string | null;
  error_message?: string | null;
  retryable: boolean;
}

const TEST_ENDPOINTS: Partial<Record<NotificationChannel['id'], string>> = {
  wechat_official: '/notify/test/wx/',
  qq_email: '/notify/test/qqmail/',
  dingtalk_bot: '/notify/test/ding/',
};

export default function NotificationPage() {
  const t = useTranslations('DashboardNotifications');
  const locale = useLocale();
  const [channels, setChannels] = useState<NotificationChannel[]>([]);
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFERENCES);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isUpdatingPreference, setIsUpdatingPreference] = useState(false);

  const channelLabel = (id: string, fallback?: string) =>
    t(`channels.${id}` as 'channels.wechat_official') || fallback || id;

  useEffect(() => {
    const initializeChannels = async () => {
      setIsLoading(true);

      try {
        const [channelsResponse, preferencesResponse] = await Promise.all([
          request<{
            wx: boolean;
            wx_code: string;
            qq_mail: boolean;
            qq: string;
            password: string;
            ding_bot: boolean;
            ding_webhook: string;
            ding_secret: string;
          }>('/notify/', { method: 'GET' }),
          request<NotificationPreferences>('/notify/preferences/', { method: 'GET' }),
        ]);

        const mergedChannels = [...STATIC_CHANNELS];

        if (preferencesResponse.code === 0 && preferencesResponse.data) {
          setPreferences({ ...DEFAULT_PREFERENCES, ...preferencesResponse.data });
        }

        if (channelsResponse.code === 0 && channelsResponse.data) {
          const data = channelsResponse.data;

          mergedChannels.forEach(channel => {
            if (channel.id === 'wechat_official') {
              channel.is_active = data.wx;
              channel.config = { wechat_auth_code: data.wx_code || '' };
            } else if (channel.id === 'qq_email') {
              channel.is_active = data.qq_mail;
              channel.config = {
                qq_email_address: data.qq || '',
                qq_auth_code: data.password || ''
              };
            } else if (channel.id === 'dingtalk_bot') {
              channel.is_active = data.ding_bot;
              channel.config = {
                dingtalk_webhook: data.ding_webhook || '',
                dingtalk_secret: data.ding_secret || ''
              };
            }
          });
        }

        setChannels(mergedChannels);
        setSelectedChannelId(mergedChannels[0]?.id || null);
      } catch (error) {
        console.error('Failed to fetch channels, using static channels:', error);
        setChannels(STATIC_CHANNELS);
        setSelectedChannelId(STATIC_CHANNELS[0]?.id || null);
        toast.error(t('toast.fetchChannelsFailed', {
          error: getErrorMessage(error, t('errors.operationFailed')),
        }));
      } finally {
        setIsLoading(false);
      }
    };

    initializeChannels();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 仅首次加载
  }, []);

  const selectedChannel = channels.find(c => c.id === selectedChannelId);

  const handleSave = async (data: NotificationChannelUpdate) => {
    if (!selectedChannel) return;
    setIsSaving(true);

    try {
      if (selectedChannel.id === 'qq_email') {
        const response = await request('/qqmail/', {
          method: 'POST',
          body: {
            qq: data.config?.qq_email_address || '',
            password: data.config?.qq_auth_code || ''
          }
        });

        if (response.code !== 0) {
          throw new Error(response.error || response.msg || t('errors.saveQqEmailFailed'));
        }
      } else if (selectedChannel.id === 'dingtalk_bot') {
        const webhook = data.config?.dingtalk_webhook?.trim() || '';
        const secret = data.config?.dingtalk_secret?.trim() || '';

        if (!webhook) {
          throw new Error(t('errors.webhookRequired'));
        }

        const response = await request('/ding/', {
          method: 'POST',
          body: {
            webhook,
            secret
          }
        });

        if (response.code !== 0) {
          throw new Error(response.error || response.msg || t('errors.saveDingtalkFailed'));
        }

        data = {
          ...data,
          is_active: true,
          config: {
            ...data.config,
            dingtalk_webhook: webhook,
            dingtalk_secret: secret
          }
        };
      }

      const channelToUpdate: NotificationChannel = {
        ...selectedChannel,
        ...data,
        config: { ...selectedChannel.config, ...data.config },
      };

      setChannels(prev => prev.map(c =>
        c.channel_type === channelToUpdate.channel_type ? channelToUpdate : c
      ));

      toast.success(t('toast.saveSuccess'));
    } catch (error) {
      console.error('Failed to save:', error);
      toast.error(t('toast.saveFailed', {
        error: getErrorMessage(error, t('errors.operationFailed')),
      }));
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    if (!selectedChannel) return;
    setIsTesting(true);

    try {
      const endpoint = TEST_ENDPOINTS[selectedChannel.id];

      if (!endpoint) {
        throw new Error(t('errors.testNotSupported'));
      }

      const response = await request<NotificationTestResult>(endpoint, {
        method: 'POST',
        body: { message: t('toast.testMessage') },
        silent: true
      });

      const result = response.data;

      if (response.code !== 0 || !result?.success) {
        const retryHint = result?.retryable ? t('errors.retryableHint') : '';
        throw new Error(
          result?.error_message || response.error || response.msg || `${t('errors.testFailed')}${retryHint}`
        );
      }

      toast.success(t('toast.testSuccess', {
        name: channelLabel(selectedChannel.id, selectedChannel.name),
      }));
    } catch (error) {
      toast.error(t('toast.testFailed', {
        error: getErrorMessage(error, t('errors.operationFailed')),
      }));
    } finally {
      setIsTesting(false);
    }
  };

  const handleTogglePreference = async (key: NotificationPreferenceKey, enabled: boolean) => {
    if (key === 'system_notice') return;

    const previous = preferences[key];
    setPreferences(prev => ({ ...prev, [key]: enabled }));
    setIsUpdatingPreference(true);

    try {
      const response = await request<NotificationPreferences>('/notify/preferences/', {
        method: 'PATCH',
        body: { [key]: enabled },
      });

      if (response.code !== 0) {
        throw new Error(response.error || response.msg || t('errors.updatePreferenceFailed'));
      }

      if (response.data) {
        setPreferences({ ...DEFAULT_PREFERENCES, ...response.data });
      }

      const label = t(`preferences.items.${key}.label`);
      toast.success(enabled ? t('toast.preferenceOn', { label }) : t('toast.preferenceOff', { label }));
    } catch (error) {
      setPreferences(prev => ({ ...prev, [key]: previous }));
      toast.error(t('toast.updateFailed', {
        error: getErrorMessage(error, t('errors.operationFailed')),
      }));
    } finally {
      setIsUpdatingPreference(false);
    }
  };

  const handleToggleChannel = async (id: string, enabled: boolean) => {
    const channelToToggle = channels.find(c => c.id === id);

    if (!channelToToggle) return;

    // Optimistic update
    setChannels(prev => prev.map(c => c.id === id ? { ...c, is_active: enabled } : c));

    try {
      if (id === 'wechat_official') {
        const response = await request('/wx/', {
          method: 'PATCH',
          body: { wx: enabled }
        });

        if (response.code !== 0) {
          throw new Error(response.error || response.msg || t('errors.toggleWechatFailed'));
        }
      } else if (id === 'qq_email') {
        const response = await request('/qqmail/', {
          method: 'PATCH',
          body: { qq_mail: enabled }
        });

        if (response.code !== 0) {
          throw new Error(response.error || response.msg || t('errors.toggleQqEmailFailed'));
        }
      } else if (id === 'dingtalk_bot') {
        const response = await request('/ding/', {
          method: 'PATCH',
          body: { ding_bot: enabled }
        });

        if (response.code !== 0) {
          throw new Error(response.error || response.msg || t('errors.toggleDingtalkFailed'));
        }
      } else {
        // 模拟其他渠道 API 状态更新
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      const name = channelLabel(channelToToggle.id, channelToToggle.name);
      toast.success(enabled ? t('toast.channelOn', { name }) : t('toast.channelOff', { name }));
    } catch (error) {
      // Revert on failure
      setChannels(prev => prev.map(c => c.id === id ? { ...c, is_active: !enabled } : c));
      toast.error(t('toast.updateStatusFailed', {
        error: getErrorMessage(error, t('errors.operationFailed')),
      }));
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto p-4 lg:p-8">
      <div className="flex flex-col gap-1" {...tourAnchor(TOUR_ANCHORS.notifyHeader)}>
        <h2 className="text-2xl font-bold tracking-tight">{t('page.title')}</h2>
        <p className="text-muted-foreground text-sm">
          {t('page.subtitle')}
        </p>
      </div>

      <NotificationPreferencesPanel
        preferences={preferences}
        isUpdating={isUpdatingPreference}
        onToggle={handleTogglePreference}
      />

      <div className="flex flex-col md:flex-row gap-4 h-full min-h-[600px]">
        <Card className="w-full md:w-[30%] h-fit shadow-sm" {...tourAnchor(TOUR_ANCHORS.notifyChannelList)}>
          <CardHeader>
            <CardTitle className="text-lg">{t('page.channelsTitle')}</CardTitle>
            <CardDescription>{t('page.channelsDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[300px] md:h-[500px]">
              <div className="flex flex-col p-2 gap-2">
                {channels
                  .filter(c => !(c.channel_type === 'qq_email' && !locale.startsWith('zh')))
                  .map(channel => (
                  <div
                    key={channel.id}
                    onClick={() => setSelectedChannelId(channel.id)}
                    className={`
                      flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200
                      ${selectedChannelId === channel.id
                        ? 'bg-accent text-accent-foreground shadow-sm'
                        : 'hover:bg-muted/50'}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <StatusDot enabled={channel.is_active} />
                      <ChannelLogo type={channel.channel_type} />
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">
                          {channelLabel(channel.id, channel.name)}
                        </span>
                      </div>
                    </div>

                    <div onClick={(e) => e.stopPropagation()}>
                      <Switch
                        checked={channel.is_active}
                        onCheckedChange={(c) => handleToggleChannel(channel.id, c)}
                        className="scale-75"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card
          className="w-full md:w-[70%] animate-in fade-in slide-in-from-right-4 duration-300 flex flex-col shadow-sm"
          {...tourAnchor(TOUR_ANCHORS.notifyChannelForm)}
        >
          {selectedChannel ? (
            <ChannelConfigForm
              channel={selectedChannel}
              onSave={handleSave}
              onTest={handleTest}
              isSaving={isSaving}
              isTesting={isTesting}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-12">
              <AlertCircle className="h-12 w-12 mb-4 opacity-20" />
              <p>{t('page.selectChannelHint')}</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
