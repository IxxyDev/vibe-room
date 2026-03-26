import { exec } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'
import type { Payload } from 'payload'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const webDir = path.resolve(dirname, '../../../web')

let building = false
let queued = false
let debounceTimer: ReturnType<typeof setTimeout> | null = null

async function runBuild(payload?: Payload): Promise<void> {
  if (building) {
    queued = true
    return
  }

  building = true
  console.log('[rebuild] Starting astro build...')

  return new Promise((resolve) => {
    exec('pnpm build', { cwd: webDir }, async (error, stdout, stderr) => {
      building = false

      if (error) {
        console.error('[rebuild] Build failed:', stderr)
      } else {
        console.log('[rebuild] Build complete.')
        if (payload) {
          try {
            await payload.updateGlobal({
              slug: 'site-settings',
              data: { lastBuildAt: new Date().toISOString() },
            })
          } catch (e) {
            console.error('[rebuild] Failed to update lastBuildAt:', e)
          }
        }
      }

      if (queued) {
        queued = false
        runBuild(payload).then(resolve)
      } else {
        resolve()
      }
    })
  })
}

export function triggerRebuild(payload?: Payload): void {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }

  debounceTimer = setTimeout(() => {
    debounceTimer = null
    runBuild(payload)
  }, 5000)
}
