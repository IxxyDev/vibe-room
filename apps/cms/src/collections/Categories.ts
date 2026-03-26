import type { CollectionConfig } from 'payload'
import { triggerRebuild } from '../hooks/rebuild'

export const Categories: CollectionConfig = {
  slug: 'categories',
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
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
      },
    },
  ],
}
