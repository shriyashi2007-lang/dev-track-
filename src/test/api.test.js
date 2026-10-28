import { afterEach, describe, expect, it, vi } from 'vitest'
import { checkHealth } from '../services/api'

const healthyPayload = {
  success: true,
  status: 'ok',
  service: 'devtrack-api',
  timestamp: '2026-10-27T12:00:00.000Z',
}

function jsonResponse(body, { ok = true, status = 200 } = {}) {
  return {
    ok,
    status,
    json: vi.fn().mockResolvedValue(body),
  }
}

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('checkHealth', () => {
  it('returns a connected result for a valid health response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(healthyPayload)))

    await expect(checkHealth()).resolves.toEqual({ connected: true, data: healthyPayload })
  })

  it('normalizes non-OK and malformed responses', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(jsonResponse({}, { ok: false, status: 503 }))
      .mockResolvedValueOnce(jsonResponse({ success: true, status: 'wrong' })))

    await expect(checkHealth()).resolves.toEqual({ connected: false, reason: 'http-error' })
    await expect(checkHealth()).resolves.toEqual({ connected: false, reason: 'invalid-response' })
  })

  it('normalizes network failures', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('connection refused')))

    await expect(checkHealth()).resolves.toEqual({ connected: false, reason: 'unreachable' })
  })

  it('aborts and normalizes requests that exceed the timeout', async () => {
    vi.useFakeTimers()
    vi.stubGlobal('fetch', vi.fn((_url, { signal }) => new Promise((_resolve, reject) => {
      signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true })
    })))

    const result = checkHealth({ timeoutMs: 25 })
    await vi.advanceTimersByTimeAsync(25)

    await expect(result).resolves.toEqual({ connected: false, reason: 'timeout' })
  })
})
