import { buildConfig } from 'payload'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Categories } from './collections/Categories'
import { Instruments } from './collections/Instruments'
import { About } from './globals/About'
import { SiteSettings } from './globals/SiteSettings'

if (!process.env.PAYLOAD_SECRET) {
  throw new Error('PAYLOAD_SECRET environment variable is required')
}

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET,
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URL || `file:${path.resolve(process.cwd(), 'data/vibe-room.db')}`,
    },
  }),
  editor: lexicalEditor(),
  collections: [Users, Media, Categories, Instruments],
  globals: [About, SiteSettings],
  typescript: {
    outputFile: path.resolve(process.cwd(), 'src/payload-types.ts'),
  },
  admin: {
    user: 'users',
    meta: {
      titleSuffix: '— Vibe Room',
    },
  },
  i18n: {
    fallbackLanguage: 'ru',
  },
})
