import { API_BASE_URL } from './config'

export class ApiError extends Error {
  status: number
  bodyText?: string

  constructor(message: string, status: number, bodyText?: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.bodyText = bodyText
  }
}

type ApiOptions = RequestInit & { json?: unknown }

export async function apiRequest<T>(
  path: string,
  options: ApiOptions = {},
  token?: string | null,
  onUnauthorized?: () => void,
): Promise<T> {
  const url = path.startsWith('http')
    ? path
    : `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`

  const headers = new Headers(options.headers)

  if (options.json !== undefined) {
    headers.set('Content-Type', 'application/json')
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const res = await fetch(url, {
    ...options,
    headers,
    body:
      options.json !== undefined ? JSON.stringify(options.json) : options.body,
  })

  if (res.status === 401) {
    onUnauthorized?.()
    const bodyText = await res.text().catch(() => undefined)
    throw new ApiError('Unauthorized', 401, bodyText)
  }

  if (!res.ok) {
    const bodyText = await res.text().catch(() => undefined)
    throw new ApiError(bodyText || `Request failed (${res.status})`, res.status, bodyText)
  }

  const contentType = res.headers.get('content-type') || ''
  if (contentType.includes('application/json')) {
    return (await res.json()) as T
  }

  return (await res.text()) as T
}
