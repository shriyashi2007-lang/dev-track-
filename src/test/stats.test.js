import { describe, it, expect } from 'vitest'
import { computeStats } from '../utils/stats'
import { getLocalDateString } from '../utils/dates'

describe('Stats Calculation', () => {
  const refDate = new Date('2026-10-19T12:00:00')
  const todayStr = getLocalDateString(refDate)

  it('computes empty problem statistics cleanly without NaN', () => {
    const stats = computeStats([], 3, refDate)
    expect(stats.total).toBe(0)
    expect(stats.solved).toBe(0)
    expect(stats.todo).toBe(0)
    expect(stats.attempted).toBe(0)
    expect(stats.easy).toBe(0)
    expect(stats.medium).toBe(0)
    expect(stats.hard).toBe(0)
    expect(stats.todaySolvedCount).toBe(0)
    expect(stats.dailyGoalProgress).toBe(0)
    expect(stats.averageTimeMinutes).toBe(0)
    expect(stats.strongestTopic).toBeNull()
  })

  it('accurately tallies difficulty and today solved counts', () => {
    const problems = [
      { id: '1', difficulty: 'Easy', status: 'Solved', solvedDate: todayStr, topics: ['Arrays'], timeTakenMinutes: 15 },
      { id: '2', difficulty: 'Medium', status: 'Solved', solvedDate: todayStr, topics: ['Arrays', 'Trees'], timeTakenMinutes: 25 },
      { id: '3', difficulty: 'Hard', status: 'Solved', solvedDate: '2026-10-15', topics: ['Graphs'], timeTakenMinutes: 50 },
      { id: '4', difficulty: 'Medium', status: 'Attempted', topics: ['Dynamic Programming'] },
      { id: '5', difficulty: 'Easy', status: 'Todo', topics: ['Strings'] },
    ]

    const stats = computeStats(problems, 2, refDate)
    expect(stats.total).toBe(5)
    expect(stats.solved).toBe(3)
    expect(stats.attempted).toBe(1)
    expect(stats.todo).toBe(1)
    expect(stats.easy).toBe(1)
    expect(stats.medium).toBe(1)
    expect(stats.hard).toBe(1)
    expect(stats.todaySolvedCount).toBe(2)
    expect(stats.dailyGoalProgress).toBe(100)
    expect(stats.averageTimeMinutes).toBe(30) // (15+25+50)/3 = 30
    expect(stats.strongestTopic?.name).toBe('Arrays')
    expect(stats.strongestTopic?.count).toBe(2)
  })
})
