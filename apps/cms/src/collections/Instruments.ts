import type { CollectionConfig } from 'payload'
import { triggerRebuild } from '../hooks/rebuild'

export const Instruments: CollectionConfig = {
  slug: 'instruments',
  labels: {
    singular: 'Инструмент',
    plural: 'Инструменты',
  },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  hooks: {
    afterChange: [({ req }) => { triggerRebuild(req.payload) }],
    afterDelete: [({ req }) => { triggerRebuild(req.payload) }],
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'category', 'year'],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Название',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      label: 'Slug',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'available',
      label: 'Статус',
      options: [
        { label: 'В наличии', value: 'available' },
        { label: 'Архив', value: 'archive' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      required: true,
      label: 'Категория',
    },
    {
      name: 'description',
      type: 'richText',
      label: 'Описание',
    },
    {
      name: 'specs',
      type: 'array',
      label: 'Спецификации',
      fields: [
        {
          name: 'key',
          type: 'text',
          required: true,
          label: 'Параметр',
        },
        {
          name: 'value',
          type: 'text',
          required: true,
          label: 'Значение',
        },
      ],
    },
    {
      name: 'images',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      required: true,
      label: 'Фотографии',
    },
    {
      name: 'year',
      type: 'number',
      label: 'Год выпуска',
    },
    {
      name: 'brand',
      type: 'text',
      label: 'Бренд',
    },
    {
      name: 'country',
      type: 'text',
      label: 'Страна',
    },
    {
      name: 'weight',
      type: 'number',
      label: 'Вес (кг)',
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      label: 'Порядок',
      admin: {
        position: 'sidebar',
      },
    },
  ],
}
