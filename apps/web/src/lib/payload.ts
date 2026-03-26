import { getPayload } from 'payload'
import config from '@vibe-room/cms/src/payload.config'

export async function getPayloadClient() {
  return getPayload({ config })
}
