import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useDebounce } from '../hooks/useDebounce'

describe('useDebounce', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('delays changed values until the configured interval', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'first', delay: 250 } }
    )

    rerender({ value: 'second', delay: 250 })
    expect(result.current).toBe('first')

    act(() => vi.advanceTimersByTime(249))
    expect(result.current).toBe('first')

    act(() => vi.advanceTimersByTime(1))
    expect(result.current).toBe('second')
  })

  it('cancels the prior timer when the value changes again', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 100),
      { initialProps: { value: 'one' } }
    )

    rerender({ value: 'two' })
    act(() => vi.advanceTimersByTime(50))
    rerender({ value: 'three' })
    act(() => vi.advanceTimersByTime(50))
    expect(result.current).toBe('one')
    act(() => vi.advanceTimersByTime(50))
    expect(result.current).toBe('three')
  })
})
