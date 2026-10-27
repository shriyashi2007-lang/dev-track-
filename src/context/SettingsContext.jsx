import React, { createContext, useCallback, useContext, useMemo, useState, useEffect } from 'react'
import { settingsService } from '../services/settingsService'
import { STORAGE_KEYS } from '../data/constants'

const SettingsContext = createContext(null)

export function SettingsProvider({ children }) {
  const [state, setState] = useState(() => settingsService.getSettingsWithMeta())
  const { settings, error: storageError } = state

  const refreshSettings = useCallback(() => {
    const next = settingsService.getSettingsWithMeta()
    setState(next)
    settingsService.applyToDOM(next.settings)
    return next.settings
  }, [])

  useEffect(() => {
    settingsService.applyToDOM(settings)
    if (settings.theme !== 'system' || typeof window.matchMedia !== 'function') return undefined
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => settingsService.applyToDOM(settings)
    media.addEventListener?.('change', handleChange)
    return () => media.removeEventListener?.('change', handleChange)
  }, [settings])

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key === STORAGE_KEYS.SETTINGS) refreshSettings()
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [refreshSettings])

  const updateSettings = useCallback((updates) => {
    const updated = settingsService.updateSettings(updates)
    setState({ settings: updated, error: null })
    return updated
  }, [])

  const resetSettings = useCallback(() => {
    const defaults = settingsService.resetSettings()
    setState({ settings: defaults, error: null })
    return defaults
  }, [])

  const toggleTheme = useCallback(() => {
    const nextTheme = settings.theme === 'dark' ? 'light' : 'dark'
    updateSettings({ theme: nextTheme })
  }, [settings.theme, updateSettings])

  const value = useMemo(() => ({
    settings,
    storageError,
    updateSettings,
    resetSettings,
    toggleTheme,
    refreshSettings,
  }), [refreshSettings, resetSettings, settings, storageError, toggleTheme, updateSettings])

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}
