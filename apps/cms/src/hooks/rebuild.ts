import { spawn } from 'child_process'
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
    const child = spawn('pnpm', ['build'], { cwd: webDir, stdio: 'pipe' })

    let stderr = ''
    child.stderr.on('data', (data) => { stderr += data.toString() })

    child.on('close', async (code) => {
      building = false

      if (code !== 0) {
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

    child.on('error', (error) => {
      building = false
      console.error('[rebuild] Failed to start build process:', error)
      resolve()
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
