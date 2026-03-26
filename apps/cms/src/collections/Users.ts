import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: 'Пользователь',
    plural: 'Пользователи',
  },
  auth: true,
  admin: {
    useAsTitle: 'email',
  },
  fields: [],
}
