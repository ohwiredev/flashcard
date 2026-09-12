import { extractFileKey } from '../../../../lib/images'
import { paramString } from '../../../../lib/params'
import { errorResponse, json } from '../../../../lib/response'
import type { AppData, Env } from '../../../../lib/types'
import { getUTApi } from '../../../../lib/uploadthing'

interface CardOwnershipRow {
  id: string
  front_image: string | null
  back_image: string | null
}

async function findOwnedCard(
  env: Env,
  userId: string,
  deckId: string,
  cardId: string,
): Promise<CardOwnershipRow | null> {
  const row = await env.DB.prepare(
    `SELECT cards.id as id, cards.front_image as front_image, cards.back_image as back_image
     FROM cards JOIN decks ON decks.id = cards.deck_id
     WHERE cards.id = ? AND cards.deck_id = ? AND decks.user_id = ?`,
  )
    .bind(cardId, deckId, userId)
    .first<CardOwnershipRow>()
  return row ?? null
}

export const onRequestPatch: PagesFunction<Env, 'deckId' | 'cardId', AppData> = async ({
  request,
  env,
  data,
  params,
}) => {
  if (!data.user) return errorResponse('Not signed in.', 401)
  const deckId = paramString(params.deckId)
  const cardId = paramString(params.cardId)

  const existing = await findOwnedCard(env, data.user.id, deckId, cardId)
  if (!existing) return errorResponse('Card not found.', 404)

  const body = (await request.json().catch(() => null)) as
    | { front?: string; back?: string; frontImage?: string | null; backImage?: string | null }
    | null
  if (!body) return errorResponse('Invalid request body.')

  const front = body.front !== undefined ? body.front.trim() : undefined
  const back = body.back !== undefined ? body.back.trim() : undefined

  const staleKeys: string[] = []
  if (body.frontImage !== undefined && body.frontImage !== existing.front_image) {
    const stale = extractFileKey(existing.front_image)
    if (stale) staleKeys.push(stale)
  }
  if (body.backImage !== undefined && body.backImage !== existing.back_image) {
    const stale = extractFileKey(existing.back_image)
    if (stale) staleKeys.push(stale)
  }

  const now = Date.now()
  await env.DB.batch([
    env.DB
      .prepare(
        `UPDATE cards SET
           front = COALESCE(?, front),
           back = COALESCE(?, back),
           front_image = CASE WHEN ? THEN ? ELSE front_image END,
           back_image = CASE WHEN ? THEN ? ELSE back_image END,
           updated_at = ?
         WHERE id = ?`,
      )
      .bind(
        front ?? null,
        back ?? null,
        body.frontImage !== undefined ? 1 : 0,
        body.frontImage || null,
        body.backImage !== undefined ? 1 : 0,
        body.backImage || null,
        now,
        cardId,
      ),
    env.DB.prepare('UPDATE decks SET updated_at = ? WHERE id = ?').bind(now, deckId),
  ])

  if (staleKeys.length > 0) await getUTApi(env).deleteFiles(staleKeys)

  return json({ ok: true })
}

export const onRequestDelete: PagesFunction<Env, 'deckId' | 'cardId', AppData> = async ({
  env,
  data,
  params,
}) => {
  if (!data.user) return errorResponse('Not signed in.', 401)
  const deckId = paramString(params.deckId)
  const cardId = paramString(params.cardId)

  const existing = await findOwnedCard(env, data.user.id, deckId, cardId)
  if (!existing) return errorResponse('Card not found.', 404)

  await env.DB.batch([
    env.DB.prepare('DELETE FROM cards WHERE id = ?').bind(cardId),
    env.DB.prepare('UPDATE decks SET updated_at = ? WHERE id = ?').bind(Date.now(), deckId),
  ])

  const keys = [extractFileKey(existing.front_image), extractFileKey(existing.back_image)].filter(
    (key): key is string => Boolean(key),
  )
  if (keys.length > 0) await getUTApi(env).deleteFiles(keys)

  return json({ ok: true })
}
