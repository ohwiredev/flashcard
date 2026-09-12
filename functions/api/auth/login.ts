import { createSession, createSessionCookie, verifyPassword } from '../../lib/auth'
import { errorResponse, json } from '../../lib/response'
import type { Env } from '../../lib/types'

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const body = (await request.json().catch(() => null)) as { email?: string; password?: string } | null
  const email = body?.email?.trim().toLowerCase()
  const password = body?.password
  if (!email || !password) return errorResponse('Enter your email and password.')

  const row = await env.DB.prepare(
    'SELECT id, email, password_hash, password_salt FROM users WHERE email = ?',
  )
    .bind(email)
    .first<{ id: string; email: string; password_hash: string; password_salt: string }>()
  if (!row) return errorResponse('Incorrect email or password.', 401)

  const valid = await verifyPassword(password, row.password_hash, row.password_salt)
  if (!valid) return errorResponse('Incorrect email or password.', 401)

  const token = await createSession(env.DB, row.id)
  return json({ user: { id: row.id, email: row.email } }, { headers: { 'Set-Cookie': createSessionCookie(token) } })
}
