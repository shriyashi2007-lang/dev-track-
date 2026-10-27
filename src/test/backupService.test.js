import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DEVTRACK_OWNED_KEYS, STORAGE_KEYS } from '../data/constants'
import { applyPlanToStorage, clearOwnedStorage, downloadCurrentBackup, getOwnedStorageInfo } from '../services/backupService'
import { buildBackup, planImport, validateBackup } from '../utils/dataPortability'

class MemoryStorage {
  constructor(initial = {}) {
    this.values = new Map(Object.entries(initial))
    this.failNextSetFor = null
  }
  getItem(key) { return this.values.has(key) ? this.values.get(key) : null }
  setItem(key, value) {
    if (this.failNextSetFor === key) {
      this.failNextSetFor = null
      throw new globalThis.DOMException('Quota exceeded', 'QuotaExceededError')
    }
    this.values.set(key, String(value))
  }
  removeItem(key) { this.values.delete(key) }
}

function currentProblem(id) {
  return {
    id, title: id, platform: 'LeetCode', url: '', difficulty: 'Easy', topics: ['Arrays'],
    status: 'Solved', solvedDate: '2026-10-25', timeTakenMinutes: null, notes: '',
    revision: { marked: false, priority: 'Medium', stage: 0, nextRevisionDate: null, revisionCount: 0, addedAt: null, updatedAt: null, lastRevisedDate: null, scheduleRepaired: false },
    createdAt: null, updatedAt: '2026-10-25T00:00:00Z', isSample: false,
  }
}

const settings = { displayName: 'Developer', theme: 'dark', accent: 'indigo', dailyGoal: 3, revisionIntervals: [1, 3, 7, 14, 30], pageSize: 25, reduceMotion: false, confetti: true, onboardingCompleted: false, usingSampleData: false }

describe('backup storage orchestration', () => {
  let adapter
  beforeEach(() => {
    adapter = new MemoryStorage({
      [STORAGE_KEYS.PROBLEMS]: JSON.stringify([currentProblem('old')]),
      [STORAGE_KEYS.REVISION_HISTORY]: '[]',
      [STORAGE_KEYS.SETTINGS]: JSON.stringify(settings),
      [STORAGE_KEYS.RECENT_SEARCHES]: '[]',
      [STORAGE_KEYS.DEMO_AUTH]: JSON.stringify({ email: 'private@example.com' }),
      'unrelated:key': 'keep me',
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('applies and verifies all portable keys without changing auth or unrelated data', () => {
    const imported = validateBackup(buildBackup({ problems: [currentProblem('new')], revisionHistory: [], settings, recentSearches: [] })).backup
    const plan = planImport({ problems: [currentProblem('old')], revisionHistory: [], settings, recentSearches: [] }, imported, { mode: 'replace' })
    expect(applyPlanToStorage(plan, adapter)).toEqual({ ok: true, rollbackSucceeded: null })
    expect(JSON.parse(adapter.getItem(STORAGE_KEYS.PROBLEMS))[0].id).toBe('new')
    expect(adapter.getItem(STORAGE_KEYS.DEMO_AUTH)).toContain('private@example.com')
    expect(adapter.getItem('unrelated:key')).toBe('keep me')
  })

  it('rolls back and verifies previous raw values after a simulated quota failure', () => {
    const before = new Map([...adapter.values])
    const imported = validateBackup(buildBackup({ problems: [currentProblem('new')], revisionHistory: [], settings, recentSearches: [] })).backup
    const plan = planImport({ problems: [currentProblem('old')], revisionHistory: [], settings, recentSearches: [] }, imported, { mode: 'replace' })
    adapter.failNextSetFor = STORAGE_KEYS.SETTINGS
    const result = applyPlanToStorage(plan, adapter)
    expect(result).toMatchObject({ ok: false, rollbackSucceeded: true })
    expect(adapter.values).toEqual(before)
  })

  it('clears exactly the owned key list and preserves unrelated storage', () => {
    const result = clearOwnedStorage(adapter)
    expect(result.ok).toBe(true)
    DEVTRACK_OWNED_KEYS.forEach((key) => expect(adapter.getItem(key)).toBeNull())
    expect(adapter.getItem('unrelated:key')).toBe('keep me')
  })

  it('reports exact owned storage usage without counting unrelated keys', () => {
    const info = getOwnedStorageInfo(adapter)
    expect(info.keys.map((item) => item.key)).toEqual(DEVTRACK_OWNED_KEYS)
    expect(info.keys.find((item) => item.key === STORAGE_KEYS.DEMO_AUTH)?.portable).toBe(false)
    expect(info.totalBytes).toBeGreaterThan(0)
  })

  it('downloads the current versioned schema with a local timestamped filename', () => {
    const click = vi.spyOn(window.HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    const createObjectURL = vi.fn(() => 'blob:devtrack-backup')
    const revokeObjectURL = vi.fn()
    vi.stubGlobal('URL', { createObjectURL, revokeObjectURL })

    const result = downloadCurrentBackup(
      { problems: [currentProblem('downloaded')], revisionHistory: [], settings },
      { adapter, date: new Date(2026, 9, 26, 9, 5) }
    )

    expect(result.downloaded).toBe(true)
    expect(result.filename).toBe('devtrack-backup-2026-10-26-0905.json')
    expect(result.backup).toMatchObject({ app: 'DevTrack', schemaVersion: 1, counts: { problems: 1 } })
    expect(click).toHaveBeenCalledOnce()
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:devtrack-backup')
  })
})
