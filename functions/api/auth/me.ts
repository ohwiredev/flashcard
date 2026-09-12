import { errorResponse, json } from '../../lib/response'
import type { AppData, Env } from '../../lib/types'

export const onRequestGet: PagesFunction<Env, string, AppData> = async ({ data }) => {
  if (!data.user) return errorResponse('Not signed in.', 401)
  return json({ user: data.user })
}
