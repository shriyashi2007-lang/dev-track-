import React, { createContext, useCallback, useContext, useState, useEffect } from 'react'
import { settingsService } from '../services/settingsService'
import { STORAGE_KEYS } from '../data/constants'

const SettingsContext = createContext(null)

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => settingsService.getSettings())

  const refreshSettings = useCallback(() => {
    const next = settingsService.getSettings()
    setSettings(next)
    settingsService.applyToDOM(next)
    return next
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

  const updateSettings = (updates) => {
    const updated = settingsService.updateSettings(updates)
    setSettings(updated)
    return updated
  }

  const resetSettings = () => {
    const defaults = settingsService.resetSettings()
    setSettings(defaults)
    return defaults
  }

  const toggleTheme = () => {
    const nextTheme = settings.theme === 'dark' ? 'light' : 'dark'
    updateSettings({ theme: nextTheme })
  }

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        resetSettings,
        toggleTheme,
        refreshSettings,
      }}
    >
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
