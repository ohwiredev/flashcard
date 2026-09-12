import { onRequest as withSessionUser } from './api/_middleware'
import * as authLogin from './api/auth/login'
import * as authLogout from './api/auth/logout'
import * as authMe from './api/auth/me'
import * as cardDetail from './api/decks/[deckId]/cards/[cardId]'
import * as cardCollection from './api/decks/[deckId]/cards/index'
import * as deckDetail from './api/decks/[deckId]/index'
import * as deckCollection from './api/decks/index'
import * as images from './api/images/index'
import { errorResponse } from './lib/response'
import type { AppData, Env } from './lib/types'

/**
 * The route modules keep the Pages Functions shape (`onRequestGet` and friends), but the app is
 * deployed as a Worker with static assets, so this entry point supplies the file-based routing and
 * the middleware chain that Pages used to provide.
 */
type RouteHandler = PagesFunction<Env, string, AppData>

type RouteModule = {
  readonly [key in `onRequest${'' | 'Get' | 'Post' | 'Patch' | 'Put' | 'Delete' | 'Head' | 'Options'}`]?: RouteHandler
}

interface Route {
  segments: string[]
  module: RouteModule
}

const METHOD_EXPORTS: Record<string, keyof RouteModule> = {
  GET: 'onRequestGet',
  POST: 'onRequestPost',
  PATCH: 'onRequestPatch',
  PUT: 'onRequestPut',
  DELETE: 'onRequestDelete',
  HEAD: 'onRequestHead',
  OPTIONS: 'onRequestOptions',
}

function route(pattern: string, module: RouteModule): Route {
  return { segments: pattern.split('/').filter(Boolean), module }
}

const ROUTES: Route[] = [
  route('/api/auth/login', authLogin),
  route('/api/auth/logout', authLogout),
  route('/api/auth/me', authMe),
  route('/api/decks', deckCollection),
  route('/api/decks/:deckId', deckDetail),
  route('/api/decks/:deckId/cards', cardCollection),
  route('/api/decks/:deckId/cards/:cardId', cardDetail),
  route('/api/images', images),
]

interface RouteMatch {
  module: RouteModule
  params: Record<string, string>
}

function matchRoute(pathname: string): RouteMatch | null {
  const segments = pathname.split('/').filter(Boolean)

  for (const candidate of ROUTES) {
    if (candidate.segments.length !== segments.length) continue

    const params: Record<string, string> = {}
    let matched = true
    for (let i = 0; i < segments.length; i++) {
      const pattern = candidate.segments[i]
      if (pattern.startsWith(':')) {
        params[pattern.slice(1)] = decodeURIComponent(segments[i])
      } else if (pattern !== segments[i]) {
        matched = false
        break
      }
    }
    if (matched) return { module: candidate.module, params }
  }

  return null
}

function methodNotAllowed(module: RouteModule): Response {
  const allowed = Object.entries(METHOD_EXPORTS)
    .filter(([, exportName]) => module[exportName])
    .map(([method]) => method)
  return errorResponse('Method not allowed.', 405, { Allow: allowed.join(', ') })
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    const pathname = url.pathname.length > 1 ? url.pathname.replace(/\/+$/, '') : url.pathname

    // `run_worker_first` limits the Worker to `/api/*`, but stay well-behaved if that ever widens.
    if (pathname !== '/api' && !pathname.startsWith('/api/')) return env.ASSETS.fetch(request)

    const match = matchRoute(pathname)
    if (!match) return errorResponse('Not found.', 404)

    const handler = match.module[METHOD_EXPORTS[request.method]] ?? match.module.onRequest

    const context: EventContext<Env, string, AppData> = {
      request,
      functionPath: pathname,
      env,
      params: match.params,
      data: { user: null },
      waitUntil: (promise) => ctx.waitUntil(promise),
      passThroughOnException: () => ctx.passThroughOnException(),
      next: async () => (handler ? handler(context) : methodNotAllowed(match.module)),
    }

    return withSessionUser(context)
  },
} satisfies ExportedHandler<Env & { ASSETS: Fetcher }>
