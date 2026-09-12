export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

async function extractErrorMessage(response: Response): Promise<string | null> {
  try {
    const data = (await response.json()) as { error?: string }
    return data.error ?? null
  } catch {
    return null
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      ...(init?.body ? { 'content-type': 'application/json' } : {}),
      ...init?.headers,
    },
  })

  if (!response.ok) {
    throw new ApiError((await extractErrorMessage(response)) || `Request failed (${response.status})`, response.status)
  }
  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

export function apiGet<T>(path: string): Promise<T> {
  return request<T>(path)
}

export function apiPost<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, { method: 'POST', body: body !== undefined ? JSON.stringify(body) : undefined })
}

export function apiPatch<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, { method: 'PATCH', body: body !== undefined ? JSON.stringify(body) : undefined })
}

export function apiDelete<T>(path: string): Promise<T> {
  return request<T>(path, { method: 'DELETE' })
}

export async function uploadImage(blob: Blob): Promise<string> {
  const response = await fetch('/api/images', {
    method: 'POST',
    credentials: 'include',
    headers: { 'content-type': blob.type },
    body: blob,
  })
  if (!response.ok) {
    throw new ApiError((await extractErrorMessage(response)) || 'Could not upload that image.', response.status)
  }
  const data = (await response.json()) as { url: string }
  return data.url
}
