import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { settingsService } from '../services/settingsService'

describe('settings service', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.className = ''
    document.documentElement.removeAttribute('data-theme')
    document.documentElement.removeAttribute('data-accent')
    document.documentElement.removeAttribute('data-reduce-motion')
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('merges stored settings with defaults', () => {
    localStorage.setItem('devtrack:v1:settings', JSON.stringify({ theme: 'light' }))

    expect(settingsService.getSettings()).toMatchObject({
      theme: 'light',
      accent: 'indigo',
      dailyGoal: 3,
    })
  })

  it('applies theme, accent, and motion settings to the document', () => {
    settingsService.applyToDOM({
      theme: 'dark',
      accent: 'emerald',
      reduceMotion: true,
    })

    expect(document.documentElement).toHaveClass('dark')
    expect(document.documentElement).not.toHaveClass('light')
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark')
    expect(document.documentElement).toHaveAttribute('data-accent', 'emerald')
    expect(document.documentElement).toHaveAttribute('data-reduce-motion', 'true')
  })

  it('resolves the system theme and clears reduced motion', () => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false })))

    settingsService.applyToDOM({
      theme: 'system',
      accent: 'indigo',
      reduceMotion: false,
    })

    expect(document.documentElement).toHaveClass('light')
    expect(document.documentElement).toHaveAttribute('data-theme', 'light')
    expect(document.documentElement).not.toHaveAttribute('data-reduce-motion')
  })
})
