import type { Env, SessionUser } from './types'

const SESSION_COOKIE = 'session'
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000
const PBKDF2_ITERATIONS = 150_000

function toHex(bytes: Uint8Array | ArrayBuffer): string {
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes)
  return [...view].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

function fromHex(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
  }
  return bytes
}

async function deriveBits(password: string, salt: Uint8Array): Promise<ArrayBuffer> {
  const keyMaterial = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, [
    'deriveBits',
  ])
  return crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: salt as BufferSource, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    keyMaterial,
    256,
  )
}

export async function hashPassword(password: string): Promise<{ hash: string; salt: string }> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const derived = await deriveBits(password, salt)
  return { hash: toHex(derived), salt: toHex(salt) }
}

/** Constant-time-ish comparison: derives from the same salt so timing only depends on password length. */
export async function verifyPassword(password: string, hash: string, salt: string): Promise<boolean> {
  const derived = await deriveBits(password, fromHex(salt))
  const candidate = toHex(derived)
  if (candidate.length !== hash.length) return false
  let mismatch = 0
  for (let i = 0; i < candidate.length; i++) {
    mismatch |= candidate.charCodeAt(i) ^ hash.charCodeAt(i)
  }
  return mismatch === 0
}

export function createSessionCookie(token: string): string {
  const maxAge = Math.floor(SESSION_TTL_MS / 1000)
  return `${SESSION_COOKIE}=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${maxAge}`
}

export function clearSessionCookie(): string {
  return `${SESSION_COOKIE}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`
}

export async function createSession(db: D1Database, userId: string): Promise<string> {
  const token = crypto.randomUUID()
  const now = Date.now()
  await db
    .prepare('INSERT INTO sessions (token, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)')
    .bind(token, userId, now + SESSION_TTL_MS, now)
    .run()
  return token
}

export async function deleteSession(db: D1Database, token: string): Promise<void> {
  await db.prepare('DELETE FROM sessions WHERE token = ?').bind(token).run()
}

function getCookie(request: Request, name: string): string | null {
  const header = request.headers.get('Cookie')
  if (!header) return null
  for (const part of header.split(';')) {
    const separator = part.indexOf('=')
    if (separator === -1) continue
    if (part.slice(0, separator).trim() === name) return part.slice(separator + 1).trim()
  }
  return null
}

export function getSessionToken(request: Request): string | null {
  return getCookie(request, SESSION_COOKIE)
}

export async function getSessionUser(request: Request, env: Env): Promise<SessionUser | null> {
  const token = getSessionToken(request)
  if (!token) return null

  const row = await env.DB.prepare(
    `SELECT users.id as id, users.email as email, sessions.expires_at as expires_at
     FROM sessions JOIN users ON users.id = sessions.user_id
     WHERE sessions.token = ?`,
  )
    .bind(token)
    .first<{ id: string; email: string; expires_at: number }>()

  if (!row) return null
  if (row.expires_at < Date.now()) {
    await deleteSession(env.DB, token)
    return null
  }
  return { id: row.id, email: row.email }
}
