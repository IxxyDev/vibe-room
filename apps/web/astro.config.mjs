import { defineConfig } from 'astro/config'
import sitemap from '@astrojs/sitemap'

export default defineConfig({
  site: 'https://vibe-room.ru',
  integrations: [sitemap()],
  output: 'static',
  vite: {
    resolve: {
      alias: {
        '@payload-config': new URL('../cms/src/payload.config.ts', import.meta.url).pathname,
      },
    },
  },
})
