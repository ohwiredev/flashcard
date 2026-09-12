#!/usr/bin/env node
// Creates the one account this app supports (no public signup) directly in D1, seeded with
// the two starter decks. Password hashing matches functions/lib/auth.ts (PBKDF2-SHA256, same
// iteration count) so the account can log in through the normal /api/auth/login route.
// Pass --reset-password to re-hash an existing account's password instead of creating one.
import { execFileSync } from 'node:child_process'
import { pbkdf2Sync, randomBytes, randomUUID } from 'node:crypto'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

// Must match functions/lib/auth.ts, which is capped at 100,000 by the Workers runtime.
const PBKDF2_ITERATIONS = 100_000

const [, , email, password, ...rest] = process.argv
const remote = rest.includes('--remote')
const resetPassword = rest.includes('--reset-password')

if (!email || !password || !email.includes('@') || password.length < 8) {
  console.error('Usage: npm run create-account -- <email> <password> [--remote] [--reset-password]')
  console.error('Password must be at least 8 characters. Omit --remote to write to the local D1 database.')
  console.error('Use --reset-password to replace the password on an account that already exists.')
  process.exit(1)
}

const SEED_DECKS = [
  {
    name: 'Spanish Basics',
    description: 'Everyday words to get you started',
    accent: 'blue',
    pairs: [
      ['hola', 'hello'],
      ['gracias', 'thank you'],
      ['por favor', 'please'],
      ['buenos días', 'good morning'],
      ['¿cómo estás?', 'how are you?'],
      ['agua', 'water'],
      ['amigo', 'friend'],
      ['adiós', 'goodbye'],
    ],
  },
  {
    name: 'World Capitals',
    description: 'Match each country to its capital',
    accent: 'amber',
    pairs: [
      ['France', 'Paris'],
      ['Japan', 'Tokyo'],
      ['Australia', 'Canberra'],
      ['Canada', 'Ottawa'],
      ['Egypt', 'Cairo'],
      ['Brazil', 'Brasília'],
      ['Kenya', 'Nairobi'],
      ['Norway', 'Oslo'],
    ],
  },
]

function sql(value) {
  return `'${String(value).replace(/'/g, "''")}'`
}

const salt = randomBytes(16)
const hash = pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, 32, 'sha256')
const userId = randomUUID()
const now = Date.now()

const normalizedEmail = email.trim().toLowerCase()

const statements = resetPassword
  ? [
      `UPDATE users SET password_hash = ${sql(hash.toString('hex'))}, password_salt = ${sql(
        salt.toString('hex'),
      )} WHERE email = ${sql(normalizedEmail)};`,
      `DELETE FROM sessions WHERE user_id IN (SELECT id FROM users WHERE email = ${sql(normalizedEmail)});`,
    ]
  : [
      `INSERT INTO users (id, email, password_hash, password_salt, created_at) VALUES (${sql(userId)}, ${sql(
        normalizedEmail,
      )}, ${sql(hash.toString('hex'))}, ${sql(salt.toString('hex'))}, ${now});`,
    ]

for (const deck of resetPassword ? [] : SEED_DECKS) {
  const deckId = randomUUID()
  statements.push(
    `INSERT INTO decks (id, user_id, name, description, accent, created_at, updated_at) VALUES (${sql(deckId)}, ${sql(
      userId,
    )}, ${sql(deck.name)}, ${sql(deck.description)}, ${sql(deck.accent)}, ${now}, ${now});`,
  )
  deck.pairs.forEach(([front, back], index) => {
    statements.push(
      `INSERT INTO cards (id, deck_id, front, back, position, created_at, updated_at) VALUES (${sql(
        randomUUID(),
      )}, ${sql(deckId)}, ${sql(front)}, ${sql(back)}, ${index}, ${now}, ${now});`,
    )
  })
}

const dir = mkdtempSync(join(tmpdir(), 'flashcard-account-'))
const file = join(dir, 'create-account.sql')
writeFileSync(file, statements.join('\n'))

const location = remote ? '--remote' : '--local'
const target = remote ? 'remote' : 'local'

function runD1(extraArgs, options = {}) {
  return execFileSync('npx', ['wrangler', 'd1', 'execute', 'flashcard-db', location, ...extraArgs], options)
}

if (resetPassword) {
  // The UPDATE is a no-op when the account does not exist, so check first rather than reporting a
  // reset that never happened. The local D1 driver omits row counts, so a SELECT is the portable check.
  const output = runD1(['--command', `SELECT id FROM users WHERE email = ${sql(normalizedEmail)}`, '--json'], {
    encoding: 'utf8',
  })
  const [{ results = [] } = {}] = JSON.parse(output.slice(output.indexOf('[')))
  if (results.length === 0) {
    console.error(`No account found for ${normalizedEmail} (${target}). Nothing changed.`)
    process.exit(1)
  }
}

console.log(`Running: npx wrangler d1 execute flashcard-db ${location} --file ${file}`)
runD1(['--file', file], { stdio: 'inherit' })

console.log(
  resetPassword
    ? `\nPassword updated for ${normalizedEmail} (${target}). Existing sessions were signed out.`
    : `\nAccount created for ${normalizedEmail} (${target}).`,
)
