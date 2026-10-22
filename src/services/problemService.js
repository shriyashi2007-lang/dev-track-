import { storageService } from './storageService'
import { STORAGE_KEYS } from '../data/constants'
import { generateId } from '../utils/ids'
import { getLocalDateString } from '../utils/dates'
import { getSampleProblems } from '../data/sampleProblems'
import { normalizeProblem, normalizeProblems } from '../utils/problemNormalizer'

/**
 * ProblemService: Async promise-based API backed by localStorage.
 * Ready for drop-in REST backend replacement.
 */
class ProblemService {
  readRaw() {
    const result = storageService.getResult(STORAGE_KEYS.PROBLEMS, [])
    return {
      records: Array.isArray(result.value) ? result.value : [],
      error: result.error || (Array.isArray(result.value) ? null : new Error('Saved problem data is not a list.')),
    }
  }

  readWritableRaw() {
    const result = this.readRaw()
    if (result.error) {
      throw new Error('Saved problem data could not be read, so DevTrack left it unchanged.')
    }
    return result.records
  }

  async getAllWithMeta() {
    const { records, error } = this.readRaw()
    return { problems: normalizeProblems(records), error }
  }

  async getAll() {
    const { problems } = await this.getAllWithMeta()
    return problems
  }

  async getById(id) {
    const list = await this.getAll()
    return list.find((p) => p.id === id) || null
  }

  async create(problemData) {
    const list = this.readWritableRaw()
    const now = new Date().toISOString()
    const todayStr = getLocalDateString(new Date())

    const isSolved = problemData.status === 'Solved'
    const solvedDate = isSolved
      ? (problemData.solvedDate || todayStr)
      : null

    const newProblem = {
      id: problemData.id || generateId(),
      title: (problemData.title || '').trim(),
      platform: problemData.platform || 'LeetCode',
      url: (problemData.url || '').trim(),
      difficulty: problemData.difficulty || 'Medium',
      topics: Array.isArray(problemData.topics) && problemData.topics.length > 0 ? problemData.topics : ['Arrays'],
      status: problemData.status || 'Todo',
      solvedDate,
      timeTakenMinutes: problemData.timeTakenMinutes ? Number(problemData.timeTakenMinutes) : null,
      notes: (problemData.notes || '').trim(),
      revision: {
        marked: Boolean(problemData.revision?.marked),
        priority: problemData.revision?.priority || 'Medium',
        nextRevisionDate: problemData.revision?.nextRevisionDate || (problemData.revision?.marked ? todayStr : null),
        revisionCount: problemData.revision?.revisionCount || 0,
        lastRevisedDate: problemData.revision?.lastRevisedDate || null,
        history: Array.isArray(problemData.revision?.history) ? problemData.revision.history : [],
      },
      createdAt: now,
      updatedAt: now,
      isSample: Boolean(problemData.isSample),
    }

    const updated = [newProblem, ...list]
    storageService.set(STORAGE_KEYS.PROBLEMS, updated)
    return normalizeProblem(newProblem)
  }

  async update(id, updates) {
    const list = this.readWritableRaw()
    const normalizedList = normalizeProblems(list)
    const index = normalizedList.findIndex((problem) => problem.id === String(id))
    if (index === -1) {
      throw new Error(`Problem with ID ${id} not found`)
    }

    const current = normalizedList[index]
    const now = new Date().toISOString()

    // Handle solved date automatic sync
    let solvedDate = updates.solvedDate !== undefined ? updates.solvedDate : current.solvedDate
    if (updates.status === 'Solved' && !solvedDate) {
      solvedDate = getLocalDateString(new Date())
    } else if (updates.status && updates.status !== 'Solved') {
      solvedDate = null
    }

    const merged = {
      ...current,
      ...updates,
      title: updates.title !== undefined ? updates.title.trim() : current.title,
      solvedDate,
      revision: {
        ...current.revision,
        ...(updates.revision || {}),
      },
      updatedAt: now,
    }

    list[index] = merged
    storageService.set(STORAGE_KEYS.PROBLEMS, list)
    return normalizeProblem(merged, index)
  }

