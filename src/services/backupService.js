import { DEVTRACK_OWNED_KEYS, DEVTRACK_PORTABLE_KEYS, STORAGE_KEYS } from '../data/constants'
import { applyPlan, buildBackup, exportProblemsCsv } from '../utils/dataPortability'
import { downloadText, localTimestampForFilename } from './downloadService'

const WRITE_KEYS = [STORAGE_KEYS.PROBLEMS, STORAGE_KEYS.REVISION_HISTORY, STORAGE_KEYS.SETTINGS, STORAGE_KEYS.RECENT_SEARCHES]

function getAdapter(adapter) {
  if (adapter) return adapter
  if (typeof window === 'undefined') throw new Error('Browser storage is unavailable.')
  return window.localStorage
}

function snapshotRaw(adapter, keys) {
  return new Map(keys.map((key) => [key, adapter.getItem(key)]))
}

function restoreRaw(adapter, snapshot) {
  const failures = []
  snapshot.forEach((raw, key) => {
    try {
      if (raw === null) adapter.removeItem(key)
      else adapter.setItem(key, raw)
    } catch (error) {
      failures.push(`${key}: ${error.message}`)
    }
  })
  const verified = failures.length === 0 && [...snapshot].every(([key, raw]) => adapter.getItem(key) === raw)
  return { verified, failures }
}

function expectedPayload(plan) {
  const next = applyPlan(plan)
  return new Map([
    [STORAGE_KEYS.PROBLEMS, next.problems],
    [STORAGE_KEYS.REVISION_HISTORY, next.revisionHistory],
    [STORAGE_KEYS.SETTINGS, next.settings],
    [STORAGE_KEYS.RECENT_SEARCHES, next.recentSearches],
  ])
}

function verifyPayload(adapter, payload) {
  return [...payload].every(([key, expected]) => {
    try {
      return JSON.stringify(JSON.parse(adapter.getItem(key))) === JSON.stringify(expected)
    } catch {
      return false
    }
  })
}

export function readRecentSearches(adapter) {
  const storage = getAdapter(adapter)
  try {
    const value = JSON.parse(storage.getItem(STORAGE_KEYS.RECENT_SEARCHES) || '[]')
    return Array.isArray(value) ? value : []
  } catch {
    return []
  }
}

export function buildCurrentBackup({ problems = [], revisionHistory = [], settings = {} }, options = {}) {
  return buildBackup({ problems, revisionHistory, settings, recentSearches: readRecentSearches(options.adapter) }, options)
}

export function downloadCurrentBackup(sources, options = {}) {
  const backup = buildCurrentBackup(sources, options)
  const filename = `devtrack-backup-${localTimestampForFilename(options.date || new Date())}.json`
  const downloaded = downloadText(JSON.stringify(backup, null, 2), filename, 'application/json;charset=utf-8')
  return { backup, filename, downloaded }
}

export function downloadProblemsCsv(problems, options = {}) {
  const filename = `devtrack-problems-${localTimestampForFilename(options.date || new Date())}.csv`
  const downloaded = downloadText(exportProblemsCsv(problems), filename, 'text/csv;charset=utf-8')
  return { filename, downloaded }
}

export function applyPlanToStorage(plan, adapter) {
  const storage = getAdapter(adapter)
  let before
  try {
    before = snapshotRaw(storage, WRITE_KEYS)
    const payload = expectedPayload(plan)
    payload.forEach((value, key) => storage.setItem(key, JSON.stringify(value)))
    if (!verifyPayload(storage, payload)) throw new Error('Stored data did not match the prepared import plan.')
    return { ok: true, rollbackSucceeded: null }
  } catch (error) {
    const rollback = before ? restoreRaw(storage, before) : { verified: false, failures: ['Previous values could not be read.'] }
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'The restore failed.',
      rollbackSucceeded: rollback.verified,
      rollbackFailures: rollback.failures,
    }
  }
}

export function clearOwnedStorage(adapter) {
  const storage = getAdapter(adapter)
  let before
  try {
    before = snapshotRaw(storage, DEVTRACK_OWNED_KEYS)
    DEVTRACK_OWNED_KEYS.forEach((key) => storage.removeItem(key))
    const verified = DEVTRACK_OWNED_KEYS.every((key) => storage.getItem(key) === null)
    if (!verified) throw new Error('One or more DevTrack keys remained in browser storage.')
    return { ok: true, removedKeys: [...DEVTRACK_OWNED_KEYS], rollbackSucceeded: null }
  } catch (error) {
    const rollback = before ? restoreRaw(storage, before) : { verified: false, failures: ['Previous values could not be read.'] }
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'DevTrack data could not be cleared.',
      rollbackSucceeded: rollback.verified,
      rollbackFailures: rollback.failures,
    }
  }
}

export function getOwnedStorageInfo(adapter) {
  const storage = getAdapter(adapter)
  let totalBytes = 0
  const keys = DEVTRACK_OWNED_KEYS.map((key) => {
    const raw = storage.getItem(key)
    const bytes = raw === null ? 0 : new globalThis.TextEncoder().encode(`${key}${raw}`).length
    totalBytes += bytes
    return { key, bytes, present: raw !== null, portable: DEVTRACK_PORTABLE_KEYS.includes(key) }
  })
  return { totalBytes, formatted: `${(totalBytes / 1024).toFixed(1)} KB`, keys }
}
