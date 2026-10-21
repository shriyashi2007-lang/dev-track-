import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useMediaQuery } from '../hooks/useMediaQuery'

describe('useMediaQuery', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('tracks media-query changes and removes its listener', () => {
    let matches = false
    let listener
    const addEventListener = vi.fn((_event, callback) => {
      listener = callback
    })
    const removeEventListener = vi.fn()
    const matchMedia = vi.fn(() => ({
      get matches() {
        return matches
      },
      addEventListener,
      removeEventListener,
    }))
    vi.stubGlobal('matchMedia', matchMedia)

    const { result, unmount } = renderHook(() => useMediaQuery('(min-width: 768px)'))
    expect(result.current).toBe(false)
    expect(addEventListener).toHaveBeenCalledWith('change', expect.any(Function))

    matches = true
    act(() => listener())
    expect(result.current).toBe(true)

    unmount()
    expect(removeEventListener).toHaveBeenCalledWith('change', listener)
  })
})
