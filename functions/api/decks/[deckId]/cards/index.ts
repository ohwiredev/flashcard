import { createId } from '../../../../lib/id'
import { paramString } from '../../../../lib/params'
import { errorResponse, json } from '../../../../lib/response'
import type { AppData, Env } from '../../../../lib/types'

export const onRequestPost: PagesFunction<Env, 'deckId', AppData> = async ({ request, env, data, params }) => {
  if (!data.user) return errorResponse('Not signed in.', 401)
  const deckId = paramString(params.deckId)

  const owned = await env.DB.prepare('SELECT id FROM decks WHERE id = ? AND user_id = ?')
    .bind(deckId, data.user.id)
    .first()
  if (!owned) return errorResponse('Deck not found.', 404)

  const body = (await request.json().catch(() => null)) as
    | { front?: string; back?: string; frontImage?: string; backImage?: string }
    | null
  const front = body?.front?.trim() ?? ''
  const back = body?.back?.trim() ?? ''
  if (!front && !body?.frontImage) return errorResponse('Add a front side or a front image.')
  if (!back) return errorResponse('Add a back side.')

  const countRow = await env.DB.prepare('SELECT COUNT(*) as count FROM cards WHERE deck_id = ?')
    .bind(deckId)
    .first<{ count: number }>()
  const position = countRow?.count ?? 0

  const now = Date.now()
  const id = createId()
  await env.DB.batch([
    env.DB
      .prepare(
        `INSERT INTO cards (id, deck_id, front, back, front_image, back_image, position, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(id, deckId, front, back, body?.frontImage || null, body?.backImage || null, position, now, now),
    env.DB.prepare('UPDATE decks SET updated_at = ? WHERE id = ?').bind(now, deckId),
  ])

  return json(
    {
      card: {
        id,
        front,
        back,
        frontImage: body?.frontImage || undefined,
        backImage: body?.backImage || undefined,
        createdAt: now,
        updatedAt: now,
      },
    },
    { status: 201 },
  )
}
