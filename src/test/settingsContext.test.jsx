import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { SettingsProvider, useSettings } from '../context/SettingsContext'

function SettingsProbe() {
  const { settings, storageError } = useSettings()
  return <p>{settings.theme}:{storageError ? 'storage-error' : 'ok'}</p>
}

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

  it('exposes corrupted settings without erasing the saved value', () => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })))
    localStorage.setItem('devtrack:v1:settings', '{broken')
    render(<SettingsProvider><SettingsProbe /></SettingsProvider>)

    expect(screen.getByText('dark:storage-error')).toBeInTheDocument()
    expect(localStorage.getItem('devtrack:v1:settings')).toBe('{broken')
  })
})
