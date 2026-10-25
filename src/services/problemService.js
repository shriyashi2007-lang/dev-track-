import { storageService } from './storageService'
import { STORAGE_KEYS } from '../data/constants'
import { generateId } from '../utils/ids'
import { getLocalDateString } from '../utils/dates'
import { getSampleProblems } from '../data/sampleProblems'
import { normalizeProblem, normalizeProblems, normalizeStatus } from '../utils/problemNormalizer'

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
    return list.find((p) => p.id === String(id)) || null
  }

  async create(problemData) {
    const list = this.readWritableRaw()
    const now = new Date().toISOString()
    const todayStr = getLocalDateString(new Date())

    const status = normalizeStatus(problemData.status || 'Todo')
    const isSolved = status === 'Solved'
    // Date rule: solvedDate is always a local calendar YYYY-MM-DD string. Non-solved records store null.
    const solvedDate = isSolved
      ? (problemData.solvedDate || problemData.dateSolved || todayStr)
      : null
    const topics = Array.isArray(problemData.topics)
      ? problemData.topics
      : problemData.topic
        ? [problemData.topic]
        : ['Arrays']
    const revisionMarked = Boolean(problemData.revision?.marked ?? problemData.markedForRevision)

    const newProblem = {
      id: problemData.id || generateId(),
      title: (problemData.title || '').trim(),
      platform: problemData.platform || 'LeetCode',
      url: (problemData.url || '').trim(),
      difficulty: problemData.difficulty || 'Medium',
      topics: topics.length > 0 ? topics : ['Arrays'],
      status,
      solvedDate,
      timeTakenMinutes: problemData.timeTakenMinutes ? Number(problemData.timeTakenMinutes) : null,
      notes: (problemData.notes || '').trim(),
      revision: {
        marked: revisionMarked,
        priority: problemData.revision?.priority || 'Medium',
        nextRevisionDate: problemData.revision?.nextRevisionDate || (revisionMarked ? todayStr : null),
        revisionCount: problemData.revision?.revisionCount || 0,
        lastRevisedDate: problemData.revision?.lastRevisedDate || null,
        history: Array.isArray(problemData.revision?.history) ? problemData.revision.history : [],
      },
      createdAt: now,
      updatedAt: now,
      isSample: Boolean(problemData.isSample),
    }

    const normalizedNewProblem = normalizeProblem(newProblem)
    const updated = [normalizedNewProblem, ...list]
    storageService.set(STORAGE_KEYS.PROBLEMS, updated)
    return normalizedNewProblem
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
    const nextStatus = updates.status !== undefined ? normalizeStatus(updates.status) : current.status
    let solvedDate = updates.solvedDate !== undefined
      ? updates.solvedDate
      : updates.dateSolved !== undefined
        ? updates.dateSolved
        : current.solvedDate
    if (nextStatus === 'Solved' && !solvedDate) {
      solvedDate = getLocalDateString(new Date())
    } else if (nextStatus !== 'Solved') {
      solvedDate = null
    }

    const safeUpdates = { ...updates }
    delete safeUpdates.id
    delete safeUpdates.createdAt
    delete safeUpdates.dateSolved
    delete safeUpdates.topic
    delete safeUpdates.markedForRevision

    const nextTopics = updates.topics !== undefined
      ? updates.topics
      : updates.topic !== undefined
        ? [updates.topic]
        : current.topics
    const nextRevision = {
      ...current.revision,
      ...(updates.revision || {}),
    }
    if (updates.markedForRevision !== undefined) {
      nextRevision.marked = Boolean(updates.markedForRevision)
    }

    const merged = normalizeProblem({
      ...current,
      ...safeUpdates,
      id: current.id,
      createdAt: current.createdAt,
      title: updates.title !== undefined ? updates.title.trim() : current.title,
      url: updates.url !== undefined ? updates.url.trim() : current.url,
      topics: nextTopics,
      status: nextStatus,
      solvedDate,
      revision: nextRevision,
      updatedAt: now,
    }, index)

    list[index] = merged
    storageService.set(STORAGE_KEYS.PROBLEMS, list)
    return merged
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
