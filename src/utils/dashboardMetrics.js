import { addDays, startOfWeek, subDays } from 'date-fns'
import { formatDate, getLocalDateString, toDate } from './dates'
import { normalizeProblems } from './problemNormalizer'

export const HEATMAP_LEVEL_THRESHOLDS = Object.freeze([0, 1, 2, 3, 4])

function todayKey(referenceDate) {
  return getLocalDateString(toDate(referenceDate) || new Date())
}

function normalized(problems) {
  return normalizeProblems(problems)
}

export function hasUsableSolvedDate(problem, referenceDate = new Date()) {
  return Boolean(problem?.solvedDate && problem.solvedDate <= todayKey(referenceDate))
}

export function isSolvedProblem(problem, referenceDate = new Date()) {
  void referenceDate
  return problem?.status === 'Solved'
}

export function getTotalSolved(problems = [], referenceDate = new Date()) {
  return normalized(problems).filter((problem) => isSolvedProblem(problem, referenceDate)).length
}

export function countByDifficulty(problems = [], referenceDate = new Date()) {
  const counts = { Easy: 0, Medium: 0, Hard: 0, Unknown: 0 }
  normalized(problems).forEach((problem) => {
    if (isSolvedProblem(problem, referenceDate)) counts[problem.difficulty] += 1
  })
  return counts
}

function activityMap(problems, referenceDate) {
  const endKey = todayKey(referenceDate)
  return normalized(problems).reduce((map, problem) => {
    if (!isSolvedProblem(problem, referenceDate) || !problem.solvedDate || problem.solvedDate > endKey) return map
    const entry = map.get(problem.solvedDate) || []
    entry.push(problem)
    map.set(problem.solvedDate, entry)
    return map
  }, new Map())
}

export function getWeeklyProgress(problems = [], referenceDate = new Date()) {
  const reference = toDate(referenceDate) || new Date()
  const byDate = activityMap(problems, reference)
  return Array.from({ length: 7 }, (_, index) => {
    const date = subDays(reference, 6 - index)
    const dateKey = getLocalDateString(date)
    const dayProblems = byDate.get(dateKey) || []
    return {
      date: dateKey,
      label: formatDate(dateKey, 'EEE'),
      fullDate: formatDate(dateKey, 'MMMM d, yyyy'),
      count: dayProblems.length,
      problems: dayProblems,
    }
  })
}

function activeDateKeys(problems, referenceDate) {
  return [...activityMap(problems, referenceDate).keys()].sort()
}

export function getLongestStreak(problems = [], referenceDate = new Date()) {
  const keys = activeDateKeys(problems, referenceDate)
  let longest = 0
  let running = 0
  let expected = null

  keys.forEach((key) => {
    running = key === expected ? running + 1 : 1
    longest = Math.max(longest, running)
    expected = getLocalDateString(addDays(toDate(key), 1))
  })
  return longest
}

export function getCurrentStreak(problems = [], referenceDate = new Date()) {
  const reference = toDate(referenceDate) || new Date()
  const active = new Set(activeDateKeys(problems, reference))
  const today = getLocalDateString(reference)
  const yesterday = getLocalDateString(subDays(reference, 1))
  let cursor = active.has(today) ? reference : active.has(yesterday) ? subDays(reference, 1) : null
  let count = 0

  while (cursor && active.has(getLocalDateString(cursor))) {
    count += 1
    cursor = subDays(cursor, 1)
  }
  return count
}

export function getHeatmapData(problems = [], referenceDate = new Date(), weeks = 52) {
  const reference = toDate(referenceDate) || new Date()
  const byDate = activityMap(problems, reference)
  const weekCount = Math.max(1, weeks)
  const currentWeekStart = startOfWeek(reference, { weekStartsOn: 0 })
  const start = subDays(currentWeekStart, (weekCount - 1) * 7)
  const endKey = getLocalDateString(reference)
  let previousMonth = null

  return Array.from({ length: weekCount }, (_, weekIndex) => {
    const weekStart = addDays(start, weekIndex * 7)
    const month = weekStart.getMonth()
    const monthLabel = month !== previousMonth ? formatDate(weekStart, 'MMM') : ''
    previousMonth = month

    return {
      monthLabel,
      days: Array.from({ length: 7 }, (_, dayIndex) => {
        const date = addDays(weekStart, dayIndex)
        const dateKey = getLocalDateString(date)
        const dayProblems = byDate.get(dateKey) || []
        return {
          date: dateKey,
          fullDate: formatDate(dateKey, 'MMMM d, yyyy'),
          count: dateKey <= endKey ? dayProblems.length : 0,
          problems: dateKey <= endKey ? dayProblems : [],
          isFuture: dateKey > endKey,
        }
      }),
    }
  })
}

export function getRecentSolved(problems = [], limit = 5, referenceDate = new Date()) {
  const endKey = todayKey(referenceDate)
  return normalized(problems)
    .filter((problem) => isSolvedProblem(problem, referenceDate) && problem.solvedDate && problem.solvedDate <= endKey)
    .sort((left, right) => {
      const dateOrder = right.solvedDate.localeCompare(left.solvedDate)
      if (dateOrder !== 0) return dateOrder
      const createdOrder = String(right.createdAt || '').localeCompare(String(left.createdAt || ''))
      return createdOrder || left.id.localeCompare(right.id)
    })
    .slice(0, Math.max(0, limit))
}
