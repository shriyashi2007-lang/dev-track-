import { storageService } from './storageService'
import { STORAGE_KEYS } from '../data/constants'
import { generateId } from '../utils/ids'
import { getLocalDateString } from '../utils/dates'
import { getSampleProblems } from '../data/sampleProblems'
import { normalizeProblem, normalizeProblems, normalizeStatus } from '../utils/problemNormalizer'
import {
  advanceRevision,
  createInitialRevision,
  isValidDateKey,
  normalizeRevisionPriority,
  normalizeRevisionState,
} from '../utils/spacedRepetition'

function isObject(value) {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

function normalizeHistoryRecord(record, index = 0) {
  const source = isObject(record) ? record : {}
  const revisedAt = typeof source.revisedAt === 'string' && !Number.isNaN(Date.parse(source.revisedAt))
    ? source.revisedAt
    : new Date(0).toISOString()
  return {
    ...source,
    id: typeof source.id === 'string' && source.id ? source.id : `history-${index}-${revisedAt}`,
    problemId: String(source.problemId || ''),
    snapshotTitle: typeof source.snapshotTitle === 'string' && source.snapshotTitle.trim()
      ? source.snapshotTitle.trim()
      : 'Problem deleted',
    revisedAt,
    previousDueDate: isValidDateKey(source.previousDueDate) ? source.previousDueDate : null,
    nextScheduledDate: isValidDateKey(source.nextScheduledDate) ? source.nextScheduledDate : null,
    stage: Number.isInteger(Number(source.stage)) && Number(source.stage) >= 0
      ? Math.min(Number(source.stage), 4)
      : 0,
  }
}

function normalizeHistory(records) {
  if (!Array.isArray(records)) return []
  const seen = new Set()
  return records.map(normalizeHistoryRecord).filter((record) => {
    if (!record.problemId || seen.has(record.id)) return false
    seen.add(record.id)
    return true
  })
}

function legacyHistoryFromProblems(problems) {
  const migrated = []
  problems.forEach((problem) => {
    const legacy = Array.isArray(problem.revision?.history) ? problem.revision.history : []
    legacy.forEach((entry, index) => {
      if (!isObject(entry)) return
      const date = isValidDateKey(entry.date) ? entry.date : null
      const revisedAt = typeof entry.revisedAt === 'string' && !Number.isNaN(Date.parse(entry.revisedAt))
        ? entry.revisedAt
        : date ? `${date}T00:00:00.000Z` : new Date(0).toISOString()
      const stage = Number.isInteger(Number(entry.stage)) ? Math.min(Math.max(Number(entry.stage), 0), 4) : Math.min(index, 4)
      migrated.push(normalizeHistoryRecord({
        id: `legacy-${problem.id}-${revisedAt}-${stage}-${index}`,
        problemId: problem.id,
        snapshotTitle: problem.title,
        revisedAt,
        previousDueDate: entry.previousDueDate || date,
        nextScheduledDate: entry.nextScheduledDate || null,
        stage,
        migratedFromLegacy: true,
      }))
    })
  })
  return migrated
}

class ProblemService {
  readRaw(key = STORAGE_KEYS.PROBLEMS, fallback = []) {
    const result = storageService.getResult(key, fallback)
    return {
      records: Array.isArray(result.value) ? result.value : fallback,
      error: result.error || (Array.isArray(result.value) ? null : new Error(`Saved data for ${key} is not a list.`)),
    }
  }

  readWritableRaw(key = STORAGE_KEYS.PROBLEMS) {
    const result = this.readRaw(key, [])
    if (result.error) throw new Error('Saved data could not be read, so DevTrack left it unchanged.')
    return result.records
  }

  migrateRevisionData(_referenceDate = new Date()) {
    const problemResult = this.readRaw(STORAGE_KEYS.PROBLEMS, [])
    const historyResult = this.readRaw(STORAGE_KEYS.REVISION_HISTORY, [])
    const problems = normalizeProblems(problemResult.records)
    const history = normalizeHistory(historyResult.records)

    if (!problemResult.error) {
      const rawJson = JSON.stringify(problemResult.records)
      const migratedJson = JSON.stringify(problems)
      if (rawJson !== migratedJson) storageService.set(STORAGE_KEYS.PROBLEMS, problems)
    }

    if (!historyResult.error && !problemResult.error) {
      const knownIds = new Set(history.map((entry) => entry.id))
      const additions = legacyHistoryFromProblems(problems).filter((entry) => !knownIds.has(entry.id))
      const migratedHistory = additions.length > 0 ? [...history, ...additions] : history
      if (JSON.stringify(historyResult.records) !== JSON.stringify(migratedHistory)) {
        storageService.set(STORAGE_KEYS.REVISION_HISTORY, migratedHistory)
      }
      return {
        problems,
        history: migratedHistory,
        error: null,
        problemError: null,
        historyError: null,
        repairedCount: problems.filter((problem) => problem.revision?.marked && problem.revision?.scheduleRepaired).length,
      }
    }

    return {
      problems,
      history,
      error: problemResult.error || historyResult.error,
      problemError: problemResult.error,
      historyError: historyResult.error,
      repairedCount: problems.filter((problem) => problem.revision?.marked && problem.revision?.scheduleRepaired).length,
    }
  }

  async getAllWithMeta() {
    const state = this.migrateRevisionData()
    return { problems: state.problems, error: state.problemError, revisionHistory: state.history, revisionError: state.historyError, repairedCount: state.repairedCount }
  }

  async getAll() {
    return (await this.getAllWithMeta()).problems
  }

  async getRevisionHistoryWithMeta() {
    const state = this.migrateRevisionData()
    return { history: state.history, error: state.historyError }
  }

  async getById(id) {
    return (await this.getAll()).find((problem) => problem.id === String(id)) || null
  }

  async create(problemData) {
    this.migrateRevisionData()
    const list = this.readWritableRaw()
    const now = new Date()
    const nowIso = now.toISOString()
    const today = getLocalDateString(now)
    const status = normalizeStatus(problemData.status || 'Todo')
    const marked = Boolean(problemData.revision?.marked ?? problemData.markedForRevision)
    const suppliedRevision = isObject(problemData.revision) ? problemData.revision : {}
    const revision = marked
      ? normalizeRevisionState({ ...suppliedRevision, ...createInitialRevision(now, { priority: suppliedRevision.priority }), marked: true }, now)
      : normalizeRevisionState({ ...suppliedRevision, marked: false }, now)

    const newProblem = normalizeProblem({
      id: problemData.id || generateId(),
      title: (problemData.title || '').trim(),
      platform: problemData.platform || 'LeetCode',
      url: (problemData.url || '').trim(),
      difficulty: problemData.difficulty || 'Medium',
      topics: Array.isArray(problemData.topics) ? problemData.topics : problemData.topic ? [problemData.topic] : ['Arrays'],
      status,
      solvedDate: status === 'Solved' ? (problemData.solvedDate || problemData.dateSolved || today) : null,
      timeTakenMinutes: problemData.timeTakenMinutes ? Number(problemData.timeTakenMinutes) : null,
      notes: (problemData.notes || '').trim(),
      revision,
      createdAt: nowIso,
      updatedAt: nowIso,
      isSample: Boolean(problemData.isSample),
    })
    storageService.set(STORAGE_KEYS.PROBLEMS, [newProblem, ...list])
    return newProblem
  }

  async update(id, updates) {
    this.migrateRevisionData()
    const list = this.readWritableRaw()
    const normalizedList = normalizeProblems(list)
    const index = normalizedList.findIndex((problem) => problem.id === String(id))
    if (index === -1) throw new Error(`Problem with ID ${id} not found`)

    const current = normalizedList[index]
    const now = new Date()
    const nextStatus = updates.status !== undefined ? normalizeStatus(updates.status) : current.status
    let solvedDate = updates.solvedDate !== undefined ? updates.solvedDate : updates.dateSolved !== undefined ? updates.dateSolved : current.solvedDate
    if (nextStatus === 'Solved' && !solvedDate) solvedDate = getLocalDateString(now)
    if (nextStatus !== 'Solved') solvedDate = null

    const safeUpdates = { ...updates }
    ;['id', 'createdAt', 'dateSolved', 'topic', 'markedForRevision'].forEach((key) => delete safeUpdates[key])
    const requestedRevision = { ...current.revision, ...(isObject(updates.revision) ? updates.revision : {}) }
    if (updates.markedForRevision !== undefined) requestedRevision.marked = Boolean(updates.markedForRevision)
    const newlyMarked = requestedRevision.marked && !current.revision?.marked
    const newlyUnmarked = !requestedRevision.marked && current.revision?.marked
    let nextRevision = requestedRevision
    if (newlyMarked) {
      const initial = createInitialRevision(now, { priority: requestedRevision.priority })
      nextRevision = { ...requestedRevision, ...initial, priority: normalizeRevisionPriority(requestedRevision.priority) }
    }
    if (newlyUnmarked) nextRevision = { ...requestedRevision, marked: false, stage: 0, revisionCount: 0, nextRevisionDate: null, addedAt: null }
    nextRevision = normalizeRevisionState(nextRevision, now)

    const merged = normalizeProblem({
      ...current,
      ...safeUpdates,
      id: current.id,
      createdAt: current.createdAt,
      title: updates.title !== undefined ? updates.title.trim() : current.title,
      url: updates.url !== undefined ? updates.url.trim() : current.url,
      topics: updates.topics !== undefined ? updates.topics : updates.topic !== undefined ? [updates.topic] : current.topics,
      status: nextStatus,
      solvedDate,
      revision: nextRevision,
      updatedAt: now.toISOString(),
    }, index)
    list[index] = merged
    storageService.set(STORAGE_KEYS.PROBLEMS, list)
    return merged
  }

  async setRevisionMarked(id, marked, priority = 'Medium') {
    const current = await this.getById(id)
    if (!current) throw new Error(`Problem with ID ${id} not found`)
    if (Boolean(current.revision?.marked) === Boolean(marked)) return current
    const revision = marked
      ? createInitialRevision(new Date(), { priority })
      : { ...current.revision, marked: false, stage: 0, revisionCount: 0, nextRevisionDate: null, addedAt: null }
    return this.update(id, { revision })
  }

  async setRevisionPriority(id, priority) {
    const current = await this.getById(id)
    if (!current?.revision?.marked) throw new Error('This problem is not in the revision queue.')
    return this.update(id, { revision: { ...current.revision, priority: normalizeRevisionPriority(priority) } })
  }

  async rescheduleRevision(id, nextRevisionDate, referenceDate = new Date()) {
    const today = getLocalDateString(referenceDate)
    if (!isValidDateKey(nextRevisionDate)) throw new Error('Choose a valid revision date.')
    if (nextRevisionDate < today) throw new Error('Revision date cannot be in the past.')
    const current = await this.getById(id)
    if (!current?.revision?.marked) throw new Error('This problem is not in the revision queue.')
    return this.update(id, { revision: { ...current.revision, nextRevisionDate, updatedAt: new Date().toISOString(), scheduleRepaired: false } })
  }

  async completeRevision(id, completedAt = new Date(), expectedCycle = null) {
    this.migrateRevisionData(completedAt)
    const list = this.readWritableRaw()
    const historyRaw = this.readWritableRaw(STORAGE_KEYS.REVISION_HISTORY)
    const history = normalizeHistory(historyRaw)
    const normalizedList = normalizeProblems(list)
    const index = normalizedList.findIndex((problem) => problem.id === String(id))
    if (index === -1) throw new Error(`Problem with ID ${id} not found`)
    const problem = normalizedList[index]
    if (!problem.revision?.marked) throw new Error('This problem is not in the revision queue.')
    const revision = normalizeRevisionState(problem.revision, completedAt)
    if (!Number.isInteger(Number(expectedCycle?.stage)) || !isValidDateKey(expectedCycle?.dueDate)) {
      throw new Error('A valid revision cycle is required to complete this session safely.')
    }
    const cycleStage = Number(expectedCycle.stage)
    const cycleDueDate = expectedCycle.dueDate
    const duplicate = history.find((entry) => entry.problemId === problem.id && entry.stage === cycleStage && entry.previousDueDate === cycleDueDate)
    if (duplicate) return { problem, historyRecord: duplicate, duplicate: true }
    if (cycleStage !== revision.stage || cycleDueDate !== revision.nextRevisionDate) {
      throw new Error('This revision cycle changed. Refresh the queue and try again.')
    }

    const schedule = advanceRevision(revision, completedAt)
    const historyRecord = normalizeHistoryRecord({
      id: generateId(),
      problemId: problem.id,
      snapshotTitle: problem.title,
      revisedAt: completedAt.toISOString(),
      previousDueDate: revision.nextRevisionDate,
      nextScheduledDate: schedule.nextRevisionDate,
      stage: schedule.completedStage,
    })
    const updatedProblem = normalizeProblem({
      ...problem,
      revision: {
        ...revision,
        stage: schedule.nextStage,
        nextRevisionDate: schedule.nextRevisionDate,
        revisionCount: schedule.nextCount,
        lastRevisedDate: getLocalDateString(completedAt),
        updatedAt: completedAt.toISOString(),
        scheduleRepaired: false,
      },
      updatedAt: completedAt.toISOString(),
    }, index)
    list[index] = updatedProblem
    const nextHistory = [...history, historyRecord]
    storageService.set(STORAGE_KEYS.REVISION_HISTORY, nextHistory)
    try {
      storageService.set(STORAGE_KEYS.PROBLEMS, list)
    } catch (error) {
      storageService.set(STORAGE_KEYS.REVISION_HISTORY, historyRaw)
      throw error
    }
    return { problem: updatedProblem, historyRecord, duplicate: false }
  }

  async remove(id) {
    this.migrateRevisionData()
    const list = this.readWritableRaw()
    const normalizedList = normalizeProblems(list)
    const index = normalizedList.findIndex((problem) => problem.id === String(id))
    if (index === -1) return null
    const target = normalizedList[index]
    storageService.set(STORAGE_KEYS.PROBLEMS, list.filter((_, itemIndex) => itemIndex !== index))
    return target
  }

  async restore(problem) {
    if (!problem) return null
    const list = this.readWritableRaw()
    if (!normalizeProblems(list).some((item) => item.id === problem.id)) storageService.set(STORAGE_KEYS.PROBLEMS, [problem, ...list])
    return problem
  }

  async bulkRemove(ids = []) {
    this.migrateRevisionData()
    const set = new Set(ids.map(String))
    const list = this.readWritableRaw()
    const normalized = normalizeProblems(list)
    const removed = normalized.filter((problem) => set.has(problem.id))
    storageService.set(STORAGE_KEYS.PROBLEMS, list.filter((_, index) => !set.has(normalized[index].id)))
    return removed
  }

  async bulkUpdateStatus(ids = [], status = 'Solved') {
    const set = new Set(ids.map(String))
    const today = getLocalDateString()
    const updated = normalizeProblems(this.readWritableRaw()).map((problem) => set.has(problem.id)
      ? { ...problem, status, solvedDate: status === 'Solved' ? (problem.solvedDate || today) : null, updatedAt: new Date().toISOString() }
      : problem)
    storageService.set(STORAGE_KEYS.PROBLEMS, updated)
    return normalizeProblems(updated)
  }

  async bulkMarkRevision(ids = [], marked = true, priority = 'Medium') {
    this.migrateRevisionData()
    const set = new Set(ids.map(String))
    const now = new Date()
    const updated = normalizeProblems(this.readWritableRaw()).map((problem) => {
      if (!set.has(problem.id) || Boolean(problem.revision?.marked) === Boolean(marked)) return problem
      return normalizeProblem({
        ...problem,
        revision: marked
          ? createInitialRevision(now, { priority })
          : { ...problem.revision, marked: false, stage: 0, revisionCount: 0, nextRevisionDate: null, addedAt: null },
        updatedAt: now.toISOString(),
      })
    })
    storageService.set(STORAGE_KEYS.PROBLEMS, updated)
    return updated
  }

  async loadSampleData() {
    const list = this.readWritableRaw()
    const merged = [...getSampleProblems(), ...list.filter((problem) => !problem.isSample)]
    storageService.set(STORAGE_KEYS.PROBLEMS, normalizeProblems(merged))
    return (await this.getAllWithMeta()).problems
  }

  async clearSampleData() {
    const list = normalizeProblems(this.readWritableRaw()).filter((problem) => !problem.isSample)
    storageService.set(STORAGE_KEYS.PROBLEMS, list)
    return list
  }

  async importProblems(newProblems = [], mode = 'merge') {
    const current = this.readWritableRaw()
    const existingIds = new Set(normalizeProblems(current).map((problem) => problem.id))
    const incoming = newProblems.map((problem) => existingIds.has(String(problem.id)) ? { ...problem, id: generateId() } : problem)
    const merged = mode === 'replace' ? incoming : [...incoming, ...current]
    storageService.set(STORAGE_KEYS.PROBLEMS, normalizeProblems(merged))
    return (await this.getAllWithMeta()).problems
  }
}

export const problemService = new ProblemService()
