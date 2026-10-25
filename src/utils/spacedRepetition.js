import { differenceInCalendarDays } from 'date-fns'
import { addDays, getLocalDateString, toDate } from './dates'

export const REVISION_INTERVALS = Object.freeze([1, 3, 7, 14, 30])
export const REVISION_PRIORITIES = Object.freeze(['Low', 'Medium', 'High'])
export const REVISION_DUE_STATES = Object.freeze(['all', 'overdue', 'today', 'upcoming'])

const priorityWeight = { High: 3, Medium: 2, Low: 1 }

export function isValidDateKey(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const parsed = toDate(value)
  return Boolean(parsed && getLocalDateString(parsed) === value)
}

export function normalizeRevisionPriority(value) {
  return REVISION_PRIORITIES.includes(value) ? value : 'Medium'
}

export function createInitialRevision(referenceDate = new Date(), options = {}) {
  const now = options.now instanceof Date ? options.now : referenceDate
  return {
    marked: true,
    priority: normalizeRevisionPriority(options.priority),
    stage: 0,
    nextRevisionDate: getLocalDateString(addDays(referenceDate, REVISION_INTERVALS[0])),
    revisionCount: 0,
    addedAt: options.addedAt || now.toISOString(),
    updatedAt: options.updatedAt || now.toISOString(),
    lastRevisedDate: null,
  }
}

export function normalizeRevisionState(revision, referenceDate = new Date(), options = {}) {
  const source = revision && typeof revision === 'object' && !Array.isArray(revision) ? revision : {}
  const marked = Boolean(source.marked)
  const revisionCount = Number.isInteger(Number(source.revisionCount)) && Number(source.revisionCount) >= 0
    ? Number(source.revisionCount)
    : 0
  const inferredStage = Math.min(revisionCount, REVISION_INTERVALS.length - 1)
  const stage = Number.isInteger(Number(source.stage)) && Number(source.stage) >= 0
    ? Math.min(Number(source.stage), REVISION_INTERVALS.length - 1)
    : inferredStage
  const validSchedule = isValidDateKey(source.nextRevisionDate)
  const repaired = marked && !validSchedule
  const fallbackTimestamp = options.fallbackTimestamp || `${getLocalDateString(referenceDate)}T00:00:00.000Z`

  return {
    ...source,
    marked,
    priority: normalizeRevisionPriority(source.priority),
    stage,
    nextRevisionDate: marked
      ? (validSchedule ? source.nextRevisionDate : getLocalDateString(addDays(referenceDate, 1)))
      : null,
    revisionCount,
    addedAt: marked ? (source.addedAt || fallbackTimestamp) : (source.addedAt || null),
    updatedAt: source.updatedAt || fallbackTimestamp,
    lastRevisedDate: isValidDateKey(source.lastRevisedDate) ? source.lastRevisedDate : null,
    scheduleRepaired: Boolean(source.scheduleRepaired || repaired),
    history: Array.isArray(source.history) ? source.history : [],
  }
}

/**
 * The next interval always counts from the actual local completion day. Completing
 * stage 4 keeps the entry at stage 4 and schedules recurring 30-day maintenance.
 */
export function advanceRevision(revision, completionDate = new Date()) {
  const current = normalizeRevisionState(revision, completionDate)
  const completedStage = current.stage
  const nextStage = Math.min(completedStage + 1, REVISION_INTERVALS.length - 1)
  const daysAdded = REVISION_INTERVALS[nextStage]
  return {
    completedStage,
    nextStage,
    daysAdded,
    nextRevisionDate: getLocalDateString(addDays(completionDate, daysAdded)),
    nextCount: current.revisionCount + 1,
    maintenance: completedStage === REVISION_INTERVALS.length - 1,
  }
}

export function getRevisionDueState(revision, referenceDate = new Date()) {
  const today = getLocalDateString(referenceDate)
  const date = revision?.nextRevisionDate
  if (!isValidDateKey(date)) return 'upcoming'
  if (date < today) return 'overdue'
  if (date === today) return 'today'
  return 'upcoming'
}

export function getRevisionRelativeText(dateKey, referenceDate = new Date()) {
  if (!isValidDateKey(dateKey)) return 'Schedule repaired to tomorrow'
  const days = differenceInCalendarDays(toDate(dateKey), toDate(getLocalDateString(referenceDate)))
  if (days === 0) return 'Today'
  if (days < 0) return `Overdue by ${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'}`
  return `In ${days} day${days === 1 ? '' : 's'}`
}

export function sortRevisionQueue(problems = [], referenceDate = new Date()) {
  const stateWeight = { overdue: 0, today: 1, upcoming: 2 }
  return [...problems].sort((left, right) => {
    const leftState = getRevisionDueState(left.revision, referenceDate)
    const rightState = getRevisionDueState(right.revision, referenceDate)
    const stateOrder = stateWeight[leftState] - stateWeight[rightState]
    if (stateOrder !== 0) return stateOrder
    const dateOrder = String(left.revision?.nextRevisionDate || '').localeCompare(String(right.revision?.nextRevisionDate || ''))
    if (dateOrder !== 0) return dateOrder
    const priorityOrder = (priorityWeight[right.revision?.priority] || 0) - (priorityWeight[left.revision?.priority] || 0)
    if (priorityOrder !== 0) return priorityOrder
    const titleOrder = String(left.title || '').localeCompare(String(right.title || ''), undefined, { sensitivity: 'base' })
    return titleOrder || String(left.id).localeCompare(String(right.id))
  })
}

export function filterRevisionQueue(problems = [], filters = {}, referenceDate = new Date()) {
  const search = String(filters.search || '').trim().toLowerCase()
  return sortRevisionQueue(problems.filter((problem) => {
    if (!problem.revision?.marked) return false
    if (search && !String(problem.title || '').toLowerCase().includes(search)) return false
    if (filters.topic && !(problem.topics || []).includes(filters.topic)) return false
    if (filters.difficulty && problem.difficulty !== filters.difficulty) return false
    if (filters.priority && problem.revision.priority !== filters.priority) return false
    if (filters.dueState && filters.dueState !== 'all' && getRevisionDueState(problem.revision, referenceDate) !== filters.dueState) return false
    return true
  }), referenceDate)
}

export function deriveRevisionStats(problems = [], history = [], referenceDate = new Date()) {
  const queue = problems.filter((problem) => problem.revision?.marked)
  const stats = { total: queue.length, today: 0, upcoming: 0, overdue: 0, completed: Array.isArray(history) ? history.length : 0 }
  queue.forEach((problem) => {
    stats[getRevisionDueState(problem.revision, referenceDate)] += 1
  })
  return stats
}

export function categorizeRevisions(problems = [], referenceDate = new Date()) {
  const queue = sortRevisionQueue(problems.filter((problem) => problem.revision?.marked), referenceDate)
  const dueToday = queue.filter((problem) => getRevisionDueState(problem.revision, referenceDate) === 'today')
  const overdue = queue.filter((problem) => getRevisionDueState(problem.revision, referenceDate) === 'overdue')
  const upcoming = queue.filter((problem) => getRevisionDueState(problem.revision, referenceDate) === 'upcoming')
  return {
    dueToday,
    overdue,
    upcoming,
    completed: [],
    counts: {
      dueToday: dueToday.length,
      overdue: overdue.length,
      upcoming: upcoming.length,
      completed: 0,
      totalActive: dueToday.length + overdue.length,
    },
  }
}
