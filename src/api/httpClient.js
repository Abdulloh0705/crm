import { ApiError } from './ApiError'
import { formatError } from '../utils/formatError'
import { handleDemoRequest } from './demoEngine'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

export { ApiError }

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
    // A deliberate cancellation (AbortController) is not "no backend" — let
    // it propagate so callers (e.g. GlobalSearch) keep ignoring it as usual.
    if (networkError?.name === 'AbortError') throw networkError
    // No real backend reachable at all — fall back to the in-browser demo
    // data engine (see demoEngine.js) instead of surfacing a raw network
    // error to the user.
    return handleDemoRequest({ method, path, body, params })
  }

  // Vercel's own platform-level error page (undeployed/unreachable /api/*
  // route) always sets this header — and, depending on the request's Accept
  // header, can render its body as either text/plain OR
  // application/json (e.g. {"error":{"code":"404",...}}), so a content-type
  // check alone isn't reliable. This header is never present on a real
  // response from our Express app, so it's a safe, unambiguous signal.
  const isVercelPlatformError = res.headers.has('x-vercel-error')

  const contentType = res.headers.get('content-type') || ''
  if (isVercelPlatformError || !contentType.includes('application/json')) {
    // Something answered, but it isn't our JSON API — most commonly a
    // static host's SPA fallback (index.html) or a platform error page for
    // an undeployed /api/* route. Treat exactly like "no backend reachable"
    // rather than handing HTML/plain-text to callers that expect JSON.
    return handleDemoRequest({ method, path, body, params })
  }

  const data = await res.json().catch(() => null)

  if (res.status === 401) {
    unauthorizedHandler?.()
  }

  if (!res.ok) {
    throw new ApiError(formatError(data, `So‘rov bajarilmadi (${res.status})`), { status: res.status, details: data })
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
