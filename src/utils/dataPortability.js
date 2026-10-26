import { ACCENTS, DEFAULT_SETTINGS, DIFFICULTIES, PLATFORMS, PRIORITIES, STATUSES, TOPICS } from '../data/constants'

export const BACKUP_APP = 'DevTrack'
export const BACKUP_SCHEMA_VERSION = 1
export const MAX_BACKUP_BYTES = 5 * 1024 * 1024
export const MAX_DAILY_GOAL = 100
export const APP_VERSION = '1.6.0'

const DATE_KEY = /^(\d{4})-(\d{2})-(\d{2})$/
const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype'])
const PROBLEM_FIELDS = new Set(['id', 'title', 'platform', 'url', 'difficulty', 'topics', 'status', 'solvedDate', 'timeTakenMinutes', 'notes', 'revision', 'createdAt', 'updatedAt', 'isSample'])
const REVISION_FIELDS = new Set(['marked', 'priority', 'stage', 'nextRevisionDate', 'revisionCount', 'addedAt', 'updatedAt', 'lastRevisedDate', 'scheduleRepaired'])
const QUEUE_FIELDS = new Set(['problemId', ...REVISION_FIELDS])
const HISTORY_FIELDS = new Set(['id', 'problemId', 'snapshotTitle', 'revisedAt', 'previousDueDate', 'nextScheduledDate', 'stage', 'migratedFromLegacy'])
const PREFERENCE_FIELDS = new Set(['displayName', 'theme', 'accent', 'revisionIntervals', 'pageSize', 'reduceMotion', 'confetti', 'onboardingCompleted', 'usingSampleData'])
const DATA_FIELDS = new Set(['problems', 'revisionQueue', 'revisionHistory', 'preferences', 'dailyGoal', 'recentSearches'])
const ENVELOPE_FIELDS = new Set(['app', 'schemaVersion', 'exportedAt', 'appVersion', 'data', 'counts'])
const ALLOWED_TOPICS = new Set([...TOPICS, 'Uncategorized'])
const ALLOWED_DIFFICULTIES = new Set([...DIFFICULTIES, 'Unknown'])
const ALLOWED_ACCENTS = new Set(ACCENTS.map((accent) => accent.id))

