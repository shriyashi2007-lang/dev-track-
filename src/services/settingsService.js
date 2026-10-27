import { storageService } from './storageService'
import { ACCENTS, STORAGE_KEYS, DEFAULT_SETTINGS } from '../data/constants'

const THEMES = new Set(['light', 'dark', 'system'])
const ACCENT_IDS = new Set(ACCENTS.map((accent) => accent.id))
const PAGE_SIZES = new Set([10, 25, 50])

function isRecord(value) {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

export function normalizeSettings(value) {
  const source = isRecord(value) ? value : {}
  const displayName = typeof source.displayName === 'string' && source.displayName.trim()
    ? source.displayName.trim().slice(0, 80)
    : DEFAULT_SETTINGS.displayName
  const dailyGoal = Number.isInteger(source.dailyGoal) && source.dailyGoal >= 1 && source.dailyGoal <= 100
    ? source.dailyGoal
    : DEFAULT_SETTINGS.dailyGoal
  const revisionIntervals = Array.isArray(source.revisionIntervals)
    && source.revisionIntervals.length > 0
    && source.revisionIntervals.every((interval) => Number.isInteger(interval) && interval >= 1 && interval <= 365)
    ? [...source.revisionIntervals]
    : [...DEFAULT_SETTINGS.revisionIntervals]

  return {
    ...DEFAULT_SETTINGS,
    ...source,
    displayName,
    theme: THEMES.has(source.theme) ? source.theme : DEFAULT_SETTINGS.theme,
    accent: ACCENT_IDS.has(source.accent) ? source.accent : DEFAULT_SETTINGS.accent,
    dailyGoal,
    revisionIntervals,
    pageSize: PAGE_SIZES.has(source.pageSize) ? source.pageSize : DEFAULT_SETTINGS.pageSize,
    reduceMotion: typeof source.reduceMotion === 'boolean' ? source.reduceMotion : DEFAULT_SETTINGS.reduceMotion,
    confetti: typeof source.confetti === 'boolean' ? source.confetti : DEFAULT_SETTINGS.confetti,
    onboardingCompleted: typeof source.onboardingCompleted === 'boolean' ? source.onboardingCompleted : DEFAULT_SETTINGS.onboardingCompleted,
    usingSampleData: typeof source.usingSampleData === 'boolean' ? source.usingSampleData : DEFAULT_SETTINGS.usingSampleData,
  }
}

class SettingsService {
  getSettingsWithMeta() {
    const result = storageService.getResult(STORAGE_KEYS.SETTINGS, null)
    if (result.error) return { settings: normalizeSettings(null), error: result.error }
    if (result.value === null) return { settings: normalizeSettings(null), error: null }
    if (!isRecord(result.value)) {
      return { settings: normalizeSettings(null), error: new Error('Saved settings are not an object.') }
    }
    return { settings: normalizeSettings(result.value), error: null }
  }

  getSettings() {
    return this.getSettingsWithMeta().settings
  }

  updateSettings(updates) {
    const current = this.getSettings()
    const merged = normalizeSettings({ ...current, ...updates })
    storageService.set(STORAGE_KEYS.SETTINGS, merged)
    this.applyToDOM(merged)
    return merged
  }

  resetSettings() {
    storageService.set(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS)
    this.applyToDOM(DEFAULT_SETTINGS)
    return DEFAULT_SETTINGS
  }

  applyToDOM(settings) {
    if (typeof document === 'undefined') return

    // Theme (dark / light / system)
    let effectiveTheme = settings.theme
    if (effectiveTheme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      effectiveTheme = prefersDark ? 'dark' : 'light'
    }

    if (effectiveTheme === 'dark') {
      document.documentElement.classList.add('dark')
      document.documentElement.classList.remove('light')
    } else {
      document.documentElement.classList.add('light')
      document.documentElement.classList.remove('dark')
    }
    document.documentElement.setAttribute('data-theme', effectiveTheme)

    // Accent
    document.documentElement.setAttribute('data-accent', settings.accent || 'indigo')

    // Reduced motion override
    if (settings.reduceMotion) {
      document.documentElement.setAttribute('data-reduce-motion', 'true')
    } else {
      document.documentElement.removeAttribute('data-reduce-motion')
    }
  }
}

export const settingsService = new SettingsService()
