import { describe, it, expect, beforeEach } from 'vitest'
import { storageService } from '../services/storageService'

describe('StorageService', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('stores and retrieves JSON objects', () => {
    const key = 'devtrack:test:key'
    storageService.set(key, { test: 123, name: 'Algo' })
    const retrieved = storageService.get(key, null)
    expect(retrieved).toEqual({ test: 123, name: 'Algo' })
  })

  it('handles non-existent key with fallback', () => {
    const res = storageService.get('devtrack:nonexistent', 'fallback-val')
    expect(res).toBe('fallback-val')
  })

  it('handles corrupted JSON in localStorage gracefully without throwing', () => {
    const key = 'devtrack:corrupted'
    localStorage.setItem(key, '{ invalid json string')
    const res = storageService.get(key, { safe: true })
    expect(res).toEqual({ safe: true })
  })

  it('removes keys cleanly', () => {
    const key = 'devtrack:remove'
    storageService.set(key, 'val')
    storageService.remove(key)
    expect(storageService.get(key, null)).toBeNull()
  })
})
