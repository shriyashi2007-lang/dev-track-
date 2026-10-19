import React, { createContext, useContext, useState, useEffect } from 'react'
import { settingsService } from '../services/settingsService'

const SettingsContext = createContext(null)

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => settingsService.getSettings())

  useEffect(() => {
    settingsService.applyToDOM(settings)
  }, [settings])

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
