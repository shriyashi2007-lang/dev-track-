import { addDays, format, startOfMonth, startOfWeek, subDays } from 'date-fns'
import { normalizeDifficulty, normalizeStatus } from './problemNormalizer'

export const ANALYTICS_RANGES = Object.freeze([
  Object.freeze({ days: 7, label: 'Last 7 days', shortLabel: '7 days' }),
  Object.freeze({ days: 30, label: 'Last 30 days', shortLabel: '30 days' }),
  Object.freeze({ days: 90, label: 'Last 90 days', shortLabel: '90 days' }),
])

export const CORE_TOPICS = Object.freeze([
  'Arrays', 'Strings', 'Linked Lists', 'Trees', 'Graphs', 'Dynamic Programming',
])

const DIFFICULTIES = Object.freeze(['Easy', 'Medium', 'Hard'])
const DATE_KEY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/
const TOPIC_ALIASES = new Map([
  ['array', 'Arrays'], ['arrays', 'Arrays'],
  ['string', 'Strings'], ['strings', 'Strings'],
  ['linked list', 'Linked Lists'], ['linked lists', 'Linked Lists'],
  ['tree', 'Trees'], ['trees', 'Trees'],
  ['graph', 'Graphs'], ['graphs', 'Graphs'],
  ['dynamic programming', 'Dynamic Programming'], ['dp', 'Dynamic Programming'],
])

function localDateFromKey(key) {
  const match = DATE_KEY_PATTERN.exec(key)
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(year, month - 1, day, 12)
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null
  return date
}

