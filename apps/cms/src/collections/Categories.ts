import type { CollectionConfig } from 'payload'
import { triggerRebuild } from '../hooks/rebuild'

export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: {
    singular: 'Категория',
    plural: 'Категории',
  },
  hooks: {
    afterChange: [({ req }) => { triggerRebuild(req.payload) }],
    afterDelete: [({ req }) => { triggerRebuild(req.payload) }],
  },
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
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
