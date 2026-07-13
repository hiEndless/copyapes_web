export type NotificationChannelType = 'smtp_email' | 'telegram_bot' | 'dingtalk_bot' | 'qq_email' | 'wechat_official';

export interface NotificationConfig {
  smtp_host?: string;
  smtp_port?: number;
  smtp_username?: string;
  smtp_password?: string;
  email_from?: string;

  qq_email_address?: string;
  qq_auth_code?: string;

  telegram_bot_token?: string;
  telegram_chat_id?: string;

  dingtalk_webhook?: string;
  dingtalk_secret?: string;
  
  wechat_auth_code?: string;

  webhook_url?: string;
  api_key?: string;
  channel_id?: string;
  email_address?: string;
}

export interface NotificationChannel {
  id: string;
  channel_type: NotificationChannelType;
  name: string;
  logo: string;
  is_active: boolean;
  config: NotificationConfig;
  recipients: string[];
  triggers: string[];
  created_at: string;
  updated_at: string;
}

export interface NotificationChannelUpdate {
  is_active?: boolean;
  config?: NotificationConfig;
  recipients?: string[];
  triggers?: string[];
}

export type NotificationPreferenceKey =
  | 'cookie_expired'
  | 'trade_notice'
  | 'task_auto_stop'
  | 'system_notice';

export interface NotificationPreferences {
  cookie_expired: boolean;
  trade_notice: boolean;
  task_auto_stop: boolean;
  system_notice: boolean;
}

export type NotificationPreferencePatch = Partial<NotificationPreferences>;
