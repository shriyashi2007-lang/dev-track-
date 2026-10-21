import { renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useCountUp } from '../hooks/useCountUp'

vi.mock('../context/SettingsContext', () => ({
  useSettings: () => ({ settings: { reduceMotion: true } }),
}))

describe('useCountUp', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('jumps directly to the target when reduced motion is enabled', () => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false })))

    const { result, rerender } = renderHook(
      ({ target }) => useCountUp(target, 600),
      { initialProps: { target: 42 } }
    )
    expect(result.current).toBe(42)

    rerender({ target: 7 })
    expect(result.current).toBe(7)
  })
})
