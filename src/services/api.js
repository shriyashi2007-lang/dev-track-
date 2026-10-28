const DEFAULT_API_BASE_URL = 'http://localhost:5000'

export function normalizeApiBaseUrl(value) {
  const candidate = value?.trim() || DEFAULT_API_BASE_URL

  try {
    const url = new URL(candidate)
    if (!['http:', 'https:'].includes(url.protocol)) return DEFAULT_API_BASE_URL
    return url.toString().replace(/\/+$/, '')
  } catch {
    return DEFAULT_API_BASE_URL
  }
}

export const API_BASE_URL = normalizeApiBaseUrl(import.meta.env.VITE_API_BASE_URL)

class ApiRequestError extends Error {
  constructor(code, message, status) {
    super(message)
    this.name = 'ApiRequestError'
    this.code = code
    this.status = status
  }
}

export async function request(path, { timeoutMs = 5000, signal, ...options } = {}) {
  const controller = new AbortController()
  let didTimeout = false
  const abortFromCaller = () => controller.abort()
  signal?.addEventListener('abort', abortFromCaller, { once: true })

  const timeoutId = setTimeout(() => {
    didTimeout = true
    controller.abort()
  }, timeoutMs)

  try {
    const response = await fetch(`${API_BASE_URL}/${path.replace(/^\/+/, '')}`, {
      ...options,
      signal: controller.signal,
    })

    if (!response.ok) {
      throw new ApiRequestError('HTTP_ERROR', `API request returned ${response.status}`, response.status)
    }

    try {
      return await response.json()
    } catch {
      throw new ApiRequestError('INVALID_RESPONSE', 'API response was not valid JSON')
    }
  } catch (error) {
    if (didTimeout) throw new ApiRequestError('TIMEOUT', 'API request timed out')
    if (signal?.aborted) throw new ApiRequestError('CANCELLED', 'API request was cancelled')
    if (error instanceof ApiRequestError) throw error
    throw new ApiRequestError('NETWORK_ERROR', 'API is unreachable')
  } finally {
    clearTimeout(timeoutId)
    signal?.removeEventListener('abort', abortFromCaller)
  }
}

function isValidHealthResponse(value) {
  if (!value || value.success !== true || value.status !== 'ok' || value.service !== 'devtrack-api') {
    return false
  }

  const parsedTimestamp = Date.parse(value.timestamp)
  return Number.isFinite(parsedTimestamp) && new Date(parsedTimestamp).toISOString() === value.timestamp
}

export async function checkHealth(options = {}) {
  try {
    const data = await request('/api/health', options)

    if (!isValidHealthResponse(data)) {
      return { connected: false, reason: 'invalid-response' }
    }

    return { connected: true, data }
  } catch (error) {
    const reasons = {
      TIMEOUT: 'timeout',
      CANCELLED: 'cancelled',
      HTTP_ERROR: 'http-error',
      INVALID_RESPONSE: 'invalid-response',
      NETWORK_ERROR: 'unreachable',
    }

    return {
      connected: false,
      reason: reasons[error.code] || 'unreachable',
    }
  }
}
