import { getLocalDateString, toDate } from './dates'

const DIFFICULTIES = new Map([
  ['easy', 'Easy'],
  ['medium', 'Medium'],
  ['hard', 'Hard'],
])

const STATUSES = new Map([
  ['todo', 'Todo'],
  ['to do', 'Todo'],
  ['attempted', 'Attempted'],
  ['in progress', 'Attempted'],
  ['solved', 'Solved'],
  ['revisit', 'Revisit'],
])

export function normalizeDifficulty(value) {
  if (typeof value !== 'string') return 'Unknown'
  return DIFFICULTIES.get(value.trim().toLowerCase()) || 'Unknown'
}

export function normalizeStatus(value) {
  if (typeof value !== 'string') return 'Todo'
  return STATUSES.get(value.trim().toLowerCase()) || 'Todo'
}

export function normalizeTopics(record = {}) {
  const source = Array.isArray(record.topics)
    ? record.topics
    : typeof record.topic === 'string'
      ? [record.topic]
      : []

  const topics = [...new Set(source
    .filter((topic) => typeof topic === 'string')
    .map((topic) => topic.trim())
    .filter(Boolean))]

  return topics.length > 0 ? topics : ['Uncategorized']
}

export function normalizeSolvedDate(value) {
  const parsed = toDate(value)
  return parsed ? getLocalDateString(parsed) : null
}

export function isSafeExternalUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return false
  try {
    const parsed = new URL(value.trim())
    return parsed.protocol === 'https:' || parsed.protocol === 'http:'
  } catch {
    return false
  }
}

function stableLegacyId(source, index) {
  const fingerprint = [source.title, source.platform, source.url, source.createdAt, source.solvedDate ?? source.dateSolved]
    .map((value) => String(value || ''))
    .join('|') || `empty-${index}`
  let hash = 2166136261
  for (let position = 0; position < fingerprint.length; position += 1) {
    hash ^= fingerprint.charCodeAt(position)
    hash = Math.imul(hash, 16777619)
  }
  return `legacy-${(hash >>> 0).toString(36)}`
}

export function normalizeProblem(record, index = 0) {
  const source = record && typeof record === 'object' && !Array.isArray(record) ? record : {}
  const revision = source.revision && typeof source.revision === 'object' ? source.revision : {}
  const status = normalizeStatus(source.status)
  const candidateSolvedDate = normalizeSolvedDate(source.solvedDate ?? source.dateSolved)
  const stableId = typeof source.id === 'string' || typeof source.id === 'number'
    ? String(source.id)
    : stableLegacyId(source, index)

  return {
    ...source,
    id: stableId,
    title: typeof source.title === 'string' && source.title.trim()
      ? source.title.trim()
      : 'Untitled problem',
    platform: typeof source.platform === 'string' && source.platform.trim()
      ? source.platform.trim()
      : 'Other',
    url: isSafeExternalUrl(source.url) ? source.url.trim() : '',
    difficulty: normalizeDifficulty(source.difficulty),
    topics: normalizeTopics(source),
    status,
    // Solved dates are local YYYY-MM-DD values and only apply while status is Solved.
    solvedDate: status === 'Solved' ? candidateSolvedDate : null,
    timeTakenMinutes: Number.isFinite(Number(source.timeTakenMinutes)) && Number(source.timeTakenMinutes) > 0
      ? Number(source.timeTakenMinutes)
      : null,
    notes: typeof source.notes === 'string' ? source.notes : '',
    revision: {
      ...revision,
      marked: Boolean(revision.marked ?? source.markedForRevision),
      priority: typeof revision.priority === 'string' ? revision.priority : 'Medium',
      history: Array.isArray(revision.history) ? revision.history : [],
    },
    createdAt: typeof source.createdAt === 'string' ? source.createdAt : null,
    updatedAt: typeof source.updatedAt === 'string' ? source.updatedAt : null,
    isSample: Boolean(source.isSample),
  }
}

export function normalizeProblems(records) {
  if (!Array.isArray(records)) return []
  const seenIds = new Map()
  return records.map((record, index) => {
    const problem = normalizeProblem(record, index)
    const occurrence = (seenIds.get(problem.id) || 0) + 1
    seenIds.set(problem.id, occurrence)
    return occurrence === 1 ? problem : { ...problem, id: `${problem.id}-${occurrence}` }
  })
}
