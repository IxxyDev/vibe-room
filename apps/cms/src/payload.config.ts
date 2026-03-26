import { buildConfig } from 'payload'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET || 'dev-secret-at-least-32-characters-long-here',
  db: sqliteAdapter({
    url: path.resolve(dirname, '../data/vibe-room.db'),
  }),
  editor: lexicalEditor(),
  collections: [],
  globals: [],
  typescript: {
    outputFile: path.resolve(dirname, './payload-types.ts'),
  },
  admin: {
    user: 'users',
  },
})
