import { describe, expect, it } from 'vitest'
import {
  HEATMAP_LEVEL_THRESHOLDS,
  countByDifficulty,
  getCurrentStreak,
  getHeatmapData,
  getLongestStreak,
  getRecentSolved,
  getTotalSolved,
  getWeeklyProgress,
} from '../utils/dashboardMetrics'

const reference = new Date(2026, 9, 22, 12)

describe('dashboard metrics', () => {
  const problems = [
    { id: 'a', title: 'A', status: 'Solved', difficulty: 'easy', solvedDate: '2026-10-22', createdAt: '2026-10-22T08:00:00Z' },
    { id: 'b', title: 'B', status: 'Todo', difficulty: 'Medium', solvedDate: '2026-10-21', createdAt: '2026-10-21T08:00:00Z' },
    { id: 'c', title: 'C', status: 'Solved', difficulty: 'impossible', solvedDate: null },
    { id: 'd', title: 'D', status: 'Todo', difficulty: 'Hard', solvedDate: 'invalid' },
    { id: 'e', title: 'E', status: 'Todo', difficulty: 'Hard', solvedDate: '2026-10-23' },
  ]

  it('uses one solved rule without inflating unknown difficulty', () => {
    expect(getTotalSolved(problems, reference)).toBe(3)
    expect(countByDifficulty(problems, reference)).toEqual({ Easy: 1, Medium: 1, Hard: 0, Unknown: 1 })
  })

  it('returns exactly seven local calendar days and excludes future or invalid dates', () => {
    const series = getWeeklyProgress(problems, reference)
    expect(series).toHaveLength(7)
    expect(series[0].date).toBe('2026-10-16')
    expect(series.at(-1)).toMatchObject({ date: '2026-10-22', count: 1 })
    expect(series.reduce((sum, day) => sum + day.count, 0)).toBe(2)
  })

  it('counts unique consecutive days for current and longest streaks', () => {
    const streakRecords = [
      { solvedDate: '2026-03-07' },
      { solvedDate: '2026-03-08' },
      { solvedDate: '2026-03-09' },
      { solvedDate: '2026-03-09' },
      { solvedDate: '2026-10-21' },
      { solvedDate: '2026-10-22' },
    ]
    expect(getCurrentStreak(streakRecords, reference)).toBe(2)
    expect(getLongestStreak(streakRecords, reference)).toBe(3)
  })

  it('builds a fixed 52-week calendar with explicit future cells and thresholds', () => {
    const heatmap = getHeatmapData(problems, reference)
    expect(heatmap).toHaveLength(52)
    expect(heatmap.every((week) => week.days.length === 7)).toBe(true)
    expect(heatmap.flatMap((week) => week.days).find((day) => day.date === '2026-10-23')).toMatchObject({ count: 0, isFuture: true })
    expect(HEATMAP_LEVEL_THRESHOLDS).toEqual([0, 1, 2, 3, 4])
  })

  it('sorts recent solves deterministically and ignores undated, invalid, and future records', () => {
    const tied = [
      ...problems,
      { id: 'z', title: 'Later created', solvedDate: '2026-10-22', createdAt: '2026-10-22T09:00:00Z' },
    ]
    expect(getRecentSolved(tied, 5, reference).map((problem) => problem.id)).toEqual(['z', 'a', 'b'])
  })
})
