import type { GlobalConfig } from 'payload'
import { triggerRebuild } from '../hooks/rebuild'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  hooks: {
    afterChange: [
      ({ data, previousDoc, req }) => {
        const changed = Object.keys(data).some(
          (key) => key !== 'lastBuildAt' && data[key] !== previousDoc?.[key],
        )
        if (changed) triggerRebuild(req.payload)
      },
    ],
  },
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
