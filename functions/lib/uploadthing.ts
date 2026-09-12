import { UTApi } from 'uploadthing/server'
import type { Env } from './types'

export function getUTApi(env: Env): UTApi {
  return new UTApi({ token: env.UPLOADTHING_TOKEN })
}
