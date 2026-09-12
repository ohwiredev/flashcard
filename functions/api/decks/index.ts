import { ACCENTS, isDeckAccent } from '../../lib/constants'
import { createId } from '../../lib/id'
import { errorResponse, json } from '../../lib/response'
import type { AppData, Env } from '../../lib/types'

interface DeckRow {
  id: string
  name: string
  description: string | null
  accent: string
  created_at: number
  updated_at: number
}

interface CardRow {
  id: string
  deck_id: string
  front: string
  back: string
  front_image: string | null
  back_image: string | null
  created_at: number
  updated_at: number
}

export const onRequestGet: PagesFunction<Env, string, AppData> = async ({ env, data }) => {
  if (!data.user) return errorResponse('Not signed in.', 401)

  const { results: deckRows } = await env.DB.prepare(
    'SELECT id, name, description, accent, created_at, updated_at FROM decks WHERE user_id = ? ORDER BY created_at ASC',
  )
    .bind(data.user.id)
    .all<DeckRow>()

  const { results: cardRows } = await env.DB.prepare(
    `SELECT cards.id as id, cards.deck_id as deck_id, cards.front as front, cards.back as back,
            cards.front_image as front_image, cards.back_image as back_image,
            cards.created_at as created_at, cards.updated_at as updated_at
     FROM cards JOIN decks ON decks.id = cards.deck_id
     WHERE decks.user_id = ?
     ORDER BY cards.position ASC`,
  )
    .bind(data.user.id)
    .all<CardRow>()

  const decks = deckRows.map((deck) => ({
    id: deck.id,
    name: deck.name,
    description: deck.description ?? undefined,
    accent: deck.accent,
    createdAt: deck.created_at,
    updatedAt: deck.updated_at,
    cards: cardRows
      .filter((card) => card.deck_id === deck.id)
      .map((card) => ({
        id: card.id,
        front: card.front,
        back: card.back,
        frontImage: card.front_image ?? undefined,
        backImage: card.back_image ?? undefined,
        createdAt: card.created_at,
        updatedAt: card.updated_at,
      })),
  }))

  return json({ decks })
}

export const onRequestPost: PagesFunction<Env, string, AppData> = async ({ request, env, data }) => {
  if (!data.user) return errorResponse('Not signed in.', 401)

  const body = (await request.json().catch(() => null)) as
    | { name?: string; description?: string; accent?: string }
    | null
  const name = body?.name?.trim()
  if (!name) return errorResponse('Deck name is required.')

  let accent = isDeckAccent(body?.accent) ? body!.accent : undefined
  if (!accent) {
    const countRow = await env.DB.prepare('SELECT COUNT(*) as count FROM decks WHERE user_id = ?')
      .bind(data.user.id)
      .first<{ count: number }>()
    accent = ACCENTS[(countRow?.count ?? 0) % ACCENTS.length]
  }

  const description = body?.description?.trim() || null
  const now = Date.now()
  const id = createId()
  await env.DB.prepare(
    'INSERT INTO decks (id, user_id, name, description, accent, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
  )
    .bind(id, data.user.id, name, description, accent, now, now)
    .run()

  return json(
    {
      deck: {
        id,
        name,
        description: description ?? undefined,
        accent,
        cards: [],
        createdAt: now,
        updatedAt: now,
      },
    },
    { status: 201 },
  )
}
