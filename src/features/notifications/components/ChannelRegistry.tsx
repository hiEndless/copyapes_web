'use client';

import { NotificationChannelType, NotificationChannelUpdate } from '../types';
import { UseFormReturn } from 'react-hook-form';
import { EmailChannel } from './channels/EmailChannel';
import { TelegramChannel } from './channels/TelegramChannel';
import { DingTalkChannel } from './channels/DingTalkChannel';
import { QQEmailChannel } from './channels/QQEmailChannel';
import { WeChatChannel } from './channels/WeChatChannel';

export const ChannelRegistry: Record<NotificationChannelType, React.FC<{ form: UseFormReturn<NotificationChannelUpdate> }>> = {
  smtp_email: EmailChannel,
  telegram_bot: TelegramChannel,
  dingtalk_bot: DingTalkChannel,
  qq_email: QQEmailChannel,
  wechat_official: WeChatChannel,
};

export const ChannelLabels: Record<NotificationChannelType, string> = {
  'smtp_email': 'Email',
  'telegram_bot': 'Telegram',
  'dingtalk_bot': 'DingTalk',
  'qq_email': 'QQ Email',
  'wechat_official': 'WeChat',
};

export const ChannelIcons: Record<NotificationChannelType, string> = {
  'smtp_email': 'mail',
  'telegram_bot': 'send',
  'dingtalk_bot': 'webhook',
  'qq_email': 'mail',
  'wechat_official': 'message-circle',
};
