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
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i)
        if (k && k.startsWith('devtrack:')) {
          const v = localStorage.getItem(k)
          total += (k.length + (v ? v.length : 0)) * 2 // UTF-16 approx 2 bytes per char
        }
      }
      const kb = (total / 1024).toFixed(1)
      return { totalBytes: total, formatted: `${kb} KB` }
    } catch {
      return { totalBytes: 0, formatted: '0 KB' }
    }
  }

  clearAppStorage() {
    if (typeof window === 'undefined') return
    try {
      const keysToRemove = []
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i)
        if (k && k.startsWith('devtrack:')) {
          keysToRemove.push(k)
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k))
    } catch (err) {
      console.error('[StorageService] Error clearing app storage:', err)
    }
  }
}

export const storageService = new StorageService()