  async remove(id) {
    const list = this.readWritableRaw()
    const normalizedList = normalizeProblems(list)
    const index = normalizedList.findIndex((problem) => problem.id === String(id))
    if (index === -1) return null
    const target = normalizedList[index]
    const filtered = list.filter((_, itemIndex) => itemIndex !== index)
    storageService.set(STORAGE_KEYS.PROBLEMS, filtered)
    return target
  }

  async restore(problem) {
    if (!problem) return
    const list = this.readWritableRaw()
    const exists = normalizeProblems(list).some((item) => item.id === problem.id)
    if (!exists) {
      const updated = [problem, ...list]
      storageService.set(STORAGE_KEYS.PROBLEMS, updated)
    }
    return problem
  }

  async bulkRemove(ids = []) {
    const set = new Set(ids)
    const list = this.readWritableRaw()
    const normalizedList = normalizeProblems(list)
    const deleted = list.filter((_, index) => set.has(normalizedList[index].id))
    const remaining = list.filter((_, index) => !set.has(normalizedList[index].id))
    storageService.set(STORAGE_KEYS.PROBLEMS, remaining)
    return normalizeProblems(deleted)
  }

  async bulkUpdateStatus(ids = [], status = 'Solved') {
    const set = new Set(ids)
    const list = this.readWritableRaw()
    const normalizedList = normalizeProblems(list)
    const todayStr = getLocalDateString(new Date())
    const now = new Date().toISOString()

    const updated = list.map((p, index) => {
      const normalizedProblem = normalizedList[index]
      if (!set.has(normalizedProblem.id)) return p
      return {
        ...p,
        status,
        solvedDate: status === 'Solved' ? (p.solvedDate || todayStr) : null,
        updatedAt: now,
      }
    })

    storageService.set(STORAGE_KEYS.PROBLEMS, updated)
    return normalizeProblems(updated)
  }

  async bulkMarkRevision(ids = [], marked = true, priority = 'Medium') {
    const set = new Set(ids)
    const list = this.readWritableRaw()
    const normalizedList = normalizeProblems(list)
    const todayStr = getLocalDateString(new Date())
    const now = new Date().toISOString()

    const updated = list.map((p, index) => {
      const normalizedProblem = normalizedList[index]
      if (!set.has(normalizedProblem.id)) return p
      return {
        ...p,
        revision: {
          ...p.revision,
          marked,
          priority: priority || p.revision?.priority || 'Medium',
          nextRevisionDate: marked ? (p.revision?.nextRevisionDate || todayStr) : null,
        },
        updatedAt: now,
      }
    })

    storageService.set(STORAGE_KEYS.PROBLEMS, updated)
    return normalizeProblems(updated)
  }

  async loadSampleData() {
    const sampleItems = getSampleProblems()
    const list = this.readWritableRaw()
    // Remove existing sample items if any, then prepend
    const nonSample = list.filter((p) => !p.isSample)
    const merged = [...sampleItems, ...nonSample]
    storageService.set(STORAGE_KEYS.PROBLEMS, merged)
    return normalizeProblems(merged)
  }

  async clearSampleData() {
    const list = this.readWritableRaw()
    const nonSample = list.filter((p) => !p.isSample)
    storageService.set(STORAGE_KEYS.PROBLEMS, nonSample)
    return normalizeProblems(nonSample)
  }

  async importProblems(newProblems = [], mode = 'merge') {
    const { records: current } = this.readRaw()
    if (mode === 'replace') {
      storageService.set(STORAGE_KEYS.PROBLEMS, newProblems)
      return normalizeProblems(newProblems)
    }

    // Merge: prevent duplicate IDs
    const existingIds = new Set(normalizeProblems(current).map((problem) => problem.id))
    const sanitized = newProblems.map((p) => {
      if (existingIds.has(p.id)) {
        return { ...p, id: generateId() }
      }
      return p
    })

    const merged = [...sanitized, ...current]
    storageService.set(STORAGE_KEYS.PROBLEMS, merged)
    return normalizeProblems(merged)
  }
}

export const problemService = new ProblemService()
