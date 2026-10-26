import { act, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { SettingsProvider } from '../context/SettingsContext'

describe('SettingsProvider theme synchronization', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.className = ''
  })

  afterEach(() => vi.unstubAllGlobals())

  it('reacts live when the operating-system theme changes', () => {
    let prefersDark = false
    let listener
    vi.stubGlobal('matchMedia', vi.fn(() => ({
      get matches() { return prefersDark },
      addEventListener: (_event, callback) => { listener = callback },
      removeEventListener: vi.fn(),
    })))
    localStorage.setItem('devtrack:v1:settings', JSON.stringify({ theme: 'system' }))
    render(<SettingsProvider><div>Settings child</div></SettingsProvider>)
    expect(document.documentElement).toHaveAttribute('data-theme', 'light')
    act(() => {
      prefersDark = true
      listener()
    })
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark')
  })

  it('refreshes settings after a cross-tab storage event', () => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })))
    render(<SettingsProvider><div>Settings child</div></SettingsProvider>)
    localStorage.setItem('devtrack:v1:settings', JSON.stringify({ theme: 'light' }))
    act(() => window.dispatchEvent(new globalThis.StorageEvent('storage', { key: 'devtrack:v1:settings' })))
    expect(document.documentElement).toHaveAttribute('data-theme', 'light')
  })
})
