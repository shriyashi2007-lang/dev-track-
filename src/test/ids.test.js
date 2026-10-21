import { afterEach, describe, expect, it, vi } from 'vitest'
import { generateId } from '../utils/ids'

describe('ID generation', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('uses the platform UUID implementation when available', () => {
    const randomUUID = vi.fn(() => 'platform-generated-id')
    vi.stubGlobal('crypto', { randomUUID })

    expect(generateId()).toBe('platform-generated-id')
    expect(randomUUID).toHaveBeenCalledOnce()
  })

  it('creates a valid version 4 UUID when the platform API is unavailable', () => {
    vi.stubGlobal('crypto', {})
    vi.spyOn(Math, 'random').mockReturnValue(0.5)

    expect(generateId()).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
    )
  })
})
