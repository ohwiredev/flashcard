import { extractFileKey } from '../../../lib/images'
import { paramString } from '../../../lib/params'
import { errorResponse, json } from '../../../lib/response'
import type { AppData, Env } from '../../../lib/types'
import { getUTApi } from '../../../lib/uploadthing'

export const onRequestPatch: PagesFunction<Env, 'deckId', AppData> = async ({ request, env, data, params }) => {
  if (!data.user) return errorResponse('Not signed in.', 401)
  const deckId = paramString(params.deckId)

  const owned = await env.DB.prepare('SELECT id FROM decks WHERE id = ? AND user_id = ?')
    .bind(deckId, data.user.id)
    .first()
  if (!owned) return errorResponse('Deck not found.', 404)

  const body = (await request.json().catch(() => null)) as { name?: string; description?: string } | null
  const name = body?.name?.trim()
  if (!name) return errorResponse('Deck name is required.')

  const now = Date.now()
  await env.DB.prepare('UPDATE decks SET name = ?, description = ?, updated_at = ? WHERE id = ?')
    .bind(name, body?.description?.trim() || null, now, deckId)
    .run()

  return json({ ok: true })
}

export const onRequestDelete: PagesFunction<Env, 'deckId', AppData> = async ({ env, data, params }) => {
  if (!data.user) return errorResponse('Not signed in.', 401)
  const deckId = paramString(params.deckId)

  const owned = await env.DB.prepare('SELECT id FROM decks WHERE id = ? AND user_id = ?')
    .bind(deckId, data.user.id)
    .first()
  if (!owned) return errorResponse('Deck not found.', 404)

  const { results } = await env.DB.prepare('SELECT front_image, back_image FROM cards WHERE deck_id = ?')
    .bind(deckId)
    .all<{ front_image: string | null; back_image: string | null }>()

  const keys = results
    .flatMap((row) => [extractFileKey(row.front_image), extractFileKey(row.back_image)])
    .filter((key): key is string => Boolean(key))

  await env.DB.batch([
    env.DB.prepare('DELETE FROM cards WHERE deck_id = ?').bind(deckId),
    env.DB.prepare('DELETE FROM decks WHERE id = ?').bind(deckId),
  ])

  if (keys.length > 0) await getUTApi(env).deleteFiles(keys)

  return json({ ok: true })
}
