import { describe, it, expect } from 'vitest'
import { calculateStreaks } from '../utils/streaks'
import { getLocalDateString, subDays } from '../utils/dates'

describe('Streak Calculation Logic', () => {
  const refDate = new Date('2026-10-19T12:00:00')
  const todayStr = getLocalDateString(refDate)
  const yestStr = getLocalDateString(subDays(refDate, 1))
  const day2Str = getLocalDateString(subDays(refDate, 2))
  const day3Str = getLocalDateString(subDays(refDate, 3))

  it('handles empty problems gracefully', () => {
    const res = calculateStreaks([], refDate)
    expect(res.currentStreak).toBe(0)
    expect(res.longestStreak).toBe(0)
    expect(res.isStreakAtRisk).toBe(false)
    expect(res.activeDaysCount).toBe(0)
  })

  it('computes 1-day streak if solved today', () => {
    const problems = [
      { id: '1', status: 'Solved', solvedDate: todayStr },
      { id: '2', status: 'Todo', solvedDate: null },
    ]
    const res = calculateStreaks(problems, refDate)
    expect(res.currentStreak).toBe(1)
    expect(res.longestStreak).toBe(1)
    expect(res.isStreakAtRisk).toBe(false)
    expect(res.activeDaysCount).toBe(1)
  })

  it('marks streak as at risk if solved yesterday but not today', () => {
    const problems = [
      { id: '1', status: 'Solved', solvedDate: yestStr },
    ]
    const res = calculateStreaks(problems, refDate)
    expect(res.currentStreak).toBe(1)
    expect(res.isStreakAtRisk).toBe(true)
  })

  it('computes consecutive multi-day streaks ending today', () => {
    const problems = [
      { id: '1', status: 'Solved', solvedDate: todayStr },
      { id: '2', status: 'Solved', solvedDate: yestStr },
      { id: '3', status: 'Solved', solvedDate: day2Str },
      { id: '4', status: 'Solved', solvedDate: day3Str },
    ]
    const res = calculateStreaks(problems, refDate)
    expect(res.currentStreak).toBe(4)
    expect(res.longestStreak).toBe(4)
    expect(res.isStreakAtRisk).toBe(false)
  })

  it('preserves historical longest streak even after a broken streak', () => {
    const day10Str = getLocalDateString(subDays(refDate, 10))
    const day11Str = getLocalDateString(subDays(refDate, 11))
    const day12Str = getLocalDateString(subDays(refDate, 12))
    const day13Str = getLocalDateString(subDays(refDate, 13))
    const day14Str = getLocalDateString(subDays(refDate, 14))

    const problems = [
      // Historical 5-day streak
      { id: 'a', status: 'Solved', solvedDate: day10Str },
      { id: 'b', status: 'Solved', solvedDate: day11Str },
      { id: 'c', status: 'Solved', solvedDate: day12Str },
      { id: 'd', status: 'Solved', solvedDate: day13Str },
      { id: 'e', status: 'Solved', solvedDate: day14Str },
      // Today solved
      { id: 'f', status: 'Solved', solvedDate: todayStr },
    ]
    const res = calculateStreaks(problems, refDate)
    expect(res.currentStreak).toBe(1)
    expect(res.longestStreak).toBe(5)
  })

  it('counts unique active days when multiple problems are solved together', () => {
    const problems = [
      { id: '1', status: 'Solved', solvedDate: todayStr },
      { id: '2', status: 'Solved', solvedDate: todayStr },
      { id: '3', status: 'Solved', solvedDate: yestStr },
    ]

    const res = calculateStreaks(problems, refDate)
    expect(res.currentStreak).toBe(2)
    expect(res.activeDaysCount).toBe(2)
    expect(res.datesMap[todayStr]).toBe(2)
  })

  it('marks every day in the seven-day calendar with today identified', () => {
    const res = calculateStreaks(
      [{ id: '1', status: 'Solved', solvedDate: yestStr }],
      refDate
    )

    expect(res.last7Days).toHaveLength(7)
    expect(res.last7Days.at(-1)).toMatchObject({
      dateStr: todayStr,
      isToday: true,
      isSolved: false,
    })
    expect(res.last7Days.at(-2).isSolved).toBe(true)
  })
})
