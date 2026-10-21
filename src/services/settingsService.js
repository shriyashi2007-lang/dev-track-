import { storageService } from './storageService'
import { STORAGE_KEYS, DEFAULT_SETTINGS } from '../data/constants'

class SettingsService {
  getSettings() {
    const stored = storageService.get(STORAGE_KEYS.SETTINGS, null)
    return { ...DEFAULT_SETTINGS, ...(stored || {}) }
  }

  updateSettings(updates) {
    const current = this.getSettings()
    const merged = { ...current, ...updates }
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
