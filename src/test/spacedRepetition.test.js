import { describe, it, expect } from 'vitest'
import { calculateNextRevision, categorizeRevisions } from '../utils/spacedRepetition'
import { getLocalDateString, addDays, subDays } from '../utils/dates'

describe('Spaced Repetition Scheduler', () => {
  const refDate = new Date('2026-10-19T12:00:00')
  const intervals = [1, 3, 7, 14, 30]

  it('schedules next interval on Okay confidence', () => {
    const result = calculateNextRevision({
      confidence: 'Okay',
      currentCount: 0,
      intervals,
      fromDate: refDate,
    })
    expect(result.daysAdded).toBe(3) // intervals[1] = 3
    expect(result.nextCount).toBe(1)
  })

  it('resets to 1st interval on Hard confidence', () => {
    const result = calculateNextRevision({
      confidence: 'Hard',
      currentCount: 3,
      intervals,
      fromDate: refDate,
    })
    expect(result.daysAdded).toBe(1) // intervals[0] = 1
    expect(result.nextCount).toBe(4)
  })

  it('accelerates interval on Easy confidence', () => {
    const result = calculateNextRevision({
      confidence: 'Easy',
      currentCount: 0,
      intervals,
      fromDate: refDate,
    })
    expect(result.daysAdded).toBe(7) // intervals[2] = 7
    expect(result.nextCount).toBe(1)
  })

  it('categorizes revisions into Due Today, Overdue, and Upcoming', () => {
    const todayStr = getLocalDateString(refDate)
    const overdueStr = getLocalDateString(subDays(refDate, 2))
    const upcomingStr = getLocalDateString(addDays(refDate, 3))

    const problems = [
      { id: '1', title: 'P1', revision: { marked: true, nextRevisionDate: todayStr, priority: 'High' } },
      { id: '2', title: 'P2', revision: { marked: true, nextRevisionDate: overdueStr, priority: 'Medium' } },
      { id: '3', title: 'P3', revision: { marked: true, nextRevisionDate: upcomingStr, priority: 'Low' } },
      { id: '4', title: 'P4', revision: { marked: false } },
    ]

    const cat = categorizeRevisions(problems, refDate)
    expect(cat.counts.dueToday).toBe(1)
    expect(cat.counts.overdue).toBe(1)
    expect(cat.counts.upcoming).toBe(1)
    expect(cat.dueToday[0].id).toBe('1')
    expect(cat.overdue[0].id).toBe('2')
    expect(cat.upcoming[0].id).toBe('3')
  })

  it('separates completed revisions and orders due items by priority', () => {
    const todayStr = getLocalDateString(refDate)
    const problems = [
      { id: 'low', revision: { marked: true, nextRevisionDate: todayStr, priority: 'Low' } },
      { id: 'high', revision: { marked: true, nextRevisionDate: todayStr, priority: 'High' } },
      {
        id: 'complete',
        revision: {
          marked: true,
          nextRevisionDate: todayStr,
          revisionCount: 5,
          isCompleted: true,
        },
      },
      { id: 'unscheduled', revision: { marked: true } },
    ]

    const result = categorizeRevisions(problems, refDate)
    expect(result.dueToday.map((problem) => problem.id)).toEqual([
      'high',
      'low',
      'unscheduled',
    ])
    expect(result.completed.map((problem) => problem.id)).toEqual(['complete'])
    expect(result.counts.totalActive).toBe(3)
  })

  it('caps easy scheduling at the largest configured interval', () => {
    const result = calculateNextRevision({
      confidence: 'Easy',
      currentCount: 20,
      intervals,
      fromDate: refDate,
    })

    expect(result.daysAdded).toBe(30)
    expect(result.nextCount).toBe(21)
  })
})