export function toLocalDayKey(value) {
  if (value === null || value === undefined || value === '') return null
  if (typeof value === 'string') {
    const trimmed = value.trim()
    const localDate = localDateFromKey(trimmed)
    if (localDate) return trimmed
    if (!trimmed) return null
    if (DATE_KEY_PATTERN.test(trimmed)) return null
  }
  const date = value instanceof Date ? new Date(value.getTime()) : new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return [
    String(date.getFullYear()).padStart(4, '0'),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-')
}

export function buildLocalDayRange(days = 30, referenceDate = new Date()) {
  const safeDays = Math.max(1, Math.floor(Number(days) || 1))
  const endKey = toLocalDayKey(referenceDate) || toLocalDayKey(new Date())
  const end = localDateFromKey(endKey)
  return Array.from({ length: safeDays }, (_, index) => {
    const date = addDays(end, index - safeDays + 1)
    return {
      date: toLocalDayKey(date),
      dateObject: date,
      label: format(date, 'MMM d'),
      fullDate: format(date, 'MMMM d, yyyy'),
    }
  })
}

function displayTopicLabel(value) {
  const cleaned = String(value || '').trim().replace(/\s+/g, ' ')
  if (!cleaned) return 'Uncategorized'
  const alias = TOPIC_ALIASES.get(cleaned.toLocaleLowerCase())
  if (alias) return alias
  return cleaned.split(' ').map((word) => word
    ? `${word[0].toLocaleUpperCase()}${word.slice(1).toLocaleLowerCase()}`
    : '').join(' ')
}

function normalizedTopics(record) {
  const source = Array.isArray(record.topics)
    ? record.topics
    : typeof record.topic === 'string'
      ? [record.topic]
      : []
  const byKey = new Map()
  source.forEach((topic) => {
    if (typeof topic !== 'string') return
    const label = displayTopicLabel(topic)
    byKey.set(label.toLocaleLowerCase(), label)
  })
  return byKey.size ? [...byKey.values()] : ['Uncategorized']
}

export function normalizeAnalyticsRecords(records = []) {
  if (!Array.isArray(records)) return []
  return records.flatMap((record, index) => {
    if (!record || typeof record !== 'object' || Array.isArray(record)) return []
    if (normalizeStatus(record.status) !== 'Solved') return []
    const solvedDate = toLocalDayKey(record.solvedDate ?? record.dateSolved)
    if (!solvedDate) return []
    return [{
      id: String(record.id ?? `analytics-${index}`),
      solvedDate,
      difficulty: normalizeDifficulty(record.difficulty),
      topics: normalizedTopics(record),
    }]
  })
}

export function getSolvedProblemCount(records = []) {
  if (!Array.isArray(records)) return 0
  return records.filter((record) => record && typeof record === 'object' && !Array.isArray(record)
    && normalizeStatus(record.status) === 'Solved').length
}

export function getRangeBounds(days = 30, referenceDate = new Date()) {
  const range = buildLocalDayRange(days, referenceDate)
  return { startKey: range[0].date, endKey: range.at(-1).date, days: range.length }
}

export function filterSolvedInRange(records = [], days = 30, referenceDate = new Date()) {
  const { startKey, endKey } = getRangeBounds(days, referenceDate)
  return normalizeAnalyticsRecords(records).filter((record) => record.solvedDate >= startKey && record.solvedDate <= endKey)
}

export function getDailySolvedSeries(records = [], days = 30, referenceDate = new Date()) {
  const normalized = normalizeAnalyticsRecords(records)
  const counts = normalized.reduce((map, record) => map.set(record.solvedDate, (map.get(record.solvedDate) || 0) + 1), new Map())
  return buildLocalDayRange(days, referenceDate).map((day) => ({ ...day, count: counts.get(day.date) || 0 }))
}

export function getCumulativeSolvedSeries(records = [], days = 30, referenceDate = new Date()) {
  const normalized = normalizeAnalyticsRecords(records)
  const daily = getDailySolvedSeries(records, days, referenceDate)
  const baseline = normalized.filter((record) => record.solvedDate < daily[0].date).length
  let cumulative = baseline
  return {
    baseline,
    series: daily.map((day) => {
      cumulative += day.count
      return { ...day, cumulative }
    }),
  }
}

function periodLabel(start, end, type) {
  if (type === 'month') return format(start, 'MMM yyyy')
  if (start.getMonth() === end.getMonth()) return `${format(start, 'MMM d')}–${format(end, 'd')}`
  return `${format(start, 'MMM d')}–${format(end, 'MMM d')}`
}

export function getActivityAggregation(records = [], days = 30, referenceDate = new Date(), type = 'week') {
  const daily = getDailySolvedSeries(records, days, referenceDate)
  const end = localDateFromKey(daily.at(-1).date)
  const buckets = new Map()
  daily.forEach((day) => {
    const date = localDateFromKey(day.date)
    const periodStart = type === 'month' ? startOfMonth(date) : startOfWeek(date, { weekStartsOn: 1 })
    const key = toLocalDayKey(periodStart)
    if (!buckets.has(key)) {
      const naturalEnd = type === 'month'
        ? new Date(periodStart.getFullYear(), periodStart.getMonth() + 1, 0, 12)
        : addDays(periodStart, 6)
      const visibleEnd = naturalEnd > end ? end : naturalEnd
      buckets.set(key, {
        key,
        label: periodLabel(periodStart, visibleEnd, type),
        startDate: key,
        endDate: toLocalDayKey(visibleEnd),
        count: 0,
      })
    }
    buckets.get(key).count += day.count
  })
  return [...buckets.values()]
}

function roundedPercentages(counts, total) {
  if (!total) return counts.map(() => 0)
  const exact = counts.map((count) => (count / total) * 100)
  const floors = exact.map(Math.floor)
  let remainder = 100 - floors.reduce((sum, value) => sum + value, 0)
  exact.map((value, index) => ({ index, fraction: value - floors[index] }))
    .sort((left, right) => right.fraction - left.fraction || left.index - right.index)
    .forEach(({ index }) => {
      if (remainder > 0) {
        floors[index] += 1
        remainder -= 1
      }
    })
  return floors
}

export function getDifficultyDistribution(records = [], days = 30, referenceDate = new Date()) {
  const ranged = filterSolvedInRange(records, days, referenceDate)
  const counts = DIFFICULTIES.map((difficulty) => ranged.filter((record) => record.difficulty === difficulty).length)
  const knownTotal = counts.reduce((sum, count) => sum + count, 0)
  const percentages = roundedPercentages(counts, knownTotal)
  return {
    total: ranged.length,
    knownTotal,
    unknownCount: ranged.filter((record) => record.difficulty === 'Unknown').length,
    items: DIFFICULTIES.map((name, index) => ({ name, count: counts[index], percentage: percentages[index] })),
  }
}

export function getTopicAnalytics(records = [], days = 30, referenceDate = new Date()) {
  const ranged = filterSolvedInRange(records, days, referenceDate)
  const topics = new Map(CORE_TOPICS.map((name) => [name.toLocaleLowerCase(), {
    name, count: 0, percentage: 0, Easy: 0, Medium: 0, Hard: 0, Unknown: 0,
  }]))
  ranged.forEach((record) => record.topics.forEach((name) => {
    const key = name.toLocaleLowerCase()
    if (!topics.has(key)) topics.set(key, { name, count: 0, percentage: 0, Easy: 0, Medium: 0, Hard: 0, Unknown: 0 })
    const topic = topics.get(key)
    topic.count += 1
    topic[record.difficulty] += 1
  }))
  const items = [...topics.values()]
    .map((topic) => ({ ...topic, percentage: ranged.length ? Math.round((topic.count / ranged.length) * 100) : 0 }))
    .sort((left, right) => right.count - left.count || left.name.localeCompare(right.name))
  const practiced = items.filter((topic) => topic.count > 0)
  const least = [...items].sort((left, right) => left.count - right.count || left.name.localeCompare(right.name))[0] || null
  return { totalSolved: ranged.length, items, mostPracticed: practiced[0] || null, leastPracticed: least }
}

export function getConsistency(records = [], days = 30, referenceDate = new Date()) {
  const ranged = filterSolvedInRange(records, days, referenceDate)
  const activeDays = new Set(ranged.map((record) => record.solvedDate)).size
  const totalDays = Math.max(1, Math.floor(Number(days) || 1))
  return { activeDays, totalDays, score: Math.min(100, Math.max(0, Math.round((activeDays / totalDays) * 100))) }
}

function getPreviousPeriodCount(records, days, referenceDate) {
  const current = getRangeBounds(days, referenceDate)
  const previousEnd = subDays(localDateFromKey(current.startKey), 1)
  return filterSolvedInRange(records, days, previousEnd).length
}

function activeDaysThisMonth(records, referenceDate) {
  const referenceKey = toLocalDayKey(referenceDate)
  const monthStartKey = toLocalDayKey(startOfMonth(localDateFromKey(referenceKey)))
  return new Set(normalizeAnalyticsRecords(records)
    .filter((record) => record.solvedDate >= monthStartKey && record.solvedDate <= referenceKey)
    .map((record) => record.solvedDate)).size
}

export function generateAnalyticsInsights(records = [], days = 30, referenceDate = new Date()) {
  const current = filterSolvedInRange(records, days, referenceDate)
  if (!current.length) return []
  const topic = getTopicAnalytics(records, days, referenceDate)
  const difficulty = getDifficultyDistribution(records, days, referenceDate)
  const previousCount = getPreviousPeriodCount(records, days, referenceDate)
  const monthActiveDays = activeDaysThisMonth(records, referenceDate)
  const insights = []
  if (topic.mostPracticed) insights.push({ id: 'most-topic', icon: 'target', title: 'Most-practiced topic', text: `${topic.mostPracticed.name} appears on ${topic.mostPracticed.count} solved problem${topic.mostPracticed.count === 1 ? '' : 's'} in this period.`, tone: 'positive' })
  if (topic.leastPracticed && topic.leastPracticed.name !== topic.mostPracticed?.name) insights.push({ id: 'least-topic', icon: 'layers', title: 'Least-practiced topic', text: `${topic.leastPracticed.name} has ${topic.leastPracticed.count} solved problem${topic.leastPracticed.count === 1 ? '' : 's'} in this period. Zero-count core topics are included.`, tone: 'neutral' })
  const common = [...difficulty.items].filter((item) => item.count > 0).sort((left, right) => right.count - left.count || left.name.localeCompare(right.name))[0]
  if (common) insights.push({ id: 'common-difficulty', icon: 'gauge', title: 'Most common difficulty', text: `${common.name} is the most frequent known difficulty with ${common.count} solved problem${common.count === 1 ? '' : 's'}.`, tone: 'neutral' })
  if (monthActiveDays > 0) insights.push({ id: 'month-active-days', icon: 'calendar', title: 'Active days this month', text: `You recorded solved problems on ${monthActiveDays} unique day${monthActiveDays === 1 ? '' : 's'} this calendar month.`, tone: 'positive' })
  if (previousCount === 0) {
    insights.push({ id: 'frequency-change', icon: 'trending', title: 'Solving frequency', text: `You solved ${current.length} problem${current.length === 1 ? '' : 's'} in this period, with no activity in the previous equal-length period.`, tone: 'positive' })
  } else {
    const change = Math.round(((current.length - previousCount) / previousCount) * 100)
    const direction = change > 0 ? 'increased' : change < 0 ? 'decreased' : 'did not change'
    const detail = change === 0 ? '' : ` by ${Math.abs(change)}%`
    insights.push({ id: 'frequency-change', icon: 'trending', title: 'Solving frequency', text: `Recorded solves ${direction}${detail} versus the previous equal-length period (${current.length} vs ${previousCount}).`, tone: change > 0 ? 'positive' : change < 0 ? 'caution' : 'neutral' })
  }
  return insights
}

export function getAnalyticsSnapshot(records = [], days = 30, referenceDate = new Date()) {
  const daily = getDailySolvedSeries(records, days, referenceDate)
  const cumulative = getCumulativeSolvedSeries(records, days, referenceDate)
  const topic = getTopicAnalytics(records, days, referenceDate)
  const consistency = getConsistency(records, days, referenceDate)
  return {
    rangeDays: daily.length,
    solvedInRange: daily.reduce((sum, day) => sum + day.count, 0),
    totalSolved: getSolvedProblemCount(records),
    datedSolvedTotal: normalizeAnalyticsRecords(records).length,
    daily,
    cumulative,
    weekly: getActivityAggregation(records, days, referenceDate, 'week'),
    monthly: getActivityAggregation(records, days, referenceDate, 'month'),
    difficulty: getDifficultyDistribution(records, days, referenceDate),
    topic,
    consistency,
    insights: generateAnalyticsInsights(records, days, referenceDate),
  }
}
