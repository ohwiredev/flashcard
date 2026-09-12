import { getSessionUser } from '../lib/auth'
import type { AppData, Env } from '../lib/types'

export const onRequest: PagesFunction<Env, string, AppData> = async (context) => {
  context.data.user = await getSessionUser(context.request, context.env)
  return context.next()
}
