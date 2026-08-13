const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

export class ApiError extends Error {
  constructor(message, { status, details } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

let unauthorizedHandler = null

/**
 * Registered once by AuthContext so a 401 from anywhere in the app can clear
 * the session and redirect to /login, without httpClient depending on React.
 */
export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler
}

function buildUrl(path, params) {
  const url = new URL(path.startsWith('http') ? path : `${BASE_URL}${path}`, window.location.origin)
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, value)
      }
    })
  }
  return url.toString()
}

async function parseResponse(res) {
  const contentType = res.headers.get('content-type') || ''
  if (contentType.includes('application/json')) {
    return res.json().catch(() => null)
  }
  return res.text().catch(() => null)
}

async function request(path, { method = 'GET', body, params, headers, signal } = {}) {
  // FormData (file uploads) must be sent as-is with no Content-Type header —
  // the browser sets the multipart boundary itself. Everything else is JSON.
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData

  let res
  try {
    res = await fetch(buildUrl(path, params), {
      method,
      credentials: 'include',
      headers: {
        ...(body !== undefined && !isFormData ? { 'Content-Type': 'application/json' } : {}),
        Accept: 'application/json',
        ...headers,
      },
      body: body === undefined ? undefined : isFormData ? body : JSON.stringify(body),
      signal,
    })
  } catch (networkError) {
    throw new ApiError('Serverga ulanib bo‘lmadi. Internetni yoki backend manzilini tekshiring.', {
      status: 0,
      details: networkError,
    })
  }

  const data = await parseResponse(res)

  if (res.status === 401) {
    unauthorizedHandler?.()
  }

  if (!res.ok) {
    const message = (data && (data.message || data.error)) || `So‘rov bajarilmadi (${res.status})`
    throw new ApiError(message, { status: res.status, details: data })
  }

  return data
}

export const httpClient = {
  get: (path, opts) => request(path, { ...opts, method: 'GET' }),
  post: (path, body, opts) => request(path, { ...opts, method: 'POST', body }),
  patch: (path, body, opts) => request(path, { ...opts, method: 'PATCH', body }),
  put: (path, body, opts) => request(path, { ...opts, method: 'PUT', body }),
  delete: (path, opts) => request(path, { ...opts, method: 'DELETE' }),
}
