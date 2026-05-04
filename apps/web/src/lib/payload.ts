import { getPayload, type Payload } from 'payload'
import config from '@vibe-room/cms/src/payload.config'

let cached: Payload | null = null
let pending: Promise<Payload> | null = null

export async function getPayloadClient(): Promise<Payload> {
  if (cached) return cached
  if (pending) return pending

  pending = getPayload({ config })
    .then((client) => {
      cached = client
      pending = null
      return client
    })
    .catch((error) => {
      pending = null
      const message = error instanceof Error ? error.message : String(error)
      throw new Error(`[Payload] Failed to initialize client: ${message}`)
    })

  return pending
}
