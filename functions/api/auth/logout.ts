import { clearSessionCookie, deleteSession, getSessionToken } from '../../lib/auth'
import { json } from '../../lib/response'
import type { Env } from '../../lib/types'

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const token = getSessionToken(request)
  if (token) await deleteSession(env.DB, token)
  return json({ ok: true }, { headers: { 'Set-Cookie': clearSessionCookie() } })
}
