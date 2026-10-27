import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { normalizeSettings, settingsService } from '../services/settingsService'

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

  it('normalizes malformed legacy fields in memory without rewriting storage', () => {
    const raw = JSON.stringify({
      displayName: '  Legacy User  ', theme: 'sepia', accent: 'unknown', dailyGoal: 0,
      revisionIntervals: ['1', 3], pageSize: 999, reduceMotion: 'false', customFutureField: 'keep',
    })
    localStorage.setItem('devtrack:v1:settings', raw)

    expect(settingsService.getSettings()).toMatchObject({
      displayName: 'Legacy User', theme: 'dark', accent: 'indigo', dailyGoal: 3,
      revisionIntervals: [1, 3, 7, 14, 30], pageSize: 25, reduceMotion: false,
      customFutureField: 'keep',
    })
    expect(localStorage.getItem('devtrack:v1:settings')).toBe(raw)
    expect(normalizeSettings(null)).toMatchObject({ theme: 'dark', dailyGoal: 3 })
  })

  it('reports corrupted settings while preserving the original raw value', () => {
    localStorage.setItem('devtrack:v1:settings', '{broken')
    const result = settingsService.getSettingsWithMeta()

    expect(result.settings).toMatchObject({ theme: 'dark', dailyGoal: 3 })
    expect(result.error).toBeInstanceOf(Error)
    expect(localStorage.getItem('devtrack:v1:settings')).toBe('{broken')
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
