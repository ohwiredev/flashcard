#!/usr/bin/env node
// Creates the one account this app supports (no public signup) directly in D1, seeded with
// the two starter decks. Password hashing matches functions/lib/auth.ts (PBKDF2-SHA256, same
// iteration count) so the account can log in through the normal /api/auth/login route.
import { execFileSync } from 'node:child_process'
import { pbkdf2Sync, randomBytes, randomUUID } from 'node:crypto'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const PBKDF2_ITERATIONS = 150_000

const [, , email, password, ...rest] = process.argv
const remote = rest.includes('--remote')

if (!email || !password || !email.includes('@') || password.length < 8) {
  console.error('Usage: npm run create-account -- <email> <password> [--remote]')
  console.error('Password must be at least 8 characters. Omit --remote to write to the local D1 database.')
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

const statements = [
  `INSERT INTO users (id, email, password_hash, password_salt, created_at) VALUES (${sql(userId)}, ${sql(
    email.trim().toLowerCase(),
  )}, ${sql(hash.toString('hex'))}, ${sql(salt.toString('hex'))}, ${now});`,
]

for (const deck of SEED_DECKS) {
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

const args = ['wrangler', 'd1', 'execute', 'flashcard-db', remote ? '--remote' : '--local', '--file', file]
console.log(`Running: npx ${args.join(' ')}`)
execFileSync('npx', args, { stdio: 'inherit' })

console.log(`\nAccount created for ${email}${remote ? ' (remote)' : ' (local)'}.`)
