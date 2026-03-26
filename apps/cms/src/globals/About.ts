import type { GlobalConfig } from 'payload'

export const About: GlobalConfig = {
  slug: 'about',
  label: 'О коллекции',
  fields: [
    {
      name: 'heading',
      type: 'text',
      required: true,
      label: 'Заголовок',
    },
    {
      name: 'content',
      type: 'richText',
      label: 'Текст',
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
      label: 'Фото',
    },
    {
      name: 'stats',
      type: 'array',
      label: 'Счётчики',
      fields: [
        {
          name: 'number',
          type: 'text',
          required: true,
          label: 'Число',
        },
        {
          name: 'label',
          type: 'text',
          required: true,
          label: 'Подпись',
        },
      ],
    },
  ],
}
