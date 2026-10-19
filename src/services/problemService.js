import { storageService } from './storageService'
import { STORAGE_KEYS } from '../data/constants'
import { generateId } from '../utils/ids'
import { getLocalDateString } from '../utils/dates'
import { getSampleProblems } from '../data/sampleProblems'

/**
 * ProblemService: Async promise-based API backed by localStorage.
 * Ready for drop-in REST backend replacement.
 */
class ProblemService {
  async getAll() {
    return new Promise((resolve) => {
      const data = storageService.get(STORAGE_KEYS.PROBLEMS, [])
      resolve(Array.isArray(data) ? data : [])
    })
  }

  async getById(id) {
    const list = await this.getAll()
    return list.find((p) => p.id === id) || null
  }

  async create(problemData) {
    const list = await this.getAll()
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
    return newProblem
  }

  async update(id, updates) {
    const list = await this.getAll()
    const index = list.findIndex((p) => p.id === id)
    if (index === -1) {
      throw new Error(`Problem with ID ${id} not found`)
    }

    const current = list[index]
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
    return merged
  }

  async remove(id) {
    const list = await this.getAll()
    const target = list.find((p) => p.id === id)
    if (!target) return null

    const filtered = list.filter((p) => p.id !== id)
    storageService.set(STORAGE_KEYS.PROBLEMS, filtered)
    return target
  }

  async restore(problem) {
    if (!problem) return
    const list = await this.getAll()
    const exists = list.some((p) => p.id === problem.id)
    if (!exists) {
      const updated = [problem, ...list]
      storageService.set(STORAGE_KEYS.PROBLEMS, updated)
    }
    return problem
  }

  async bulkRemove(ids = []) {
    const set = new Set(ids)
    const list = await this.getAll()
    const deleted = list.filter((p) => set.has(p.id))
    const remaining = list.filter((p) => !set.has(p.id))
    storageService.set(STORAGE_KEYS.PROBLEMS, remaining)
    return deleted
  }

  async bulkUpdateStatus(ids = [], status = 'Solved') {
    const set = new Set(ids)
    const list = await this.getAll()
    const todayStr = getLocalDateString(new Date())
    const now = new Date().toISOString()

    const updated = list.map((p) => {
      if (!set.has(p.id)) return p
      return {
        ...p,
        status,
        solvedDate: status === 'Solved' ? (p.solvedDate || todayStr) : null,
        updatedAt: now,
      }
    })

    storageService.set(STORAGE_KEYS.PROBLEMS, updated)
    return updated
  }

  async bulkMarkRevision(ids = [], marked = true, priority = 'Medium') {
    const set = new Set(ids)
    const list = await this.getAll()
    const todayStr = getLocalDateString(new Date())
    const now = new Date().toISOString()

    const updated = list.map((p) => {
      if (!set.has(p.id)) return p
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
    return updated
  }

  async loadSampleData() {
    const sampleItems = getSampleProblems()
    const list = await this.getAll()
    // Remove existing sample items if any, then prepend
    const nonSample = list.filter((p) => !p.isSample)
    const merged = [...sampleItems, ...nonSample]
    storageService.set(STORAGE_KEYS.PROBLEMS, merged)
    return merged
  }

  async clearSampleData() {
    const list = await this.getAll()
    const nonSample = list.filter((p) => !p.isSample)
    storageService.set(STORAGE_KEYS.PROBLEMS, nonSample)
    return nonSample
  }

  async importProblems(newProblems = [], mode = 'merge') {
    const current = await this.getAll()
    if (mode === 'replace') {
      storageService.set(STORAGE_KEYS.PROBLEMS, newProblems)
      return newProblems
    }

    // Merge: prevent duplicate IDs
    const existingIds = new Set(current.map((p) => p.id))
    const sanitized = newProblems.map((p) => {
      if (existingIds.has(p.id)) {
        return { ...p, id: generateId() }
      }
      return p
    })

    const merged = [...sanitized, ...current]
    storageService.set(STORAGE_KEYS.PROBLEMS, merged)
    return merged
  }
}

export const problemService = new ProblemService()
