import { describe, expect, it } from 'vitest'
import { getTotalSolved } from '../utils/dashboardMetrics'
import {
  ANALYTICS_RANGES,
  buildLocalDayRange,
  filterSolvedInRange,
  generateAnalyticsInsights,
  getActivityAggregation,
  getAnalyticsSnapshot,
  getConsistency,
  getCumulativeSolvedSeries,
  getDailySolvedSeries,
  getDifficultyDistribution,
  getTopicAnalytics,
  normalizeAnalyticsRecords,
  toLocalDayKey,
} from '../utils/analytics'

const referenceDate = new Date(2026, 9, 25, 12)

function solved(id, solvedDate, difficulty = 'Medium', topics = ['Arrays'], extra = {}) {
  return { id, status: 'Solved', solvedDate, difficulty, topics, ...extra }
}

describe('analytics calculations', () => {
  it('defines the supported ranges once and returns chronological zero-filled series', () => {
    expect(ANALYTICS_RANGES.map((range) => range.days)).toEqual([7, 30, 90])
    ANALYTICS_RANGES.forEach(({ days }) => {
      const series = getDailySolvedSeries([], days, referenceDate)
      expect(series).toHaveLength(days)
      expect(series.every((day) => day.count === 0)).toBe(true)
      expect(series.map((day) => day.date)).toEqual([...series].map((day) => day.date).sort())
    })
  })

  it('counts solved records only and skips malformed or undated values', () => {
    const records = [
      solved('1', '2026-10-25', 'easy'),
      { id: '2', status: ' attempted ', solvedDate: '2026-10-25', difficulty: 'Hard' },
      solved('3', 'not-a-date', 'Hard'),
      null,
      'broken',
      solved('4', '2026-10-24', 'EASY'),
    ]
    expect(normalizeAnalyticsRecords(records)).toHaveLength(2)
    expect(filterSolvedInRange(records, 7, referenceDate).map((record) => record.id)).toEqual(['1', '4'])
  })

  it('uses local calendar keys for date-only, ISO, epoch, midnight, and DST-adjacent days', () => {
    expect(toLocalDayKey('2026-10-25')).toBe('2026-10-25')
    expect(toLocalDayKey('2026-02-30')).toBeNull()
    const iso = '2026-10-24T23:45:00.000Z'
    const parsed = new Date(iso)
    const expectedIso = `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}-${String(parsed.getDate()).padStart(2, '0')}`
    expect(toLocalDayKey(iso)).toBe(expectedIso)
    const epoch = new Date(2026, 9, 25, 0, 1).getTime()
    expect(toLocalDayKey(epoch)).toBe('2026-10-25')
    expect(buildLocalDayRange(4, new Date(2026, 2, 10, 0, 5)).map((day) => day.date)).toEqual([
      '2026-03-07', '2026-03-08', '2026-03-09', '2026-03-10',
    ])
  })

  it('counts each active date once and clamps consistency from 0 to 100', () => {
    expect(getConsistency([], 7, referenceDate)).toEqual({ activeDays: 0, totalDays: 7, score: 0 })
    const repeated = [solved('1', '2026-10-25'), solved('2', '2026-10-25'), solved('3', '2026-10-22')]
    expect(getConsistency(repeated, 7, referenceDate)).toEqual({ activeDays: 2, totalDays: 7, score: 29 })
    const everyDay = buildLocalDayRange(7, referenceDate).map((day, index) => solved(String(index), day.date))
    expect(getConsistency(everyDay, 7, referenceDate).score).toBe(100)
  })

  it('uses the pre-range solved count as the cumulative baseline', () => {
    const records = [
      solved('old', '2026-10-01'),
      solved('start', '2026-10-19'),
      solved('today', '2026-10-25'),
    ]
    const cumulative = getCumulativeSolvedSeries(records, 7, referenceDate)
    expect(cumulative.baseline).toBe(1)
    expect(cumulative.series[0].cumulative).toBe(2)
    expect(cumulative.series.at(-1).cumulative).toBe(3)
  })

  it('builds Monday-start weekly and calendar-month buckets including empty periods', () => {
    const weekly = getActivityAggregation([solved('1', '2026-10-25')], 30, referenceDate, 'week')
    const monthly = getActivityAggregation([solved('1', '2026-10-25')], 90, referenceDate, 'month')
    expect(weekly[0].startDate).toBe('2026-09-21')
    expect(weekly.some((bucket) => bucket.count === 0)).toBe(true)
    expect(monthly.map((bucket) => bucket.label)).toEqual(['Jul 2026', 'Aug 2026', 'Sep 2026', 'Oct 2026'])
  })

  it('normalizes difficulty variants, keeps unknown totals, and rounds known percentages to 100', () => {
    const distribution = getDifficultyDistribution([
      solved('1', '2026-10-25', 'easy'),
      solved('2', '2026-10-24', 'EASY'),
      solved('3', '2026-10-23', 'medium'),
      solved('4', '2026-10-22', 'unexpected'),
    ], 7, referenceDate)
    expect(distribution.total).toBe(4)
    expect(distribution.unknownCount).toBe(1)
    expect(distribution.items.map((item) => item.count)).toEqual([2, 1, 0])
    expect(distribution.items.reduce((sum, item) => sum + item.percentage, 0)).toBe(100)
    expect(getDifficultyDistribution([], 7, referenceDate).items.every((item) => item.percentage === 0)).toBe(true)
  })

  it('normalizes topics, includes core zeros, and resolves most/least ties alphabetically', () => {
    const topic = getTopicAnalytics([
      solved('1', '2026-10-25', 'Easy', [' arrays ', 'ARRAYS', 'Custom TOPIC']),
      solved('2', '2026-10-24', 'Hard', ['Linked List']),
      solved('3', '2026-10-23', 'Medium', []),
    ], 7, referenceDate)
    expect(topic.items.find((item) => item.name === 'Arrays')).toMatchObject({ count: 1, Easy: 1 })
    expect(topic.items.find((item) => item.name === 'Linked Lists')).toMatchObject({ count: 1, Hard: 1 })
    expect(topic.items.find((item) => item.name === 'Custom Topic')?.count).toBe(1)
    expect(topic.items.find((item) => item.name === 'Uncategorized')?.count).toBe(1)
    expect(topic.items.find((item) => item.name === 'Dynamic Programming')?.count).toBe(0)
    expect(topic.mostPracticed?.name).toBe('Arrays')
    expect(topic.leastPracticed?.name).toBe('Dynamic Programming')
  })

  it('generates supported neutral insights for one topic and a zero previous period', () => {
    const insights = generateAnalyticsInsights([solved('1', '2026-10-25', 'Easy', ['Arrays'])], 7, referenceDate)
    expect(insights.map((insight) => insight.id)).toEqual([
      'most-topic', 'least-topic', 'common-difficulty', 'month-active-days', 'frequency-change',
    ])
    expect(insights.find((insight) => insight.id === 'frequency-change')?.text).toContain('no activity in the previous')
    expect(insights.some((insight) => /master|readiness|AI-generated/i.test(insight.text))).toBe(false)
    expect(generateAnalyticsInsights([], 7, referenceDate)).toEqual([])
  })

  it.each([
    { label: 'increase', current: 4, previous: 2, phrase: 'increased by 100%' },
    { label: 'decrease', current: 1, previous: 2, phrase: 'decreased by 50%' },
    { label: 'no change', current: 2, previous: 2, phrase: 'did not change' },
  ])('describes a $label without division errors', ({ current, previous, phrase }) => {
    const records = [
      ...Array.from({ length: current }, (_, index) => solved(`c${index}`, `2026-10-${String(25 - index).padStart(2, '0')}`)),
      ...Array.from({ length: previous }, (_, index) => solved(`p${index}`, `2026-10-${String(18 - index).padStart(2, '0')}`)),
    ]
    expect(generateAnalyticsInsights(records, 7, referenceDate).find((item) => item.id === 'frequency-change')?.text).toContain(phrase)
  })

  it('keeps Dashboard and Analytics lifetime solved totals aligned', () => {
    const records = [
      solved('1', '2026-10-25'),
      { id: '2', status: 'solved', solvedDate: null },
      { id: '3', status: 'Todo', solvedDate: '2026-10-25' },
    ]
    const snapshot = getAnalyticsSnapshot(records, 7, referenceDate)
    expect(snapshot.totalSolved).toBe(getTotalSolved(records, referenceDate))
    expect(snapshot.solvedInRange).toBe(1)
  })
})
