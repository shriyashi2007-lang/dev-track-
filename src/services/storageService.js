import { DEVTRACK_OWNED_KEYS } from '../data/constants'

/**
 * Service to interface safely with localStorage, schema versioning, and corrupted data resilience.
 */
class StorageService {
  getResult(key, fallback = null) {
    if (typeof window === 'undefined') return { value: fallback, error: null }
    try {
      const raw = localStorage.getItem(key)
      if (raw === null || raw === undefined) return { value: fallback, error: null }
      return { value: JSON.parse(raw), error: null }
    } catch (error) {
      console.warn(`[StorageService] Corrupted data encountered for key "${key}". Reverting to fallback.`, error)
      return { value: fallback, error }
    }
  }

  get(key, fallback = null) {
    return this.getResult(key, fallback).value
  }

  set(key, value) {
    if (typeof window === 'undefined') return false
    try {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch (err) {
      console.error(`[StorageService] Failed to write key "${key}" to localStorage. Storage quota may be exceeded.`, err)
      throw new Error('Storage quota exceeded or storage unavailable.')
    }
  }

  remove(key) {
    if (typeof window === 'undefined') return
    try {
      localStorage.removeItem(key)
    } catch (err) {
      console.error(`[StorageService] Failed to remove key "${key}".`, err)
    }
  }

  getStorageUsage() {
    if (typeof window === 'undefined') return { totalBytes: 0, formatted: '0 KB' }
    try {
      let total = 0
      DEVTRACK_OWNED_KEYS.forEach((key) => {
        const value = localStorage.getItem(key)
        if (value !== null) total += (key.length + value.length) * 2
      })
      const kb = (total / 1024).toFixed(1)
      return { totalBytes: total, formatted: `${kb} KB` }
    } catch {
      return { totalBytes: 0, formatted: '0 KB' }
    }
  }

  clearAppStorage() {
    if (typeof window === 'undefined') return
    try {
      DEVTRACK_OWNED_KEYS.forEach((key) => localStorage.removeItem(key))
    } catch (err) {
      console.error('[StorageService] Error clearing app storage:', err)
    }
  }
}

export const storageService = new StorageService()
