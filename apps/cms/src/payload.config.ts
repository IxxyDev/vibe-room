import { buildConfig } from 'payload'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Categories } from './collections/Categories'
import { Instruments } from './collections/Instruments'
import { About } from './globals/About'
import { SiteSettings } from './globals/SiteSettings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET || 'dev-secret-at-least-32-characters-long-here',
  db: sqliteAdapter({
    url: path.resolve(dirname, '../data/vibe-room.db'),
  }),
  editor: lexicalEditor(),
  collections: [Users, Media, Categories, Instruments],
  globals: [About, SiteSettings],
  typescript: {
    outputFile: path.resolve(dirname, './payload-types.ts'),
  },
  admin: {
    user: 'users',
  },
})
