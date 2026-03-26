import type { GlobalConfig } from 'payload'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Настройки сайта',
  fields: [
    {
      name: 'telegramUrl',
      type: 'text',
      label: 'Telegram',
    },
    {
      name: 'instagramUrl',
      type: 'text',
      label: 'Instagram',
    },
    {
      name: 'vkUrl',
      type: 'text',
      label: 'VK',
    },
    {
      name: 'siteUrl',
      type: 'text',
      label: 'URL сайта',
      admin: {
        description: 'Каноничный URL (напр. https://vibe-room.ru)',
      },
    },
    {
      name: 'lastBuildAt',
      type: 'date',
      label: 'Последний билд',
      admin: {
        readOnly: true,
        date: {
          displayFormat: 'dd.MM.yyyy HH:mm',
        },
      },
    },
  ],
}