function isRecord(value) {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

export function validateBackupFileMetadata(file) {
  const errors = []
  if (!file || typeof file.name !== 'string') return { isValid: false, errors: ['Choose a JSON backup file.'] }
  if (!file.name.toLocaleLowerCase().endsWith('.json')) errors.push('Choose a file with a .json extension.')
  const allowedMime = !file.type || file.type.includes('json') || file.type === 'text/plain' || file.type === 'application/octet-stream'
  if (!allowedMime) errors.push('The selected file does not appear to be JSON.')
  if (!Number.isFinite(file.size) || file.size < 0) errors.push('The selected file size is invalid.')
  else if (file.size > MAX_BACKUP_BYTES) errors.push('This file is larger than the 5 MB import limit.')
  return { isValid: errors.length === 0, errors }
}

export function parseBackupText(text) {
  try {
    return validateBackup(JSON.parse(text))
  } catch {
    return { isValid: false, errors: ['This file contains malformed JSON and was not imported.'], warnings: [], droppedFieldCount: 0, backup: null }
  }
}

function unknownFieldCount(value, allowed) {
  if (!isRecord(value)) return 0
  return Object.keys(value).filter((key) => FORBIDDEN_KEYS.has(key) || !allowed.has(key)).length
}

function validDateKey(value) {
  if (typeof value !== 'string') return false
  const match = DATE_KEY.exec(value)
  if (!match) return false
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(year, month - 1, day, 12)
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
}

function validIso(value) {
  return typeof value === 'string' && value.length <= 64 && !Number.isNaN(Date.parse(value))
}

function optionalDate(value) {
  return value === null || value === undefined || value === '' || validDateKey(value)
}

function optionalIso(value) {
  return value === null || value === undefined || value === '' || validIso(value)
}

function safeString(value, fallback = '') {
  return typeof value === 'string' ? value : fallback
}

function cleanRevision(source = {}) {
  const revision = isRecord(source) ? source : {}
  return {
    marked: Boolean(revision.marked),
    priority: safeString(revision.priority, 'Medium'),
    stage: Number.isInteger(Number(revision.stage)) ? Number(revision.stage) : 0,
    nextRevisionDate: typeof revision.nextRevisionDate === 'string' ? revision.nextRevisionDate : null,
    revisionCount: Number.isInteger(Number(revision.revisionCount)) ? Number(revision.revisionCount) : 0,
    addedAt: typeof revision.addedAt === 'string' ? revision.addedAt : null,
    updatedAt: typeof revision.updatedAt === 'string' ? revision.updatedAt : null,
    lastRevisedDate: typeof revision.lastRevisedDate === 'string' ? revision.lastRevisedDate : null,
    scheduleRepaired: Boolean(revision.scheduleRepaired),
  }
}

function cleanProblem(source) {
  return {
    id: safeString(source.id),
    title: safeString(source.title).trim(),
    platform: safeString(source.platform),
    url: safeString(source.url).trim(),
    difficulty: safeString(source.difficulty),
    topics: Array.isArray(source.topics) ? source.topics.filter((topic) => typeof topic === 'string').map((topic) => topic.trim()) : [],
    status: safeString(source.status),
    solvedDate: typeof source.solvedDate === 'string' ? source.solvedDate : null,
    timeTakenMinutes: source.timeTakenMinutes === null || source.timeTakenMinutes === undefined ? null : Number(source.timeTakenMinutes),
    notes: safeString(source.notes),
    revision: cleanRevision(source.revision),
    createdAt: typeof source.createdAt === 'string' ? source.createdAt : null,
    updatedAt: typeof source.updatedAt === 'string' ? source.updatedAt : null,
    isSample: Boolean(source.isSample),
  }
}

function cleanQueueEntry(source) {
  return { problemId: safeString(source.problemId), ...cleanRevision({ ...source, marked: true }) }
}

function cleanHistoryEntry(source) {
  return {
    id: safeString(source.id),
    problemId: safeString(source.problemId),
    snapshotTitle: safeString(source.snapshotTitle).trim(),
    revisedAt: safeString(source.revisedAt),
    previousDueDate: typeof source.previousDueDate === 'string' ? source.previousDueDate : null,
    nextScheduledDate: typeof source.nextScheduledDate === 'string' ? source.nextScheduledDate : null,
    stage: Number.isInteger(Number(source.stage)) ? Number(source.stage) : 0,
    migratedFromLegacy: Boolean(source.migratedFromLegacy),
  }
}

function cleanPreferences(source = {}) {
  const value = isRecord(source) ? source : {}
  return {
    displayName: safeString(value.displayName, DEFAULT_SETTINGS.displayName).trim(),
    theme: safeString(value.theme, DEFAULT_SETTINGS.theme),
    accent: safeString(value.accent, DEFAULT_SETTINGS.accent),
    revisionIntervals: Array.isArray(value.revisionIntervals) ? value.revisionIntervals.map(Number) : [...DEFAULT_SETTINGS.revisionIntervals],
    pageSize: Number(value.pageSize ?? DEFAULT_SETTINGS.pageSize),
    reduceMotion: Boolean(value.reduceMotion),
    confetti: value.confetti === undefined ? DEFAULT_SETTINGS.confetti : Boolean(value.confetti),
    onboardingCompleted: Boolean(value.onboardingCompleted),
    usingSampleData: Boolean(value.usingSampleData),
  }
}

export function revisionQueueFromProblems(problems = []) {
  return problems.filter((problem) => problem.revision?.marked).map((problem) => ({
    problemId: problem.id,
    ...cleanRevision(problem.revision),
    marked: true,
  }))
}

export function backupCounts(data) {
  return {
    problems: data.problems.length,
    revisionQueue: data.revisionQueue.length,
    revisionHistory: data.revisionHistory.length,
    preferences: data.preferences ? 1 : 0,
    recentSearches: data.recentSearches.length,
  }
}

export function buildBackup(current = {}, options = {}) {
  const problems = Array.isArray(current.problems) ? current.problems.filter(isRecord).map(cleanProblem) : []
  const revisionHistory = Array.isArray(current.revisionHistory) ? current.revisionHistory.filter(isRecord).map(cleanHistoryEntry) : []
  const settings = isRecord(current.settings) ? current.settings : DEFAULT_SETTINGS
  const recentSearches = Array.isArray(current.recentSearches) ? current.recentSearches.filter((item) => typeof item === 'string').map((item) => item.slice(0, 200)) : []
  const data = {
    problems,
    revisionQueue: revisionQueueFromProblems(problems),
    revisionHistory,
    preferences: cleanPreferences(settings),
    dailyGoal: Number(settings.dailyGoal ?? DEFAULT_SETTINGS.dailyGoal),
    recentSearches,
  }
  return {
    app: BACKUP_APP,
    schemaVersion: BACKUP_SCHEMA_VERSION,
    exportedAt: (options.exportedAt || new Date()).toISOString(),
    appVersion: options.appVersion || APP_VERSION,
    data,
    counts: backupCounts(data),
  }
}

function validateRevision(revision, label, errors) {
  if (!isRecord(revision)) {
    errors.push(`${label} must be an object.`)
    return
  }
  if (typeof revision.marked !== 'boolean') errors.push(`${label}.marked must be true or false.`)
  if (!PRIORITIES.includes(revision.priority)) errors.push(`${label}.priority must be High, Medium, or Low.`)
  if (!Number.isInteger(revision.stage) || revision.stage < 0 || revision.stage > 4) errors.push(`${label}.stage must be an integer from 0 to 4.`)
  if (!Number.isInteger(revision.revisionCount) || revision.revisionCount < 0) errors.push(`${label}.revisionCount must be a non-negative integer.`)
  if (!optionalDate(revision.nextRevisionDate)) errors.push(`${label}.nextRevisionDate must be a valid YYYY-MM-DD date or null.`)
  if (!optionalDate(revision.lastRevisedDate)) errors.push(`${label}.lastRevisedDate must be a valid YYYY-MM-DD date or null.`)
  if (!optionalIso(revision.addedAt) || !optionalIso(revision.updatedAt)) errors.push(`${label} contains an invalid timestamp.`)
  if (typeof revision.scheduleRepaired !== 'boolean') errors.push(`${label}.scheduleRepaired must be true or false.`)
}

export function validateBackup(input) {
  const errors = []
  const warnings = []
  let droppedFieldCount = unknownFieldCount(input, ENVELOPE_FIELDS)
  if (!isRecord(input)) return { isValid: false, errors: ['Backup root must be an object.'], warnings, droppedFieldCount: 0, backup: null }
  if (input.app !== BACKUP_APP) errors.push('This file is not a DevTrack backup.')
  if (!Number.isInteger(input.schemaVersion)) errors.push('schemaVersion must be an integer.')
  else if (input.schemaVersion > BACKUP_SCHEMA_VERSION) errors.push('This backup was created by a newer version of DevTrack.')
  else if (input.schemaVersion < BACKUP_SCHEMA_VERSION) errors.push(`Backup schema version ${input.schemaVersion} is not supported yet.`)
  if (!validIso(input.exportedAt)) errors.push('exportedAt must be a valid ISO timestamp.')
  if (input.appVersion !== undefined && typeof input.appVersion !== 'string') errors.push('appVersion must be a string when present.')
  if (input.counts !== undefined && !isRecord(input.counts)) errors.push('counts must be an object when present.')
  if (!isRecord(input.data)) errors.push('Backup data must be an object.')
  if (errors.length || !isRecord(input.data)) return { isValid: false, errors, warnings, droppedFieldCount, backup: null }

  droppedFieldCount += unknownFieldCount(input.data, DATA_FIELDS)
  const raw = input.data
  if (!Array.isArray(raw.problems)) errors.push('data.problems must be an array.')
  if (!Array.isArray(raw.revisionQueue)) errors.push('data.revisionQueue must be an array.')
  if (!Array.isArray(raw.revisionHistory)) errors.push('data.revisionHistory must be an array.')
  if (!isRecord(raw.preferences)) errors.push('data.preferences must be an object.')
  if (!Array.isArray(raw.recentSearches)) errors.push('data.recentSearches must be an array.')
  if (errors.length) return { isValid: false, errors, warnings, droppedFieldCount, backup: null }
  if (!Number.isInteger(raw.dailyGoal) || raw.dailyGoal < 1 || raw.dailyGoal > MAX_DAILY_GOAL) errors.push(`data.dailyGoal must be an integer from 1 to ${MAX_DAILY_GOAL}.`)

  const problemIds = new Set()
  const problems = raw.problems.map((problem, index) => {
    const label = `Problem ${index + 1}`
    if (!isRecord(problem)) {
      errors.push(`${label} must be an object.`)
      return cleanProblem({})
    }
    droppedFieldCount += unknownFieldCount(problem, PROBLEM_FIELDS)
    const clean = cleanProblem(problem)
    if (typeof problem.id !== 'string') errors.push(`${label}.id must be a string.`)
    if (typeof problem.title !== 'string') errors.push(`${label}.title must be a string.`)
    if (typeof problem.platform !== 'string') errors.push(`${label}.platform must be a string.`)
    if (typeof problem.url !== 'string') errors.push(`${label}.url must be a string.`)
    if (typeof problem.difficulty !== 'string') errors.push(`${label}.difficulty must be a string.`)
    if (!Array.isArray(problem.topics) || problem.topics.some((topic) => typeof topic !== 'string')) errors.push(`${label}.topics must be an array of strings.`)
    if (typeof problem.status !== 'string') errors.push(`${label}.status must be a string.`)
    if (problem.solvedDate !== null && typeof problem.solvedDate !== 'string') errors.push(`${label}.solvedDate must be a string or null.`)
    if (problem.timeTakenMinutes !== null && typeof problem.timeTakenMinutes !== 'number') errors.push(`${label}.timeTakenMinutes must be a number or null.`)
    if (typeof problem.notes !== 'string') errors.push(`${label}.notes must be a string.`)
    if (problem.createdAt !== null && typeof problem.createdAt !== 'string') errors.push(`${label}.createdAt must be a string or null.`)
    if (problem.updatedAt !== null && typeof problem.updatedAt !== 'string') errors.push(`${label}.updatedAt must be a string or null.`)
    if (typeof problem.isSample !== 'boolean') errors.push(`${label}.isSample must be true or false.`)
    if (!clean.id || clean.id.length > 128) errors.push(`${label} must have an id of 1–128 characters.`)
    else if (problemIds.has(clean.id)) errors.push(`Duplicate problem id: ${clean.id}.`)
    else problemIds.add(clean.id)
    if (!clean.title || clean.title.length > 120) errors.push(`${label} title must contain 1–120 characters.`)
    if (!PLATFORMS.includes(clean.platform)) errors.push(`${label} has an invalid platform.`)
    if (!ALLOWED_DIFFICULTIES.has(clean.difficulty)) errors.push(`${label} has an invalid difficulty.`)
    if (!STATUSES.includes(clean.status)) errors.push(`${label} has an invalid status.`)
    if (!clean.topics.length || clean.topics.some((topic) => !ALLOWED_TOPICS.has(topic))) errors.push(`${label} contains an invalid topic.`)
    if (clean.url.length > 2048) errors.push(`${label} URL is too long.`)
    else if (clean.url) {
      try {
        const parsed = new URL(clean.url)
        if (!['http:', 'https:'].includes(parsed.protocol)) errors.push(`${label} URL must use http or https.`)
      } catch {
        errors.push(`${label} URL is invalid.`)
      }
    }
    if (clean.notes.length > 10000) errors.push(`${label} notes exceed 10,000 characters.`)
    if (clean.status === 'Solved' && !validDateKey(clean.solvedDate)) errors.push(`${label} requires a valid solvedDate.`)
    if (clean.status !== 'Solved' && clean.solvedDate !== null) errors.push(`${label} cannot have solvedDate unless status is Solved.`)
    if (clean.timeTakenMinutes !== null && (!Number.isFinite(clean.timeTakenMinutes) || clean.timeTakenMinutes <= 0 || clean.timeTakenMinutes > 100000)) errors.push(`${label} has an invalid timeTakenMinutes value.`)
    if (!optionalIso(clean.createdAt) || !optionalIso(clean.updatedAt)) errors.push(`${label} contains an invalid timestamp.`)
    validateRevision(problem.revision, `${label}.revision`, errors)
    droppedFieldCount += unknownFieldCount(problem.revision, REVISION_FIELDS)
    return clean
  })

  const queueProblemIds = new Set()
  const revisionQueue = raw.revisionQueue.map((entry, index) => {
    const label = `Revision queue entry ${index + 1}`
    if (!isRecord(entry)) {
      errors.push(`${label} must be an object.`)
      return cleanQueueEntry({})
    }
    droppedFieldCount += unknownFieldCount(entry, QUEUE_FIELDS)
    const clean = cleanQueueEntry(entry)
    if (!problemIds.has(clean.problemId)) errors.push(`${label} references missing problem ${clean.problemId || '(blank)'}.`)
    if (queueProblemIds.has(clean.problemId)) errors.push(`Duplicate revision queue entry for problem ${clean.problemId}.`)
    queueProblemIds.add(clean.problemId)
    validateRevision(entry, label, errors)
    return clean
  })

  problems.forEach((problem) => {
    if (problem.revision.marked && !queueProblemIds.has(problem.id)) errors.push(`Marked problem ${problem.id} is missing from revisionQueue.`)
    if (!problem.revision.marked && queueProblemIds.has(problem.id)) errors.push(`Unmarked problem ${problem.id} cannot appear in revisionQueue.`)
    const queueEntry = revisionQueue.find((entry) => entry.problemId === problem.id)
    if (queueEntry && JSON.stringify(cleanRevision(queueEntry)) !== JSON.stringify(problem.revision)) errors.push(`Revision queue entry for problem ${problem.id} does not match the problem revision state.`)
  })

  const historyIds = new Set()
  const revisionHistory = raw.revisionHistory.map((entry, index) => {
    const label = `Revision history entry ${index + 1}`
    if (!isRecord(entry)) {
      errors.push(`${label} must be an object.`)
      return cleanHistoryEntry({})
    }
    droppedFieldCount += unknownFieldCount(entry, HISTORY_FIELDS)
    const clean = cleanHistoryEntry(entry)
    if (typeof entry.id !== 'string') errors.push(`${label}.id must be a string.`)
    if (typeof entry.problemId !== 'string') errors.push(`${label}.problemId must be a string.`)
    if (typeof entry.snapshotTitle !== 'string') errors.push(`${label}.snapshotTitle must be a string.`)
    if (typeof entry.revisedAt !== 'string') errors.push(`${label}.revisedAt must be a string.`)
    if (entry.previousDueDate !== null && typeof entry.previousDueDate !== 'string') errors.push(`${label}.previousDueDate must be a string or null.`)
    if (entry.nextScheduledDate !== null && typeof entry.nextScheduledDate !== 'string') errors.push(`${label}.nextScheduledDate must be a string or null.`)
    if (typeof entry.migratedFromLegacy !== 'boolean') errors.push(`${label}.migratedFromLegacy must be true or false.`)
    if (!clean.id || clean.id.length > 128) errors.push(`${label} has an invalid id.`)
    else if (historyIds.has(clean.id)) errors.push(`Duplicate revision history id: ${clean.id}.`)
    else historyIds.add(clean.id)
    if (!clean.problemId) errors.push(`${label} requires a problemId.`)
    if (!problemIds.has(clean.problemId) && !clean.snapshotTitle) errors.push(`${label} references a deleted problem without snapshotTitle.`)
    if (!validIso(clean.revisedAt)) errors.push(`${label} requires a valid revisedAt timestamp.`)
    if (!optionalDate(clean.previousDueDate) || !optionalDate(clean.nextScheduledDate)) errors.push(`${label} contains an invalid date.`)
    if (!Number.isInteger(clean.stage) || clean.stage < 0 || clean.stage > 4) errors.push(`${label}.stage must be an integer from 0 to 4.`)
    return clean
  })

  droppedFieldCount += unknownFieldCount(raw.preferences, PREFERENCE_FIELDS)
  const preferences = cleanPreferences(raw.preferences)
  if (typeof raw.preferences.displayName !== 'string') errors.push('preferences.displayName must be a string.')
  if (typeof raw.preferences.theme !== 'string') errors.push('preferences.theme must be a string.')
  if (typeof raw.preferences.accent !== 'string') errors.push('preferences.accent must be a string.')
  if (!Array.isArray(raw.preferences.revisionIntervals) || raw.preferences.revisionIntervals.some((value) => typeof value !== 'number')) errors.push('preferences.revisionIntervals must be an array of numbers.')
  if (typeof raw.preferences.pageSize !== 'number') errors.push('preferences.pageSize must be a number.')
  ;['reduceMotion', 'confetti', 'onboardingCompleted', 'usingSampleData'].forEach((field) => {
    if (typeof raw.preferences[field] !== 'boolean') errors.push(`preferences.${field} must be true or false.`)
  })
  if (!preferences.displayName || preferences.displayName.length > 80) errors.push('preferences.displayName must contain 1–80 characters.')
  if (!['light', 'dark', 'system'].includes(preferences.theme)) errors.push('preferences.theme must be light, dark, or system.')
  if (!ALLOWED_ACCENTS.has(preferences.accent)) errors.push('preferences.accent is invalid.')
  if (!Array.isArray(raw.preferences.revisionIntervals) || !raw.preferences.revisionIntervals.length || raw.preferences.revisionIntervals.some((value) => !Number.isInteger(value) || value < 1 || value > 365)) errors.push('preferences.revisionIntervals must contain integers from 1 to 365.')
  if (![10, 25, 50].includes(preferences.pageSize)) errors.push('preferences.pageSize must be 10, 25, or 50.')

  const recentSearches = raw.recentSearches.flatMap((value, index) => {
    if (typeof value !== 'string' || value.length > 200) {
      errors.push(`Recent search ${index + 1} must be a string of at most 200 characters.`)
      return []
    }
    return [value]
  })
  if (droppedFieldCount > 0) warnings.push(`${droppedFieldCount} unknown or forbidden field${droppedFieldCount === 1 ? '' : 's'} will be dropped.`)
  const data = { problems, revisionQueue, revisionHistory, preferences, dailyGoal: raw.dailyGoal, recentSearches }
  const computedCounts = backupCounts(data)
  if (isRecord(input.counts) && Object.entries(computedCounts).some(([key, value]) => input.counts[key] !== value)) warnings.push('The supplied counts did not match the records and were recomputed.')
  const backup = { app: BACKUP_APP, schemaVersion: BACKUP_SCHEMA_VERSION, exportedAt: input.exportedAt, ...(typeof input.appVersion === 'string' ? { appVersion: input.appVersion.slice(0, 40) } : {}), data, counts: computedCounts }
  return { isValid: errors.length === 0, errors, warnings, droppedFieldCount, backup: errors.length === 0 ? backup : null }
}

function timestamp(value) {
  const parsed = Date.parse(value || '')
  return Number.isNaN(parsed) ? 0 : parsed
}

function mergeRecords(existing, incoming, idKey = 'id') {
  const incomingMap = new Map(incoming.map((record) => [record[idKey], record]))
  const next = []
  let added = 0
  let conflicts = 0
  let importedNewer = 0
  let existingKept = 0
  existing.forEach((record) => {
    const candidate = incomingMap.get(record[idKey])
    if (!candidate) {
      next.push(record)
      return
    }
    conflicts += 1
    if (timestamp(candidate.updatedAt) > timestamp(record.updatedAt)) {
      next.push(candidate)
      importedNewer += 1
    } else {
      next.push(record)
      existingKept += 1
    }
    incomingMap.delete(record[idKey])
  })
  incomingMap.forEach((record) => {
    next.push(record)
    added += 1
  })
  return { records: next, added, conflicts, importedNewer, existingKept }
}

function applyQueue(problems, queue) {
  const queueMap = new Map(queue.map((entry) => [entry.problemId, entry]))
  return problems.map((problem) => {
    const entry = queueMap.get(problem.id)
    return entry ? { ...problem, revision: cleanRevision(entry) } : problem
  })
}

export function planImport(current, validatedBackup, options = {}) {
  const mode = options.mode === 'replace' ? 'replace' : 'merge'
  const takePreferences = Boolean(options.takePreferences)
  const currentEnvelope = buildBackup(current)
  const existing = currentEnvelope.data
  const incoming = validatedBackup.data
  if (mode === 'replace') {
    const settings = { ...DEFAULT_SETTINGS, ...incoming.preferences, dailyGoal: incoming.dailyGoal }
    const next = {
      problems: applyQueue(incoming.problems, incoming.revisionQueue),
      revisionHistory: incoming.revisionHistory,
      settings,
      recentSearches: incoming.recentSearches,
    }
    return {
      mode,
      takePreferences: true,
      next,
      preview: {
        current: backupCounts(existing),
        incoming: backupCounts(incoming),
        addedProblems: incoming.problems.length,
        updatedProblems: 0,
        keptProblems: 0,
        removedProblems: existing.problems.length,
        conflicts: 0,
        importedNewer: 0,
        existingKept: 0,
      },
    }
  }

  const problemMerge = mergeRecords(existing.problems, incoming.problems)
  const queueMerge = mergeRecords(existing.revisionQueue, incoming.revisionQueue, 'problemId')
  const historyById = new Map(existing.revisionHistory.map((entry) => [entry.id, entry]))
  let addedHistory = 0
  incoming.revisionHistory.forEach((entry) => {
    if (!historyById.has(entry.id)) {
      historyById.set(entry.id, entry)
      addedHistory += 1
    }
  })
  const settings = takePreferences
    ? { ...DEFAULT_SETTINGS, ...incoming.preferences, dailyGoal: incoming.dailyGoal }
    : { ...currentEnvelope.data.preferences, dailyGoal: Number(current.settings?.dailyGoal ?? DEFAULT_SETTINGS.dailyGoal) }
  const next = {
    problems: applyQueue(problemMerge.records, queueMerge.records),
    revisionHistory: [...historyById.values()],
    settings,
    recentSearches: [...new Set([...existing.recentSearches, ...incoming.recentSearches])],
  }
  return {
    mode,
    takePreferences,
    next,
    preview: {
      current: backupCounts(existing),
      incoming: backupCounts(incoming),
      addedProblems: problemMerge.added,
      updatedProblems: problemMerge.importedNewer,
      keptProblems: problemMerge.existingKept,
      removedProblems: 0,
      conflicts: problemMerge.conflicts,
      importedNewer: problemMerge.importedNewer,
      existingKept: problemMerge.existingKept,
      addedHistory,
    },
  }
}

export function applyPlan(plan) {
  return {
    problems: plan.next.problems.map((problem) => cleanProblem(problem)),
    revisionHistory: plan.next.revisionHistory.map((entry) => cleanHistoryEntry(entry)),
    settings: { ...DEFAULT_SETTINGS, ...cleanPreferences(plan.next.settings), dailyGoal: Number(plan.next.settings.dailyGoal) },
    recentSearches: [...plan.next.recentSearches],
  }
}

function spreadsheetSafe(value) {
  const text = String(value ?? '')
  return /^[=+\-@\t\r]/.test(text) ? `'${text}` : text
}

function csvCell(value, protect = true) {
  const text = protect ? spreadsheetSafe(value) : String(value ?? '')
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

export function exportProblemsCsv(problems = []) {
  const headers = ['Title', 'Platform', 'Topic', 'Difficulty', 'Status', 'URL', 'Date Solved', 'Notes', 'Marked For Revision']
  const rows = (Array.isArray(problems) ? problems : []).filter(isRecord).map((problem) => [
    csvCell(problem.title),
    csvCell(problem.platform),
    csvCell(Array.isArray(problem.topics) ? problem.topics.join(', ') : problem.topic || ''),
    csvCell(problem.difficulty),
    csvCell(problem.status),
    csvCell(problem.url),
    csvCell(problem.solvedDate || '', false),
    csvCell(problem.notes),
    csvCell(problem.revision?.marked || problem.markedForRevision ? 'Yes' : 'No', false),
  ].join(','))
  return `\uFEFF${[headers.join(','), ...rows].join('\r\n')}\r\n`
}
