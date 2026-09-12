export function json(data: unknown, init: ResponseInit = {}): Response {
  const headers = new Headers(init.headers)
  headers.set('content-type', 'application/json')
  return new Response(JSON.stringify(data), { ...init, headers })
}

export function errorResponse(message: string, status = 400, headers?: HeadersInit): Response {
  return json({ error: message }, { status, headers })
}
